import { Usuario } from "../../entities/Usuario";

/**
 * Contrato para las operaciones de autenticación.
 * Lo implementa la capa de datos contra Firebase Authentication
 * (login, registro, logout y reset de contraseña).
 */
export interface IAuthRepository {
  /**
   * Inicia sesión con email y contraseña.
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Promesa que resuelve al usuario autenticado
   */
  login(email: string, password: string): Promise<Usuario>;

  /**
   * Registra un nuevo usuario en la aplicación.
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña elegida
   * @param nombre - Nombre visible en la aplicación
   * @returns Promesa que resuelve al usuario registrado
   */
  register(email: string, password: string, nombre: string): Promise<Usuario>;

  /**
   * Cierra la sesión del usuario actual.
   * @returns Promesa que se resuelve al cerrar sesión
   */
  logout(): Promise<void>;

  /**
   * Envía un correo para restablecer la contraseña del usuario.
   * @param email - Correo electrónico al que enviar el enlace
   * @returns Promesa que se resuelve al enviar el correo
   */
  resetPassword(email: string): Promise<void>;
}
