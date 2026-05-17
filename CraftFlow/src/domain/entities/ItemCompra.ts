/**
 * Ítem que el usuario necesita adquirir para poder hacer alguno de
 * sus proyectos guardados como favoritos.
 *
 * Se calcula al vuelo comparando los materiales y herramientas que
 * piden los proyectos favoritos con el inventario actual del usuario;
 * no se persiste como tal en Firestore (solo se guarda la marca de
 * "comprado" por usuario).
 *
 * El agrupamiento evita duplicados: si tres proyectos distintos
 * necesitan "Hilo algodón verde", aparece una sola vez con los tres
 * nombres en `proyectosQueLoNecesitan`.
 */
export interface ItemCompra {
  /**
   * Clave estable del ítem ("m:nombre|categoria" para material o
   * "h:nombre|tipo" para herramienta). Se usa para marcarlo como
   * comprado y para persistir ese estado en Firestore.
   */
  clave: string;

  /** Nombre del material o herramienta que falta por adquirir */
  nombre: string;

  /** True si es una herramienta, false si es un material */
  esHerramienta: boolean;

  /**
   * Categoría del material ("lana", "pintura"...) o tipo de herramienta
   * ("Agujas de crochet"). Se usa para agrupar y para sugerir URL de compra.
   */
  categoriaOTipo: string;

  /** Nombres de los proyectos favoritos que requieren este ítem */
  proyectosQueLoNecesitan: string[];

  /**
   * URL de compra sugerida, sacada de algún material/herramienta de la
   * misma categoría que el usuario ya tenga con `urlCompra` rellena.
   * Null si no hay ninguna referencia previa.
   */
  urlCompraSugerida: string | null;
}
