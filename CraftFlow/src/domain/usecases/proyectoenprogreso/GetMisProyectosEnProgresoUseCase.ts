import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IGetMisProyectosEnProgresoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

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

  async execute(idUsuario: string): Promise<ProyectoEnProgreso[]> {
    return this._repo.getMisProyectosEnProgreso(idUsuario);
  }
}
