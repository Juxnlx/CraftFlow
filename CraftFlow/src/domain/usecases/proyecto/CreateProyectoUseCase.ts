import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { ICreateProyectoUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { Proyecto } from "../../entities/Proyecto";

/**
 * Caso de uso para publicar un nuevo proyecto.
 * Delega la persistencia en el repositorio.
 */
@injectable()
export class CreateProyectoUseCase implements ICreateProyectoUseCase {
  private _proyectoRepository: IProyectoRepository;

  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  /**
   * Crea un nuevo proyecto.
   * @returns El ID generado por Firestore
   */
  async execute(proyecto: Proyecto): Promise<string> {
    return this._proyectoRepository.crearProyecto(proyecto);
  }
}
