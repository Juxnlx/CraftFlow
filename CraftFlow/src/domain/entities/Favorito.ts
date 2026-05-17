/**
 * Relación entre un usuario y un proyecto guardado como favorito.
 *
 * Se guarda como documento independiente en vez de un array dentro
 * del usuario para poder hacer dos consultas inversas con facilidad:
 * "qué proyectos ha guardado este usuario" y "cuántos usuarios han
 * guardado este proyecto".
 */
export class Favorito {

  /** Identificador único del favorito (generado por Firestore) */
  private _id: string;

  /** UID del usuario que guardó el proyecto */
  private _idUsuario: string;

  /** ID del proyecto guardado */
  private _idProyecto: string;

  /** Fecha en la que se guardó */
  private _fechaFavorito: Date;

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

  // Favorito es inmutable: se crea o se elimina, nunca se modifica
  /** Devuelve el ID del favorito */
  get id(): string { return this._id; }
  /** Devuelve el UID del usuario que lo guardó */
  get idUsuario(): string { return this._idUsuario; }
  /** Devuelve el ID del proyecto guardado */
  get idProyecto(): string { return this._idProyecto; }
  /** Devuelve la fecha de guardado */
  get fechaFavorito(): Date { return this._fechaFavorito; }
}
