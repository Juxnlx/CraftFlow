import { makeAutoObservable, runInAction } from "mobx";
import { container } from "../../core/container";
import { TYPES } from "../../core/types";
import {
  IGetProyectosPublicosUseCase,
  IGetMisProyectosUseCase,
  IGetProyectoByIdUseCase,
  ICreateProyectoUseCase,
  IUpdateProyectoUseCase,
  IDeleteProyectoUseCase,
} from "../../domain/interfaces/usecases/IProyectoUseCases";
import { Proyecto } from "../../domain/entities/Proyecto";
import { IUsuarioRepository } from "../../domain/interfaces/repositories/IUsuarioRepository";

/**
 * ViewModel que gestiona proyectos: feed público, mis proyectos,
 * detalle, búsqueda y operaciones CRUD.
 */
export class ProyectoViewModel {
  /** Proyectos públicos para el feed de Explorar */
  proyectosPublicos: Proyecto[] = [];
  /** Proyectos creados por el usuario actual */
  misProyectos: Proyecto[] = [];
  /** Proyecto cargado en la pantalla de detalle, o null */
  proyectoDetalle: Proyecto | null = null;
  /** Proyectos que cumplen el filtro de búsqueda actual */
  resultadosBusqueda: Proyecto[] = [];
  /** Cache id de usuario → nombre, para no pedirlos en cada render */
  nombresAutores: Record<string, string> = {};
  /** Indica si hay una operación en curso */
  isLoading: boolean = false;
  /** Mensaje de error a mostrar en la UI, o null si no hay */
  error: string | null = null;

  /** Caso de uso para listar los proyectos públicos */
  private _getPublicosUseCase: IGetProyectosPublicosUseCase;
  /** Caso de uso para listar los proyectos del usuario */
  private _getMisProyectosUseCase: IGetMisProyectosUseCase;
  /** Caso de uso para obtener un proyecto por ID */
  private _getByIdUseCase: IGetProyectoByIdUseCase;
  /** Caso de uso para crear un proyecto */
  private _createUseCase: ICreateProyectoUseCase;
  /** Caso de uso para actualizar un proyecto */
  private _updateUseCase: IUpdateProyectoUseCase;
  /** Caso de uso para eliminar (borrado lógico) un proyecto */
  private _deleteUseCase: IDeleteProyectoUseCase;
  /** Repositorio de usuarios, usado para resolver nombres de autores */
  private _usuarioRepository: IUsuarioRepository;

  /** Activa MobX y resuelve dependencias desde el contenedor de DI. */
  constructor() {
    makeAutoObservable(this);
    this._getPublicosUseCase = container.get<IGetProyectosPublicosUseCase>(TYPES.IGetProyectosPublicosUseCase);
    this._getMisProyectosUseCase = container.get<IGetMisProyectosUseCase>(TYPES.IGetMisProyectosUseCase);
    this._getByIdUseCase = container.get<IGetProyectoByIdUseCase>(TYPES.IGetProyectoByIdUseCase);
    this._createUseCase = container.get<ICreateProyectoUseCase>(TYPES.ICreateProyectoUseCase);
    this._updateUseCase = container.get<IUpdateProyectoUseCase>(TYPES.IUpdateProyectoUseCase);
    this._deleteUseCase = container.get<IDeleteProyectoUseCase>(TYPES.IDeleteProyectoUseCase);
    this._usuarioRepository = container.get<IUsuarioRepository>(TYPES.IUsuarioRepository);
  }

  /** Carga todos los proyectos públicos para el feed de explorar. */
  async cargarProyectosPublicos(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const proyectos = await this._getPublicosUseCase.execute();
      runInAction(() => {
        this.proyectosPublicos = proyectos;
        this.isLoading = false;
      });
      await this._resolverNombresAutores(proyectos);
    } catch {
      runInAction(() => {
        this.error = "Error al cargar proyectos";
        this.isLoading = false;
      });
    }
  }

  /** Carga los proyectos creados por el usuario actual. */
  async cargarMisProyectos(idUsuario: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const proyectos = await this._getMisProyectosUseCase.execute(idUsuario);
      runInAction(() => {
        this.misProyectos = proyectos;
        this.isLoading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Error al cargar tus proyectos";
        this.isLoading = false;
      });
    }
  }

  /** Carga un proyecto específico para ver su detalle. */
  async cargarProyectoDetalle(idProyecto: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const proyecto = await this._getByIdUseCase.execute(idProyecto);
      runInAction(() => {
        this.proyectoDetalle = proyecto;
        this.isLoading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Error al cargar el proyecto";
        this.isLoading = false;
      });
    }
  }

  /** Crea un nuevo proyecto. */
  async crearProyecto(proyecto: Proyecto): Promise<boolean> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await this._createUseCase.execute(proyecto);
      runInAction(() => {
        this.isLoading = false;
      });
      return true;
    } catch {
      runInAction(() => {
        this.error = "Error al crear el proyecto";
        this.isLoading = false;
      });
      return false;
    }
  }

  /** Actualiza un proyecto existente. */
  async actualizarProyecto(idProyecto: string, datos: Partial<Proyecto>): Promise<boolean> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await this._updateUseCase.execute(idProyecto, datos);
      runInAction(() => {
        this.isLoading = false;
      });
      return true;
    } catch {
      runInAction(() => {
        this.error = "Error al actualizar el proyecto";
        this.isLoading = false;
      });
      return false;
    }
  }

  /** Elimina un proyecto (borrado lógico). */
  async eliminarProyecto(idProyecto: string): Promise<boolean> {
    try {
      await this._deleteUseCase.execute(idProyecto);
      // Quitar de la lista local
      runInAction(() => {
        this.misProyectos = this.misProyectos.filter((p) => p.id !== idProyecto);
      });
      return true;
    } catch {
      runInAction(() => {
        this.error = "Error al eliminar el proyecto";
      });
      return false;
    }
  }

  /**
   * Carga múltiples proyectos por sus IDs.
   * Usado por SavedScreen para obtener los datos completos de los favoritos.
   * No afecta al campo proyectoDetalle.
   *
   * @param ids - Array de IDs de proyectos a cargar
   * @returns Array de proyectos encontrados (ignora los que no existen)
   */
  async cargarProyectosPorIds(ids: string[]): Promise<Proyecto[]> {
    const proyectos: Proyecto[] = [];
    for (const id of ids) {
      try {
        const proyecto = await this._getByIdUseCase.execute(id);
        proyectos.push(proyecto);
      } catch {
        // Proyecto eliminado o no encontrado, se ignora
      }
    }
    return proyectos;
  }

  /**
   * Busca proyectos por texto en nombre y etiquetas.
   * Si los proyectos públicos no se han cargado aún, los carga primero.
   */
  async buscarProyectos(texto: string): Promise<void> {
    if (!texto.trim()) {
      runInAction(() => {
        this.resultadosBusqueda = [];
      });
      return;
    }

    if (this.proyectosPublicos.length === 0) {
      await this.cargarProyectosPublicos();
    }

    const textoBusqueda = texto.toLowerCase();
    runInAction(() => {
      this.resultadosBusqueda = this.proyectosPublicos.filter((p) => {
        const nombreCoincide = p.nombre.toLowerCase().includes(textoBusqueda);
        const etiquetaCoincide = p.etiquetas.some((et) =>
          et.toLowerCase().includes(textoBusqueda)
        );
        return nombreCoincide || etiquetaCoincide;
      });
    });
  }

  /** Limpia los resultados de búsqueda. */
  limpiarBusqueda(): void {
    this.resultadosBusqueda = [];
  }

  /** Resuelve los nombres de los autores de una lista de proyectos. */
  private async _resolverNombresAutores(proyectos: Proyecto[]): Promise<void> {
    const idsUnicos = [...new Set(proyectos.map((p) => p.idUsuario))];
    for (const id of idsUnicos) {
      // Si ya tenemos el nombre cacheado, no volvemos a pedirlo
      if (!this.nombresAutores[id]) {
        try {
          const usuario = await this._usuarioRepository.getUsuarioPorId(id);
          runInAction(() => {
            this.nombresAutores[id] = usuario.nombre;
          });
        } catch {
          runInAction(() => {
            this.nombresAutores[id] = "Desconocido";
          });
        }
      }
    }
  }
}
