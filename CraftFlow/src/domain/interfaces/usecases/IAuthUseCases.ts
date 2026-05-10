import { Usuario } from "../../entities/Usuario";

export interface ILoginUseCase {
  /**
   * Ejecuta el caso de uso de inicio de sesión.
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Promesa que resuelve al usuario autenticado
   */
  execute(email: string, password: string): Promise<Usuario>;
}

export interface IRegisterUseCase {
  /**
   * Ejecuta el caso de uso de registro.
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @param nombre - Nombre de visualización
   * @returns Promesa que resuelve al usuario registrado
   */
  execute(email: string, password: string, nombre: string): Promise<Usuario>;
}

export interface ILogoutUseCase {
  /**
   * Ejecuta el caso de uso de cierre de sesión.
   * @returns Promesa que se resuelve al cerrar sesión
   */
  execute(): Promise<void>;
}

export interface IResetPasswordUseCase {
  /**
   * Ejecuta el caso de uso de restablecimiento de contraseña.
   * @param email - Correo electrónico del usuario
   * @returns Promesa que se resuelve al enviar el correo
   */
  execute(email: string): Promise<void>;
}
