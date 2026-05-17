/**
 * Herramienta del inventario del usuario.
 *
 * Se separa de Material porque las herramientas no se consumen: unas
 * tijeras se reutilizan proyecto tras proyecto, mientras que un ovillo
 * se va gastando. Esa distinción también la usa el motor de
 * recomendaciones para diferenciar "te falta un material" de "te falta
 * una herramienta".
 *
 * Igual que en Material, los campos específicos de cada tipo (grosor de
 * una aguja, número de un pincel, etc.) viven en `_propiedades` para
 * no arrastrar columnas vacías.
 */
export class Herramienta {

  /** Identificador único (generado por Firestore) */
  private _id: string;

  /** UID del usuario propietario */
  private _idUsuario: string;

  /** Nombre descriptivo de la herramienta */
  private _nombre: string;

  /** Tipo de herramienta (texto libre, p.ej. "Agujas de crochet") */
  private _tipo: string;

  /** Campos específicos del tipo (grosor, número, etc.) */
  private _propiedades: Record<string, string | number>;

  /** Número de unidades disponibles */
  private _cantidad: number;

  /**
   * URL de la tienda donde se compró. Se reutiliza como sugerencia en
   * la lista de la compra cuando otro proyecto pide una herramienta
   * del mismo tipo.
   */
  private _urlCompra: string | null;

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

  // Getters
  /** Devuelve el ID de la herramienta */
  get id(): string { return this._id; }
  /** Devuelve el UID del propietario */
  get idUsuario(): string { return this._idUsuario; }
  /** Devuelve el nombre */
  get nombre(): string { return this._nombre; }
  /** Devuelve el tipo de herramienta */
  get tipo(): string { return this._tipo; }
  /** Devuelve los campos específicos del tipo */
  get propiedades(): Record<string, string | number> { return this._propiedades; }
  /** Devuelve el número de unidades */
  get cantidad(): number { return this._cantidad; }
  /** Devuelve la URL de compra o null */
  get urlCompra(): string | null { return this._urlCompra; }

  // Setters: id e idUsuario son inmutables
  /** Cambia el nombre de la herramienta */
  set nombre(value: string) { this._nombre = value; }
  /** Cambia el tipo de herramienta */
  set tipo(value: string) { this._tipo = value; }
  /** Sustituye los campos específicos */
  set propiedades(value: Record<string, string | number>) { this._propiedades = value; }
  /** Cambia el número de unidades */
  set cantidad(value: number) { this._cantidad = value; }
  /** Cambia la URL de compra */
  set urlCompra(value: string | null) { this._urlCompra = value; }
}
