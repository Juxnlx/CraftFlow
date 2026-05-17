/** Visibilidad del proyecto en el feed */
export type Visibilidad = "publico" | "privado";

/** Nivel de dificultad estimado por el creador */
export type Dificultad = "facil" | "intermedio" | "avanzado";

/** Paso individual del proceso de creación de un proyecto */
export interface PasoProyecto {
  /** Posición del paso dentro del proyecto */
  numeroOrden: number;
  /** Texto explicativo del paso */
  descripcion: string;
  /** URL de la imagen ilustrativa, o null si no tiene */
  imagen: string | null;
}

/**
 * Material que requiere un proyecto.
 *
 * No es una referencia al inventario del usuario: es información
 * descriptiva que el creador define libremente, así cualquier persona
 * puede publicar un proyecto sin necesidad de tener los materiales
 * en su propio inventario.
 */
export interface MaterialRequerido {
  /** Nombre del material (texto libre) */
  nombre: string;
  /** Categoría a la que pertenece (lana, pintura...) */
  categoria: string;
  /** Cantidad sugerida (texto libre, p.ej. "80 metros") o null */
  cantidad: string | null;
}

/** Herramienta necesaria para realizar un proyecto */
export interface HerramientaRequerida {
  /** Nombre de la herramienta */
  nombre: string;
  /** Tipo de herramienta (texto libre, p.ej. "Agujas de crochet") */
  tipo: string;
}

/**
 * Proyecto creativo publicado por un usuario.
 *
 * Materiales, herramientas y pasos se almacenan como arrays dentro
 * del propio documento de Firestore (no como subcolecciones) porque
 * siempre se leen y escriben junto con el proyecto.
 */
export class Proyecto {

  /** Identificador único (generado por Firestore) */
  private _id: string;

  /** UID del usuario que creó el proyecto */
  private _idUsuario: string;

  /** Nombre del proyecto */
  private _nombre: string;

  /** Descripción larga del proyecto */
  private _descripcion: string;

  /** URL de la imagen principal, o null si no tiene */
  private _imagen: string | null;

  /** Si es público (visible en el feed) o privado (solo el autor) */
  private _visibilidad: Visibilidad;

  /** Nivel de dificultad, o null si no se especifica */
  private _dificultad: Dificultad | null;

  /** Etiquetas para clasificar y buscar el proyecto */
  private _etiquetas: string[];

  /** Materiales necesarios para realizarlo */
  private _materiales: MaterialRequerido[];

  /** Herramientas necesarias para realizarlo */
  private _herramientas: HerramientaRequerida[];

  /** Pasos ordenados del proceso de creación */
  private _pasos: PasoProyecto[];

  /** Fecha de publicación */
  private _fechaCreacion: Date;

  /** Permite ocultar el proyecto sin borrarlo (soft delete) */
  private _activo: boolean;

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

  // Getters
  /** Devuelve el ID del proyecto */
  get id(): string { return this._id; }
  /** Devuelve el UID del autor */
  get idUsuario(): string { return this._idUsuario; }
  /** Devuelve el nombre del proyecto */
  get nombre(): string { return this._nombre; }
  /** Devuelve la descripción larga */
  get descripcion(): string { return this._descripcion; }
  /** Devuelve la URL de la imagen principal o null */
  get imagen(): string | null { return this._imagen; }
  /** Devuelve la visibilidad ("publico" o "privado") */
  get visibilidad(): Visibilidad { return this._visibilidad; }
  /** Devuelve la dificultad o null si no se especificó */
  get dificultad(): Dificultad | null { return this._dificultad; }
  /** Devuelve las etiquetas */
  get etiquetas(): string[] { return this._etiquetas; }
  /** Devuelve la lista de materiales requeridos */
  get materiales(): MaterialRequerido[] { return this._materiales; }
  /** Devuelve la lista de herramientas requeridas */
  get herramientas(): HerramientaRequerida[] { return this._herramientas; }
  /** Devuelve los pasos del proceso */
  get pasos(): PasoProyecto[] { return this._pasos; }
  /** Devuelve la fecha de publicación */
  get fechaCreacion(): Date { return this._fechaCreacion; }
  /** Indica si el proyecto sigue activo */
  get activo(): boolean { return this._activo; }

  // Setters: id, idUsuario y fechaCreacion son inmutables
  /** Cambia el nombre del proyecto */
  set nombre(value: string) { this._nombre = value; }
  /** Cambia la descripción */
  set descripcion(value: string) { this._descripcion = value; }
  /** Cambia la imagen principal */
  set imagen(value: string | null) { this._imagen = value; }
  /** Cambia la visibilidad */
  set visibilidad(value: Visibilidad) { this._visibilidad = value; }
  /** Cambia la dificultad */
  set dificultad(value: Dificultad | null) { this._dificultad = value; }
  /** Sustituye las etiquetas */
  set etiquetas(value: string[]) { this._etiquetas = value; }
  /** Sustituye los materiales requeridos */
  set materiales(value: MaterialRequerido[]) { this._materiales = value; }
  /** Sustituye las herramientas requeridas */
  set herramientas(value: HerramientaRequerida[]) { this._herramientas = value; }
  /** Sustituye los pasos del proceso */
  set pasos(value: PasoProyecto[]) { this._pasos = value; }
  /** Activa o desactiva el proyecto */
  set activo(value: boolean) { this._activo = value; }
}
