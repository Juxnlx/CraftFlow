import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { ICreateMaterialUseCase } from "../../interfaces/usecases/IMaterialUseCases";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";
import { Material } from "../../entities/Material";

/**
 * Caso de uso para añadir un material al inventario del usuario.
 * Delega la persistencia en el repositorio.
 */
@injectable()
export class CreateMaterialUseCase implements ICreateMaterialUseCase {
  private _materialRepository: IMaterialRepository;

  constructor(
    @inject(TYPES.IMaterialRepository) materialRepository: IMaterialRepository
  ) {
    this._materialRepository = materialRepository;
  }

  /**
   * Crea un nuevo material en el inventario.
   * @returns El ID generado por Firestore
   */
  async execute(material: Material): Promise<string> {
    return this._materialRepository.crearMaterial(material);
  }
}
