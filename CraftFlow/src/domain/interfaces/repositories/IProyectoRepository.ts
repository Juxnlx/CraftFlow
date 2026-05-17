import { Proyecto } from "../../entities/Proyecto";

export interface IProyectoRepository {
  /**
   * Obtiene todos los proyectos que son públicos.
   * @returns Promesa que resuelve a un array de proyectos públicos
   */
  getProyectosPublicos(): Promise<Proyecto[]>;

  /**
   * Obtiene todos los proyectos creados por un usuario.
   * @param idUsuario - ID del usuario dueño de los proyectos
   * @returns Promesa que resuelve a un array de proyectos
   */
  getProyectosPorUsuario(idUsuario: string): Promise<Proyecto[]>;

  /**
   * Obtiene un proyecto específico por su ID.
   * @param idProyecto - ID del proyecto a buscar
   * @returns Promesa que resuelve al proyecto encontrado
   */
  getProyectoPorId(idProyecto: string): Promise<Proyecto>;

  /**
   * Crea un nuevo proyecto en la base de datos.
   * @param proyecto - Objeto proyecto a persistir
   * @returns Promesa que resuelve al ID del proyecto creado
   */
  crearProyecto(proyecto: Proyecto): Promise<string>;

  /**
   * Actualiza los datos de un proyecto existente.
   * @param idProyecto - ID del proyecto a actualizar
   * @param proyecto - Objeto con los campos parciales a actualizar
   * @returns Promesa que se resuelve al completar la actualización
   */
  actualizarProyecto(idProyecto: string, proyecto: Partial<Proyecto>): Promise<void>;

  /**
   * Elimina un proyecto de la base de datos.
   * @param idProyecto - ID del proyecto a eliminar
   * @returns Promesa que se resuelve al eliminar el proyecto
   */
  eliminarProyecto(idProyecto: string): Promise<void>;
}
