import { Usuario } from "../../entities/Usuario";

export interface IGetUsuarioPorIdUseCase {
  /**
   * Ejecuta el caso de uso para obtener un usuario por su ID.
   * @param idUsuario - ID del usuario (UID de Firebase Auth)
   * @returns Promesa que resuelve al usuario encontrado
   */
  execute(idUsuario: string): Promise<Usuario>;
}

export interface IUpdateUsuarioUseCase {
  /**
   * Ejecuta el caso de uso para actualizar los datos del perfil.
   * Solo se actualizan los campos incluidos en el objeto parcial.
   * @param idUsuario - ID del usuario a actualizar
   * @param datos - Campos parciales a actualizar (nombre, fotoPerfil, intereses, activo)
   * @returns Promesa que se resuelve al completar la actualización
   */
  execute(idUsuario: string, datos: Partial<Usuario>): Promise<void>;
}
