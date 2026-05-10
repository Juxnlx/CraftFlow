/**
 * Representa a un usuario registrado en la aplicación CraftFlow.
 *
 * El identificador (_id) corresponde al ID que genera Firebase Authentication
 * automáticamente al registrarse, por eso es de tipo string y no number.
 *
 * El array de intereses se rellena durante el paso 2 del registro,
 * donde el usuario selecciona qué tipo de manualidades le gustan
 * (crochet, pintura, cerámica, etc.). Se usa para personalizar
 * la experiencia en el feed.
 *
 * @example
 * const usuario = new Usuario(
 *   "abc123Firebase",
 *   "juan@email.com",
 *   "Juan Luis",
 *   null,
 *   new Date(),
 *   ["crochet", "ceramica"],
 *   true
 * );
 */
export class Usuario {

  /** Identificador único del usuario (ID de Firebase Auth) */
  private _id: string;

  /** Correo electrónico con el que se registró */
  private _email: string;

  /** Nombre visible del usuario en la aplicación */
  private _nombre: string;

  /** URL de la foto de perfil almacenada en Firebase Storage (null si no tiene) */
  private _fotoPerfil: string | null;

  /** Fecha en la que el usuario se registró en CraftFlow */
  private _fechaRegistro: Date;

  /**
   * Lista de intereses seleccionados durante el registro.
   * Valores posibles: "crochet", "pintura", "ceramica", "costura", "papel", "otras"
   */
  private _intereses: string[];

  /**
   * Indica si la cuenta está activa.
   * Permite desactivar cuentas sin eliminar los datos del usuario.
   */
  private _activo: boolean;

  /**
   * Crea una nueva instancia de Usuario.
   *
   * @param id - ID generado por Firebase Authentication
   * @param email - Correo electrónico del usuario
   * @param nombre - Nombre visible en la aplicación
   * @param fotoPerfil - URL de la foto de perfil en Firebase Storage (opcional)
   * @param fechaRegistro - Fecha de registro (por defecto: fecha actual)
   * @param intereses - Array de intereses seleccionados en el registro (por defecto: vacío)
   * @param activo - Estado de la cuenta (por defecto: true)
   */
  constructor(
    id: string,
    email: string,
    nombre: string,
    fotoPerfil: string | null = null,
    fechaRegistro: Date = new Date(),
    intereses: string[] = [],
    activo: boolean = true
  ) {
    this._id = id;
    this._email = email;
    this._nombre = nombre;
    this._fotoPerfil = fotoPerfil;
    this._fechaRegistro = fechaRegistro;
    this._intereses = intereses;
    this._activo = activo;
  }

  //  GETTERS
  //  Acceso de lectura a todos los atributos

  /** @returns El ID de Firebase Authentication del usuario */
  get id(): string {
    return this._id;
  }

  /** @returns El correo electrónico del usuario */
  get email(): string {
    return this._email;
  }

  /** @returns El nombre visible del usuario */
  get nombre(): string {
    return this._nombre;
  }

  /** @returns La URL de la foto de perfil, o null si no tiene */
  get fotoPerfil(): string | null {
    return this._fotoPerfil;
  }

  /** @returns La fecha en que se registró el usuario */
  get fechaRegistro(): Date {
    return this._fechaRegistro;
  }

  /** @returns Array con los intereses del usuario */
  get intereses(): string[] {
    return this._intereses;
  }

  /** @returns true si la cuenta está activa */
  get activo(): boolean {
    return this._activo;
  }

  //  SETTERS
  //  Solo para los campos que el usuario puede modificar.
  //  El id, email y fechaRegistro no tienen setter porque
  //  son inmutables una vez creado el usuario.

  /** @param value - Nuevo nombre visible del usuario */
  set nombre(value: string) {
    this._nombre = value;
  }

  /** @param value - Nueva URL de foto de perfil, o null para eliminarla */
  set fotoPerfil(value: string | null) {
    this._fotoPerfil = value;
  }

  /** @param value - Nueva lista de intereses del usuario */
  set intereses(value: string[]) {
    this._intereses = value;
  }

  /** @param value - true para activar la cuenta, false para desactivarla */
  set activo(value: boolean) {
    this._activo = value;
  }
}