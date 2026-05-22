import { MaterialRequerido, PasoProyecto } from "../entities/Proyecto";

/**
 * Datos de un proyecto necesarios para validarlo antes de crearlo o editarlo.
 */
export interface DatosProyecto {
  /** Nombre del proyecto */
  nombre: string;
  /** Descripción del proyecto */
  descripcion: string;
  /** Categoría seleccionada, o null si no se ha elegido ninguna */
  categoria: string | null;
  /** Materiales requeridos añadidos en el formulario */
  materiales: MaterialRequerido[];
  /** Pasos del proceso añadidos en el formulario */
  pasos: PasoProyecto[];
}

/**
 * Servicio de dominio que centraliza las reglas de validación de un
 * proyecto. Al vivir en el dominio, las reglas son reutilizables y
 * testeables, y no quedan dispersas en la capa de presentación.
 */
export class ProyectoValidator {
  /**
   * Valida los datos de un proyecto antes de guardarlo. Devuelve el primer
   * incumplimiento encontrado para mostrárselo al usuario.
   *
   * @param datos - Datos del proyecto a validar
   * @returns El mensaje del primer error encontrado, o null si es válido
   */
  static validar(datos: DatosProyecto): string | null {
    if (!datos.nombre.trim()) {
      return "El nombre es obligatorio";
    }
    if (!datos.descripcion.trim()) {
      return "La descripción es obligatoria";
    }
    if (!datos.categoria) {
      return "Selecciona una categoría";
    }
    // Se considera material válido el que tiene nombre; los vacíos del
    // formulario no cuentan para el mínimo exigido.
    const materialesValidos = datos.materiales.filter((material) =>
      material.nombre.trim()
    );
    if (materialesValidos.length === 0) {
      return "Añade al menos un material";
    }
    // Mismo criterio para los pasos: solo cuentan los que tienen descripción.
    const pasosValidos = datos.pasos.filter((paso) =>
      paso.descripcion.trim()
    );
    if (pasosValidos.length === 0) {
      return "Añade al menos un paso";
    }
    return null;
  }
}
