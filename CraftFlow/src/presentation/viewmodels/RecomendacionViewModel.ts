import { makeAutoObservable, runInAction } from "mobx";
import { container } from "../../core/container";
import { TYPES } from "../../core/types";
import { IGetRecomendacionesUseCase } from "../../domain/interfaces/usecases/IRecomendacionUseCases";
import { ProyectoRecomendado } from "../../domain/entities/ProyectoRecomendado";

/**
 * ViewModel que gestiona las recomendaciones de proyectos.
 * Alimenta la pantalla principal "¿Qué puedo hacer hoy?"
 * con proyectos ordenados por porcentaje de compatibilidad.
 */
export class RecomendacionViewModel {
  recomendaciones: ProyectoRecomendado[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  private _getRecomendacionesUseCase: IGetRecomendacionesUseCase;

  constructor() {
    makeAutoObservable(this);
    this._getRecomendacionesUseCase = container.get<IGetRecomendacionesUseCase>(TYPES.IGetRecomendacionesUseCase);
  }

  /** Carga las recomendaciones para el usuario actual. */
  async cargarRecomendaciones(idUsuario: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const recomendaciones = await this._getRecomendacionesUseCase.execute(idUsuario);
      runInAction(() => {
        this.recomendaciones = recomendaciones;
        this.isLoading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Error al cargar recomendaciones";
        this.isLoading = false;
      });
    }
  }

  /** Proyectos donde el usuario tiene TODOS los materiales necesarios. */
  get proyectosQuePuedoHacer(): ProyectoRecomendado[] {
    return this.recomendaciones.filter((r) => r.canMake);
  }

  /** Número de proyectos que el usuario puede hacer ahora mismo. */
  get totalProyectosDisponibles(): number {
    return this.proyectosQuePuedoHacer.length;
  }
}
