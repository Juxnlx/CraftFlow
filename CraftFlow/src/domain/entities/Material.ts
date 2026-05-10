/**
 * Tipos de categoría disponibles para materiales.
 * Cada categoría tiene campos específicos almacenados en _propiedades.
 *
 * Campos por categoría:
 * - lana:     { grosor: "3.5", metros: 200, tipoMaterial: "Algodón" }
 * - pintura:  { mililitros: 250, tipoMaterial: "Acrílica" }
 * - ceramica: { kilogramos: 1.5, tipoMaterial: "Arcilla roja" }
 * - tela:     { metros: 2, tipoMaterial: "Fieltro" }
 * - papel:    { unidades: 10, tipoMaterial: "Cartulina" }
 */
export type CategoriaType = "lana" | "pintura" | "ceramica" | "tela" | "papel";

/**
 * Representa un material del inventario del usuario.
 *
 * Los campos comunes (nombre, categoría, color, precio, imagen) son atributos fijos.
 * Los campos específicos de cada categoría se almacenan en _propiedades
 * usando un Record<string, string | number> para evitar campos nulos innecesarios.
 *
 * De esta forma, un ovillo de lana solo tiene los campos de lana
 * y un bote de pintura solo tiene los campos de pintura,
 * sin arrastrar campos vacíos de otras categorías.
 *
 * @example
 * // Ovillo de lana
 * const ovillo = new Material(
 *   "mat001",
 *   "user123",
 *   "Ovillo algodón verde menta",
 *   "lana",
 *   "Verde menta",
 *   3.50,
 *   null,
 *   { grosor: "3.5", metros: 200, tipoMaterial: "Algodón" }
 * );
 *
 * @example
 * // Pintura acrílica
 * const pintura = new Material(
 *   "mat002",
 *   "user123",
 *   "Pintura acrílica blanca",
 *   "pintura",
 *   "Blanco",
 *   5.99,
 *   null,
 *   { mililitros: 250, tipoMaterial: "Acrílica" }
 * );
 */
export class Material {

  /** Identificador único del material (generado por Firestore) */
  private _id: string;

  /** ID del usuario propietario de este material */
  private _idUsuario: string;

  /** Nombre descriptivo del material */
  private _nombre: string;

  /** Categoría a la que pertenece el material */
  private _categoria: CategoriaType;

  /** Color del material (null si no aplica o no se especifica) */
  private _color: string | null;

  /** Precio en euros (null si no se especifica) */
  private _precio: number | null;

  /** URL de la imagen en Firebase Storage (null si no tiene) */
  private _imagen: string | null;

  /**
   * URL de la web donde se compró el material (null si no se especifica).
   * Permite al usuario guardar de dónde compró cada material para poder
   * reponerlo o compartirlo con la comunidad.
   */
  private _urlCompra: string | null;

  /**
   * Campos específicos de la categoría del material.
   * Cada categoría define sus propias claves:
   * - lana: grosor, metros, tipoMaterial
   * - pintura: mililitros, tipoMaterial
   * - ceramica: kilogramos, tipoMaterial
   * - tela: metros, tipoMaterial
   * - papel: unidades, tipoMaterial
   */
  private _propiedades: Record<string, string | number>;

  /** Fecha en la que se añadió el material al inventario */
  private _fechaCreacion: Date;

  /**
   * Número de unidades del mismo material que tiene el usuario.
   * Las propiedades (metros, gramos, mililitros…) son por unidad,
   * por lo que el total disponible se calcularía como propiedad × cantidad.
   */
  private _cantidad: number;

  /**
   * Crea una nueva instancia de Material.
   *
   * @param id - ID generado por Firestore
   * @param idUsuario - ID del usuario propietario
   * @param nombre - Nombre descriptivo del material
   * @param categoria - Categoría del material
   * @param color - Color del material (opcional)
   * @param precio - Precio en euros (opcional)
   * @param imagen - URL de la imagen en Firebase Storage (opcional)
   * @param propiedades - Campos específicos de la categoría (por defecto: vacío)
   * @param fechaCreacion - Fecha de creación (por defecto: fecha actual)
   * @param urlCompra - URL de la web donde se compró el material (opcional)
   */
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

  // GETTERS

  /** @returns El ID del material en Firestore */
  get id(): string {
    return this._id;
  }

  /** @returns El ID del usuario propietario */
  get idUsuario(): string {
    return this._idUsuario;
  }

  /** @returns El nombre descriptivo del material */
  get nombre(): string {
    return this._nombre;
  }

  /** @returns La categoría del material */
  get categoria(): CategoriaType {
    return this._categoria;
  }

  /** @returns El color del material, o null si no se especificó */
  get color(): string | null {
    return this._color;
  }

  /** @returns El precio en euros, o null si no se especificó */
  get precio(): number | null {
    return this._precio;
  }

  /** @returns La URL de la imagen, o null si no tiene */
  get imagen(): string | null {
    return this._imagen;
  }

  /** @returns Los campos específicos de la categoría */
  get propiedades(): Record<string, string | number> {
    return this._propiedades;
  }

  /** @returns La fecha en que se añadió al inventario */
  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  /** @returns La URL de compra, o null si no se especificó */
  get urlCompra(): string | null {
    return this._urlCompra;
  }

  /** @returns Número de unidades del mismo material */
  get cantidad(): number {
    return this._cantidad;
  }

  // SETTERS
  // El id, idUsuario, categoria y fechaCreacion no tienen setter
  // porque son inmutables una vez creado el material.

  /** @param value - Nuevo nombre del material */
  set nombre(value: string) {
    this._nombre = value;
  }

  /** @param value - Nuevo color, o null para eliminarlo */
  set color(value: string | null) {
    this._color = value;
  }

  /** @param value - Nuevo precio en euros, o null para eliminarlo */
  set precio(value: number | null) {
    this._precio = value;
  }

  /** @param value - Nueva URL de imagen, o null para eliminarla */
  set imagen(value: string | null) {
    this._imagen = value;
  }

  /** @param value - Nuevas propiedades específicas de la categoría */
  set propiedades(value: Record<string, string | number>) {
    this._propiedades = value;
  }

  /** @param value - Nueva URL de compra, o null para eliminarla */
  set urlCompra(value: string | null) {
    this._urlCompra = value;
  }

  /** @param value - Nuevo número de unidades */
  set cantidad(value: number) {
    this._cantidad = value;
  }

}