import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IUpdateProyectoUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { Proyecto } from "../../entities/Proyecto";

/**
 * Caso de uso para actualizar un proyecto existente.
 * Solo se modifican los campos incluidos en el objeto parcial.
 */
@injectable()
export class UpdateProyectoUseCase implements IUpdateProyectoUseCase {
  private _proyectoRepository: IProyectoRepository;

  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  /** Actualiza un proyecto existente con los campos del objeto parcial. */
  async execute(idProyecto: string, proyecto: Partial<Proyecto>): Promise<void> {
    return this._proyectoRepository.actualizarProyecto(idProyecto, proyecto);
  }
}
