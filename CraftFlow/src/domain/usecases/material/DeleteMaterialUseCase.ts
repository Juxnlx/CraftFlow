import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IDeleteMaterialUseCase } from "../../interfaces/usecases/IMaterialUseCases";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";

@injectable()
export class DeleteMaterialUseCase implements IDeleteMaterialUseCase {
  private _materialRepository: IMaterialRepository;

  /**
   * @param materialRepository - Repositorio de materiales inyectado
   */
  constructor(
    @inject(TYPES.IMaterialRepository) materialRepository: IMaterialRepository
  ) {
    this._materialRepository = materialRepository;
  }

  async execute(idMaterial: string): Promise<void> {
    return this._materialRepository.eliminarMaterial(idMaterial);
  }
}
