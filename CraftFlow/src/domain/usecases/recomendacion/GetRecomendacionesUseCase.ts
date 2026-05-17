import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetRecomendacionesUseCase } from "../../interfaces/usecases/IRecomendacionUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { IMaterialRepository } from "../../interfaces/repositories/IMaterialRepository";
import { IHerramientaRepository } from "../../interfaces/repositories/IHerramientaRepository";
import { IUsuarioRepository } from "../../interfaces/repositories/IUsuarioRepository";
import {
  ProyectoRecomendado,
  MaterialMatch,
  HerramientaMatch,
} from "../../entities/ProyectoRecomendado";
import { Material } from "../../entities/Material";
import { Herramienta } from "../../entities/Herramienta";
import { Usuario } from "../../entities/Usuario";
import { MaterialMatcher } from "../../services/MaterialMatcher";

/**
 * Caso de uso que genera recomendaciones de proyectos para un usuario.
 *
 * Compara los materiales y herramientas del inventario del usuario con los
 * requisitos de cada proyecto público, calcula un porcentaje de compatibilidad
 * combinado y devuelve los resultados ordenados de mayor a menor match.
 *
 * Necesita 4 repositorios:
 * - IProyectoRepository: proyectos públicos
 * - IMaterialRepository: materiales del usuario
 * - IHerramientaRepository: herramientas del usuario
 * - IUsuarioRepository: nombre y foto del autor de cada proyecto
 *
 * @example
 * const recomendaciones = await getRecomendacionesUseCase.execute("user123");
 * // Devuelve proyectos ordenados por % de match descendente
 */
@injectable()
export class GetRecomendacionesUseCase implements IGetRecomendacionesUseCase {
  private _proyectoRepository: IProyectoRepository;
  private _materialRepository: IMaterialRepository;
  private _herramientaRepository: IHerramientaRepository;
  private _usuarioRepository: IUsuarioRepository;

  /**
   * @param proyectoRepository - Repositorio de proyectos inyectado
   * @param materialRepository - Repositorio de materiales inyectado
   * @param herramientaRepository - Repositorio de herramientas inyectado
   * @param usuarioRepository - Repositorio de usuarios inyectado
   */
  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository,
    @inject(TYPES.IMaterialRepository) materialRepository: IMaterialRepository,
    @inject(TYPES.IHerramientaRepository) herramientaRepository: IHerramientaRepository,
    @inject(TYPES.IUsuarioRepository) usuarioRepository: IUsuarioRepository
  ) {
    this._proyectoRepository = proyectoRepository;
    this._materialRepository = materialRepository;
    this._herramientaRepository = herramientaRepository;
    this._usuarioRepository = usuarioRepository;
  }

  /**
   * Ejecuta el motor de recomendaciones.
   *
   * Algoritmo:
   * 1. Obtiene materiales, herramientas del usuario y proyectos públicos
   * 2. Para cada proyecto, compara materiales y herramientas requeridos
   * 3. matchPercent combinado: (materiales + herramientas coincidentes) / total ítems
   * 4. canMake = true solo si tiene TODOS los materiales Y TODAS las herramientas
   * 5. Obtiene datos del autor con caché para no repetir consultas
   * 6. Ordena por matchPercent descendente
   *
   * @param idUsuario - ID del usuario para el que se generan recomendaciones
   * @returns Promesa que resuelve a un array de proyectos recomendados
   */
  async execute(idUsuario: string): Promise<ProyectoRecomendado[]> {
    // 1. Obtener inventario del usuario y proyectos públicos en paralelo
    const [misMateriales, misHerramientas, proyectosPublicos] = await Promise.all([
      this._materialRepository.getMaterialesPorUsuario(idUsuario),
      this._herramientaRepository.getHerramientasPorUsuario(idUsuario),
      this._proyectoRepository.getProyectosPublicos(),
    ]);

    const recomendaciones: ProyectoRecomendado[] = [];

    // Caché de autores para no consultar el mismo usuario varias veces
    const cacheAutores = new Map<string, Usuario>();

    // 2. Para cada proyecto, comparar materiales y herramientas
    for (const proyecto of proyectosPublicos) {
      // Omitir proyectos propios del usuario
      if (proyecto.idUsuario === idUsuario) continue;

      // 2a. Matching de materiales
      const materialesRequeridos = proyecto.materiales || [];
      const materialesMatch: MaterialMatch[] = materialesRequeridos.map((req) => ({
        nombre: req.nombre,
        categoria: req.categoria,
        loTieneElUsuario: misMateriales.some((m) =>
          this._esMaterialCompatible(req, m)
        ),
      }));

      // 2b. Matching de herramientas
      const herramientasRequeridas = proyecto.herramientas || [];
      const herramientasMatch: HerramientaMatch[] = herramientasRequeridas.map((req) => ({
        nombre: req.nombre,
        tipo: req.tipo,
        loTieneElUsuario: misHerramientas.some((h) =>
          this._esHerramientaCompatible(req, h)
        ),
      }));

      // 3. Calcular matchPercent combinado.
      // Un proyecto sin materiales NI herramientas no es recomendable
      // (no hay nada que comparar contra el inventario): se descarta.
      const totalItems = materialesMatch.length + herramientasMatch.length;
      if (totalItems === 0) continue;
      const itemsTenidos =
        materialesMatch.filter((m) => m.loTieneElUsuario).length +
        herramientasMatch.filter((h) => h.loTieneElUsuario).length;
      const matchPercent = Math.round((itemsTenidos / totalItems) * 100);

      // 4. canMake = todo material y toda herramienta (si el proyecto no requiere
      //    nada, se considera que sí se puede hacer)
      const canMake = matchPercent === 100;

      // 5. Obtener datos del autor (con caché)
      let autor = cacheAutores.get(proyecto.idUsuario);
      if (!autor) {
        try {
          autor = await this._usuarioRepository.getUsuarioPorId(proyecto.idUsuario);
          cacheAutores.set(proyecto.idUsuario, autor);
        } catch {
          // Si el autor fue eliminado, usar valores por defecto
          autor = new Usuario(proyecto.idUsuario, "", "Usuario eliminado");
          cacheAutores.set(proyecto.idUsuario, autor);
        }
      }

      recomendaciones.push(
        new ProyectoRecomendado(
          proyecto,
          autor.nombre,
          autor.fotoPerfil,
          matchPercent,
          canMake,
          materialesMatch,
          herramientasMatch
        )
      );
    }

    // 6. Ordenar por matchPercent descendente
    recomendaciones.sort((a, b) => b.matchPercent - a.matchPercent);

    return recomendaciones;
  }

  /**
   * Compara un material requerido con uno del inventario delegando
   * todo el chequeo (categoría + nombre + cantidad) al MaterialMatcher.
   * La lista de la compra usa exactamente la misma función.
   */
  private _esMaterialCompatible(
    materialRequerido: { nombre: string; categoria: string; cantidad: string | null },
    materialUsuario: Material
  ): boolean {
    return MaterialMatcher.esMaterialCompatible(
      materialRequerido,
      materialUsuario
    );
  }

  /**
   * Compara una herramienta requerida con una del inventario delegando
   * en MaterialMatcher (lógica compartida con la lista de la compra).
   */
  private _esHerramientaCompatible(
    herramientaRequerida: { nombre: string; tipo: string },
    herramientaUsuario: Herramienta
  ): boolean {
    return MaterialMatcher.esHerramientaCompatible(
      herramientaRequerida,
      herramientaUsuario
    );
  }
}
