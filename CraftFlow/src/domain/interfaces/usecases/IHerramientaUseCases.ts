import { Herramienta } from "../../entities/Herramienta";

export interface IGetHerramientasUseCase {
  /**
   * Ejecuta el caso de uso para obtener las herramientas de un usuario.
   * @param idUsuario - ID del usuario
   * @returns Promesa que resuelve a un array de herramientas
   */
  execute(idUsuario: string): Promise<Herramienta[]>;
}

export interface ICreateHerramientaUseCase {
  /**
   * Ejecuta el caso de uso para crear una herramienta.
   * @param herramienta - Objeto herramienta a crear
   * @returns Promesa que resuelve al ID de la herramienta creada
   */
  execute(herramienta: Herramienta): Promise<string>;
}

export interface IUpdateHerramientaUseCase {
  /**
   * Ejecuta el caso de uso para actualizar una herramienta.
   * @param idHerramienta - ID de la herramienta a actualizar
   * @param herramienta - Datos parciales de la herramienta a actualizar
   * @returns Promesa que se resuelve al actualizar
   */
  execute(idHerramienta: string, herramienta: Partial<Herramienta>): Promise<void>;
}

export interface IDeleteHerramientaUseCase {
  /**
   * Ejecuta el caso de uso para eliminar una herramienta.
   * @param idHerramienta - ID de la herramienta a eliminar
   * @returns Promesa que se resuelve al eliminar
   */
  execute(idHerramienta: string): Promise<void>;
}
