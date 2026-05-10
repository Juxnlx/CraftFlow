import { Proyecto } from "../../entities/Proyecto";

export interface IGetProyectosPublicosUseCase {
  /**
   * Ejecuta el caso de uso para obtener todos los proyectos públicos.
   * @returns Promesa que resuelve a un array de proyectos públicos
   */
  execute(): Promise<Proyecto[]>;
}

export interface IGetMisProyectosUseCase {
  /**
   * Ejecuta el caso de uso para obtener los proyectos de un usuario.
   * @param idUsuario - ID del usuario
   * @returns Promesa que resuelve a un array de proyectos
   */
  execute(idUsuario: string): Promise<Proyecto[]>;
}

export interface IGetProyectoByIdUseCase {
  /**
   * Ejecuta el caso de uso para obtener un proyecto por su ID.
   * @param idProyecto - ID del proyecto
   * @returns Promesa que resuelve al proyecto
   */
  execute(idProyecto: string): Promise<Proyecto>;
}

export interface ICreateProyectoUseCase {
  /**
   * Ejecuta el caso de uso para crear un proyecto.
   * @param proyecto - Objeto proyecto a crear
   * @returns Promesa que resuelve al ID del proyecto creado
   */
  execute(proyecto: Proyecto): Promise<string>;
}

export interface IUpdateProyectoUseCase {
  /**
   * Ejecuta el caso de uso para actualizar un proyecto.
   * @param idProyecto - ID del proyecto a actualizar
   * @param proyecto - Datos parciales del proyecto
   * @returns Promesa que se resuelve al actualizar
   */
  execute(idProyecto: string, proyecto: Partial<Proyecto>): Promise<void>;
}

export interface IDeleteProyectoUseCase {
  /**
   * Ejecuta el caso de uso para eliminar un proyecto.
   * @param idProyecto - ID del proyecto a eliminar
   * @returns Promesa que se resuelve al eliminar
   */
  execute(idProyecto: string): Promise<void>;
}
