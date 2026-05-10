import { injectable } from "inversify";
import "reflect-metadata";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { IProyectoEnProgresoRepository } from "../../domain/interfaces/repositories/IProyectoEnProgresoRepository";
import {
  ProyectoEnProgreso,
  EstadoProyecto,
  PasoCompletado,
} from "../../domain/entities/ProyectoEnProgreso";

/**
 * Implementación del repositorio de seguimientos de proyectos usando Firestore.
 *
 * Trabaja con la colección "proyectosEnProgreso" donde cada documento
 * representa el avance de un usuario sobre un proyecto. Las queries
 * filtran siempre por idUsuario para que cada usuario solo vea sus
 * propios seguimientos.
 */
@injectable()
export class ProyectoEnProgresoRepositoryFirebase
  implements IProyectoEnProgresoRepository {
  /**
   * Convierte un documento Firestore en una instancia de la entidad.
   * Centralizado para evitar duplicar la lógica de conversión.
   */
  private _toEntity(id: string, data: any): ProyectoEnProgreso {
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

  async getProyectoEnProgreso(
    idUsuario: string,
    idProyecto: string
  ): Promise<ProyectoEnProgreso | null> {
    // Buscamos seguimientos del usuario sobre ese proyecto que estén
    // todavía en progreso (no completados). Filtramos completados en
    // cliente para evitar la necesidad de un índice compuesto extra
    // en Firestore.
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

  async getMisProyectosCompletados(
    idUsuario: string
  ): Promise<ProyectoEnProgreso[]> {
    const q = query(
      collection(db, "proyectosEnProgreso"),
      where("idUsuario", "==", idUsuario),
      where("estado", "==", "completado")
    );
    const snapshot = await getDocs(q);

    // Ordenamos por fechaCompletado descendente (los más recientes primero)
    return snapshot.docs
      .map((d) => this._toEntity(d.id, d.data()))
      .sort((a, b) => {
        const dateA = a.fechaCompletado?.getTime() ?? 0;
        const dateB = b.fechaCompletado?.getTime() ?? 0;
        return dateB - dateA;
      });
  }

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

  async actualizarProyectoEnProgreso(
    idSeguimiento: string,
    datos: Partial<ProyectoEnProgreso>
  ): Promise<void> {
    const docRef = doc(db, "proyectosEnProgreso", idSeguimiento);
    // Solo actualizamos los campos definidos en el Partial
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

  async eliminarProyectoEnProgreso(idSeguimiento: string): Promise<void> {
    const docRef = doc(db, "proyectosEnProgreso", idSeguimiento);
    await deleteDoc(docRef);
  }
}
