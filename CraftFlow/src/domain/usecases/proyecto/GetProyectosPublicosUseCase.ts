import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IGetProyectosPublicosUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { Proyecto } from "../../entities/Proyecto";

@injectable()
export class GetProyectosPublicosUseCase implements IGetProyectosPublicosUseCase {
  private _proyectoRepository: IProyectoRepository;

  /**
   * @param proyectoRepository - Repositorio de proyectos inyectado
   */
  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  async execute(): Promise<Proyecto[]> {
    return this._proyectoRepository.getProyectosPublicos();
  }
}
