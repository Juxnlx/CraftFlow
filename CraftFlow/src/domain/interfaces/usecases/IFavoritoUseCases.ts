import { Favorito } from "../../entities/Favorito";

export interface IGetFavoritosUseCase {
  /**
   * Ejecuta el caso de uso para obtener los favoritos de un usuario.
   * @param idUsuario - ID del usuario
   * @returns Promesa que resuelve a un array de favoritos
   */
  execute(idUsuario: string): Promise<Favorito[]>;
}

export interface IToggleFavoritoUseCase {
  /**
   * Ejecuta el caso de uso para alternar el estado de favorito.
   * @param idUsuario - ID del usuario
   * @param idProyecto - ID del proyecto
   * @returns Promesa que resuelve al nuevo estado (true si es favorito, false si no)
   */
  execute(idUsuario: string, idProyecto: string): Promise<boolean>;
}
