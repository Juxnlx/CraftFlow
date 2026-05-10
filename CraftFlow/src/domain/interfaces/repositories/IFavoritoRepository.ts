import { Favorito } from "../../entities/Favorito";

export interface IFavoritoRepository {
  /**
   * Obtiene todos los favoritos guardados por un usuario.
   * @param idUsuario - ID del usuario
   * @returns Promesa que resuelve a un array de favoritos
   */
  getFavoritosPorUsuario(idUsuario: string): Promise<Favorito[]>;

  /**
   * Comprueba si un proyecto específico está marcado como favorito por un usuario.
   * @param idUsuario - ID del usuario
   * @param idProyecto - ID del proyecto
   * @returns Promesa que resuelve a true si es favorito, false en caso contrario
   */
  esFavorito(idUsuario: string, idProyecto: string): Promise<boolean>;

  /**
   * Alterna el estado de favorito de un proyecto para un usuario.
   * @param idUsuario - ID del usuario
   * @param idProyecto - ID del proyecto
   * @returns Promesa que resuelve al nuevo estado (true si ahora es favorito, false si dejó de serlo)
   */
  toggleFavorito(idUsuario: string, idProyecto: string): Promise<boolean>;
}
