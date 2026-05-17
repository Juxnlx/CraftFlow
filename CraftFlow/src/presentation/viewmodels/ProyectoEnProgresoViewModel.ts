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
 * Mantiene el proyecto activo, los completados y los que están en curso,
 * y persiste el progreso (pasos, fotos y tiempos) en Firestore.
 */
export class ProyectoEnProgresoViewModel {
  /** Seguimiento que el usuario está realizando ahora (null si ninguno) */
  proyectoActivo: ProyectoEnProgreso | null = null;

  /** Historial de proyectos completados del usuario (perfil) */
  proyectosCompletados: ProyectoEnProgreso[] = [];

  /** Seguimientos en curso del usuario (Home "Sigue trabajando" y perfil "En proceso") */
  proyectosEnProgreso: ProyectoEnProgreso[] = [];

  /** Indica si se está cargando un seguimiento o lista desde Firestore */
  isLoading: boolean = false;
  /** Indica si se está persistiendo un cambio (iniciar, completar, etc.) */
  isSaving: boolean = false;
  /** Mensaje de error a mostrar en la UI, o null si no hay */
  mensajeError: string | null = null;

  /**
   * Suma de los tiempos registrados por paso, en segundos. Si no hay
   * tiempos por paso, devuelve el campo global `tiempoInvertidoSegundos`
   * como respaldo para datos antiguos.
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

  /** Caso de uso para iniciar (o recuperar) un seguimiento */
  private _iniciarUseCase: IIniciarProyectoUseCase;
  /** Caso de uso para obtener el seguimiento activo de un proyecto */
  private _getEnProgresoUseCase: IGetProyectoEnProgresoUseCase;
  /** Caso de uso para actualizar pasos, tiempos o fotos del seguimiento */
  private _actualizarUseCase: IActualizarProgresoUseCase;
  /** Caso de uso para marcar un seguimiento como completado */
  private _completarUseCase: ICompletarProyectoUseCase;
  /** Caso de uso para obtener los proyectos terminados del usuario */
  private _getCompletadosUseCase: IGetProyectosCompletadosUseCase;
  /** Caso de uso para obtener los seguimientos en curso del usuario */
  private _getMisEnProgresoUseCase: IGetMisProyectosEnProgresoUseCase;
  /** Caso de uso para abandonar un seguimiento (lo elimina) */
  private _abandonarUseCase: IAbandonarProyectoUseCase;

  /** Activa MobX y resuelve los casos de uso desde el contenedor de DI. */
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
      // Si falla la carga, dejamos la lista vacía sin notificar al usuario
    }
  }

  /**
   * Carga el seguimiento activo del usuario sobre un proyecto, si existe.
   * Si no lo había empezado deja `proyectoActivo` a null.
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
   * actualiza la foto de progreso. Persiste el cambio inmediatamente.
   * @param fotoProgreso - undefined deja la actual, null la elimina, string la sustituye
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

    // Actualización optimista: cambiamos el VM primero y luego persistimos.
    // Hace falta una nueva instancia porque la entidad no es observable
    // y MobX no detecta mutaciones internas.
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
   * Devuelve una nueva instancia con los pasos sustituidos. Reasignar
   * la referencia es lo que dispara el re-render de MobX, ya que la
   * entidad no es observable internamente.
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
      // Volcamos la suma de tiempos en el campo global para que las
      // pantallas antiguas que lo leen sigan funcionando.
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
      // Si falla la carga, dejamos la lista vacía sin notificar al usuario
    }
  }
}
