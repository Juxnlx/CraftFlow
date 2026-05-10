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
import { IHerramientaRepository } from "../../domain/interfaces/repositories/IHerramientaRepository";
import { Herramienta } from "../../domain/entities/Herramienta";

/**
 * Implementación del repositorio de herramientas usando Firebase Firestore.
 *
 * Trabaja con la colección "herramientas". Sigue el mismo patrón
 * que MaterialRepositoryFirebase, filtrando siempre por idUsuario
 * para que cada usuario solo acceda a sus propias herramientas.
 *
 * @example
 * const repo = container.get<IHerramientaRepository>(TYPES.IHerramientaRepository);
 * const herramientas = await repo.getHerramientasPorUsuario("user123");
 */
@injectable()
export class HerramientaRepositoryFirebase implements IHerramientaRepository {
  /**
   * Obtiene todas las herramientas de un usuario.
   *
   * @param idUsuario - ID del usuario dueño de las herramientas
   * @returns Promesa que resuelve a un array de herramientas del usuario
   */
  async getHerramientasPorUsuario(
    idUsuario: string
  ): Promise<Herramienta[]> {
    const q = query(
      collection(db, "herramientas"),
      where("idUsuario", "==", idUsuario)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return new Herramienta(
        docSnap.id,
        data.idUsuario,
        data.nombre,
        data.tipo,
        data.propiedades || {},
        data.cantidad ?? 1,
        data.urlCompra ?? null
      );
    });
  }

  /**
   * Crea una nueva herramienta en Firestore.
   * El ID se genera automáticamente por Firestore (addDoc).
   *
   * @param herramienta - Objeto herramienta a persistir
   * @returns Promesa que resuelve al ID de la herramienta creada
   */
  async crearHerramienta(herramienta: Herramienta): Promise<string> {
    const docRef = await addDoc(collection(db, "herramientas"), {
      idUsuario: herramienta.idUsuario,
      nombre: herramienta.nombre,
      tipo: herramienta.tipo,
      propiedades: herramienta.propiedades,
      cantidad: herramienta.cantidad,
      urlCompra: herramienta.urlCompra,
    });

    return docRef.id;
  }

  /**
   * Actualiza los datos de una herramienta existente.
   * Solo se actualizan los campos incluidos en el Partial.
   *
   * @param idHerramienta - ID de la herramienta a actualizar
   * @param herramienta - Objeto con los campos parciales a actualizar
   * @returns Promesa que se resuelve al completar la actualización
   */
  async actualizarHerramienta(
    idHerramienta: string,
    herramienta: Partial<Herramienta>
  ): Promise<void> {
    const docRef = doc(db, "herramientas", idHerramienta);
    const datosActualizados: Record<string, unknown> = {};

    if (herramienta.nombre !== undefined) datosActualizados.nombre = herramienta.nombre;
    if (herramienta.tipo !== undefined) datosActualizados.tipo = herramienta.tipo;
    if (herramienta.propiedades !== undefined) datosActualizados.propiedades = herramienta.propiedades;
    if (herramienta.cantidad !== undefined) datosActualizados.cantidad = herramienta.cantidad;
    if (herramienta.urlCompra !== undefined) datosActualizados.urlCompra = herramienta.urlCompra;

    await updateDoc(docRef, datosActualizados);
  }

  /**
   * Elimina una herramienta de Firestore.
   *
   * @param idHerramienta - ID de la herramienta a eliminar
   * @returns Promesa que se resuelve al eliminar la herramienta
   */
  async eliminarHerramienta(idHerramienta: string): Promise<void> {
    const docRef = doc(db, "herramientas", idHerramienta);
    await deleteDoc(docRef);
  }
}
