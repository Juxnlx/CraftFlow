import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IAbandonarProyectoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";

@injectable()
export class AbandonarProyectoUseCase implements IAbandonarProyectoUseCase {
  private _repo: IProyectoEnProgresoRepository;

  constructor(
    @inject(TYPES.IProyectoEnProgresoRepository)
    repo: IProyectoEnProgresoRepository
  ) {
    this._repo = repo;
  }

  async execute(idSeguimiento: string): Promise<void> {
    await this._repo.eliminarProyectoEnProgreso(idSeguimiento);
  }
}
