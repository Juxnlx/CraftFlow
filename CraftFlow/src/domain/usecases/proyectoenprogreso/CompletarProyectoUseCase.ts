import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { ICompletarProyectoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

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
   * Cierra un seguimiento marcándolo como completado.
   * Cambia el estado, registra la fecha y guarda imagen y nota opcionales.
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
