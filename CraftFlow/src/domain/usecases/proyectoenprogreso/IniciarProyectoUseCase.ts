import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IIniciarProyectoUseCase } from "../../interfaces/usecases/IProyectoEnProgresoUseCases";
import { IProyectoEnProgresoRepository } from "../../interfaces/repositories/IProyectoEnProgresoRepository";
import {
  ProyectoEnProgreso,
  PasoCompletado,
} from "../../entities/ProyectoEnProgreso";

/**
 * Caso de uso para iniciar el seguimiento de un proyecto.
 *
 * Antes de crear un nuevo seguimiento comprueba si ya existe uno
 * activo del mismo proyecto: si lo hay, lo devuelve sin duplicar.
 * Esto permite al usuario entrar y salir del detalle del proyecto
 * sin generar registros redundantes.
 */
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
   * Devuelve el seguimiento existente o crea uno nuevo con los pasos
   * inicializados a partir del número de pasos del proyecto.
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

    // Devolvemos una nueva instancia con el ID generado por Firestore
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
