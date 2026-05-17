import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { ICreateHerramientaUseCase } from "../../interfaces/usecases/IHerramientaUseCases";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";
import { Herramienta } from "../../entities/Herramienta";

/**
 * Caso de uso para añadir una herramienta al inventario del usuario.
 * Delega la persistencia en el repositorio.
 */
@injectable()
export class CreateHerramientaUseCase implements ICreateHerramientaUseCase {
  private _herramientaRepository: IHerramientaRepository;

  constructor(
    @inject(TYPES.IHerramientaRepository) herramientaRepository: IHerramientaRepository
  ) {
    this._herramientaRepository = herramientaRepository;
  }

  /**
   * Crea una nueva herramienta en el inventario.
   * @returns El ID generado por Firestore
   */
  async execute(herramienta: Herramienta): Promise<string> {
    return this._herramientaRepository.crearHerramienta(herramienta);
  }
}
