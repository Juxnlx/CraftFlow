import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IGetFavoritosUseCase } from "../../interfaces/usecases/IFavoritoUseCases";
import { IFavoritoRepository } from "../../interfaces/repositories/IFavoritoRepository";
import { Favorito } from "../../entities/Favorito";

@injectable()
export class GetFavoritosUseCase implements IGetFavoritosUseCase {
  private _favoritoRepository: IFavoritoRepository;

  /**
   * @param favoritoRepository - Repositorio de favoritos inyectado
   */
  constructor(
    @inject(TYPES.IFavoritoRepository) favoritoRepository: IFavoritoRepository
  ) {
    this._favoritoRepository = favoritoRepository;
  }

  async execute(idUsuario: string): Promise<Favorito[]> {
    return this._favoritoRepository.getFavoritosPorUsuario(idUsuario);
  }
}
