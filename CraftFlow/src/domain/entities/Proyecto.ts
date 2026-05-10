/** Visibilidad del proyecto en el feed */
export type Visibilidad = "publico" | "privado";

/** Nivel de dificultad del proyecto */
export type Dificultad = "facil" | "intermedio" | "avanzado";

/**
 * Representa un paso del proceso de creación de un proyecto.
 * Cada paso tiene un orden, una descripción y opcionalmente una imagen.
 */
export interface PasoProyecto {
  numeroOrden: number;
  descripcion: string;
  imagen: string | null;
}

/**
 * Describe un material necesario para realizar un proyecto.
 *
 * No es una referencia al inventario del usuario: es información
 * descriptiva que el creador del proyecto define libremente.
 * Así cualquiera puede crear un proyecto diciendo "necesitas hilo verde"
 * sin tener que tenerlo en su propio inventario.
 */
export interface MaterialRequerido {
  nombre: string;
  categoria: string;
  cantidad: string | null;
}

/**
 * Describe una herramienta necesaria para realizar un proyecto.
 */
export interface HerramientaRequerida {
  nombre: string;
  tipo: string;
}

/**
 * Representa un proyecto creativo publicado por un usuario.
 *
 * Contiene toda la información necesaria para:
 * - Mostrarlo en el feed general (Explorar)
 * - Mostrarlo en las recomendaciones (Para ti)
 * - Mostrar su detalle completo con pasos, materiales y herramientas
 * - Que el motor de recomendaciones calcule el % de match con el inventario
 *
 * Los materiales y herramientas se almacenan como arrays dentro del propio
 * documento en Firestore, no como colecciones separadas, porque siempre
 * se leen y escriben junto con el proyecto.
 *
 * @example
 * const proyecto = new Proyecto(
 *   "proy001",
 *   "user123",
 *   "Amigurumi Rana",
 *   "Rana tejida a crochet de 15cm",
 *   null,
 *   "publico",
 *   "intermedio",
 *   ["crochet", "amigurumi"],
 *   [{ nombre: "Hilo algodón verde", categoria: "lana", cantidad: "80 metros" }],
 *   [{ nombre: "Aguja crochet 3.5mm", tipo: "agujas_crochet" }],
 *   [{ numeroOrden: 1, descripcion: "Anillo mágico 6pb", imagen: null }]
 * );
 */
export class Proyecto {

  /** Identificador único del proyecto (generado por Firestore) */
  private _id: string;

  /** ID del usuario que creó el proyecto */
  private _idUsuario: string;

  /** Nombre del proyecto */
  private _nombre: string;

  /** Descripción detallada del proyecto */
  private _descripcion: string;

  /** URL de la imagen principal en Firebase Storage (null si no tiene) */
  private _imagen: string | null;

  /** Si el proyecto es visible para todos o solo para el creador */
  private _visibilidad: Visibilidad;

  /** Nivel de dificultad estimado por el creador (null si no se especifica) */
  private _dificultad: Dificultad | null;

  /** Etiquetas para categorizar y buscar el proyecto (ej: ["crochet", "amigurumi"]) */
  private _etiquetas: string[];

  /** Lista de materiales necesarios para realizar el proyecto */
  private _materiales: MaterialRequerido[];

  /** Lista de herramientas necesarias para realizar el proyecto */
  private _herramientas: HerramientaRequerida[];

  /** Pasos ordenados del proceso de creación */
  private _pasos: PasoProyecto[];

  /** Fecha en la que se creó el proyecto */
  private _fechaCreacion: Date;

  /**
   * Indica si el proyecto está activo.
   * Permite ocultar proyectos sin eliminarlos de Firestore.
   */
  private _activo: boolean;

  /**
   * Crea una nueva instancia de Proyecto.
   *
   * @param id - ID generado por Firestore
   * @param idUsuario - ID del usuario creador
   * @param nombre - Nombre del proyecto
   * @param descripcion - Descripción detallada
   * @param imagen - URL de la imagen principal (opcional)
   * @param visibilidad - Visibilidad del proyecto (por defecto: "publico")
   * @param dificultad - Nivel de dificultad (opcional)
   * @param etiquetas - Array de etiquetas (por defecto: vacío)
   * @param materiales - Array de materiales requeridos (por defecto: vacío)
   * @param herramientas - Array de herramientas requeridas (por defecto: vacío)
   * @param pasos - Array de pasos del proceso (por defecto: vacío)
   * @param fechaCreacion - Fecha de creación (por defecto: fecha actual)
   * @param activo - Estado del proyecto (por defecto: true)
   */
  constructor(
    id: string,
    idUsuario: string,
    nombre: string,
    descripcion: string,
    imagen: string | null = null,
    visibilidad: Visibilidad = "publico",
    dificultad: Dificultad | null = null,
    etiquetas: string[] = [],
    materiales: MaterialRequerido[] = [],
    herramientas: HerramientaRequerida[] = [],
    pasos: PasoProyecto[] = [],
    fechaCreacion: Date = new Date(),
    activo: boolean = true
  ) {
    this._id = id;
    this._idUsuario = idUsuario;
    this._nombre = nombre;
    this._descripcion = descripcion;
    this._imagen = imagen;
    this._visibilidad = visibilidad;
    this._dificultad = dificultad;
    this._etiquetas = etiquetas;
    this._materiales = materiales;
    this._herramientas = herramientas;
    this._pasos = pasos;
    this._fechaCreacion = fechaCreacion;
    this._activo = activo;
  }

  // GETTERS

  /** @returns El ID del proyecto en Firestore */
  get id(): string {
    return this._id;
  }

  /** @returns El ID del usuario creador */
  get idUsuario(): string {
    return this._idUsuario;
  }

  /** @returns El nombre del proyecto */
  get nombre(): string {
    return this._nombre;
  }

  /** @returns La descripción detallada del proyecto */
  get descripcion(): string {
    return this._descripcion;
  }

  /** @returns La URL de la imagen principal, o null si no tiene */
  get imagen(): string | null {
    return this._imagen;
  }

  /** @returns La visibilidad del proyecto ("publico" o "privado") */
  get visibilidad(): Visibilidad {
    return this._visibilidad;
  }

  /** @returns El nivel de dificultad, o null si no se especificó */
  get dificultad(): Dificultad | null {
    return this._dificultad;
  }

  /** @returns Array de etiquetas del proyecto */
  get etiquetas(): string[] {
    return this._etiquetas;
  }

  /** @returns Array de materiales necesarios */
  get materiales(): MaterialRequerido[] {
    return this._materiales;
  }

  /** @returns Array de herramientas necesarias */
  get herramientas(): HerramientaRequerida[] {
    return this._herramientas;
  }

  /** @returns Array de pasos ordenados del proceso */
  get pasos(): PasoProyecto[] {
    return this._pasos;
  }

  /** @returns La fecha de creación del proyecto */
  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  /** @returns true si el proyecto está activo */
  get activo(): boolean {
    return this._activo;
  }

  // SETTERS
  // El id, idUsuario y fechaCreacion no tienen setter
  // porque son inmutables una vez creado el proyecto.

  /** @param value - Nuevo nombre del proyecto */
  set nombre(value: string) {
    this._nombre = value;
  }

  /** @param value - Nueva descripción del proyecto */
  set descripcion(value: string) {
    this._descripcion = value;
  }

  /** @param value - Nueva URL de imagen, o null para eliminarla */
  set imagen(value: string | null) {
    this._imagen = value;
  }

  /** @param value - Nueva visibilidad ("publico" o "privado") */
  set visibilidad(value: Visibilidad) {
    this._visibilidad = value;
  }

  /** @param value - Nueva dificultad, o null para no especificar */
  set dificultad(value: Dificultad | null) {
    this._dificultad = value;
  }

  /** @param value - Nuevas etiquetas del proyecto */
  set etiquetas(value: string[]) {
    this._etiquetas = value;
  }

  /** @param value - Nueva lista de materiales requeridos */
  set materiales(value: MaterialRequerido[]) {
    this._materiales = value;
  }

  /** @param value - Nueva lista de herramientas requeridas */
  set herramientas(value: HerramientaRequerida[]) {
    this._herramientas = value;
  }

  /** @param value - Nueva lista de pasos del proceso */
  set pasos(value: PasoProyecto[]) {
    this._pasos = value;
  }

  /** @param value - true para activar, false para ocultar */
  set activo(value: boolean) {
    this._activo = value;
  }
}