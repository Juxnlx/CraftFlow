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
import { IHerramientaRepository } from "../../domain/interfaces/repositories/IHerramientaRepository";
import { Herramienta } from "../../domain/entities/Herramienta";

/**
 * Implementación del repositorio de herramientas con Firebase Firestore.
 *
 * Mismo patrón que MaterialRepositoryFirebase: trabaja con la colección
 * "herramientas" filtrando siempre por idUsuario para que cada usuario
 * solo acceda a las suyas.
 */
@injectable()
export class HerramientaRepositoryFirebase implements IHerramientaRepository {
  /** Devuelve todas las herramientas del inventario de un usuario. */
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

  /** Crea una nueva herramienta y devuelve el ID generado por Firestore. */
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

  /** Actualiza solo los campos definidos en el objeto parcial. */
  async actualizarHerramienta(
    idHerramienta: string,
    herramienta: Partial<Herramienta>
  ): Promise<void> {
    const docRef = doc(db, "herramientas", idHerramienta);
    const datosActualizados: Record<string, unknown> = {};

    if (herramienta.nombre !== undefined) {
      datosActualizados.nombre = herramienta.nombre;
    }
    if (herramienta.tipo !== undefined) {
      datosActualizados.tipo = herramienta.tipo;
    }
    if (herramienta.propiedades !== undefined) {
      datosActualizados.propiedades = herramienta.propiedades;
    }
    if (herramienta.cantidad !== undefined) {
      datosActualizados.cantidad = herramienta.cantidad;
    }
    if (herramienta.urlCompra !== undefined) {
      datosActualizados.urlCompra = herramienta.urlCompra;
    }

    await updateDoc(docRef, datosActualizados);
  }

  /** Elimina la herramienta de Firestore. */
  async eliminarHerramienta(idHerramienta: string): Promise<void> {
    const docRef = doc(db, "herramientas", idHerramienta);
    await deleteDoc(docRef);
  }
}
