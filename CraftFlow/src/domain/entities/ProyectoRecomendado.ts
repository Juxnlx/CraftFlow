import { Proyecto } from "./Proyecto";

/**
 * Indica si el usuario tiene o no un material específico
 * que requiere un proyecto. Se usa para mostrar en el detalle
 * del proyecto la lista de materiales con "✓ Tienes" o "✗ Falta".
 */
export interface MaterialMatch {
  nombre: string;
  categoria: string;
  loTieneElUsuario: boolean;
}

/**
 * Indica si el usuario tiene o no una herramienta específica
 * que requiere un proyecto. Mismo patrón que MaterialMatch pero
 * para herramientas (agujas, pinceles, tijeras, etc.).
 */
export interface HerramientaMatch {
  nombre: string;
  tipo: string;
  loTieneElUsuario: boolean;
}

/**
 * Envuelve un Proyecto con datos calculados por el motor de recomendación.
 *
 * No se persiste en Firestore: se calcula al vuelo cada vez que
 * el usuario abre la pantalla "¿Qué puedo hacer hoy?", comparando
 * los materiales que requiere cada proyecto público con los materiales
 * que el usuario tiene en su inventario.
 *
 * El cálculo funciona así:
 * 1. Se obtienen los materiales del inventario del usuario
 * 2. Para cada proyecto público, se comparan sus materiales requeridos
 * 3. matchPercent = (materiales que tiene / materiales totales) * 100
 * 4. canMake = true solo si matchPercent es 100
 * 5. Se ordena de mayor a menor matchPercent
 *
 * @example
 * const recomendado = new ProyectoRecomendado(
 *   proyectoRana,
 *   "María López",
 *   "https://storage.firebase.com/foto.jpg",
 *   95,
 *   false,
 *   [
 *     { nombre: "Hilo verde", categoria: "lana", loTieneElUsuario: true },
 *     { nombre: "Hilo blanco", categoria: "lana", loTieneElUsuario: false }
 *   ]
 * );
 */
export class ProyectoRecomendado {

  /** El proyecto original con toda su información */
  private _proyecto: Proyecto;

  /** Nombre del usuario que creó el proyecto */
  private _nombreAutor: string;

  /** URL de la foto de perfil del autor (null si no tiene) */
  private _fotoAutor: string | null;

  /** Porcentaje de compatibilidad (0-100) con el inventario del usuario */
  private _matchPercent: number;

  /** true solo si el usuario tiene TODOS los materiales necesarios */
  private _canMake: boolean;

  /** Detalle de cada material: si el usuario lo tiene o no */
  private _materialesMatch: MaterialMatch[];

  /** Detalle de cada herramienta: si el usuario la tiene o no */
  private _herramientasMatch: HerramientaMatch[];

  /**
   * Crea una nueva instancia de ProyectoRecomendado.
   *
   * @param proyecto - El proyecto original
   * @param nombreAutor - Nombre del creador del proyecto
   * @param fotoAutor - URL de la foto del autor (opcional)
   * @param matchPercent - Porcentaje de compatibilidad (0-100)
   * @param canMake - true si tiene todos los materiales y herramientas
   * @param materialesMatch - Detalle de cada material con su disponibilidad
   * @param herramientasMatch - Detalle de cada herramienta con su disponibilidad
   */
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

  // GETTERS
  // ProyectoRecomendado no tiene setters porque es inmutable:
  // se calcula una vez y se muestra, nunca se modifica.

  /** @returns El proyecto original completo */
  get proyecto(): Proyecto {
    return this._proyecto;
  }

  /** @returns El nombre del autor del proyecto */
  get nombreAutor(): string {
    return this._nombreAutor;
  }

  /** @returns La URL de la foto del autor, o null si no tiene */
  get fotoAutor(): string | null {
    return this._fotoAutor;
  }

  /** @returns El porcentaje de compatibilidad (0-100) */
  get matchPercent(): number {
    return this._matchPercent;
  }

  /** @returns true si el usuario puede hacer el proyecto con su inventario actual */
  get canMake(): boolean {
    return this._canMake;
  }

  /** @returns El detalle de disponibilidad de cada material */
  get materialesMatch(): MaterialMatch[] {
    return this._materialesMatch;
  }

  /** @returns El detalle de disponibilidad de cada herramienta */
  get herramientasMatch(): HerramientaMatch[] {
    return this._herramientasMatch;
  }
}