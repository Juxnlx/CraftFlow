import { Material } from "../entities/Material";
import { Herramienta } from "../entities/Herramienta";

/**
 * Servicio compartido de comparación de materiales y herramientas.
 *
 * Centraliza la lógica de matching usada por el motor de recomendaciones
 * (`GetRecomendacionesUseCase`) y por la lista de la compra
 * (`GetListaCompraUseCase`) para que ambos den resultados coherentes:
 * si Home dice "tienes este material", la Lista de la compra no debe
 * pedírtelo.
 *
 * Tres herramientas de tolerancia para que el match aguante variaciones
 * naturales del usuario:
 *  - Sinónimos: "ovillo" ≡ "hilo", "madeja" ≡ "hilo", "folio" ≡ "papel"…
 *  - Levenshtein: tolera typos cortos ("alggodon" ≈ "algodon").
 *  - Coincidencia parcial por palabras: basta con ≥50% para considerar match.
 */
export class MaterialMatcher {
  /**
   * Diccionario de sinónimos: cada clave se sustituye por su valor canónico
   * antes de comparar nombres. Ampliable según se vayan detectando casos.
   */
  private static readonly SINONIMOS: Record<string, string> = {
    ovillo: "hilo",
    ovillos: "hilo",
    hilos: "hilo",
    madeja: "hilo",
    madejas: "hilo",
    bote: "frasco",
    botes: "frasco",
    frascos: "frasco",
    bobina: "hilo",
    bobinas: "hilo",
    pincel: "pinceles",
    aguja: "agujas",
    punzón: "agujas",
    punzon: "agujas",
    punzones: "agujas",
    tijera: "tijeras",
    cartulinas: "cartulina",
    folios: "papel",
    folio: "papel",
    hojas: "papel",
    hoja: "papel",
  };

  /**
   * Normaliza un texto eliminando tildes y convirtiendo a minúsculas.
   */
  static normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  /**
   * Aplica el diccionario de sinónimos a una palabra ya normalizada.
   */
  private static aplicarSinonimos(palabra: string): string {
    return this.SINONIMOS[palabra] ?? palabra;
  }

  /**
   * Distancia de Levenshtein (operaciones mínimas para convertir a en b).
   */
  private static levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const coste = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + coste
        );
      }
    }
    return dp[m][n];
  }

  /**
   * Indica si dos palabras coinciden tolerando typos.
   * - Match exacto, o una contenida en la otra (>=4 letras).
   * - Levenshtein ≤ 1 si alguna es corta (<5), ≤ 2 en otro caso.
   */
  private static palabrasCoinciden(a: string, b: string): boolean {
    if (a === b) return true;
    if (a.length >= 4 && b.length >= 4) {
      if (a.includes(b) || b.includes(a)) return true;
    }
    const distancia = this.levenshtein(a, b);
    const esCorta = a.length < 5 || b.length < 5;
    return distancia <= (esCorta ? 1 : 2);
  }

  /**
   * Compara dos nombres por palabras tolerando sinónimos y typos.
   * Si más del 50% de las palabras del texto requerido tienen una
   * coincidencia en el del usuario, se considera match.
   */
  static coincidenciaPorPalabras(
    textoRequerido: string,
    textoUsuario: string
  ): boolean {
    const palabrasRequerido = this.normalizarTexto(textoRequerido)
      .split(/\s+/)
      .filter((p) => p.length > 0)
      .map((p) => this.aplicarSinonimos(p));
    const palabrasUsuario = this.normalizarTexto(textoUsuario)
      .split(/\s+/)
      .filter((p) => p.length > 0)
      .map((p) => this.aplicarSinonimos(p));

    if (palabrasRequerido.length === 0) return false;

    const coincidencias = palabrasRequerido.filter((palabra) =>
      palabrasUsuario.some((pu) => this.palabrasCoinciden(palabra, pu))
    );

    return coincidencias.length >= Math.ceil(palabrasRequerido.length / 2);
  }

  /**
   * Material compatible: misma categoría (normalizada) + nombre coincidente.
   * No comprueba cantidad. Lo usa internamente `esMaterialCompatible`.
   */
  static esMaterialCompatiblePorNombre(
    materialRequerido: { nombre: string; categoria: string },
    materialUsuario: Material
  ): boolean {
    if (
      this.normalizarTexto(materialRequerido.categoria) !==
      this.normalizarTexto(materialUsuario.categoria)
    ) {
      return false;
    }
    return this.coincidenciaPorPalabras(
      materialRequerido.nombre,
      materialUsuario.nombre
    );
  }

  /**
   * Material compatible completo: categoría + nombre + cantidad suficiente.
   * Es el chequeo que tanto el motor de recomendaciones como la lista
   * de la compra deben usar para que sus resultados coincidan.
   */
  static esMaterialCompatible(
    materialRequerido: { nombre: string; categoria: string; cantidad: string | null },
    materialUsuario: Material
  ): boolean {
    if (!this.esMaterialCompatiblePorNombre(materialRequerido, materialUsuario)) {
      return false;
    }
    return this.cumpleCantidad(materialRequerido, materialUsuario);
  }

  /**
   * Comprueba si el material del inventario cubre la cantidad requerida.
   * Convierte ambas cantidades a la unidad base de la categoría antes de
   * comparar, evitando comparaciones absurdas como "126 kg ≥ 250 g".
   *
   * Reglas:
   *  - Si no hay cantidad pedida o no es parseable, devuelve true.
   *  - Si la propiedad principal del usuario no está rellena, compara
   *    contra las unidades del inventario sin convertir.
   */
  static cumpleCantidad(
    materialRequerido: { categoria: string; cantidad: string | null },
    materialUsuario: Material
  ): boolean {
    if (!materialRequerido.cantidad) return true;
    const requeridoNum = this.extraerNumero(materialRequerido.cantidad);
    if (requeridoNum === null) return true;

    const categoria = this.normalizarTexto(materialUsuario.categoria);
    const propiedadKey = this.propiedadPrincipalPorCategoria(categoria);
    if (!propiedadKey) {
      return materialUsuario.cantidad >= requeridoNum;
    }

    const valorPorUnidad = Number(materialUsuario.propiedades[propiedadKey]);
    if (isNaN(valorPorUnidad) || valorPorUnidad <= 0) {
      return materialUsuario.cantidad >= requeridoNum;
    }

    // Convertir ambas magnitudes a la unidad base de la categoría.
    // La propiedad principal del usuario ya está en la unidad base; el
    // texto requerido puede venir en otra (g, mg, cm, mm, L…).
    const unidadRequerida = this.extraerUnidad(materialRequerido.cantidad);
    const factor = this.factorAUnidadBase(categoria, unidadRequerida);
    const requeridoEnBase = requeridoNum * factor;

    const disponibleTotal = valorPorUnidad * materialUsuario.cantidad;
    return disponibleTotal >= requeridoEnBase;
  }

  /**
   * Devuelve la primera abreviatura/unidad detectable en el texto, en
   * minúsculas y sin tildes. Si no detecta nada, devuelve "".
   */
  private static extraerUnidad(texto: string): string {
    const t = this.normalizarTexto(texto);
    // Ojo al orden: las más largas/específicas primero para no matchear
    // "g" antes que "gramos".
    const unidades = [
      "kilogramos", "kilogramo", "kilos", "kilo", "kg",
      "gramos", "gramo", "gr", "g",
      "mililitros", "mililitro", "ml",
      "litros", "litro", "l",
      "centimetros", "centimetro", "cm",
      "milimetros", "milimetro", "mm",
      "metros", "metro", "m",
      "unidades", "unidad", "uds", "ud",
      "hojas", "hoja", "folios", "folio",
    ];
    for (const u of unidades) {
      const re = new RegExp(`\\b${u}\\b`);
      if (re.test(t)) return u;
    }
    return "";
  }

  /**
   * Factor multiplicador para llevar una cantidad expresada en `unidad`
   * a la unidad base de la categoría. Si la unidad no se reconoce, asume
   * que ya está en la unidad base (factor 1) para no penalizar.
   */
  private static factorAUnidadBase(
    categoria: string,
    unidad: string
  ): number {
    switch (categoria) {
      case "ceramica":
        // Base: kg
        if (["gramos", "gramo", "gr", "g"].includes(unidad)) return 0.001;
        return 1;
      case "lana":
      case "tela":
      case "hilo":
        // Base: metros
        if (["centimetros", "centimetro", "cm"].includes(unidad)) return 0.01;
        if (["milimetros", "milimetro", "mm"].includes(unidad)) return 0.001;
        return 1;
      case "pintura":
        // Base: ml
        if (["litros", "litro", "l"].includes(unidad)) return 1000;
        return 1;
      default:
        return 1;
    }
  }

  /**
   * Devuelve la propiedad numérica principal de cada categoría, que es la
   * que se multiplica por la cantidad del inventario para obtener el total.
   */
  private static propiedadPrincipalPorCategoria(categoria: string): string | null {
    switch (this.normalizarTexto(categoria)) {
      case "lana":
      case "tela":
      case "hilo":
        return "metros";
      case "pintura":
        return "mililitros";
      case "ceramica":
        return "kilogramos";
      case "papel":
        return "unidades";
      default:
        return null;
    }
  }

  /**
   * Extrae el primer número (entero o decimal) que aparece en un string.
   * Ej.: "80 metros" → 80; "1.5 m" → 1.5; "dos ovillos" → null.
   */
  private static extraerNumero(texto: string): number | null {
    const match = texto.match(/[\d]+(?:[.,]\d+)?/);
    if (!match) return null;
    const num = parseFloat(match[0].replace(",", "."));
    return isNaN(num) ? null : num;
  }

  /**
   * Herramienta compatible: nombre coincidente, o tipo coincidente.
   */
  static esHerramientaCompatible(
    herramientaRequerida: { nombre: string; tipo: string },
    herramientaUsuario: Herramienta
  ): boolean {
    if (
      this.coincidenciaPorPalabras(
        herramientaRequerida.nombre,
        herramientaUsuario.nombre
      )
    ) {
      return true;
    }
    if (
      herramientaRequerida.tipo &&
      herramientaUsuario.tipo &&
      this.coincidenciaPorPalabras(
        herramientaRequerida.tipo,
        herramientaUsuario.tipo
      )
    ) {
      return true;
    }
    return false;
  }
}
