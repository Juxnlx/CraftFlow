import { Material } from "../../entities/Material";

export interface IMaterialRepository {
  /**
   * Obtiene todos los materiales de un usuario.
   * @param idUsuario - ID del usuario dueño de los materiales
   * @returns Promesa que resuelve a un array de materiales
   */
  getMaterialesPorUsuario(idUsuario: string): Promise<Material[]>;

  /**
   * Obtiene un material específico por su ID.
   * @param idMaterial - ID del material a buscar
   * @returns Promesa que resuelve al material encontrado
   */
  getMaterialPorId(idMaterial: string): Promise<Material>;

  /**
   * Crea un nuevo material en la base de datos.
   * @param material - Objeto material a persistir
   * @returns Promesa que resuelve al ID del material creado
   */
  crearMaterial(material: Material): Promise<string>;

  /**
   * Actualiza los datos de un material existente.
   * @param idMaterial - ID del material a actualizar
   * @param material - Objeto con los campos parciales a actualizar
   * @returns Promesa que se resuelve al completar la actualización
   */
  actualizarMaterial(idMaterial: string, material: Partial<Material>): Promise<void>;

  /**
   * Elimina un material de la base de datos.
   * @param idMaterial - ID del material a eliminar
   * @returns Promesa que se resuelve al eliminar el material
   */
  eliminarMaterial(idMaterial: string): Promise<void>;
}
