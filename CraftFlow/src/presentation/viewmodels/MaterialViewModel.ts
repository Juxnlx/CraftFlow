import { makeAutoObservable, runInAction } from "mobx";
import { container } from "../../core/container";
import { TYPES } from "../../core/types";
import {
  IGetMaterialesUseCase,
  ICreateMaterialUseCase,
  IUpdateMaterialUseCase,
  IDeleteMaterialUseCase,
} from "../../domain/interfaces/usecases/IMaterialUseCases";
import { Material, CategoriaType } from "../../domain/entities/Material";

/**
 * ViewModel que gestiona el inventario de materiales del usuario.
 * Proporciona operaciones CRUD y agrupación por categoría.
 */
export class MaterialViewModel {
  /** Lista de materiales del inventario del usuario actual */
  materiales: Material[] = [];
  /** Indica si hay una operación en curso (carga o CRUD) */
  isLoading: boolean = false;
  /** Mensaje de error a mostrar en la UI, o null si no hay */
  error: string | null = null;

  /** UID del último usuario cargado, usado para recargar tras un CRUD */
  private _idUsuarioActual: string = "";
  /** Caso de uso para obtener los materiales del usuario */
  private _getMaterialesUseCase: IGetMaterialesUseCase;
  /** Caso de uso para crear un material */
  private _createMaterialUseCase: ICreateMaterialUseCase;
  /** Caso de uso para actualizar un material */
  private _updateMaterialUseCase: IUpdateMaterialUseCase;
  /** Caso de uso para eliminar un material */
  private _deleteMaterialUseCase: IDeleteMaterialUseCase;

  /** Activa MobX y resuelve los casos de uso desde el contenedor de DI. */
  constructor() {
    makeAutoObservable(this);
    this._getMaterialesUseCase = container.get<IGetMaterialesUseCase>(TYPES.IGetMaterialesUseCase);
    this._createMaterialUseCase = container.get<ICreateMaterialUseCase>(TYPES.ICreateMaterialUseCase);
    this._updateMaterialUseCase = container.get<IUpdateMaterialUseCase>(TYPES.IUpdateMaterialUseCase);
    this._deleteMaterialUseCase = container.get<IDeleteMaterialUseCase>(TYPES.IDeleteMaterialUseCase);
  }

  /** Carga todos los materiales del usuario desde Firestore. */
  async cargarMateriales(idUsuario: string): Promise<void> {
    this._idUsuarioActual = idUsuario;
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const materiales = await this._getMaterialesUseCase.execute(idUsuario);
      runInAction(() => {
        this.materiales = materiales;
        this.isLoading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Error al cargar los materiales";
        this.isLoading = false;
      });
    }
  }

  /**
   * Crea un nuevo material y recarga la lista.
   * @returns true si se creó correctamente
   */
  async crearMaterial(material: Material): Promise<boolean> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await this._createMaterialUseCase.execute(material);
      await this.cargarMateriales(this._idUsuarioActual);
      return true;
    } catch {
      runInAction(() => {
        this.error = "Error al crear el material";
        this.isLoading = false;
      });
      return false;
    }
  }

  /**
   * Actualiza un material existente y recarga la lista.
   * @returns true si se actualizó correctamente
   */
  async actualizarMaterial(idMaterial: string, datos: Partial<Material>): Promise<boolean> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await this._updateMaterialUseCase.execute(idMaterial, datos);
      await this.cargarMateriales(this._idUsuarioActual);
      return true;
    } catch {
      runInAction(() => {
        this.error = "Error al actualizar el material";
        this.isLoading = false;
      });
      return false;
    }
  }

  /**
   * Elimina un material y recarga la lista.
   * @returns true si se eliminó correctamente
   */
  async eliminarMaterial(idMaterial: string): Promise<boolean> {
    try {
      await this._deleteMaterialUseCase.execute(idMaterial);
      await this.cargarMateriales(this._idUsuarioActual);
      return true;
    } catch {
      runInAction(() => {
        this.error = "Error al eliminar el material";
      });
      return false;
    }
  }

  /** Agrupa los materiales por categoría para mostrar en secciones. */
  get materialesPorCategoria(): Record<CategoriaType, Material[]> {
    const agrupados: Record<string, Material[]> = {};
    for (const m of this.materiales) {
      if (!agrupados[m.categoria]) {
        agrupados[m.categoria] = [];
      }
      agrupados[m.categoria].push(m);
    }
    return agrupados as Record<CategoriaType, Material[]>;
  }
}
