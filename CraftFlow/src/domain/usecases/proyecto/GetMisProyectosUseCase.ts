import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetMisProyectosUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { Proyecto } from "../../entities/Proyecto";

/**
 * Caso de uso para obtener los proyectos publicados por el usuario actual.
 * Se usa en el perfil para mostrar la pestaña "Mis proyectos".
 */
@injectable()
export class GetMisProyectosUseCase implements IGetMisProyectosUseCase {
  private _proyectoRepository: IProyectoRepository;

  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  /** Devuelve los proyectos publicados por un usuario. */
  async execute(idUsuario: string): Promise<Proyecto[]> {
    return this._proyectoRepository.getProyectosPorUsuario(idUsuario);
  }
}
