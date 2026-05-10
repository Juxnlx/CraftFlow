import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IUpdateProyectoUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { Proyecto } from "../../entities/Proyecto";

@injectable()
export class UpdateProyectoUseCase implements IUpdateProyectoUseCase {
  private _proyectoRepository: IProyectoRepository;

  /**
   * @param proyectoRepository - Repositorio de proyectos inyectado
   */
  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  async execute(idProyecto: string, proyecto: Partial<Proyecto>): Promise<void> {
    return this._proyectoRepository.actualizarProyecto(idProyecto, proyecto);
  }
}
