import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IUpdateHerramientaUseCase } from "../../interfaces/usecases/IHerramientaUseCases";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";
import { Herramienta } from "../../entities/Herramienta";

/**
 * Caso de uso para actualizar los datos de una herramienta existente.
 * Solo se modifican los campos incluidos en el objeto parcial.
 */
@injectable()
export class UpdateHerramientaUseCase implements IUpdateHerramientaUseCase {
  private _herramientaRepository: IHerramientaRepository;

  constructor(
    @inject(TYPES.IHerramientaRepository) herramientaRepository: IHerramientaRepository
  ) {
    this._herramientaRepository = herramientaRepository;
  }

  /** Actualiza una herramienta existente con los campos del objeto parcial. */
  async execute(idHerramienta: string, herramienta: Partial<Herramienta>): Promise<void> {
    return this._herramientaRepository.actualizarHerramienta(idHerramienta, herramienta);
  }
}
