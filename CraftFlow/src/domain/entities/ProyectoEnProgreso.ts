/**
 * Estado del seguimiento de un proyecto.
 * Los proyectos completados no se eliminan: se quedan en el historial.
 */
export type EstadoProyecto = "en_progreso" | "completado";

/**
 * Avance del usuario en un paso concreto del proyecto.
 *
 * Guarda si lo ha terminado, una foto opcional y, opcionalmente, los
 * segundos que tardó. El tiempo no es obligatorio: si el usuario no lo
 * introduce se queda a 0.
 */
export interface PasoCompletado {
  /** Número del paso al que corresponde el avance */
  numeroOrden: number;
  /** Indica si el paso ya está terminado */
  completado: boolean;
  /** URL de la foto de progreso, o null si no hay */
  fotoProgreso: string | null;
  /** Tiempo invertido en el paso (segundos), opcional */
  tiempoSegundos?: number;
}

/**
 * Seguimiento del progreso de un usuario sobre un proyecto.
 *
 * No es el proyecto en sí (ese vive en la colección "proyectos"), sino
 * el rastro del avance de un usuario concreto sobre él. Vive en la
 * colección "proyectosEnProgreso" para que cada usuario pueda llevar su
 * propio seguimiento sin afectar al proyecto original.
 */
export class ProyectoEnProgreso {

  /** Identificador único del seguimiento (generado por Firestore) */
  private _id: string;

  /** UID del usuario que está realizando el proyecto */
  private _idUsuario: string;

  /** ID del proyecto que se está realizando */
  private _idProyecto: string;

  /** Fecha en la que el usuario empezó el proyecto */
  private _fechaInicio: Date;

  /** Fecha en la que se marcó como completado, o null si sigue en curso */
  private _fechaCompletado: Date | null;

  /** Estado actual del seguimiento */
  private _estado: EstadoProyecto;

  /** Avance individual de cada paso del proyecto */
  private _pasosCompletados: PasoCompletado[];

  /**
   * Tiempo total invertido en segundos. Se acumula entre sesiones: si
   * el usuario pausa y reanuda más tarde, el contador no se reinicia.
   */
  private _tiempoInvertidoSegundos: number;

  /** URL de la foto del resultado final, o null hasta completar */
  private _imagenResultado: string | null;

  /** Reflexión opcional escrita al completar el proyecto */
  private _notaFinal: string | null;

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

  // Getters
  /** Devuelve el ID del seguimiento */
  get id(): string { return this._id; }
  /** Devuelve el UID del usuario */
  get idUsuario(): string { return this._idUsuario; }
  /** Devuelve el ID del proyecto asociado */
  get idProyecto(): string { return this._idProyecto; }
  /** Devuelve la fecha de inicio */
  get fechaInicio(): Date { return this._fechaInicio; }
  /** Devuelve la fecha de completado o null */
  get fechaCompletado(): Date | null { return this._fechaCompletado; }
  /** Devuelve el estado actual */
  get estado(): EstadoProyecto { return this._estado; }
  /** Devuelve el avance de cada paso */
  get pasosCompletados(): PasoCompletado[] { return this._pasosCompletados; }
  /** Devuelve el tiempo total invertido en segundos */
  get tiempoInvertidoSegundos(): number { return this._tiempoInvertidoSegundos; }
  /** Devuelve la URL de la foto final o null */
  get imagenResultado(): string | null { return this._imagenResultado; }
  /** Devuelve la nota final o null */
  get notaFinal(): string | null { return this._notaFinal; }

  /**
   * Calcula el porcentaje de pasos completados (0-100).
   * Se calcula aquí para que la UI no tenga que recalcularlo en cada render.
   */
  get porcentajeCompletado(): number {
    if (this._pasosCompletados.length === 0) return 0;
    const completados = this._pasosCompletados.filter((p) => p.completado).length;
    return Math.round((completados / this._pasosCompletados.length) * 100);
  }

  // Setters: id, idUsuario, idProyecto y fechaInicio son inmutables
  /** Cambia la fecha de completado */
  set fechaCompletado(value: Date | null) { this._fechaCompletado = value; }
  /** Cambia el estado del seguimiento */
  set estado(value: EstadoProyecto) { this._estado = value; }
  /** Sustituye el avance de los pasos */
  set pasosCompletados(value: PasoCompletado[]) { this._pasosCompletados = value; }
  /** Cambia el tiempo total invertido en segundos */
  set tiempoInvertidoSegundos(value: number) { this._tiempoInvertidoSegundos = value; }
  /** Cambia la URL de la foto del resultado */
  set imagenResultado(value: string | null) { this._imagenResultado = value; }
  /** Cambia la nota final */
  set notaFinal(value: string | null) { this._notaFinal = value; }
}
