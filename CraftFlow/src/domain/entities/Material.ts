/**
 * Categorías de material soportadas por la aplicación.
 *
 * Cada categoría define qué claves se esperan en `_propiedades`:
 *  - lana:     grosor, metros, tipoMaterial
 *  - pintura:  mililitros, tipoMaterial
 *  - ceramica: kilogramos, tipoMaterial
 *  - tela:     metros, tipoMaterial
 *  - papel:    unidades, tipoMaterial
 */
export type CategoriaType = "lana" | "pintura" | "ceramica" | "tela" | "papel";

/**
 * Material del inventario del usuario.
 *
 * Los campos comunes (nombre, color, precio, imagen) son atributos fijos.
 * Los campos específicos de cada categoría se guardan en `_propiedades`
 * como Record para evitar arrastrar columnas nulas de otras categorías
 * (un ovillo no necesita "mililitros" y un bote de pintura no necesita
 * "grosor").
 */
export class Material {

  /** Identificador único (generado por Firestore) */
  private _id: string;

  /** UID del usuario propietario del material */
  private _idUsuario: string;

  /** Nombre descriptivo del material */
  private _nombre: string;

  /** Categoría a la que pertenece */
  private _categoria: CategoriaType;

  /** Color del material, o null si no aplica */
  private _color: string | null;

  /** Precio en euros, o null si no se indica */
  private _precio: number | null;

  /** URL de la imagen del material, o null si no tiene */
  private _imagen: string | null;

  /**
   * URL de la tienda donde se compró. Se reutiliza como sugerencia en
   * la lista de la compra cuando otro proyecto pide un material de la
   * misma categoría.
   */
  private _urlCompra: string | null;

  /** Campos específicos de la categoría (metros, mililitros, etc.) */
  private _propiedades: Record<string, string | number>;

  /** Fecha en la que se añadió al inventario */
  private _fechaCreacion: Date;

  /**
   * Número de unidades disponibles. Las propiedades (metros, gramos…)
   * se entienden por unidad: el total real es propiedad × cantidad.
   */
  private _cantidad: number;

  constructor(
    id: string,
    idUsuario: string,
    nombre: string,
    categoria: CategoriaType,
    color: string | null = null,
    precio: number | null = null,
    imagen: string | null = null,
    propiedades: Record<string, string | number> = {},
    fechaCreacion: Date = new Date(),
    urlCompra: string | null = null,
    cantidad: number = 1
  ) {
    this._id = id;
    this._idUsuario = idUsuario;
    this._nombre = nombre;
    this._categoria = categoria;
    this._color = color;
    this._precio = precio;
    this._imagen = imagen;
    this._propiedades = propiedades;
    this._fechaCreacion = fechaCreacion;
    this._urlCompra = urlCompra;
    this._cantidad = cantidad;
  }

  // Getters
  /** Devuelve el ID del material */
  get id(): string { return this._id; }
  /** Devuelve el UID del propietario */
  get idUsuario(): string { return this._idUsuario; }
  /** Devuelve el nombre del material */
  get nombre(): string { return this._nombre; }
  /** Devuelve la categoría del material */
  get categoria(): CategoriaType { return this._categoria; }
  /** Devuelve el color o null */
  get color(): string | null { return this._color; }
  /** Devuelve el precio en euros o null */
  get precio(): number | null { return this._precio; }
  /** Devuelve la URL de la imagen o null */
  get imagen(): string | null { return this._imagen; }
  /** Devuelve los campos específicos de la categoría */
  get propiedades(): Record<string, string | number> { return this._propiedades; }
  /** Devuelve la fecha de alta en el inventario */
  get fechaCreacion(): Date { return this._fechaCreacion; }
  /** Devuelve la URL de compra o null */
  get urlCompra(): string | null { return this._urlCompra; }
  /** Devuelve el número de unidades */
  get cantidad(): number { return this._cantidad; }

  // Setters: id, idUsuario, categoria y fechaCreacion son inmutables
  /** Cambia el nombre del material */
  set nombre(value: string) { this._nombre = value; }
  /** Cambia el color */
  set color(value: string | null) { this._color = value; }
  /** Cambia el precio en euros */
  set precio(value: number | null) { this._precio = value; }
  /** Cambia la URL de la imagen */
  set imagen(value: string | null) { this._imagen = value; }
  /** Sustituye los campos específicos de la categoría */
  set propiedades(value: Record<string, string | number>) { this._propiedades = value; }
  /** Cambia la URL de compra */
  set urlCompra(value: string | null) { this._urlCompra = value; }
  /** Cambia el número de unidades */
  set cantidad(value: number) { this._cantidad = value; }
}
