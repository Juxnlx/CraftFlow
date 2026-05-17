import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IToggleFavoritoUseCase } from "../../interfaces/usecases/IFavoritoUseCases";
import { IFavoritoRepository } from "../../interfaces/repositories/IFavoritoRepository";

/**
 * Caso de uso para alternar el estado de favorito de un proyecto.
 * Si ya está guardado lo elimina; si no lo está, lo crea. Permite
 * implementar el botón "Guardar / Guardado" con una sola acción.
 */
@injectable()
export class ToggleFavoritoUseCase implements IToggleFavoritoUseCase {
  private _favoritoRepository: IFavoritoRepository;

  constructor(
    @inject(TYPES.IFavoritoRepository) favoritoRepository: IFavoritoRepository
  ) {
    this._favoritoRepository = favoritoRepository;
  }

  /**
   * Alterna el favorito.
   * @returns El nuevo estado: true si quedó guardado, false si dejó de estarlo
   */
  async execute(idUsuario: string, idProyecto: string): Promise<boolean> {
    return this._favoritoRepository.toggleFavorito(idUsuario, idProyecto);
  }
}
