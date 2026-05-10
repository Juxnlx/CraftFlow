import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IDeleteProyectoUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";

@injectable()
export class DeleteProyectoUseCase implements IDeleteProyectoUseCase {
  private _proyectoRepository: IProyectoRepository;

  /**
   * @param proyectoRepository - Repositorio de proyectos inyectado
   */
  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  async execute(idProyecto: string): Promise<void> {
    return this._proyectoRepository.eliminarProyecto(idProyecto);
  }
}
