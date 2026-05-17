import { makeAutoObservable, runInAction } from "mobx";
import { container } from "../../core/container";
import { TYPES } from "../../core/types";
import {
  IGetFavoritosUseCase,
  IToggleFavoritoUseCase,
} from "../../domain/interfaces/usecases/IFavoritoUseCases";
import { Favorito } from "../../domain/entities/Favorito";

/**
 * ViewModel que gestiona los proyectos guardados como favoritos.
 * Mantiene un Set de IDs para comprobación rápida sin consultar Firebase.
 */
export class FavoritoViewModel {
  /** Lista completa de favoritos del usuario actual */
  favoritos: Favorito[] = [];
  /** IDs de proyectos guardados, para comprobar pertenencia en O(1) */
  favoritosIds: Set<string> = new Set();
  /** Indica si hay una operación de carga en curso */
  isLoading: boolean = false;

  /** UID del último usuario cargado, usado para recargar tras un toggle */
  private _idUsuarioActual: string = "";
  /** Caso de uso para obtener los favoritos del usuario */
  private _getFavoritosUseCase: IGetFavoritosUseCase;
  /** Caso de uso para guardar/quitar favoritos */
  private _toggleFavoritoUseCase: IToggleFavoritoUseCase;

  /** Activa MobX y resuelve los casos de uso desde el contenedor de DI. */
  constructor() {
    makeAutoObservable(this);
    this._getFavoritosUseCase = container.get<IGetFavoritosUseCase>(TYPES.IGetFavoritosUseCase);
    this._toggleFavoritoUseCase = container.get<IToggleFavoritoUseCase>(TYPES.IToggleFavoritoUseCase);
  }

  /** Carga todos los favoritos del usuario y actualiza el Set de IDs. */
  async cargarFavoritos(idUsuario: string): Promise<void> {
    this._idUsuarioActual = idUsuario;
    runInAction(() => {
      this.isLoading = true;
    });

    try {
      const favoritos = await this._getFavoritosUseCase.execute(idUsuario);
      runInAction(() => {
        this.favoritos = favoritos;
        this.favoritosIds = new Set(favoritos.map((f) => f.idProyecto));
        this.isLoading = false;
      });
    } catch {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  /**
   * Alterna el estado de favorito de un proyecto.
   * Actualiza el Set local y recarga desde Firebase.
   */
  async toggleFavorito(idUsuario: string, idProyecto: string): Promise<void> {
    // Actualización optimista: cambiar el Set local inmediatamente para UI instantánea
    runInAction(() => {
      const nuevoSet = new Set(this.favoritosIds);
      if (nuevoSet.has(idProyecto)) {
        nuevoSet.delete(idProyecto);
      } else {
        nuevoSet.add(idProyecto);
      }
      this.favoritosIds = nuevoSet;
    });

    try {
      await this._toggleFavoritoUseCase.execute(idUsuario, idProyecto);
      // Recargar lista completa para sincronizar
      await this.cargarFavoritos(this._idUsuarioActual);
    } catch {
      // Revertir en caso de error: recargar desde servidor
      await this.cargarFavoritos(this._idUsuarioActual);
    }
  }

  /**
   * Comprueba si un proyecto está guardado como favorito.
   * Consulta el Set local (O(1)), sin ir a Firebase.
   */
  esFavorito(idProyecto: string): boolean {
    return this.favoritosIds.has(idProyecto);
  }
}
