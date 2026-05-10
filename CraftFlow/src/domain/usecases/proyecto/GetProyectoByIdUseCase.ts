import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IGetProyectoByIdUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { Proyecto } from "../../entities/Proyecto";

@injectable()
export class GetProyectoByIdUseCase implements IGetProyectoByIdUseCase {
  private _proyectoRepository: IProyectoRepository;

  /**
   * @param proyectoRepository - Repositorio de proyectos inyectado
   */
  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  async execute(idProyecto: string): Promise<Proyecto> {
    return this._proyectoRepository.getProyectoPorId(idProyecto);
  }
}
