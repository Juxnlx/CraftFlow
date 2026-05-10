/**
 * Representa un ítem que el usuario necesita adquirir para poder hacer
 * uno o varios de sus proyectos guardados como favoritos.
 *
 * Se calcula al vuelo comparando los materiales y herramientas requeridos
 * por los proyectos favoritos con el inventario actual del usuario.
 * No se persiste en Firestore: es un modelo derivado de la lógica de negocio.
 *
 * El agrupamiento evita duplicados: si tres proyectos distintos necesitan
 * "Hilo algodón verde", aparece una sola vez con los tres nombres de proyecto
 * en `proyectosQueLoNecesitan`.
 *
 * @example
 * // Ítem de material con URL sugerida
 * const item: ItemCompra = {
 *   nombre: "Hilo algodón verde",
 *   esHerramienta: false,
 *   categoriaOTipo: "lana",
 *   proyectosQueLoNecesitan: ["Amigurumi Rana", "Jersey bebé"],
 *   urlCompraSugerida: "https://tienda.com/hilo-algodon"
 * };
 */
export interface ItemCompra {
  /**
   * Clave estable del ítem ("m:nombre|categoria" o "h:nombre|tipo").
   * Permite a la UI marcarlo como comprado y a Firestore persistir
   * ese estado entre sesiones.
   */
  clave: string;

  /** Nombre del material o herramienta que falta por adquirir */
  nombre: string;

  /**
   * Diferencia visualmente materiales (🧶, 🎨...) y herramientas (🔧).
   * Permite a la UI agruparlos o mostrarlos con iconos distintos.
   */
  esHerramienta: boolean;

  /**
   * Categoría del material ("lana", "pintura"...) o tipo de herramienta
   * ("Agujas de crochet"). Se usa para agrupar y para sugerir URL de compra.
   */
  categoriaOTipo: string;

  /**
   * Nombres de los proyectos favoritos que requieren este ítem.
   * Permite a la UI mostrar chips del tipo "Para: Jersey · Amigurumi".
   */
  proyectosQueLoNecesitan: string[];

  /**
   * URL de compra sugerida, obtenida de materiales del mismo tipo que el
   * usuario ya tiene en su inventario con `urlCompra` rellena.
   * Null si el usuario no tiene ningún material de esa categoría con URL.
   */
  urlCompraSugerida: string | null;
}
