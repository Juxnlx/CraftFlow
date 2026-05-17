import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IDeleteHerramientaUseCase } from "../../interfaces/usecases/IHerramientaUseCases";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";

/**
 * Caso de uso para eliminar una herramienta del inventario.
 * Delega el borrado en el repositorio.
 */
@injectable()
export class DeleteHerramientaUseCase implements IDeleteHerramientaUseCase {
  private _herramientaRepository: IHerramientaRepository;

  constructor(
    @inject(TYPES.IHerramientaRepository) herramientaRepository: IHerramientaRepository
  ) {
    this._herramientaRepository = herramientaRepository;
  }

  /** Elimina una herramienta del inventario. */
  async execute(idHerramienta: string): Promise<void> {
    return this._herramientaRepository.eliminarHerramienta(idHerramienta);
  }
}
