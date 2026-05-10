import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { ICreateProyectoUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { Proyecto } from "../../entities/Proyecto";

@injectable()
export class CreateProyectoUseCase implements ICreateProyectoUseCase {
  private _proyectoRepository: IProyectoRepository;

  /**
   * @param proyectoRepository - Repositorio de proyectos inyectado
   */
  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  async execute(proyecto: Proyecto): Promise<string> {
    return this._proyectoRepository.crearProyecto(proyecto);
  }
}
