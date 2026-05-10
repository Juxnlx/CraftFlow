import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { ICreateMaterialUseCase } from "../../interfaces/usecases/IMaterialUseCases";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";
import { Material } from "../../entities/Material";

@injectable()
export class CreateMaterialUseCase implements ICreateMaterialUseCase {
  private _materialRepository: IMaterialRepository;

  /**
   * @param materialRepository - Repositorio de materiales inyectado
   */
  constructor(
    @inject(TYPES.IMaterialRepository) materialRepository: IMaterialRepository
  ) {
    this._materialRepository = materialRepository;
  }

  async execute(material: Material): Promise<string> {
    return this._materialRepository.crearMaterial(material);
  }
}
