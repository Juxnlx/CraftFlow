import { injectable } from "inversify";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { IProyectoRepository } from "../../domain/interfaces/repositories/IProyectoRepository";
import { Proyecto, Visibilidad, Dificultad } from "../../domain/entities/Proyecto";

/**
 * Implementación del repositorio de proyectos con Firebase Firestore.
 *
 * Es el repositorio más complejo porque cada documento contiene arrays
 * anidados (materiales, herramientas, pasos). La eliminación es lógica
 * (campo `activo: false`) en lugar de física para evitar pérdida
 * accidental de datos publicados por el usuario.
 */
@injectable()
export class ProyectoRepositoryFirebase implements IProyectoRepository {
  /**
   * Devuelve los proyectos públicos y activos, ordenados por fecha
   * de creación descendente.
   */
  async getProyectosPublicos(): Promise<Proyecto[]> {
    // Se usa una query simple y se filtra en cliente para no obligar
    // a Firestore a mantener un índice compuesto adicional.
    const snapshot = await getDocs(collection(db, "proyectos"));

    return snapshot.docs
      .map((docSnap) => this._mapearProyecto(docSnap))
      .filter((p) => p.visibilidad === "publico" && p.activo)
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
  }

  /** Devuelve los proyectos activos creados por un usuario. */
  async getProyectosPorUsuario(idUsuario: string): Promise<Proyecto[]> {
    const q = query(
      collection(db, "proyectos"),
      where("idUsuario", "==", idUsuario)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((docSnap) => this._mapearProyecto(docSnap))
      .filter((p) => p.activo);
  }

  /**
   * Devuelve un proyecto por su ID.
   * Lanza error si el documento no existe en Firestore.
   */
  async getProyectoPorId(idProyecto: string): Promise<Proyecto> {
    const docRef = doc(db, "proyectos", idProyecto);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error(`Proyecto con ID ${idProyecto} no encontrado`);
    }

    return this._mapearProyecto(snapshot);
  }

  /**
   * Crea un nuevo proyecto en Firestore y devuelve el ID generado.
   * Materiales, herramientas y pasos se guardan como arrays dentro
   * del propio documento, no como subcolecciones.
   */
  async crearProyecto(proyecto: Proyecto): Promise<string> {
    const docRef = await addDoc(collection(db, "proyectos"), {
      idUsuario: proyecto.idUsuario,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      imagen: proyecto.imagen,
      visibilidad: proyecto.visibilidad,
      dificultad: proyecto.dificultad,
      etiquetas: proyecto.etiquetas,
      materiales: proyecto.materiales,
      herramientas: proyecto.herramientas,
      pasos: proyecto.pasos,
      fechaCreacion: proyecto.fechaCreacion,
      activo: proyecto.activo,
    });

    return docRef.id;
  }

  /** Actualiza solo los campos definidos en el objeto parcial. */
  async actualizarProyecto(
    idProyecto: string,
    proyecto: Partial<Proyecto>
  ): Promise<void> {
    const docRef = doc(db, "proyectos", idProyecto);
    const datosActualizados: Record<string, unknown> = {};

    if (proyecto.nombre !== undefined) datosActualizados.nombre = proyecto.nombre;
    if (proyecto.descripcion !== undefined) datosActualizados.descripcion = proyecto.descripcion;
    if (proyecto.imagen !== undefined) datosActualizados.imagen = proyecto.imagen;
    if (proyecto.visibilidad !== undefined) datosActualizados.visibilidad = proyecto.visibilidad;
    if (proyecto.dificultad !== undefined) datosActualizados.dificultad = proyecto.dificultad;
    if (proyecto.etiquetas !== undefined) datosActualizados.etiquetas = proyecto.etiquetas;
    if (proyecto.materiales !== undefined) datosActualizados.materiales = proyecto.materiales;
    if (proyecto.herramientas !== undefined) datosActualizados.herramientas = proyecto.herramientas;
    if (proyecto.pasos !== undefined) datosActualizados.pasos = proyecto.pasos;
    if (proyecto.activo !== undefined) datosActualizados.activo = proyecto.activo;

    await updateDoc(docRef, datosActualizados);
  }

  /**
   * Elimina un proyecto de forma lógica (activo: false).
   * No se borra el documento para preservar los datos del usuario.
   */
  async eliminarProyecto(idProyecto: string): Promise<void> {
    const docRef = doc(db, "proyectos", idProyecto);
    await updateDoc(docRef, { activo: false });
  }

  /**
   * Convierte un documento de Firestore en una instancia de Proyecto.
   * Centralizado para no duplicar la lógica de mapeo en cada lectura.
   */
  private _mapearProyecto(docSnap: DocumentSnapshot): Proyecto {
    const data = docSnap.data()!;

    return new Proyecto(
      docSnap.id,
      data.idUsuario,
      data.nombre,
      data.descripcion,
      data.imagen || null,
      (data.visibilidad as Visibilidad) || "publico",
      (data.dificultad as Dificultad) || null,
      data.etiquetas || [],
      data.materiales || [],
      data.herramientas || [],
      data.pasos || [],
      data.fechaCreacion?.toDate() || new Date(),
      data.activo ?? true
    );
  }
}
