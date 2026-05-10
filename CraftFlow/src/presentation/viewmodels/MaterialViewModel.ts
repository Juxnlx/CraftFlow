import { makeAutoObservable, runInAction } from "mobx";
import { container } from "../../core/container";
import { TYPES } from "../../core/types";
import { IGetMaterialesUseCase } from "../../domain/interfaces/usecases/IMaterialUseCases";
import { ICreateMaterialUseCase } from "../../domain/interfaces/usecases/IMaterialUseCases";
import { IUpdateMaterialUseCase } from "../../domain/interfaces/usecases/IMaterialUseCases";
import { IDeleteMaterialUseCase } from "../../domain/interfaces/usecases/IMaterialUseCases";
import { Material } from "../../domain/entities/Material";
import { CategoriaType } from "../../domain/entities/Material";

/**
 * ViewModel que gestiona el inventario de materiales del usuario.
 * Proporciona operaciones CRUD y agrupación por categoría.
 */
export class MaterialViewModel {
  materiales: Material[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  private _idUsuarioActual: string = "";
  private _getMaterialesUseCase: IGetMaterialesUseCase;
  private _createMaterialUseCase: ICreateMaterialUseCase;
  private _updateMaterialUseCase: IUpdateMaterialUseCase;
  private _deleteMaterialUseCase: IDeleteMaterialUseCase;

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
      if (!agrupados[m.categoria]) agrupados[m.categoria] = [];
      agrupados[m.categoria].push(m);
    }
    return agrupados as Record<CategoriaType, Material[]>;
  }
}
