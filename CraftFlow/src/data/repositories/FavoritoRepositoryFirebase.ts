import { injectable } from "inversify";
import "reflect-metadata";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { IFavoritoRepository } from "../../domain/interfaces/repositories/IFavoritoRepository";
import { Favorito } from "../../domain/entities/Favorito";

/**
 * Implementación del repositorio de favoritos usando Firebase Firestore.
 *
 * Trabaja con la colección "favoritos" donde cada documento representa
 * la relación entre un usuario y un proyecto guardado.
 *
 * El método toggleFavorito permite alternar el estado con un solo botón
 * en la UI: si el proyecto ya está guardado lo elimina, si no lo crea.
 *
 * @example
 * const repo = container.get<IFavoritoRepository>(TYPES.IFavoritoRepository);
 * const esFav = await repo.toggleFavorito("user123", "proy456"); // true o false
 */
@injectable()
export class FavoritoRepositoryFirebase implements IFavoritoRepository {
  /**
   * Obtiene todos los favoritos guardados por un usuario.
   *
   * @param idUsuario - ID del usuario
   * @returns Promesa que resuelve a un array de favoritos del usuario
   */
  async getFavoritosPorUsuario(idUsuario: string): Promise<Favorito[]> {
    const q = query(
      collection(db, "favoritos"),
      where("idUsuario", "==", idUsuario)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return new Favorito(
        docSnap.id,
        data.idUsuario,
        data.idProyecto,
        data.fechaFavorito?.toDate() || new Date()
      );
    });
  }

  /**
   * Comprueba si un proyecto está marcado como favorito por un usuario.
   *
   * @param idUsuario - ID del usuario
   * @param idProyecto - ID del proyecto
   * @returns Promesa que resuelve a true si es favorito, false si no
   */
  async esFavorito(
    idUsuario: string,
    idProyecto: string
  ): Promise<boolean> {
    // Query simple por idUsuario y filtrado en cliente para evitar indice compuesto
    const q = query(
      collection(db, "favoritos"),
      where("idUsuario", "==", idUsuario)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.some((d) => d.data().idProyecto === idProyecto);
  }

  /**
   * Alterna el estado de favorito de un proyecto para un usuario.
   * Si ya es favorito lo elimina; si no lo es, lo crea.
   * Esto permite usar un solo botón "Guardar/Guardado" en la UI.
   *
   * @param idUsuario - ID del usuario
   * @param idProyecto - ID del proyecto
   * @returns Promesa que resuelve al nuevo estado (true si ahora es favorito, false si dejó de serlo)
   */
  async toggleFavorito(
    idUsuario: string,
    idProyecto: string
  ): Promise<boolean> {
    // Query simple por idUsuario y filtrado en cliente para evitar indice compuesto
    const q = query(
      collection(db, "favoritos"),
      where("idUsuario", "==", idUsuario)
    );
    const snapshot = await getDocs(q);
    const existente = snapshot.docs.find((d) => d.data().idProyecto === idProyecto);

    if (existente) {
      // Ya es favorito → eliminarlo
      await deleteDoc(doc(db, "favoritos", existente.id));
      return false;
    }

    // No es favorito → crearlo
    await addDoc(collection(db, "favoritos"), {
      idUsuario,
      idProyecto,
      fechaFavorito: new Date(),
    });
    return true;
  }
}
