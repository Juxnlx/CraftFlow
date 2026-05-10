import { makeAutoObservable, runInAction } from "mobx";
import { container } from "../../core/container";
import { TYPES } from "../../core/types";
import {
  IIniciarProyectoUseCase,
  IGetProyectoEnProgresoUseCase,
  IActualizarProgresoUseCase,
  ICompletarProyectoUseCase,
  IGetProyectosCompletadosUseCase,
  IGetMisProyectosEnProgresoUseCase,
  IAbandonarProyectoUseCase,
} from "../../domain/interfaces/usecases/IProyectoEnProgresoUseCases";
import {
  ProyectoEnProgreso,
  PasoCompletado,
} from "../../domain/entities/ProyectoEnProgreso";

/**
 * ViewModel que gestiona el seguimiento de proyectos en realización.
 *
 * Centraliza:
 * - El proyecto que el usuario está haciendo ahora (proyectoActivo).
 * - El cronómetro que mide el tiempo invertido en la sesión actual.
 * - Los proyectos completados (para mostrar en el perfil).
 *
 * El cronómetro se gestiona aquí (en lugar de en la pantalla) para que
 * persista al cambiar de pestaña o pausar y reanudar dentro de la app.
 * El "tiempoActual" expuesto suma el tiempo acumulado de sesiones previas
 * más el tiempo de la sesión activa, ambos en segundos.
 */
export class ProyectoEnProgresoViewModel {
  /** Seguimiento que el usuario está realizando ahora (null si ninguno) */
  proyectoActivo: ProyectoEnProgreso | null = null;

  /** Historial de proyectos completados del usuario (perfil) */
  proyectosCompletados: ProyectoEnProgreso[] = [];

  /** Seguimientos en curso del usuario (Home "Sigue trabajando" y perfil "En proceso") */
  proyectosEnProgreso: ProyectoEnProgreso[] = [];

  isLoading: boolean = false;
  isSaving: boolean = false;
  mensajeError: string | null = null;

  /**
   * Suma de los tiempos opcionales registrados por paso, en segundos.
   * Si el usuario no rellena tiempos, vale 0. Si datos antiguos solo tienen
   * `tiempoInvertidoSegundos` global, se usa ese como fallback.
   */
  get tiempoTotalSegundos(): number {
    if (!this.proyectoActivo) return 0;
    const sumaPasos = this.proyectoActivo.pasosCompletados.reduce(
      (acc, p) => acc + (p.tiempoSegundos ?? 0),
      0
    );
    if (sumaPasos > 0) return sumaPasos;
    return this.proyectoActivo.tiempoInvertidoSegundos ?? 0;
  }

  private _iniciarUseCase: IIniciarProyectoUseCase;
  private _getEnProgresoUseCase: IGetProyectoEnProgresoUseCase;
  private _actualizarUseCase: IActualizarProgresoUseCase;
  private _completarUseCase: ICompletarProyectoUseCase;
  private _getCompletadosUseCase: IGetProyectosCompletadosUseCase;
  private _getMisEnProgresoUseCase: IGetMisProyectosEnProgresoUseCase;
  private _abandonarUseCase: IAbandonarProyectoUseCase;

  constructor() {
    makeAutoObservable(this);
    this._iniciarUseCase = container.get<IIniciarProyectoUseCase>(
      TYPES.IIniciarProyectoUseCase
    );
    this._getEnProgresoUseCase = container.get<IGetProyectoEnProgresoUseCase>(
      TYPES.IGetProyectoEnProgresoUseCase
    );
    this._actualizarUseCase = container.get<IActualizarProgresoUseCase>(
      TYPES.IActualizarProgresoUseCase
    );
    this._completarUseCase = container.get<ICompletarProyectoUseCase>(
      TYPES.ICompletarProyectoUseCase
    );
    this._getCompletadosUseCase = container.get<IGetProyectosCompletadosUseCase>(
      TYPES.IGetProyectosCompletadosUseCase
    );
    this._getMisEnProgresoUseCase = container.get<IGetMisProyectosEnProgresoUseCase>(
      TYPES.IGetMisProyectosEnProgresoUseCase
    );
    this._abandonarUseCase = container.get<IAbandonarProyectoUseCase>(
      TYPES.IAbandonarProyectoUseCase
    );
  }

  /**
   * Abandona un proyecto en curso eliminando su seguimiento.
   * Actualiza la lista local para reflejar el cambio sin recargar.
   */
  async abandonarProyecto(idSeguimiento: string): Promise<boolean> {
    try {
      await this._abandonarUseCase.execute(idSeguimiento);
      runInAction(() => {
        this.proyectosEnProgreso = this.proyectosEnProgreso.filter(
          (s) => s.id !== idSeguimiento
        );
        if (this.proyectoActivo?.id === idSeguimiento) {
          this.proyectoActivo = null;
        }
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.mensajeError =
          error instanceof Error ? error.message : "Error al abandonar proyecto";
      });
      return false;
    }
  }

  /**
   * Carga la lista de seguimientos en curso del usuario.
   * Se usa en el Home ("Sigue trabajando") y en el perfil ("En proceso").
   */
  async cargarMisProyectosEnProgreso(idUsuario: string): Promise<void> {
    try {
      const lista = await this._getMisEnProgresoUseCase.execute(idUsuario);
      runInAction(() => {
        this.proyectosEnProgreso = lista;
      });
    } catch {
      // Silencioso: si falla, simplemente no se muestran
    }
  }

  /**
   * Carga el seguimiento activo del usuario sobre un proyecto, si existe.
   * Si no existe, deja proyectoActivo en null. Útil al entrar al detalle
   * de un proyecto para saber si el usuario ya lo había empezado.
   */
  async cargarSeguimiento(
    idUsuario: string,
    idProyecto: string
  ): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.mensajeError = null;
    });

    try {
      const seguimiento = await this._getEnProgresoUseCase.execute(
        idUsuario,
        idProyecto
      );
      runInAction(() => {
        this.proyectoActivo = seguimiento;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.mensajeError =
          error instanceof Error ? error.message : "Error al cargar seguimiento";
        this.isLoading = false;
      });
    }
  }

  /**
   * Inicia un nuevo seguimiento o recupera el existente.
   * Se llama cuando el usuario pulsa "Empezar" o "Continuar".
   */
  async iniciarProyecto(
    idUsuario: string,
    idProyecto: string,
    numeroPasos: number
  ): Promise<ProyectoEnProgreso | null> {
    runInAction(() => {
      this.isSaving = true;
      this.mensajeError = null;
    });

    try {
      const seguimiento = await this._iniciarUseCase.execute(
        idUsuario,
        idProyecto,
        numeroPasos
      );
      runInAction(() => {
        this.proyectoActivo = seguimiento;
        this.isSaving = false;
      });
      return seguimiento;
    } catch (error) {
      runInAction(() => {
        this.mensajeError =
          error instanceof Error ? error.message : "Error al iniciar proyecto";
        this.isSaving = false;
      });
      return null;
    }
  }

  /**
   * Actualiza el tiempo (en segundos) que el usuario tardó en un paso concreto.
   * Es opcional: si no se llama, los pasos quedan a 0 y el total será 0.
   * El total del proyecto se calcula como suma vía `tiempoTotalSegundos`.
   */
  async actualizarTiempoPaso(
    numeroOrden: number,
    tiempoSegundos: number
  ): Promise<void> {
    if (!this.proyectoActivo) return;

    const nuevosPasos: PasoCompletado[] = this.proyectoActivo.pasosCompletados.map(
      (p) =>
        p.numeroOrden === numeroOrden
          ? { ...p, tiempoSegundos: Math.max(0, tiempoSegundos) }
          : p
    );

    const idActivo = this.proyectoActivo.id;
    runInAction(() => {
      if (this.proyectoActivo) {
        this.proyectoActivo = this._conPasos(this.proyectoActivo, nuevosPasos);
      }
    });

    try {
      await this._actualizarUseCase.execute(idActivo, {
        pasosCompletados: this._sanitizarPasos(nuevosPasos),
      });
    } catch (error) {
      runInAction(() => {
        this.mensajeError =
          error instanceof Error ? error.message : "Error al actualizar tiempo";
      });
    }
  }

  /**
   * Marca un paso como completado o no completado y opcionalmente
   * añade/cambia/quita la foto de progreso. Persiste el cambio inmediatamente.
   *
   * @param fotoProgreso - undefined: no toca la foto existente.
   *                       null: la elimina.
   *                       string: la sustituye por la nueva URL.
   */
  async marcarPaso(
    numeroOrden: number,
    completado: boolean,
    fotoProgreso?: string | null
  ): Promise<void> {
    if (!this.proyectoActivo) return;

    const nuevosPasos: PasoCompletado[] = this.proyectoActivo.pasosCompletados.map(
      (p) =>
        p.numeroOrden === numeroOrden
          ? {
              ...p,
              completado,
              fotoProgreso:
                fotoProgreso === undefined ? p.fotoProgreso : fotoProgreso,
            }
          : p
    );

    // Optimista: actualizar UI primero, luego persistir.
    // Reasignamos la referencia con una nueva instancia para que MobX
    // detecte el cambio (la entidad en sí no es observable).
    const idActivo = this.proyectoActivo.id;
    runInAction(() => {
      if (this.proyectoActivo) {
        this.proyectoActivo = this._conPasos(this.proyectoActivo, nuevosPasos);
      }
    });

    try {
      await this._actualizarUseCase.execute(idActivo, {
        pasosCompletados: this._sanitizarPasos(nuevosPasos),
      });
    } catch (error) {
      runInAction(() => {
        this.mensajeError =
          error instanceof Error ? error.message : "Error al actualizar paso";
      });
    }
  }

  /**
   * Asegura que cada paso tiene todos los campos definidos antes de persistir.
   * Firestore rechaza valores `undefined`, por lo que normalizamos a null/0.
   */
  private _sanitizarPasos(pasos: PasoCompletado[]): PasoCompletado[] {
    return pasos.map((p) => ({
      numeroOrden: p.numeroOrden,
      completado: p.completado,
      fotoProgreso: p.fotoProgreso ?? null,
      tiempoSegundos: p.tiempoSegundos ?? 0,
    }));
  }

  /**
   * Devuelve una nueva instancia de ProyectoEnProgreso con los pasos cambiados.
   * Es necesario porque la entidad NO es observable internamente: si solo
   * mutamos `proyectoActivo.pasosCompletados`, MobX no detecta el cambio y
   * la UI se queda con datos obsoletos. Reasignar la referencia del VM sí
   * dispara re-render.
   */
  private _conPasos(
    actual: ProyectoEnProgreso,
    pasos: PasoCompletado[]
  ): ProyectoEnProgreso {
    return new ProyectoEnProgreso(
      actual.id,
      actual.idUsuario,
      actual.idProyecto,
      actual.fechaInicio,
      actual.fechaCompletado,
      actual.estado,
      pasos,
      actual.tiempoInvertidoSegundos,
      actual.imagenResultado,
      actual.notaFinal
    );
  }

  /**
   * Cierra el seguimiento marcándolo como completado, con foto del
   * resultado y nota opcional. Guarda también el tiempo final acumulado.
   */
  async completarProyecto(
    imagenResultado: string | null,
    notaFinal: string | null
  ): Promise<boolean> {
    if (!this.proyectoActivo) return false;

    runInAction(() => {
      this.isSaving = true;
      this.mensajeError = null;
    });

    try {
      // Persistimos el total (suma de tiempos por paso) en el campo legacy
      // tiempoInvertidoSegundos para que las pantallas que lo lean sigan
      // funcionando aunque no se haya tocado el cronómetro automático.
      await this._actualizarUseCase.execute(this.proyectoActivo.id, {
        tiempoInvertidoSegundos: this.tiempoTotalSegundos,
      });
      await this._completarUseCase.execute(
        this.proyectoActivo.id,
        imagenResultado,
        notaFinal
      );
      runInAction(() => {
        this.proyectoActivo = null;
        this.isSaving = false;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.mensajeError =
          error instanceof Error ? error.message : "Error al completar proyecto";
        this.isSaving = false;
      });
      return false;
    }
  }

  /**
   * Carga los proyectos completados del usuario (para el perfil).
   */
  async cargarCompletados(idUsuario: string): Promise<void> {
    try {
      const completados = await this._getCompletadosUseCase.execute(idUsuario);
      runInAction(() => {
        this.proyectosCompletados = completados;
      });
    } catch {
      // Silencioso: si falla, simplemente no se muestran los completados
    }
  }
}
