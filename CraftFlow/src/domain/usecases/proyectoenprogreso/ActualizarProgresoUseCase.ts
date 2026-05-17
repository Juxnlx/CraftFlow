import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IActualizarProgresoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

/**
 * Caso de uso para actualizar el progreso de un seguimiento.
 * Permite marcar pasos como completados, añadir fotos de progreso o
 * actualizar el tiempo invertido.
 */
@injectable()
export class ActualizarProgresoUseCase implements IActualizarProgresoUseCase {
  private _repo: IProyectoEnProgresoRepository;

  constructor(
    @inject(TYPES.IProyectoEnProgresoRepository)
    repo: IProyectoEnProgresoRepository
  ) {
    this._repo = repo;
  }

  /** Actualiza el seguimiento con los campos del objeto parcial. */
  async execute(
    idSeguimiento: string,
    datos: Partial<ProyectoEnProgreso>
  ): Promise<void> {
    return this._repo.actualizarProyectoEnProgreso(idSeguimiento, datos);
  }
}
