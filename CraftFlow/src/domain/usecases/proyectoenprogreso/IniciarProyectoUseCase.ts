import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IIniciarProyectoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import {
  ProyectoEnProgreso,
  PasoCompletado,
} from "../../entities/ProyectoEnProgreso";

@injectable()
export class IniciarProyectoUseCase implements IIniciarProyectoUseCase {
  private _repo: IProyectoEnProgresoRepository;

  constructor(
    @inject(TYPES.IProyectoEnProgresoRepository)
    repo: IProyectoEnProgresoRepository
  ) {
    this._repo = repo;
  }

  /**
   * Inicia un seguimiento. Si ya hay uno activo del mismo proyecto, lo
   * devuelve sin crear otro: así el usuario puede entrar y salir del detalle
   * sin generar duplicados.
   */
  async execute(
    idUsuario: string,
    idProyecto: string,
    numeroPasos: number
  ): Promise<ProyectoEnProgreso> {
    const existente = await this._repo.getProyectoEnProgreso(
      idUsuario,
      idProyecto
    );
    if (existente) return existente;

    // Inicializa el array de pasos a partir del número de pasos del proyecto
    const pasosCompletados: PasoCompletado[] = Array.from(
      { length: numeroPasos },
      (_, i) => ({
        numeroOrden: i + 1,
        completado: false,
        fotoProgreso: null,
        tiempoSegundos: 0,
      })
    );

    const nuevo = new ProyectoEnProgreso(
      "",
      idUsuario,
      idProyecto,
      new Date(),
      null,
      "en_progreso",
      pasosCompletados,
      0,
      null,
      null
    );
    const id = await this._repo.crearProyectoEnProgreso(nuevo);

    // Devolver una nueva instancia con el ID generado
    return new ProyectoEnProgreso(
      id,
      idUsuario,
      idProyecto,
      nuevo.fechaInicio,
      null,
      "en_progreso",
      pasosCompletados,
      0,
      null,
      null
    );
  }
}
