import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IAbandonarProyectoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";

/**
 * Caso de uso para abandonar un proyecto en curso.
 * Elimina el seguimiento del usuario sobre ese proyecto. No afecta al
 * proyecto original ni al historial de proyectos completados.
 */
@injectable()
export class AbandonarProyectoUseCase implements IAbandonarProyectoUseCase {
  private _repo: IProyectoEnProgresoRepository;

  constructor(
    @inject(TYPES.IProyectoEnProgresoRepository)
    repo: IProyectoEnProgresoRepository
  ) {
    this._repo = repo;
  }

  /** Elimina el seguimiento, descartando el progreso registrado. */
  async execute(idSeguimiento: string): Promise<void> {
    await this._repo.eliminarProyectoEnProgreso(idSeguimiento);
  }
}
