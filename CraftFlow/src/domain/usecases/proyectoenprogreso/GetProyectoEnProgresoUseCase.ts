import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetProyectoEnProgresoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

/**
 * Caso de uso para recuperar el seguimiento activo de un usuario sobre
 * un proyecto. Sirve para mostrar "Continuar (X%)" en el detalle del
 * proyecto cuando el usuario ya lo había empezado.
 */
@injectable()
export class GetProyectoEnProgresoUseCase
  implements IGetProyectoEnProgresoUseCase {
  private _repo: IProyectoEnProgresoRepository;

  constructor(
    @inject(TYPES.IProyectoEnProgresoRepository)
    repo: IProyectoEnProgresoRepository
  ) {
    this._repo = repo;
  }

  /**
   * Devuelve el seguimiento activo o null si el usuario no había
   * empezado todavía ese proyecto.
   */
  async execute(
    idUsuario: string,
    idProyecto: string
  ): Promise<ProyectoEnProgreso | null> {
    return this._repo.getProyectoEnProgreso(idUsuario, idProyecto);
  }
}
