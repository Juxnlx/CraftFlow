import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetListaCompraUseCase } from "../../interfaces/usecases/IListaCompraUseCases";
import { IFavoritoRepository } from "../../interfaces/repositories/IFavoritoRepository";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";
import { ItemCompra } from "../../entities/ItemCompra";
import { Material } from "../../entities/Material";
import { Proyecto } from "../../entities/Proyecto";
import { Herramienta } from "../../entities/Herramienta";
import { MaterialMatcher } from "../../services/MaterialMatcher";

/**
 * Caso de uso que genera la lista de la compra del usuario a partir de
 * sus proyectos favoritos y su inventario. Reutiliza el mismo matching
 * que el motor de recomendaciones para que Home y la lista coincidan,
 * agrupa ítems repetidos acumulando los proyectos que los necesitan y
 * sugiere una URL de compra cuando el usuario ya guardó otra de la misma
 * categoría. Devuelve materiales primero y luego herramientas.
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

  /**
   * Calcula la lista de la compra del usuario a partir de sus favoritos
   * y de su inventario actual.
   */
  async execute(idUsuario: string): Promise<ItemCompra[]> {
    // Cargar favoritos e inventario en paralelo
    const [favoritos, misMateriales, misHerramientas] = await Promise.all([
      this._favoritoRepository.getFavoritosPorUsuario(idUsuario),
      this._materialRepository.getMaterialesPorUsuario(idUsuario),
      this._herramientaRepository.getHerramientasPorUsuario(idUsuario),
    ]);

    if (favoritos.length === 0) {
      return [];
    }

    // Cargar los proyectos completos asociados a los favoritos
    // (ignoramos los que ya hayan sido eliminados por su autor)
    const proyectos: Proyecto[] = [];
    for (const fav of favoritos) {
      try {
        const proyecto = await this._proyectoRepository.getProyectoPorId(fav.idProyecto);
        proyectos.push(proyecto);
      } catch {
        // Proyecto eliminado: se omite
      }
    }

    // Mapa agregado de ítems que faltan. La clave evita duplicados y
    // permite acumular los proyectos que necesitan el mismo material o
    // herramienta.
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

    // Ordenar: primero materiales (agrupados por categoría) y después
    // herramientas, ambos alfabéticamente dentro de su grupo.
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
   * Añade un ítem al mapa o, si ya existe la misma clave, acumula el
   * nombre del proyecto que lo necesita evitando duplicados.
   */
  private _acumularItem(
    mapa: Map<string, ItemCompra>,
    clave: string,
    item: ItemCompra
  ): void {
    const existente = mapa.get(clave);
    if (existente) {
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
   * Sugiere una URL de compra reutilizando alguna de las que el usuario
   * ya guardó para un material de la misma categoría: si ya compró su
   * lana en una tienda, sugerimos esa misma tienda para otra lana que le falte.
   */
  private _buscarUrlSugerida(categoria: string, misMateriales: Material[]): string | null {
    const cat = this._normalizarTexto(categoria);
    const sugerencia = misMateriales.find(
      (m) => this._normalizarTexto(m.categoria) === cat && m.urlCompra
    );
    return sugerencia?.urlCompra || null;
  }

  /**
   * Equivalente al método anterior pero para herramientas. Si no
   * encuentra coincidencia exacta de tipo, prueba con coincidencia por
   * palabras para no perder sugerencias entre tipos similares.
   */
  private _buscarUrlSugeridaHerramienta(
    tipo: string,
    misHerramientas: Herramienta[]
  ): string | null {
    const tipoNormalizado = this._normalizarTexto(tipo);
    const exacta = misHerramientas.find(
      (h) => this._normalizarTexto(h.tipo) === tipoNormalizado && h.urlCompra
    );
    if (exacta) {
      return exacta.urlCompra;
    }

    const aproximada = misHerramientas.find(
      (h) =>
        h.urlCompra &&
        MaterialMatcher.coincidenciaPorPalabras(tipo, h.tipo)
    );
    return aproximada?.urlCompra || null;
  }

  /** Normaliza el texto (sin tildes, en minúsculas) para construir claves estables. */
  private _normalizarTexto(texto: string): string {
    return MaterialMatcher.normalizarTexto(texto);
  }

  /**
   * Comprueba si el usuario tiene un material compatible con el requerido.
   * Si tiene el material pero no cubre la cantidad pedida, se considera
   * que no lo tiene y se añade a la lista de la compra.
   */
  private _esMaterialCompatible(
    req: { nombre: string; categoria: string; cantidad: string | null },
    usuario: Material
  ): boolean {
    return MaterialMatcher.esMaterialCompatible(req, usuario);
  }

  /**
   * Comprueba si el usuario tiene una herramienta compatible con la
   * requerida (misma lógica de matching que el motor de recomendaciones).
   */
  private _esHerramientaCompatible(
    req: { nombre: string; tipo: string },
    usuario: Herramienta
  ): boolean {
    return MaterialMatcher.esHerramientaCompatible(req, usuario);
  }
}
