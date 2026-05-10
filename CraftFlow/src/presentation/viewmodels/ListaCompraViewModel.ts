import { makeAutoObservable, runInAction } from "mobx";
import { container } from "../../core/container";
import { TYPES } from "../../core/types";
import { IGetListaCompraUseCase } from "../../domain/interfaces/usecases/IListaCompraUseCases";
import { ItemCompra } from "../../domain/entities/ItemCompra";
import { IUsuarioRepository } from "../../domain/interfaces/repositories/IUsuarioRepository";

/**
 * ViewModel que gestiona la lista de la compra del usuario.
 * Calcula qué materiales y herramientas faltan para hacer los proyectos
 * guardados como favoritos y expone el progreso global.
 */
export class ListaCompraViewModel {
  items: ItemCompra[] = [];
  itemsComprados: Set<string> = new Set();
  isLoading: boolean = false;
  mensajeError: string | null = null;

  private _getListaCompraUseCase: IGetListaCompraUseCase;
  private _usuarioRepository: IUsuarioRepository;
  private _idUsuarioActual: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this._getListaCompraUseCase = container.get<IGetListaCompraUseCase>(
      TYPES.IGetListaCompraUseCase
    );
    this._usuarioRepository = container.get<IUsuarioRepository>(
      TYPES.IUsuarioRepository
    );
  }

  /**
   * Calcula la lista de la compra para el usuario actual y carga las
   * marcas de "comprado" persistidas en Firestore.
   */
  async cargarLista(idUsuario: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.mensajeError = null;
      this._idUsuarioActual = idUsuario;
    });

    try {
      const [items, comprados] = await Promise.all([
        this._getListaCompraUseCase.execute(idUsuario),
        this._usuarioRepository.getItemsComprados(idUsuario),
      ]);
      runInAction(() => {
        this.items = items;
        this.itemsComprados = new Set(comprados);
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.mensajeError =
          error instanceof Error ? error.message : "Error al cargar la lista";
        this.isLoading = false;
      });
    }
  }

  /**
   * Marca/desmarca un ítem como comprado. Hace optimistic update y persiste
   * en Firestore en segundo plano. Si la persistencia falla, revierte.
   */
  async toggleItemComprado(clave: string): Promise<void> {
    if (!this._idUsuarioActual) return;
    const yaComprado = this.itemsComprados.has(clave);
    const nuevoSet = new Set(this.itemsComprados);
    if (yaComprado) nuevoSet.delete(clave);
    else nuevoSet.add(clave);
    runInAction(() => {
      this.itemsComprados = nuevoSet;
    });
    try {
      await this._usuarioRepository.setItemComprado(
        this._idUsuarioActual,
        clave,
        !yaComprado
      );
    } catch {
      runInAction(() => {
        const revert = new Set(this.itemsComprados);
        if (yaComprado) revert.add(clave);
        else revert.delete(clave);
        this.itemsComprados = revert;
      });
    }
  }

  /** @returns true si el ítem está marcado como comprado */
  estaComprado(clave: string): boolean {
    return this.itemsComprados.has(clave);
  }

  /** @returns Cantidad total de ítems pendientes */
  get totalItems(): number {
    return this.items.length;
  }

  /** @returns Cantidad de materiales pendientes */
  get totalMateriales(): number {
    return this.items.filter((i) => !i.esHerramienta).length;
  }

  /** @returns Cantidad de herramientas pendientes */
  get totalHerramientas(): number {
    return this.items.filter((i) => i.esHerramienta).length;
  }
}
