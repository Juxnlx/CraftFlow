import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IActualizarProgresoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

@injectable()
export class ActualizarProgresoUseCase implements IActualizarProgresoUseCase {
  private _repo: IProyectoEnProgresoRepository;

  constructor(
    @inject(TYPES.IProyectoEnProgresoRepository)
    repo: IProyectoEnProgresoRepository
  ) {
    this._repo = repo;
  }

  async execute(
    idSeguimiento: string,
    datos: Partial<ProyectoEnProgreso>
  ): Promise<void> {
    return this._repo.actualizarProyectoEnProgreso(idSeguimiento, datos);
  }
}
