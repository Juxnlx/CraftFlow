import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IUpdateMaterialUseCase } from "../../interfaces/usecases/IMaterialUseCases";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";
import { Material } from "../../entities/Material";

/**
 * Caso de uso para actualizar los datos de un material existente.
 * Solo se modifican los campos incluidos en el objeto parcial.
 */
@injectable()
export class UpdateMaterialUseCase implements IUpdateMaterialUseCase {
  private _materialRepository: IMaterialRepository;

  constructor(
    @inject(TYPES.IMaterialRepository) materialRepository: IMaterialRepository
  ) {
    this._materialRepository = materialRepository;
  }

  /** Actualiza un material existente con los campos del objeto parcial. */
  async execute(idMaterial: string, material: Partial<Material>): Promise<void> {
    return this._materialRepository.actualizarMaterial(idMaterial, material);
  }
}
