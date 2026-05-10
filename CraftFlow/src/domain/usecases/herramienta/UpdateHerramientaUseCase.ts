import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IUpdateHerramientaUseCase } from "../../interfaces/usecases/IHerramientaUseCases";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";
import { Herramienta } from "../../entities/Herramienta";

@injectable()
export class UpdateHerramientaUseCase implements IUpdateHerramientaUseCase {
  private _herramientaRepository: IHerramientaRepository;

  /**
   * @param herramientaRepository - Repositorio de herramientas inyectado
   */
  constructor(
    @inject(TYPES.IHerramientaRepository) herramientaRepository: IHerramientaRepository
  ) {
    this._herramientaRepository = herramientaRepository;
  }

  async execute(idHerramienta: string, herramienta: Partial<Herramienta>): Promise<void> {
    return this._herramientaRepository.actualizarHerramienta(idHerramienta, herramienta);
  }
}
