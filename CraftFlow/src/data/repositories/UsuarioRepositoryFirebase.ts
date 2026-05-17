import { injectable } from "inversify";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { IUsuarioRepository } from "../../domain/interfaces/repositories/IUsuarioRepository";
import { Usuario } from "../../domain/entities/Usuario";

/**
 * Implementación del repositorio de usuarios con Firebase Firestore.
 *
 * Trabaja con la colección "usuarios" donde el ID del documento coincide
 * con el UID de Firebase Authentication (no es autogenerado por Firestore).
 *
 * Gestiona los datos del perfil. La sesión (login, logout, registro)
 * la gestiona AuthRepositoryFirebase.
 */
@injectable()
export class UsuarioRepositoryFirebase implements IUsuarioRepository {
  /**
   * Devuelve un usuario a partir de su UID.
   * Lanza error si el documento no existe en Firestore.
   */
  async getUsuarioPorId(idUsuario: string): Promise<Usuario> {
    const docRef = doc(db, "usuarios", idUsuario);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error(`Usuario con ID ${idUsuario} no encontrado`);
    }

    const data = snapshot.data();
    return new Usuario(
      snapshot.id,
      data.email,
      data.nombre,
      data.fotoPerfil || null,
      data.fechaRegistro?.toDate() || new Date(),
      data.intereses || [],
      data.activo ?? true
    );
  }

  /** Actualiza solo los campos definidos en el objeto parcial. */
  async actualizarUsuario(
    idUsuario: string,
    datos: Partial<Usuario>
  ): Promise<void> {
    const docRef = doc(db, "usuarios", idUsuario);
    const datosActualizados: Record<string, unknown> = {};

    if (datos.nombre !== undefined) datosActualizados.nombre = datos.nombre;
    if (datos.fotoPerfil !== undefined) datosActualizados.fotoPerfil = datos.fotoPerfil;
    if (datos.intereses !== undefined) datosActualizados.intereses = datos.intereses;
    if (datos.activo !== undefined) datosActualizados.activo = datos.activo;

    await updateDoc(docRef, datosActualizados);
  }

  /**
   * Devuelve las claves de los ítems de la lista de la compra que el
   * usuario ya marcó como comprados. Si el campo no existe, devuelve [].
   */
  async getItemsComprados(idUsuario: string): Promise<string[]> {
    const snapshot = await getDoc(doc(db, "usuarios", idUsuario));
    const data = snapshot.data();
    return Array.isArray(data?.itemsComprados) ? data.itemsComprados : [];
  }

  /**
   * Marca o desmarca un ítem como comprado.
   * Se usan arrayUnion/arrayRemove para que dos pulsaciones simultáneas
   * desde dispositivos distintos no se pisen.
   */
  async setItemComprado(
    idUsuario: string,
    clave: string,
    comprado: boolean
  ): Promise<void> {
    const ref = doc(db, "usuarios", idUsuario);
    await updateDoc(ref, {
      itemsComprados: comprado ? arrayUnion(clave) : arrayRemove(clave),
    });
  }
}
