import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IDeleteMaterialUseCase } from "../../interfaces/usecases/IMaterialUseCases";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";

/**
 * Caso de uso para eliminar un material del inventario.
 * Delega el borrado en el repositorio.
 */
@injectable()
export class DeleteMaterialUseCase implements IDeleteMaterialUseCase {
  private _materialRepository: IMaterialRepository;

  constructor(
    @inject(TYPES.IMaterialRepository) materialRepository: IMaterialRepository
  ) {
    this._materialRepository = materialRepository;
  }

  /** Elimina un material del inventario. */
  async execute(idMaterial: string): Promise<void> {
    return this._materialRepository.eliminarMaterial(idMaterial);
  }
}
