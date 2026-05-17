import { injectable } from "inversify";
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
 * Implementación del repositorio de favoritos con Firebase Firestore.
 *
 * Trabaja con la colección "favoritos", donde cada documento representa
 * la relación entre un usuario y un proyecto guardado. El método
 * `toggleFavorito` permite alternar el estado con un único botón en la UI.
 */
@injectable()
export class FavoritoRepositoryFirebase implements IFavoritoRepository {
  /** Devuelve los favoritos guardados por un usuario. */
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

  /** Indica si un proyecto está guardado como favorito por el usuario. */
  async esFavorito(
    idUsuario: string,
    idProyecto: string
  ): Promise<boolean> {
    // Query simple por idUsuario y filtrado en cliente para no
    // requerir un índice compuesto en Firestore.
    const q = query(
      collection(db, "favoritos"),
      where("idUsuario", "==", idUsuario)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.some((d) => d.data().idProyecto === idProyecto);
  }

  /**
   * Alterna el estado de favorito: si ya existe lo elimina, si no lo crea.
   * Devuelve el nuevo estado (true si quedó como favorito).
   */
  async toggleFavorito(
    idUsuario: string,
    idProyecto: string
  ): Promise<boolean> {
    // Query simple por idUsuario y filtrado en cliente para no
    // requerir un índice compuesto en Firestore.
    const q = query(
      collection(db, "favoritos"),
      where("idUsuario", "==", idUsuario)
    );
    const snapshot = await getDocs(q);
    const existente = snapshot.docs.find((d) => d.data().idProyecto === idProyecto);

    if (existente) {
      await deleteDoc(doc(db, "favoritos", existente.id));
      return false;
    }

    await addDoc(collection(db, "favoritos"), {
      idUsuario,
      idProyecto,
      fechaFavorito: new Date(),
    });
    return true;
  }
}
