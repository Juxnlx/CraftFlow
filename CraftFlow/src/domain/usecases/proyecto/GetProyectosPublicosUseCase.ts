import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetProyectosPublicosUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { Proyecto } from "../../entities/Proyecto";

/**
 * Caso de uso para obtener los proyectos públicos.
 * Alimenta el feed de "Explorar" y la pantalla principal de
 * recomendaciones.
 */
@injectable()
export class GetProyectosPublicosUseCase implements IGetProyectosPublicosUseCase {
  private _proyectoRepository: IProyectoRepository;

  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  /** Devuelve todos los proyectos públicos y activos. */
  async execute(): Promise<Proyecto[]> {
    return this._proyectoRepository.getProyectosPublicos();
  }
}
