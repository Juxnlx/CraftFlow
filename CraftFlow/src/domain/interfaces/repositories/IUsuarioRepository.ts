import { Usuario } from "../../entities/Usuario";

/**
 * Contrato para las operaciones sobre los datos de perfil de los usuarios.
 *
 * Va separado de IAuthRepository: Auth se encarga de la sesión (login,
 * logout, registro) y este repositorio se encarga del perfil (nombre,
 * foto, intereses) y de la marca de ítems comprados de la lista de la compra.
 */
export interface IUsuarioRepository {
  /**
   * Obtiene un usuario por su ID.
   * @param idUsuario - ID del usuario (UID de Firebase Auth)
   * @returns Promesa que resuelve al usuario encontrado
   * @throws Error si el usuario no existe en Firestore
   */
  getUsuarioPorId(idUsuario: string): Promise<Usuario>;

  /**
   * Actualiza los datos del perfil de un usuario.
   * @param idUsuario - ID del usuario a actualizar
   * @param datos - Campos parciales a actualizar (nombre, fotoPerfil, intereses)
   * @returns Promesa que se resuelve al completar la actualización
   */
  actualizarUsuario(idUsuario: string, datos: Partial<Usuario>): Promise<void>;

  /**
   * Devuelve las claves de los ítems de la lista de la compra que el usuario
   * ya ha marcado como comprados.
   */
  getItemsComprados(idUsuario: string): Promise<string[]>;

  /**
   * Marca o desmarca un ítem como comprado en la lista de la compra.
   * Si `comprado` es true se añade a la colección persistida; si es false
   * se elimina. La idempotencia la garantiza Firestore con sets.
   */
  setItemComprado(
    idUsuario: string,
    clave: string,
    comprado: boolean
  ): Promise<void>;
}
