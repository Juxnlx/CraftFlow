import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IDeleteProyectoUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";

/**
 * Caso de uso para eliminar un proyecto.
 * El borrado real es lógico (campo `activo: false`) en el repositorio
 * para no perder datos publicados por el usuario.
 */
@injectable()
export class DeleteProyectoUseCase implements IDeleteProyectoUseCase {
  private _proyectoRepository: IProyectoRepository;

  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  /** Elimina (de forma lógica) un proyecto del usuario. */
  async execute(idProyecto: string): Promise<void> {
    return this._proyectoRepository.eliminarProyecto(idProyecto);
  }
}
