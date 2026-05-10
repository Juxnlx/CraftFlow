import { ProyectoRecomendado } from "../../entities/ProyectoRecomendado";

export interface IGetRecomendacionesUseCase {
  /**
   * Ejecuta el caso de uso para obtener recomendaciones de proyectos para un usuario.
   * @param idUsuario - ID del usuario del que se obtendrán sus materiales y herramientas
   * @returns Promesa que resuelve a un array de proyectos recomendados
   */
  execute(idUsuario: string): Promise<ProyectoRecomendado[]>;
}
