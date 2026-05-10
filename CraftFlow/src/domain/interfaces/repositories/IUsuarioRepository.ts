import { Usuario } from "../../entities/Usuario";

/**
 * Contrato para operaciones de datos sobre usuarios.
 *
 * Separado de IAuthRepository porque Auth gestiona la sesión
 * (login, logout, registro) mientras que este repositorio gestiona
 * los datos del perfil (nombre, foto, intereses) y la consulta
 * de perfiles de otros usuarios.
 *
 * Se necesita principalmente para:
 * - Obtener el autor de un proyecto en las recomendaciones
 * - Mostrar el perfil de otros usuarios en la pantalla de explorar
 * - Actualizar el perfil del usuario en la pantalla de editar perfil
 * - Buscar usuarios por nombre
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
   * Busca usuarios activos cuyo nombre coincida parcialmente con el texto.
   * @param texto - Texto a buscar en el nombre del usuario
   * @returns Promesa que resuelve a un array de usuarios coincidentes
   */
  buscarUsuarios(texto: string): Promise<Usuario[]>;

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
