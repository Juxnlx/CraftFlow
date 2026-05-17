import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetFavoritosUseCase } from "../../interfaces/usecases/IFavoritoUseCases";
import { IFavoritoRepository } from "../../interfaces/repositories/IFavoritoRepository";
import { Favorito } from "../../entities/Favorito";

/**
 * Caso de uso para obtener los proyectos guardados como favoritos
 * por un usuario. Se usa para alimentar la pestaña "Guardados" y para
 * generar la lista de la compra.
 */
@injectable()
export class GetFavoritosUseCase implements IGetFavoritosUseCase {
  private _favoritoRepository: IFavoritoRepository;

  constructor(
    @inject(TYPES.IFavoritoRepository) favoritoRepository: IFavoritoRepository
  ) {
    this._favoritoRepository = favoritoRepository;
  }

  /** Devuelve los favoritos guardados por el usuario. */
  async execute(idUsuario: string): Promise<Favorito[]> {
    return this._favoritoRepository.getFavoritosPorUsuario(idUsuario);
  }
}
