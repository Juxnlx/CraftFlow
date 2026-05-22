/**
 * Utilidades genéricas para el trabajo con arrays.
 */

/**
 * Devuelve una copia del array con sus elementos en orden aleatorio
 * aplicando el algoritmo de Fisher-Yates. No muta el array original.
 *
 * Se usa para que las listas (recomendaciones del Home, proyectos de
 * Explorar) no aparezcan siempre en el mismo orden, dando oportunidad
 * a los elementos empatados o antiguos de mostrarse arriba.
 *
 * @param arr - Array de entrada (no se modifica)
 * @returns Una nueva copia barajada del array
 */
export function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
