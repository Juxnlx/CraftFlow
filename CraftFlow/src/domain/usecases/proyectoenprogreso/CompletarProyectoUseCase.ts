import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { ICompletarProyectoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

/**
 * Caso de uso para cerrar un seguimiento como completado.
 * Marca el estado como "completado", registra la fecha de finalización
 * y guarda la imagen del resultado y la nota opcional del usuario.
 */
@injectable()
export class CompletarProyectoUseCase implements ICompletarProyectoUseCase {
  private _repo: IProyectoEnProgresoRepository;

  constructor(
    @inject(TYPES.IProyectoEnProgresoRepository)
    repo: IProyectoEnProgresoRepository
  ) {
    this._repo = repo;
  }

  /**
   * Marca el seguimiento como completado y guarda la imagen final y la
   * nota opcional del usuario.
   */
  async execute(
    idSeguimiento: string,
    imagenResultado: string | null,
    notaFinal: string | null
  ): Promise<void> {
    const datos: Partial<ProyectoEnProgreso> = {
      estado: "completado",
      fechaCompletado: new Date(),
      imagenResultado,
      notaFinal,
    };
    return this._repo.actualizarProyectoEnProgreso(idSeguimiento, datos);
  }
}
