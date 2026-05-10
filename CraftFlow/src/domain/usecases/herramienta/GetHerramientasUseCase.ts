import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IGetHerramientasUseCase } from "../../interfaces/usecases/IHerramientaUseCases";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";
import { Herramienta } from "../../entities/Herramienta";

@injectable()
export class GetHerramientasUseCase implements IGetHerramientasUseCase {
  private _herramientaRepository: IHerramientaRepository;

  /**
   * @param herramientaRepository - Repositorio de herramientas inyectado
   */
  constructor(
    @inject(TYPES.IHerramientaRepository) herramientaRepository: IHerramientaRepository
  ) {
    this._herramientaRepository = herramientaRepository;
  }

  async execute(idUsuario: string): Promise<Herramienta[]> {
    return this._herramientaRepository.getHerramientasPorUsuario(idUsuario);
  }
}
