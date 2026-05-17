import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetProyectoByIdUseCase } from "../../interfaces/usecases/IProyectoUseCases";
import { IProyectoRepository } from "../../interfaces/repositories/IProyectoRepository";
import { Proyecto } from "../../entities/Proyecto";

/**
 * Caso de uso para obtener un proyecto concreto por su ID.
 * Se utiliza al abrir la pantalla de detalle desde cualquier pestaña.
 */
@injectable()
export class GetProyectoByIdUseCase implements IGetProyectoByIdUseCase {
  private _proyectoRepository: IProyectoRepository;

  constructor(
    @inject(TYPES.IProyectoRepository) proyectoRepository: IProyectoRepository
  ) {
    this._proyectoRepository = proyectoRepository;
  }

  /** Devuelve un proyecto por su ID. */
  async execute(idProyecto: string): Promise<Proyecto> {
    return this._proyectoRepository.getProyectoPorId(idProyecto);
  }
}
