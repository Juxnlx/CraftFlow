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
  /** Recomendaciones ordenadas por compatibilidad de mayor a menor */
  recomendaciones: ProyectoRecomendado[] = [];
  /** Indica si se está calculando la lista de recomendaciones */
  isLoading: boolean = false;
  /** Mensaje de error a mostrar en la UI, o null si no hay */
  error: string | null = null;

  /** Caso de uso que calcula las recomendaciones del usuario */
  private _getRecomendacionesUseCase: IGetRecomendacionesUseCase;

  /** Activa MobX y resuelve el caso de uso desde el contenedor de DI. */
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
