import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetMisProyectosEnProgresoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

/**
 * Caso de uso para obtener los seguimientos en curso del usuario.
 * Se utiliza tanto en la sección "Sigue trabajando" del Home como en
 * la pestaña "En proceso" del perfil.
 */
@injectable()
export class GetMisProyectosEnProgresoUseCase
  implements IGetMisProyectosEnProgresoUseCase {
  private _repo: IProyectoEnProgresoRepository;

  constructor(
    @inject(TYPES.IProyectoEnProgresoRepository)
    repo: IProyectoEnProgresoRepository
  ) {
    this._repo = repo;
  }

  /** Devuelve los seguimientos del usuario que están en curso. */
  async execute(idUsuario: string): Promise<ProyectoEnProgreso[]> {
    return this._repo.getMisProyectosEnProgreso(idUsuario);
  }
}
