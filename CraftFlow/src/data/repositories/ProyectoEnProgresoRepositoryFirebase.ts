import { injectable } from "inversify";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { IProyectoEnProgresoRepository } from "../../domain/interfaces/repositories/IProyectoEnProgresoRepository";
import {
  ProyectoEnProgreso,
  EstadoProyecto,
  PasoCompletado,
} from "../../domain/entities/ProyectoEnProgreso";

/**
 * Implementación del repositorio de seguimientos con Firebase Firestore.
 *
 * Trabaja con la colección "proyectosEnProgreso", donde cada documento
 * representa el avance de un usuario sobre un proyecto. Las queries
 * filtran siempre por idUsuario para que cada usuario solo vea los suyos.
 */
@injectable()
export class ProyectoEnProgresoRepositoryFirebase
  implements IProyectoEnProgresoRepository {
  /**
   * Convierte un documento de Firestore en una instancia de la entidad.
   * Centralizado para no duplicar la lógica de mapeo en cada lectura.
   */
  private _toEntity(id: string, data: DocumentData): ProyectoEnProgreso {
    return new ProyectoEnProgreso(
      id,
      data.idUsuario,
      data.idProyecto,
      data.fechaInicio?.toDate() || new Date(),
      data.fechaCompletado?.toDate() || null,
      (data.estado as EstadoProyecto) || "en_progreso",
      (data.pasosCompletados as PasoCompletado[]) || [],
      data.tiempoInvertidoSegundos ?? 0,
      data.imagenResultado || null,
      data.notaFinal || null
    );
  }

  /**
   * Devuelve el seguimiento activo de un usuario sobre un proyecto, o null
   * si no existe. Filtra los completados en cliente para no requerir un
   * índice compuesto extra en Firestore.
   */
  async getProyectoEnProgreso(
    idUsuario: string,
    idProyecto: string
  ): Promise<ProyectoEnProgreso | null> {
    const q = query(
      collection(db, "proyectosEnProgreso"),
      where("idUsuario", "==", idUsuario),
      where("idProyecto", "==", idProyecto)
    );
    const snapshot = await getDocs(q);

    const enProgreso = snapshot.docs.find(
      (d) => d.data().estado === "en_progreso"
    );
    if (!enProgreso) return null;

    return this._toEntity(enProgreso.id, enProgreso.data());
  }

  /** Devuelve los seguimientos en curso del usuario (pantalla "Sigue trabajando"). */
  async getMisProyectosEnProgreso(
    idUsuario: string
  ): Promise<ProyectoEnProgreso[]> {
    const q = query(
      collection(db, "proyectosEnProgreso"),
      where("idUsuario", "==", idUsuario),
      where("estado", "==", "en_progreso")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => this._toEntity(d.id, d.data()));
  }

  /**
   * Devuelve los proyectos completados por el usuario, ordenados por
   * fecha de completado descendente (los más recientes primero).
   */
  async getMisProyectosCompletados(
    idUsuario: string
  ): Promise<ProyectoEnProgreso[]> {
    const q = query(
      collection(db, "proyectosEnProgreso"),
      where("idUsuario", "==", idUsuario),
      where("estado", "==", "completado")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((d) => this._toEntity(d.id, d.data()))
      .sort((a, b) => {
        const dateA = a.fechaCompletado?.getTime() ?? 0;
        const dateB = b.fechaCompletado?.getTime() ?? 0;
        return dateB - dateA;
      });
  }

  /** Crea un nuevo seguimiento y devuelve el ID generado por Firestore. */
  async crearProyectoEnProgreso(
    proyectoEnProgreso: ProyectoEnProgreso
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "proyectosEnProgreso"), {
      idUsuario: proyectoEnProgreso.idUsuario,
      idProyecto: proyectoEnProgreso.idProyecto,
      fechaInicio: proyectoEnProgreso.fechaInicio,
      fechaCompletado: proyectoEnProgreso.fechaCompletado,
      estado: proyectoEnProgreso.estado,
      pasosCompletados: proyectoEnProgreso.pasosCompletados,
      tiempoInvertidoSegundos: proyectoEnProgreso.tiempoInvertidoSegundos,
      imagenResultado: proyectoEnProgreso.imagenResultado,
      notaFinal: proyectoEnProgreso.notaFinal,
    });

    return docRef.id;
  }

  /** Actualiza solo los campos definidos en el objeto parcial. */
  async actualizarProyectoEnProgreso(
    idSeguimiento: string,
    datos: Partial<ProyectoEnProgreso>
  ): Promise<void> {
    const docRef = doc(db, "proyectosEnProgreso", idSeguimiento);
    const datosActualizados: Record<string, unknown> = {};

    if (datos.fechaCompletado !== undefined)
      datosActualizados.fechaCompletado = datos.fechaCompletado;
    if (datos.estado !== undefined) datosActualizados.estado = datos.estado;
    if (datos.pasosCompletados !== undefined)
      datosActualizados.pasosCompletados = datos.pasosCompletados;
    if (datos.tiempoInvertidoSegundos !== undefined)
      datosActualizados.tiempoInvertidoSegundos = datos.tiempoInvertidoSegundos;
    if (datos.imagenResultado !== undefined)
      datosActualizados.imagenResultado = datos.imagenResultado;
    if (datos.notaFinal !== undefined)
      datosActualizados.notaFinal = datos.notaFinal;

    await updateDoc(docRef, datosActualizados);
  }

  /** Elimina un seguimiento (cuando el usuario abandona el proyecto). */
  async eliminarProyectoEnProgreso(idSeguimiento: string): Promise<void> {
    const docRef = doc(db, "proyectosEnProgreso", idSeguimiento);
    await deleteDoc(docRef);
  }
}
