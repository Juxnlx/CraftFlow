import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetHerramientasUseCase } from "../../interfaces/usecases/IHerramientaUseCases";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";
import { Herramienta } from "../../entities/Herramienta";

/**
 * Caso de uso para obtener el inventario de herramientas de un usuario.
 * Mismo patrón que GetMaterialesUseCase: actúa como fachada entre la
 * presentación y el repositorio.
 */
@injectable()
export class GetHerramientasUseCase implements IGetHerramientasUseCase {
  private _herramientaRepository: IHerramientaRepository;

  constructor(
    @inject(TYPES.IHerramientaRepository) herramientaRepository: IHerramientaRepository
  ) {
    this._herramientaRepository = herramientaRepository;
  }

  /** Devuelve todas las herramientas del inventario del usuario. */
  async execute(idUsuario: string): Promise<Herramienta[]> {
    return this._herramientaRepository.getHerramientasPorUsuario(idUsuario);
  }
}
