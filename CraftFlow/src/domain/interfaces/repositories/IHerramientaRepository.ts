import { Herramienta } from "../../entities/Herramienta";

export interface IHerramientaRepository {
  /**
   * Obtiene todas las herramientas de un usuario.
   * @param idUsuario - ID del usuario dueño de las herramientas
   * @returns Promesa que resuelve a un array de herramientas
   */
  getHerramientasPorUsuario(idUsuario: string): Promise<Herramienta[]>;

  /**
   * Crea una nueva herramienta en la base de datos.
   * @param herramienta - Objeto herramienta a persistir
   * @returns Promesa que resuelve al ID de la herramienta creada
   */
  crearHerramienta(herramienta: Herramienta): Promise<string>;

  /**
   * Actualiza los datos de una herramienta existente.
   * @param idHerramienta - ID de la herramienta a actualizar
   * @param herramienta - Objeto con los campos parciales a actualizar
   * @returns Promesa que se resuelve al completar la actualización
   */
  actualizarHerramienta(idHerramienta: string, herramienta: Partial<Herramienta>): Promise<void>;

  /**
   * Elimina una herramienta de la base de datos.
   * @param idHerramienta - ID de la herramienta a eliminar
   * @returns Promesa que se resuelve al eliminar la herramienta
   */
  eliminarHerramienta(idHerramienta: string): Promise<void>;
}
