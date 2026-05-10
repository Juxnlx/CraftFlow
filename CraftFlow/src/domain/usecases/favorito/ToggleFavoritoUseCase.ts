import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IToggleFavoritoUseCase } from "../../interfaces/usecases/IFavoritoUseCases";
import { IFavoritoRepository } from "../../interfaces/repositories/IFavoritoRepository";

@injectable()
export class ToggleFavoritoUseCase implements IToggleFavoritoUseCase {
  private _favoritoRepository: IFavoritoRepository;

  /**
   * @param favoritoRepository - Repositorio de favoritos inyectado
   */
  constructor(
    @inject(TYPES.IFavoritoRepository) favoritoRepository: IFavoritoRepository
  ) {
    this._favoritoRepository = favoritoRepository;
  }

  async execute(idUsuario: string, idProyecto: string): Promise<boolean> {
    return this._favoritoRepository.toggleFavorito(idUsuario, idProyecto);
  }
}
