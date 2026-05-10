import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { ICreateHerramientaUseCase } from "../../interfaces/usecases/IHerramientaUseCases";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";
import { Herramienta } from "../../entities/Herramienta";

@injectable()
export class CreateHerramientaUseCase implements ICreateHerramientaUseCase {
  private _herramientaRepository: IHerramientaRepository;

  /**
   * @param herramientaRepository - Repositorio de herramientas inyectado
   */
  constructor(
    @inject(TYPES.IHerramientaRepository) herramientaRepository: IHerramientaRepository
  ) {
    this._herramientaRepository = herramientaRepository;
  }

  async execute(herramienta: Herramienta): Promise<string> {
    return this._herramientaRepository.crearHerramienta(herramienta);
  }
}
