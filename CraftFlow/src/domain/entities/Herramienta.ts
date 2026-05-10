/**
 * Representa una herramienta del inventario del usuario.
 *
 * Se separa de Material porque las herramientas no se consumen:
 * unas tijeras se reutilizan proyecto tras proyecto,
 * mientras que un ovillo de lana se va gastando.
 *
 * Esta separación también facilita el motor de recomendaciones,
 * que puede distinguir entre "te falta un material" y 
 * "te falta una herramienta".
 *
 * Los campos específicos de cada herramienta (como el grosor de una aguja
 * o el número de un pincel) se almacenan en _propiedades usando el mismo
 * patrón que Material, evitando campos nulos innecesarios.
 *
 * Ejemplos de propiedades por tipo de herramienta:
 * - Aguja de crochet: { grosor: "3.5" }
 * - Pincel:           { numero: 2 }
 * - Tijeras:          {} (sin propiedades extra)
 * - Bastidor:         { diametro: 20 }
 *
 * @example
 * const aguja = new Herramienta(
 *   "her001",
 *   "user123",
 *   "Aguja de crochet 3.5mm",
 *   "Agujas de crochet",
 *   { grosor: "3.5" },
 *   1
 * );
 *
 * @example
 * const pincel = new Herramienta(
 *   "her002",
 *   "user123",
 *   "Pincel redondo nº2",
 *   "Pinceles",
 *   { numero: 2 },
 *   3
 * );
 */
export class Herramienta {

  /** Identificador único de la herramienta (generado por Firestore) */
  private _id: string;

  /** ID del usuario propietario de esta herramienta */
  private _idUsuario: string;

  /** Nombre descriptivo de la herramienta */
  private _nombre: string;

  /**
   * Tipo de herramienta (string libre).
   * El usuario escribe lo que quiera: "Tijeras", "Agujas de crochet",
   * "Bastidor circular", etc. No está limitado a un catálogo cerrado.
   */
  private _tipo: string;

  /**
   * Campos específicos de la herramienta.
   * Cada tipo puede tener sus propias propiedades:
   * - Agujas de crochet: { grosor: "3.5" }
   * - Pinceles: { numero: 2 }
   * - Tijeras: {} (sin propiedades adicionales)
   */
  private _propiedades: Record<string, string | number>;

  /** Cantidad de unidades que tiene el usuario */
  private _cantidad: number;

  /**
   * URL de la tienda donde el usuario compró la herramienta.
   * Se reutiliza como sugerencia de compra en la lista de la compra
   * cuando otro proyecto requiere una herramienta del mismo tipo.
   */
  private _urlCompra: string | null;

  /**
   * Crea una nueva instancia de Herramienta.
   *
   * @param id - ID generado por Firestore
   * @param idUsuario - ID del usuario propietario
   * @param nombre - Nombre descriptivo de la herramienta
   * @param tipo - Tipo de herramienta (texto libre)
   * @param propiedades - Campos específicos del tipo (por defecto: vacío)
   * @param cantidad - Cantidad de unidades (por defecto: 1)
   * @param urlCompra - URL de compra opcional (por defecto: null)
   */
  constructor(
    id: string,
    idUsuario: string,
    nombre: string,
    tipo: string,
    propiedades: Record<string, string | number> = {},
    cantidad: number = 1,
    urlCompra: string | null = null
  ) {
    this._id = id;
    this._idUsuario = idUsuario;
    this._nombre = nombre;
    this._tipo = tipo;
    this._propiedades = propiedades;
    this._cantidad = cantidad;
    this._urlCompra = urlCompra;
  }

  // GETTERS

  /** @returns El ID de la herramienta en Firestore */
  get id(): string {
    return this._id;
  }

  /** @returns El ID del usuario propietario */
  get idUsuario(): string {
    return this._idUsuario;
  }

  /** @returns El nombre descriptivo de la herramienta */
  get nombre(): string {
    return this._nombre;
  }

  /** @returns El tipo de herramienta */
  get tipo(): string {
    return this._tipo;
  }

  /** @returns Los campos específicos de la herramienta */
  get propiedades(): Record<string, string | number> {
    return this._propiedades;
  }

  /** @returns La cantidad de unidades */
  get cantidad(): number {
    return this._cantidad;
  }

  // SETTERS
  // El id e idUsuario no tienen setter porque son inmutables.

  /** @param value - Nuevo nombre de la herramienta */
  set nombre(value: string) {
    this._nombre = value;
  }

  /** @param value - Nuevo tipo de herramienta */
  set tipo(value: string) {
    this._tipo = value;
  }

  /** @param value - Nuevas propiedades específicas de la herramienta */
  set propiedades(value: Record<string, string | number>) {
    this._propiedades = value;
  }

  /** @param value - Nueva cantidad de unidades */
  set cantidad(value: number) {
    this._cantidad = value;
  }

  /** @returns La URL de compra (puede ser null) */
  get urlCompra(): string | null {
    return this._urlCompra;
  }

  /** @param value - Nueva URL de compra */
  set urlCompra(value: string | null) {
    this._urlCompra = value;
  }
}