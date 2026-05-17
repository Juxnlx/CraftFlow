import { Proyecto } from "./Proyecto";

/**
 * Indica si el usuario tiene o no un material concreto que pide un
 * proyecto. Se usa en el detalle del proyecto para mostrar la lista
 * con "✓ Tienes" o "✗ Falta".
 */
export interface MaterialMatch {
  /** Nombre del material requerido */
  nombre: string;
  /** Categoría del material (lana, pintura...) */
  categoria: string;
  /** True si el usuario tiene el material en su inventario */
  loTieneElUsuario: boolean;
}

/** Equivalente a MaterialMatch pero para herramientas */
export interface HerramientaMatch {
  /** Nombre de la herramienta requerida */
  nombre: string;
  /** Tipo de herramienta */
  tipo: string;
  /** True si el usuario tiene la herramienta en su inventario */
  loTieneElUsuario: boolean;
}

/**
 * Proyecto público acompañado de los datos calculados por el motor de
 * recomendación.
 *
 * No se persiste en Firestore: se calcula al vuelo cada vez que el
 * usuario abre la pantalla principal, comparando los materiales y
 * herramientas que requiere cada proyecto público con los que tiene
 * en su propio inventario.
 */
export class ProyectoRecomendado {

  /** Proyecto original con toda su información */
  private _proyecto: Proyecto;

  /** Nombre del usuario que creó el proyecto */
  private _nombreAutor: string;

  /** URL de la foto de perfil del autor, o null si no tiene */
  private _fotoAutor: string | null;

  /** Porcentaje de compatibilidad (0-100) con el inventario del usuario */
  private _matchPercent: number;

  /** True solo si el usuario tiene todos los materiales y herramientas */
  private _canMake: boolean;

  /** Detalle de cada material: si el usuario lo tiene o no */
  private _materialesMatch: MaterialMatch[];

  /** Detalle de cada herramienta: si el usuario la tiene o no */
  private _herramientasMatch: HerramientaMatch[];

  constructor(
    proyecto: Proyecto,
    nombreAutor: string,
    fotoAutor: string | null,
    matchPercent: number,
    canMake: boolean,
    materialesMatch: MaterialMatch[],
    herramientasMatch: HerramientaMatch[] = []
  ) {
    this._proyecto = proyecto;
    this._nombreAutor = nombreAutor;
    this._fotoAutor = fotoAutor;
    this._matchPercent = matchPercent;
    this._canMake = canMake;
    this._materialesMatch = materialesMatch;
    this._herramientasMatch = herramientasMatch;
  }

  // No tiene setters: se calcula una vez y se muestra, nunca se modifica
  /** Devuelve el proyecto original */
  get proyecto(): Proyecto { return this._proyecto; }
  /** Devuelve el nombre del autor */
  get nombreAutor(): string { return this._nombreAutor; }
  /** Devuelve la URL de la foto del autor, o null si no tiene */
  get fotoAutor(): string | null { return this._fotoAutor; }
  /** Devuelve el porcentaje de compatibilidad (0-100) */
  get matchPercent(): number { return this._matchPercent; }
  /** Indica si el usuario puede hacer el proyecto con su inventario actual */
  get canMake(): boolean { return this._canMake; }
  /** Devuelve el detalle de disponibilidad de cada material */
  get materialesMatch(): MaterialMatch[] { return this._materialesMatch; }
  /** Devuelve el detalle de disponibilidad de cada herramienta */
  get herramientasMatch(): HerramientaMatch[] { return this._herramientasMatch; }
}
