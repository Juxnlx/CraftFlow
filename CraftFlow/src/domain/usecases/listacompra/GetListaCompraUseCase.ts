import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IGetListaCompraUseCase } from "../../interfaces/usecases/IListaCompraUseCases";
import { IFavoritoRepository } from "../../interfaces/repositories/IFavoritoRepository";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";
import { ItemCompra } from "../../entities/ItemCompra";
import { Material } from "../../entities/Material";
import { Proyecto } from "../../entities/Proyecto";
import { MaterialMatcher } from "../../services/MaterialMatcher";

/**
 * Caso de uso que genera la lista de la compra del usuario.
 *
 * Flujo:
 * 1. Obtiene proyectos favoritos y el inventario del usuario.
 * 2. Para cada proyecto favorito, identifica los materiales y herramientas
 *    que el usuario NO tiene (usando el mismo matching por palabras del
 *    motor de recomendaciones).
 * 3. Agrupa ítems repetidos acumulando los proyectos que los necesitan.
 * 4. Sugiere una URL de compra si el usuario ya tiene algún material de
 *    la misma categoría con url_compra rellena.
 * 5. Devuelve la lista ordenada (materiales primero, luego herramientas).
 *
 * @example
 * const lista = await getListaCompraUseCase.execute("user123");
 * // [
 * //   { nombre: "Hilo verde", esHerramienta: false, ... },
 * //   { nombre: "Aguja 3.5mm", esHerramienta: true, ... }
 * // ]
 */
@injectable()
export class GetListaCompraUseCase implements IGetListaCompraUseCase {
  private _favoritoRepository: IFavoritoRepository;
  private _proyectoRepository: IProyectoRepository;
  private _materialRepository: IMaterialRepository;
  private _herramientaRepository: IHerramientaRepository;

  constructor(
    @inject(TYPES.IFavoritoRepository) favoritoRepository: IFavoritoRepository,
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository,
    @inject(TYPES.IMaterialRepository) materialRepository: IMaterialRepository,
    @inject(TYPES.IHerramientaRepository) herramientaRepository: IHerramientaRepository
  ) {
    this._favoritoRepository = favoritoRepository;
    this._proyectoRepository = proyectoRepository;
    this._materialRepository = materialRepository;
    this._herramientaRepository = herramientaRepository;
  }

  async execute(idUsuario: string): Promise<ItemCompra[]> {
    // 1. Cargar favoritos + inventario en paralelo
    const [favoritos, misMateriales, misHerramientas] = await Promise.all([
      this._favoritoRepository.getFavoritosPorUsuario(idUsuario),
      this._materialRepository.getMaterialesPorUsuario(idUsuario),
      this._herramientaRepository.getHerramientasPorUsuario(idUsuario),
    ]);

    if (favoritos.length === 0) return [];

    // 2. Cargar los proyectos completos de los favoritos (ignora los borrados)
    const proyectos: Proyecto[] = [];
    for (const fav of favoritos) {
      try {
        const proyecto = await this._proyectoRepository.getProyectoPorId(fav.idProyecto);
        proyectos.push(proyecto);
      } catch {
        // Proyecto eliminado, se ignora
      }
    }

    // 3. Construir el mapa agregado de ítems que faltan.
    // Clave = "m:nombre|categoria" para material, "h:nombre|tipo" para herramienta.
    // Esto evita duplicados y permite acumular los proyectos que lo necesitan.
    const itemsMap = new Map<string, ItemCompra>();

    for (const proyecto of proyectos) {
      // Materiales que faltan
      for (const matReq of proyecto.materiales || []) {
        const loTiene = misMateriales.some((m) =>
          this._esMaterialCompatible(matReq, m)
        );
        if (!loTiene) {
          const clave = `m:${this._normalizarTexto(matReq.nombre)}|${this._normalizarTexto(matReq.categoria)}`;
          this._acumularItem(itemsMap, clave, {
            clave,
            nombre: matReq.nombre,
            esHerramienta: false,
            categoriaOTipo: matReq.categoria,
            proyectosQueLoNecesitan: [proyecto.nombre],
            urlCompraSugerida: this._buscarUrlSugerida(matReq.categoria, misMateriales),
          });
        }
      }

      // Herramientas que faltan
      for (const herReq of proyecto.herramientas || []) {
        const laTiene = misHerramientas.some((h) =>
          this._esHerramientaCompatible(herReq, h)
        );
        if (!laTiene) {
          const clave = `h:${this._normalizarTexto(herReq.nombre)}|${this._normalizarTexto(herReq.tipo)}`;
          this._acumularItem(itemsMap, clave, {
            clave,
            nombre: herReq.nombre,
            esHerramienta: true,
            categoriaOTipo: herReq.tipo,
            proyectosQueLoNecesitan: [proyecto.nombre],
            urlCompraSugerida: this._buscarUrlSugeridaHerramienta(
              herReq.tipo,
              misHerramientas
            ),
          });
        }
      }
    }

    // 5. Ordenar: materiales primero (agrupados por categoría), luego herramientas
    const lista = Array.from(itemsMap.values());
    lista.sort((a, b) => {
      if (a.esHerramienta !== b.esHerramienta) {
        return a.esHerramienta ? 1 : -1;
      }
      if (a.categoriaOTipo !== b.categoriaOTipo) {
        return a.categoriaOTipo.localeCompare(b.categoriaOTipo);
      }
      return a.nombre.localeCompare(b.nombre);
    });

    return lista;
  }

  /**
   * Añade un ítem al mapa o, si ya existe, acumula el proyecto que lo necesita.
   */
  private _acumularItem(
    mapa: Map<string, ItemCompra>,
    clave: string,
    item: ItemCompra
  ): void {
    const existente = mapa.get(clave);
    if (existente) {
      // Evitar repetir el mismo nombre de proyecto en el array
      for (const nombreProy of item.proyectosQueLoNecesitan) {
        if (!existente.proyectosQueLoNecesitan.includes(nombreProy)) {
          existente.proyectosQueLoNecesitan.push(nombreProy);
        }
      }
    } else {
      mapa.set(clave, { ...item });
    }
  }

  /**
   * Busca una URL de compra en los materiales que el usuario ya tiene
   * de la misma categoría. Permite a la lista de la compra aprovechar
   * dónde compró antes el usuario (ej: si ya tiene lana con url, la
   * lista sugiere esa misma tienda para otra lana que le falte).
   */
  private _buscarUrlSugerida(categoria: string, misMateriales: Material[]): string | null {
    const cat = this._normalizarTexto(categoria);
    const sugerencia = misMateriales.find(
      (m) => this._normalizarTexto(m.categoria) === cat && m.urlCompra
    );
    return sugerencia?.urlCompra || null;
  }

  /**
   * Equivalente para herramientas: busca una URL guardada en una herramienta
   * existente del mismo tipo. Si no hay coincidencia exacta, cae a una con
   * tipo similar por palabras (mismo matching que usa el motor) para no
   * dejarse sin sugerencia entre tipos sinónimos.
   */
  private _buscarUrlSugeridaHerramienta(
    tipo: string,
    misHerramientas: import("../../entities/Herramienta").Herramienta[]
  ): string | null {
    const tipoNormalizado = this._normalizarTexto(tipo);
    const exacta = misHerramientas.find(
      (h) => this._normalizarTexto(h.tipo) === tipoNormalizado && h.urlCompra
    );
    if (exacta) return exacta.urlCompra;
    const aproximada = misHerramientas.find(
      (h) =>
        h.urlCompra &&
        MaterialMatcher.coincidenciaPorPalabras(tipo, h.tipo)
    );
    return aproximada?.urlCompra || null;
  }

  /**
   * Normaliza un texto eliminando tildes y pasando a minúsculas.
   * Se usa internamente para construir las claves de agregación del mapa.
   */
  private _normalizarTexto(texto: string): string {
    return MaterialMatcher.normalizarTexto(texto);
  }

  /**
   * Material compatible: misma lógica que el motor de recomendaciones,
   * incluyendo el chequeo de cantidad. Si el usuario tiene el material
   * pero NO cubre la cantidad pedida, se considera "no lo tiene" y
   * se añade a la lista de la compra. Así Home y Lista coinciden.
   */
  private _esMaterialCompatible(
    req: { nombre: string; categoria: string; cantidad: string | null },
    usuario: Material
  ): boolean {
    return MaterialMatcher.esMaterialCompatible(req, usuario);
  }

  /**
   * Herramienta compatible: misma lógica que el motor de recomendaciones,
   * para que ambos vean lo mismo. Se envuelve en método de instancia para
   * preservar el `this` interno del MaterialMatcher (la asignación directa
   * lo rompía y lanzaba un error silencioso).
   */
  private _esHerramientaCompatible(
    req: { nombre: string; tipo: string },
    usuario: import("../../entities/Herramienta").Herramienta
  ): boolean {
    return MaterialMatcher.esHerramientaCompatible(req, usuario);
  }
}
