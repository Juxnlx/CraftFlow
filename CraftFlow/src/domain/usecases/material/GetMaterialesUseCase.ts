import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetMaterialesUseCase } from "../../interfaces/usecases/IMaterialUseCases";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";
import { Material } from "../../entities/Material";

/**
 * Caso de uso para obtener el inventario de materiales de un usuario.
 * Sirve de fachada entre el ViewModel y el repositorio para no acoplar
 * la presentación a la implementación concreta de Firestore.
 */
@injectable()
export class GetMaterialesUseCase implements IGetMaterialesUseCase {
  private _materialRepository: IMaterialRepository;

  constructor(
    @inject(TYPES.IMaterialRepository) materialRepository: IMaterialRepository
  ) {
    this._materialRepository = materialRepository;
  }

  /** Devuelve todos los materiales del inventario del usuario. */
  async execute(idUsuario: string): Promise<Material[]> {
    return this._materialRepository.getMaterialesPorUsuario(idUsuario);
  }
}
