import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetProyectosCompletadosUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

/**
 * Caso de uso para obtener los proyectos que el usuario ha completado.
 * Alimenta la pestaña "Completados" del perfil.
 */
@injectable()
export class GetProyectosCompletadosUseCase
  implements IGetProyectosCompletadosUseCase {
  private _repo: IProyectoEnProgresoRepository;

  constructor(
    @inject(TYPES.IProyectoEnProgresoRepository)
    repo: IProyectoEnProgresoRepository
  ) {
    this._repo = repo;
  }

  /** Devuelve los proyectos completados del usuario. */
  async execute(idUsuario: string): Promise<ProyectoEnProgreso[]> {
    return this._repo.getMisProyectosCompletados(idUsuario);
  }
}
