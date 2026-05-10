/**
 * Representa la relación entre un usuario y un proyecto guardado.
 *
 * Cuando un usuario pulsa "Guardar" en un proyecto, se crea un Favorito
 * en Firestore. Cuando pulsa de nuevo, se elimina (toggle).
 *
 * Se almacena como documento independiente en vez de un array dentro
 * del usuario para facilitar las consultas ("¿qué proyectos ha guardado
 * este usuario?" y "¿cuántas personas han guardado este proyecto?").
 *
 * @example
 * const favorito = new Favorito(
 *   "fav001",
 *   "user123",
 *   "proy456",
 *   new Date()
 * );
 */
export class Favorito {

  /** Identificador único del favorito (generado por Firestore) */
  private _id: string;

  /** ID del usuario que guardó el proyecto */
  private _idUsuario: string;

  /** ID del proyecto guardado */
  private _idProyecto: string;

  /** Fecha en la que el usuario guardó el proyecto */
  private _fechaFavorito: Date;

  /**
   * Crea una nueva instancia de Favorito.
   *
   * @param id - ID generado por Firestore
   * @param idUsuario - ID del usuario que guarda el proyecto
   * @param idProyecto - ID del proyecto guardado
   * @param fechaFavorito - Fecha del guardado (por defecto: fecha actual)
   */
  constructor(
    id: string,
    idUsuario: string,
    idProyecto: string,
    fechaFavorito: Date = new Date()
  ) {
    this._id = id;
    this._idUsuario = idUsuario;
    this._idProyecto = idProyecto;
    this._fechaFavorito = fechaFavorito;
  }

  // GETTERS
  // Favorito no tiene setters porque es inmutable:
  // se crea o se elimina, nunca se modifica.

  /** @returns El ID del favorito en Firestore */
  get id(): string {
    return this._id;
  }

  /** @returns El ID del usuario que guardó el proyecto */
  get idUsuario(): string {
    return this._idUsuario;
  }

  /** @returns El ID del proyecto guardado */
  get idProyecto(): string {
    return this._idProyecto;
  }

  /** @returns La fecha en que se guardó el proyecto */
  get fechaFavorito(): Date {
    return this._fechaFavorito;
  }
}