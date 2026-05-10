import { Usuario } from "../../entities/Usuario";

export interface IAuthRepository {
  /**
   * Inicia sesión con email y contraseña.
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Promesa que resuelve al usuario autenticado
   */
  login(email: string, password: string): Promise<Usuario>;

  /**
   * Registra un nuevo usuario.
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @param nombre - Nombre de visualización
   * @returns Promesa que resuelve al usuario registrado
   */
  register(email: string, password: string, nombre: string): Promise<Usuario>;

  /**
   * Cierra la sesión del usuario actual.
   * @returns Promesa que se resuelve al cerrar sesión
   */
  logout(): Promise<void>;

  /**
   * Envía un correo para restablecer la contraseña.
   * @param email - Correo electrónico del usuario
   * @returns Promesa que se resuelve al enviar el correo
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Obtiene el usuario actual autenticado.
   * @returns Promesa que resuelve al usuario actual o null si no hay sesión
   */
  getCurrentUser(): Promise<Usuario | null>;
}
