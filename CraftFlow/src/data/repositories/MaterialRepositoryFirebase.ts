import { injectable } from "inversify";
import "reflect-metadata";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { IMaterialRepository } from "../../domain/interfaces/repositories/IMaterialRepository";
import { Material } from "../../domain/entities/Material";
import { CategoriaType } from "../../domain/entities/Material";

/**
 * Implementación del repositorio de materiales usando Firebase Firestore.
 *
 * Trabaja con la colección "materiales" donde cada documento representa
 * un material del inventario de un usuario. Las queries filtran siempre
 * por idUsuario para que cada usuario solo vea sus propios materiales.
 *
 * @example
 * const repo = container.get<IMaterialRepository>(TYPES.IMaterialRepository);
 * const materiales = await repo.getMaterialesPorUsuario("user123");
 */
@injectable()
export class MaterialRepositoryFirebase implements IMaterialRepository {
  /**
   * Obtiene todos los materiales de un usuario.
   *
   * @param idUsuario - ID del usuario dueño de los materiales
   * @returns Promesa que resuelve a un array de materiales del usuario
   */
  async getMaterialesPorUsuario(idUsuario: string): Promise<Material[]> {
    const q = query(
      collection(db, "materiales"),
      where("idUsuario", "==", idUsuario)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return new Material(
        docSnap.id,
        data.idUsuario,
        data.nombre,
        data.categoria as CategoriaType,
        data.color || null,
        data.precio ?? null,
        data.imagen || null,
        data.propiedades || {},
        data.fechaCreacion?.toDate() || new Date(),
        data.urlCompra || null,
        data.cantidad ?? 1
      );
    });
  }

  /**
   * Obtiene un material específico por su ID.
   *
   * @param idMaterial - ID del material a buscar
   * @returns Promesa que resuelve al material encontrado
   * @throws Error si el material no existe en Firestore
   */
  async getMaterialPorId(idMaterial: string): Promise<Material> {
    const docRef = doc(db, "materiales", idMaterial);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error(`Material con ID ${idMaterial} no encontrado`);
    }

    const data = snapshot.data();
    return new Material(
      snapshot.id,
      data.idUsuario,
      data.nombre,
      data.categoria as CategoriaType,
      data.color || null,
      data.precio ?? null,
      data.imagen || null,
      data.propiedades || {},
      data.fechaCreacion?.toDate() || new Date(),
      data.urlCompra || null
    );
  }

  /**
   * Crea un nuevo material en Firestore.
   * El ID se genera automáticamente por Firestore (addDoc).
   *
   * @param material - Objeto material a persistir
   * @returns Promesa que resuelve al ID del material creado
   */
  async crearMaterial(material: Material): Promise<string> {
    const docRef = await addDoc(collection(db, "materiales"), {
      idUsuario: material.idUsuario,
      nombre: material.nombre,
      categoria: material.categoria,
      color: material.color,
      precio: material.precio,
      imagen: material.imagen,
      propiedades: material.propiedades,
      fechaCreacion: material.fechaCreacion,
      urlCompra: material.urlCompra,
      cantidad: material.cantidad,
    });

    return docRef.id;
  }

  /**
   * Actualiza los datos de un material existente.
   * Solo se actualizan los campos incluidos en el Partial.
   *
   * @param idMaterial - ID del material a actualizar
   * @param material - Objeto con los campos parciales a actualizar
   * @returns Promesa que se resuelve al completar la actualización
   */
  async actualizarMaterial(
    idMaterial: string,
    material: Partial<Material>
  ): Promise<void> {
    const docRef = doc(db, "materiales", idMaterial);
    // Se construye un objeto solo con los campos definidos
    const datosActualizados: Record<string, unknown> = {};

    if (material.nombre !== undefined) datosActualizados.nombre = material.nombre;
    if (material.color !== undefined) datosActualizados.color = material.color;
    if (material.precio !== undefined) datosActualizados.precio = material.precio;
    if (material.imagen !== undefined) datosActualizados.imagen = material.imagen;
    if (material.propiedades !== undefined) datosActualizados.propiedades = material.propiedades;
    if (material.urlCompra !== undefined) datosActualizados.urlCompra = material.urlCompra;
    if (material.cantidad !== undefined) datosActualizados.cantidad = material.cantidad;

    await updateDoc(docRef, datosActualizados);
  }

  /**
   * Elimina un material de Firestore.
   *
   * @param idMaterial - ID del material a eliminar
   * @returns Promesa que se resuelve al eliminar el material
   */
  async eliminarMaterial(idMaterial: string): Promise<void> {
    const docRef = doc(db, "materiales", idMaterial);
    await deleteDoc(docRef);
  }
}
