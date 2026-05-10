import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

/**
 * Contrato para operaciones de datos sobre los seguimientos de proyectos
 * que cada usuario está realizando o ha realizado.
 *
 * Trabaja con la colección "proyectosEnProgreso" en Firestore. Cada
 * documento representa el avance de UN usuario sobre UN proyecto.
 * Un usuario puede tener varios seguimientos (de proyectos distintos).
 */
export interface IProyectoEnProgresoRepository {
  /**
   * Obtiene el seguimiento activo de un usuario para un proyecto específico,
   * si existe. Devuelve null si el usuario nunca empezó ese proyecto o si
   * lo eliminó.
   *
   * @param idUsuario - ID del usuario
   * @param idProyecto - ID del proyecto original
   * @returns Promesa que resuelve al seguimiento o null
   */
  getProyectoEnProgreso(
    idUsuario: string,
    idProyecto: string
  ): Promise<ProyectoEnProgreso | null>;

  /**
   * Obtiene todos los seguimientos del usuario que están en progreso
   * (no completados). Útil para mostrar "Sigue trabajando" en el Home.
   *
   * @param idUsuario - ID del usuario
   * @returns Promesa que resuelve al array de seguimientos activos
   */
  getMisProyectosEnProgreso(idUsuario: string): Promise<ProyectoEnProgreso[]>;

  /**
   * Obtiene todos los proyectos completados por el usuario.
   * Se usan en el perfil para mostrar el historial de creaciones.
   *
   * @param idUsuario - ID del usuario
   * @returns Promesa que resuelve al array de proyectos completados
   */
  getMisProyectosCompletados(idUsuario: string): Promise<ProyectoEnProgreso[]>;

  /**
   * Crea un nuevo seguimiento de proyecto en Firestore.
   * El ID se genera automáticamente.
   *
   * @param proyectoEnProgreso - Objeto a persistir
   * @returns Promesa que resuelve al ID generado
   */
  crearProyectoEnProgreso(
    proyectoEnProgreso: ProyectoEnProgreso
  ): Promise<string>;

  /**
   * Actualiza un seguimiento existente. Solo se actualizan los campos
   * incluidos en el objeto parcial.
   *
   * @param idSeguimiento - ID del seguimiento a actualizar
   * @param datos - Campos parciales a modificar
   */
  actualizarProyectoEnProgreso(
    idSeguimiento: string,
    datos: Partial<ProyectoEnProgreso>
  ): Promise<void>;

  /**
   * Elimina un seguimiento de Firestore.
   * Se usa cuando el usuario quiere abandonar un proyecto que estaba haciendo.
   *
   * @param idSeguimiento - ID del seguimiento a eliminar
   */
  eliminarProyectoEnProgreso(idSeguimiento: string): Promise<void>;
}
