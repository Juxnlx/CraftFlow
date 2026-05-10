import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IDeleteHerramientaUseCase } from "../../interfaces/usecases/IHerramientaUseCases";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";

@injectable()
export class DeleteHerramientaUseCase implements IDeleteHerramientaUseCase {
  private _herramientaRepository: IHerramientaRepository;

  /**
   * @param herramientaRepository - Repositorio de herramientas inyectado
   */
  constructor(
    @inject(TYPES.IHerramientaRepository) herramientaRepository: IHerramientaRepository
  ) {
    this._herramientaRepository = herramientaRepository;
  }

  async execute(idHerramienta: string): Promise<void> {
    return this._herramientaRepository.eliminarHerramienta(idHerramienta);
  }
}
