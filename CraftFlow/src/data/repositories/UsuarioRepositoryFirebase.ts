import { injectable } from "inversify";
import "reflect-metadata";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { IUsuarioRepository } from "../../domain/interfaces/repositories/IUsuarioRepository";
import { Usuario } from "../../domain/entities/Usuario";

/**
 * Implementación del repositorio de usuarios usando Firebase Firestore.
 *
 * Trabaja con la colección "usuarios" donde el ID de cada documento
 * es el UID de Firebase Authentication (no autogenerado por Firestore).
 *
 * Este repositorio gestiona los datos del perfil, no la sesión.
 * La sesión (login/logout) la gestiona AuthRepositoryFirebase.
 *
 * @example
 * const repo = container.get<IUsuarioRepository>(TYPES.IUsuarioRepository);
 * const usuario = await repo.getUsuarioPorId("abc123Firebase");
 */
@injectable()
export class UsuarioRepositoryFirebase implements IUsuarioRepository {
  /**
   * Obtiene un usuario por su ID desde Firestore.
   *
   * @param idUsuario - ID del usuario (UID de Firebase Auth)
   * @returns Promesa que resuelve al usuario encontrado
   * @throws Error si el usuario no existe en Firestore
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

  /**
   * Actualiza los datos del perfil de un usuario.
   * Solo se actualizan los campos incluidos en el Partial.
   *
   * @param idUsuario - ID del usuario a actualizar
   * @param datos - Campos parciales a actualizar
   * @returns Promesa que se resuelve al completar la actualización
   */
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
   * Busca usuarios activos cuyo nombre coincida parcialmente con el texto.
   *
   * Firestore no soporta búsqueda full-text nativa, así que se traen
   * todos los usuarios activos y se filtran en el cliente.
   * Para un TFG es aceptable porque no habrá millones de usuarios.
   * En producción se usaría Algolia o Firebase Extensions.
   *
   * @param texto - Texto a buscar en el nombre del usuario
   * @returns Promesa que resuelve a un array de usuarios coincidentes
   */
  async buscarUsuarios(texto: string): Promise<Usuario[]> {
    const q = query(
      collection(db, "usuarios"),
      where("activo", "==", true)
    );
    const snapshot = await getDocs(q);
    const textoBusqueda = texto.toLowerCase();

    return snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        return new Usuario(
          docSnap.id,
          data.email,
          data.nombre,
          data.fotoPerfil || null,
          data.fechaRegistro?.toDate() || new Date(),
          data.intereses || [],
          data.activo ?? true
        );
      })
      .filter((usuario) =>
        usuario.nombre.toLowerCase().includes(textoBusqueda)
      );
  }

  /**
   * Devuelve las claves de los ítems de la lista de la compra que el usuario
   * ya marcó como comprados. Si el campo no existe en Firestore, devuelve [].
   */
  async getItemsComprados(idUsuario: string): Promise<string[]> {
    const snapshot = await getDoc(doc(db, "usuarios", idUsuario));
    const data = snapshot.data();
    return Array.isArray(data?.itemsComprados) ? data.itemsComprados : [];
  }

  /**
   * Marca o desmarca un ítem como comprado usando arrayUnion/arrayRemove
   * para que dos pulsaciones simultáneas no se pisen.
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
