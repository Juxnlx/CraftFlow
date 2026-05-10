import { makeAutoObservable, runInAction } from "mobx";
import { container } from "../../core/container";
import { TYPES } from "../../core/types";
import { IGetHerramientasUseCase } from "../../domain/interfaces/usecases/IHerramientaUseCases";
import { ICreateHerramientaUseCase } from "../../domain/interfaces/usecases/IHerramientaUseCases";
import { IUpdateHerramientaUseCase } from "../../domain/interfaces/usecases/IHerramientaUseCases";
import { IDeleteHerramientaUseCase } from "../../domain/interfaces/usecases/IHerramientaUseCases";
import { Herramienta } from "../../domain/entities/Herramienta";

/**
 * ViewModel que gestiona el inventario de herramientas del usuario.
 * Mismo patrón CRUD que MaterialViewModel.
 */
export class HerramientaViewModel {
  herramientas: Herramienta[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  private _idUsuarioActual: string = "";
  private _getHerramientasUseCase: IGetHerramientasUseCase;
  private _createHerramientaUseCase: ICreateHerramientaUseCase;
  private _updateHerramientaUseCase: IUpdateHerramientaUseCase;
  private _deleteHerramientaUseCase: IDeleteHerramientaUseCase;

  constructor() {
    makeAutoObservable(this);
    this._getHerramientasUseCase = container.get<IGetHerramientasUseCase>(TYPES.IGetHerramientasUseCase);
    this._createHerramientaUseCase = container.get<ICreateHerramientaUseCase>(TYPES.ICreateHerramientaUseCase);
    this._updateHerramientaUseCase = container.get<IUpdateHerramientaUseCase>(TYPES.IUpdateHerramientaUseCase);
    this._deleteHerramientaUseCase = container.get<IDeleteHerramientaUseCase>(TYPES.IDeleteHerramientaUseCase);
  }

  /** Carga todas las herramientas del usuario desde Firestore. */
  async cargarHerramientas(idUsuario: string): Promise<void> {
    this._idUsuarioActual = idUsuario;
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const herramientas = await this._getHerramientasUseCase.execute(idUsuario);
      runInAction(() => {
        this.herramientas = herramientas;
        this.isLoading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Error al cargar las herramientas";
        this.isLoading = false;
      });
    }
  }

  /** Crea una nueva herramienta y recarga la lista. */
  async crearHerramienta(herramienta: Herramienta): Promise<boolean> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await this._createHerramientaUseCase.execute(herramienta);
      await this.cargarHerramientas(this._idUsuarioActual);
      return true;
    } catch {
      runInAction(() => {
        this.error = "Error al crear la herramienta";
        this.isLoading = false;
      });
      return false;
    }
  }

  /** Actualiza una herramienta existente y recarga la lista. */
  async actualizarHerramienta(idHerramienta: string, datos: Partial<Herramienta>): Promise<boolean> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await this._updateHerramientaUseCase.execute(idHerramienta, datos);
      await this.cargarHerramientas(this._idUsuarioActual);
      return true;
    } catch {
      runInAction(() => {
        this.error = "Error al actualizar la herramienta";
        this.isLoading = false;
      });
      return false;
    }
  }

  /** Elimina una herramienta y recarga la lista. */
  async eliminarHerramienta(idHerramienta: string): Promise<boolean> {
    try {
      await this._deleteHerramientaUseCase.execute(idHerramienta);
      await this.cargarHerramientas(this._idUsuarioActual);
      return true;
    } catch {
      runInAction(() => {
        this.error = "Error al eliminar la herramienta";
      });
      return false;
    }
  }
}
