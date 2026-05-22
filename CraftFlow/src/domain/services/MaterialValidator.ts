/**
 * Servicio de dominio que centraliza las reglas de validación de los
 * ítems del inventario (materiales y herramientas). Al vivir en el
 * dominio, las reglas son reutilizables y no quedan en la capa de
 * presentación.
 */
export class MaterialValidator {
  /**
   * Valida los datos de un material del inventario.
   *
   * @param nombre - Nombre del material
   * @returns El mensaje del primer error encontrado, o null si es válido
   */
  static validarMaterial(nombre: string): string | null {
    if (!nombre.trim()) {
      return "El nombre es obligatorio";
    }
    return null;
  }

  /**
   * Valida los datos de una herramienta del inventario.
   *
   * @param nombre - Nombre de la herramienta
   * @param tipo - Tipo de la herramienta
   * @returns El mensaje del primer error encontrado, o null si es válido
   */
  static validarHerramienta(nombre: string, tipo: string): string | null {
    if (!nombre.trim()) {
      return "El nombre es obligatorio";
    }
    if (!tipo.trim()) {
      return "El tipo de herramienta es obligatorio";
    }
    return null;
  }
}
