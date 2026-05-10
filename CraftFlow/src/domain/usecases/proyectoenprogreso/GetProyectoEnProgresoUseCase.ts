import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IGetProyectoEnProgresoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

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

  async execute(
    idUsuario: string,
    idProyecto: string
  ): Promise<ProyectoEnProgreso | null> {
    return this._repo.getProyectoEnProgreso(idUsuario, idProyecto);
  }
}
