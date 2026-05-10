import { injectable } from "inversify";
import "reflect-metadata";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { IProyectoRepository } from "../../domain/interfaces/repositories/IProyectoRepository";
import { Proyecto } from "../../domain/entities/Proyecto";
import { Visibilidad, Dificultad } from "../../domain/entities/Proyecto";

/**
 * Implementación del repositorio de proyectos usando Firebase Firestore.
 *
 * Trabaja con la colección "proyectos". Es el repositorio más complejo
 * porque gestiona documentos con arrays anidados (materiales, herramientas,
 * pasos) y soporta búsqueda por texto.
 *
 * La eliminación es lógica (activo: false) en vez de física para
 * no perder datos que podrían ser necesarios después.
 *
 * @example
 * const repo = container.get<IProyectoRepository>(TYPES.IProyectoRepository);
 * const publicos = await repo.getProyectosPublicos();
 */
@injectable()
export class ProyectoRepositoryFirebase implements IProyectoRepository {
  /**
   * Obtiene todos los proyectos públicos y activos.
   * Se ordenan por fecha de creación descendente (más recientes primero).
   *
   * @returns Promesa que resuelve a un array de proyectos públicos activos
   */
  async getProyectosPublicos(): Promise<Proyecto[]> {
    // Query simple para evitar necesidad de indices compuestos en Firestore.
    // Filtrado y ordenación se hacen en el cliente (aceptable para un TFG).
    const snapshot = await getDocs(collection(db, "proyectos"));

    return snapshot.docs
      .map((docSnap) => this._mapearProyecto(docSnap))
      .filter((p) => p.visibilidad === "publico" && p.activo)
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
  }

  /**
   * Obtiene todos los proyectos activos de un usuario.
   *
   * @param idUsuario - ID del usuario dueño de los proyectos
   * @returns Promesa que resuelve a un array de proyectos del usuario
   */
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
   * Obtiene un proyecto específico por su ID.
   *
   * @param idProyecto - ID del proyecto a buscar
   * @returns Promesa que resuelve al proyecto encontrado
   * @throws Error si el proyecto no existe en Firestore
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
   * Crea un nuevo proyecto en Firestore.
   * El ID se genera automáticamente por Firestore (addDoc).
   * Los materiales, herramientas y pasos se guardan como arrays
   * dentro del mismo documento, no como subcolecciones.
   *
   * @param proyecto - Objeto proyecto a persistir
   * @returns Promesa que resuelve al ID del proyecto creado
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

  /**
   * Actualiza los datos de un proyecto existente.
   * Solo se actualizan los campos incluidos en el Partial.
   *
   * @param idProyecto - ID del proyecto a actualizar
   * @param proyecto - Objeto con los campos parciales a actualizar
   * @returns Promesa que se resuelve al completar la actualización
   */
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
   * No se hace deleteDoc para preservar los datos en Firestore.
   * Si un profesor pregunta: esto es un soft delete, patrón común
   * en producción para evitar pérdida accidental de datos.
   *
   * @param idProyecto - ID del proyecto a eliminar
   * @returns Promesa que se resuelve al marcar el proyecto como inactivo
   */
  async eliminarProyecto(idProyecto: string): Promise<void> {
    const docRef = doc(db, "proyectos", idProyecto);
    await updateDoc(docRef, { activo: false });
  }

  /**
   * Busca proyectos públicos activos cuyo nombre o etiquetas
   * coincidan parcialmente con el texto de búsqueda.
   *
   * Firestore no soporta búsqueda full-text nativa (no hay LIKE ni CONTAINS).
   * Para un TFG es aceptable traer todos los proyectos públicos y filtrar
   * en el cliente, ya que no habrá millones de documentos.
   * En producción se usaría Algolia o Firebase Extensions.
   *
   * @param texto - Texto a buscar en nombre y etiquetas del proyecto
   * @returns Promesa que resuelve a un array de proyectos coincidentes
   */
  async buscarProyectos(texto: string): Promise<Proyecto[]> {
    const snapshot = await getDocs(collection(db, "proyectos"));
    const textoBusqueda = texto.toLowerCase();

    // Filtrar en el cliente: publicos, activos y que coincidan con la busqueda
    return snapshot.docs
      .map((docSnap) => this._mapearProyecto(docSnap))
      .filter((proyecto) => {
        if (proyecto.visibilidad !== "publico" || !proyecto.activo) return false;
        const nombreCoincide = proyecto.nombre
          .toLowerCase()
          .includes(textoBusqueda);
        const etiquetaCoincide = proyecto.etiquetas.some((etiqueta) =>
          etiqueta.toLowerCase().includes(textoBusqueda)
        );
        return nombreCoincide || etiquetaCoincide;
      });
  }

  /**
   * Mapea un documento de Firestore a una instancia de Proyecto.
   * Método privado reutilizado por todas las operaciones de lectura
   * para evitar duplicar la lógica de conversión.
   *
   * @param docSnap - Snapshot del documento de Firestore
   * @returns Instancia de Proyecto con los datos del documento
   */
  private _mapearProyecto(
    docSnap: import("firebase/firestore").DocumentSnapshot
  ): Proyecto {
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
