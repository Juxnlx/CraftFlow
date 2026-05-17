/**
 * Representa a un usuario registrado en CraftFlow.
 *
 * El identificador (_id) coincide con el UID que genera Firebase
 * Authentication, por eso es de tipo string en vez de un autoincremental.
 *
 * El array de intereses se rellena durante el registro y se utiliza
 * para personalizar las recomendaciones del feed.
 */
export class Usuario {

  /** Identificador único (UID de Firebase Auth) */
  private _id: string;

  /** Correo electrónico con el que se registró */
  private _email: string;

  /** Nombre visible en la aplicación */
  private _nombre: string;

  /** URL de la foto de perfil, o null si no tiene */
  private _fotoPerfil: string | null;

  /** Fecha de alta del usuario */
  private _fechaRegistro: Date;

  /** Categorías que le interesan al usuario (crochet, pintura, etc.) */
  private _intereses: string[];

  /** Permite desactivar la cuenta sin borrar los datos */
  private _activo: boolean;

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

  // Getters
  /** Devuelve el UID del usuario */
  get id(): string { return this._id; }
  /** Devuelve el correo electrónico */
  get email(): string { return this._email; }
  /** Devuelve el nombre visible */
  get nombre(): string { return this._nombre; }
  /** Devuelve la URL de la foto de perfil o null */
  get fotoPerfil(): string | null { return this._fotoPerfil; }
  /** Devuelve la fecha de alta */
  get fechaRegistro(): Date { return this._fechaRegistro; }
  /** Devuelve la lista de intereses */
  get intereses(): string[] { return this._intereses; }
  /** Indica si la cuenta está activa */
  get activo(): boolean { return this._activo; }

  // Setters: id, email y fechaRegistro son inmutables tras el registro
  /** Cambia el nombre visible */
  set nombre(value: string) { this._nombre = value; }
  /** Cambia la URL de la foto de perfil */
  set fotoPerfil(value: string | null) { this._fotoPerfil = value; }
  /** Sustituye la lista de intereses */
  set intereses(value: string[]) { this._intereses = value; }
  /** Activa o desactiva la cuenta */
  set activo(value: boolean) { this._activo = value; }
}
