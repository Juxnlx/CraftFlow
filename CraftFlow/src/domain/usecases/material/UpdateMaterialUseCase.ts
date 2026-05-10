import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IUpdateMaterialUseCase } from "../../interfaces/usecases/IMaterialUseCases";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";
import { Material } from "../../entities/Material";

@injectable()
export class UpdateMaterialUseCase implements IUpdateMaterialUseCase {
  private _materialRepository: IMaterialRepository;

  /**
   * @param materialRepository - Repositorio de materiales inyectado
   */
  constructor(
    @inject(TYPES.IMaterialRepository) materialRepository: IMaterialRepository
  ) {
    this._materialRepository = materialRepository;
  }

  async execute(idMaterial: string, material: Partial<Material>): Promise<void> {
    return this._materialRepository.actualizarMaterial(idMaterial, material);
  }
}
