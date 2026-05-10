/**
 * Estado del seguimiento de un proyecto.
 * "en_progreso" mientras el usuario lo está haciendo;
 * "completado" cuando lo termina (no se elimina, queda en su historial).
 */
export type EstadoProyecto = "en_progreso" | "completado";

/**
 * Estado de un paso individual del proyecto en progreso.
 * Cada paso del proyecto original tiene su propio registro de avance:
 * si está marcado como completado, una foto opcional y, opcionalmente,
 * el tiempo (en segundos) que el usuario tardó en hacerlo. El tiempo
 * NO es obligatorio: si el usuario no lo introduce, queda en 0.
 */
export interface PasoCompletado {
  numeroOrden: number;
  completado: boolean;
  fotoProgreso: string | null;
  tiempoSegundos?: number;
}

/**
 * Representa el seguimiento de un proyecto que un usuario está realizando.
 *
 * No es el proyecto en sí (ese vive en la colección "proyectos"), sino
 * el rastro del avance del usuario sobre ese proyecto. Por eso tiene su
 * propia colección "proyectosEnProgreso" en Firestore: cada usuario puede
 * tener su propio seguimiento del mismo proyecto sin afectar al original.
 *
 * Permite:
 * - Marcar pasos completados con su foto opcional
 * - Acumular el tiempo invertido (cronómetro persistente)
 * - Cerrar el proyecto como "completado" con foto de resultado y nota
 *
 * @example
 * const enProgreso = new ProyectoEnProgreso(
 *   "prog001",
 *   "user123",
 *   "proy456",
 *   new Date(),
 *   null,
 *   "en_progreso",
 *   [
 *     { numeroOrden: 1, completado: true, fotoProgreso: null },
 *     { numeroOrden: 2, completado: false, fotoProgreso: null }
 *   ],
 *   1800,  // 30 minutos
 *   null,
 *   null
 * );
 */
export class ProyectoEnProgreso {

  /** ID del seguimiento (generado por Firestore) */
  private _id: string;

  /** ID del usuario que está realizando el proyecto */
  private _idUsuario: string;

  /** ID del proyecto original que se está realizando */
  private _idProyecto: string;

  /** Fecha en la que el usuario empezó el proyecto */
  private _fechaInicio: Date;

  /** Fecha en la que se marcó como completado (null si todavía no) */
  private _fechaCompletado: Date | null;

  /** Estado actual del seguimiento */
  private _estado: EstadoProyecto;

  /**
   * Estado de cada paso del proyecto. El número de elementos coincide con
   * el número de pasos del proyecto original; el array se inicializa al
   * empezar y se va actualizando conforme el usuario marca pasos.
   */
  private _pasosCompletados: PasoCompletado[];

  /**
   * Tiempo total invertido en el proyecto, en segundos.
   * Se acumula entre sesiones: si el usuario pausa y reanuda más tarde,
   * el tiempo no se reinicia.
   */
  private _tiempoInvertidoSegundos: number;

  /** URL de la imagen del resultado final (null hasta completar) */
  private _imagenResultado: string | null;

  /** Nota o reflexión opcional escrita al completar el proyecto */
  private _notaFinal: string | null;

  /**
   * Crea una nueva instancia de ProyectoEnProgreso.
   *
   * @param id - ID generado por Firestore
   * @param idUsuario - ID del usuario propietario del seguimiento
   * @param idProyecto - ID del proyecto original
   * @param fechaInicio - Cuándo se empezó (por defecto: ahora)
   * @param fechaCompletado - Cuándo se completó (null si aún no)
   * @param estado - Estado del seguimiento (por defecto: "en_progreso")
   * @param pasosCompletados - Array con el avance de cada paso
   * @param tiempoInvertidoSegundos - Tiempo acumulado en segundos (por defecto: 0)
   * @param imagenResultado - URL de la imagen final (por defecto: null)
   * @param notaFinal - Reflexión opcional (por defecto: null)
   */
  constructor(
    id: string,
    idUsuario: string,
    idProyecto: string,
    fechaInicio: Date = new Date(),
    fechaCompletado: Date | null = null,
    estado: EstadoProyecto = "en_progreso",
    pasosCompletados: PasoCompletado[] = [],
    tiempoInvertidoSegundos: number = 0,
    imagenResultado: string | null = null,
    notaFinal: string | null = null
  ) {
    this._id = id;
    this._idUsuario = idUsuario;
    this._idProyecto = idProyecto;
    this._fechaInicio = fechaInicio;
    this._fechaCompletado = fechaCompletado;
    this._estado = estado;
    this._pasosCompletados = pasosCompletados;
    this._tiempoInvertidoSegundos = tiempoInvertidoSegundos;
    this._imagenResultado = imagenResultado;
    this._notaFinal = notaFinal;
  }

  // GETTERS

  /** @returns El ID del seguimiento */
  get id(): string {
    return this._id;
  }

  /** @returns El ID del usuario */
  get idUsuario(): string {
    return this._idUsuario;
  }

  /** @returns El ID del proyecto original */
  get idProyecto(): string {
    return this._idProyecto;
  }

  /** @returns La fecha en que se empezó el seguimiento */
  get fechaInicio(): Date {
    return this._fechaInicio;
  }

  /** @returns La fecha en que se completó, o null si aún no */
  get fechaCompletado(): Date | null {
    return this._fechaCompletado;
  }

  /** @returns El estado actual del seguimiento */
  get estado(): EstadoProyecto {
    return this._estado;
  }

  /** @returns El array con el avance de cada paso */
  get pasosCompletados(): PasoCompletado[] {
    return this._pasosCompletados;
  }

  /** @returns El tiempo total invertido en segundos */
  get tiempoInvertidoSegundos(): number {
    return this._tiempoInvertidoSegundos;
  }

  /** @returns La URL de la imagen del resultado, o null */
  get imagenResultado(): string | null {
    return this._imagenResultado;
  }

  /** @returns La nota final, o null */
  get notaFinal(): string | null {
    return this._notaFinal;
  }

  /**
   * Calcula el porcentaje de pasos completados.
   * Útil para mostrar progreso en la UI sin recalcular fuera de la entidad.
   *
   * @returns Porcentaje 0-100. Si no hay pasos, devuelve 0.
   */
  get porcentajeCompletado(): number {
    if (this._pasosCompletados.length === 0) return 0;
    const completados = this._pasosCompletados.filter((p) => p.completado).length;
    return Math.round((completados / this._pasosCompletados.length) * 100);
  }

  // SETTERS
  // El id, idUsuario, idProyecto y fechaInicio son inmutables.

  /** @param value - Nueva fecha de completado */
  set fechaCompletado(value: Date | null) {
    this._fechaCompletado = value;
  }

  /** @param value - Nuevo estado del seguimiento */
  set estado(value: EstadoProyecto) {
    this._estado = value;
  }

  /** @param value - Nueva lista de pasos completados */
  set pasosCompletados(value: PasoCompletado[]) {
    this._pasosCompletados = value;
  }

  /** @param value - Nuevo tiempo invertido en segundos */
  set tiempoInvertidoSegundos(value: number) {
    this._tiempoInvertidoSegundos = value;
  }

  /** @param value - Nueva URL de imagen del resultado */
  set imagenResultado(value: string | null) {
    this._imagenResultado = value;
  }

  /** @param value - Nueva nota final */
  set notaFinal(value: string | null) {
    this._notaFinal = value;
  }
}
