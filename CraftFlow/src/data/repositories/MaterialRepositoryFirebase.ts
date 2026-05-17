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
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { IMaterialRepository } from "../../domain/interfaces/repositories/IMaterialRepository";
import { Material, CategoriaType } from "../../domain/entities/Material";

/**
 * Implementación del repositorio de materiales con Firebase Firestore.
 *
 * Trabaja con la colección "materiales", filtrando siempre por
 * idUsuario para que cada usuario solo acceda a su propio inventario.
 */
@injectable()
export class MaterialRepositoryFirebase implements IMaterialRepository {
  /** Devuelve todos los materiales del inventario de un usuario. */
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

  /** Crea un nuevo material y devuelve el ID generado por Firestore. */
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

  /** Actualiza solo los campos definidos en el objeto parcial. */
  async actualizarMaterial(
    idMaterial: string,
    material: Partial<Material>
  ): Promise<void> {
    const docRef = doc(db, "materiales", idMaterial);
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

  /** Elimina el material de Firestore. */
  async eliminarMaterial(idMaterial: string): Promise<void> {
    const docRef = doc(db, "materiales", idMaterial);
    await deleteDoc(docRef);
  }
}
