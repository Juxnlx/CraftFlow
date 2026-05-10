import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IGetMaterialesUseCase } from "../../interfaces/usecases/IMaterialUseCases";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";
import { Material } from "../../entities/Material";

@injectable()
export class GetMaterialesUseCase implements IGetMaterialesUseCase {
  private _materialRepository: IMaterialRepository;

  /**
   * @param materialRepository - Repositorio de materiales inyectado
   */
  constructor(
    @inject(TYPES.IMaterialRepository) materialRepository: IMaterialRepository
  ) {
    this._materialRepository = materialRepository;
  }

  async execute(idUsuario: string): Promise<Material[]> {
    return this._materialRepository.getMaterialesPorUsuario(idUsuario);
  }
}
