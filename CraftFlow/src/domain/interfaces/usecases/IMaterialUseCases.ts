import { Material } from "../../entities/Material";

export interface IGetMaterialesUseCase {
  /**
   * Ejecuta el caso de uso para obtener los materiales de un usuario.
   * @param idUsuario - ID del usuario
   * @returns Promesa que resuelve a un array de materiales
   */
  execute(idUsuario: string): Promise<Material[]>;
}

export interface ICreateMaterialUseCase {
  /**
   * Ejecuta el caso de uso para crear un material.
   * @param material - Objeto material a crear
   * @returns Promesa que resuelve al ID del material creado
   */
  execute(material: Material): Promise<string>;
}

export interface IUpdateMaterialUseCase {
  /**
   * Ejecuta el caso de uso para actualizar un material.
   * @param idMaterial - ID del material a actualizar
   * @param material - Datos parciales del material a actualizar
   * @returns Promesa que se resuelve al actualizar
   */
  execute(idMaterial: string, material: Partial<Material>): Promise<void>;
}

export interface IDeleteMaterialUseCase {
  /**
   * Ejecuta el caso de uso para eliminar un material.
   * @param idMaterial - ID del material a eliminar
   * @returns Promesa que se resuelve al eliminar
   */
  execute(idMaterial: string): Promise<void>;
}
