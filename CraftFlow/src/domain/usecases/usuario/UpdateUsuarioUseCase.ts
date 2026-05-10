import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IUpdateUsuarioUseCase } from "../../interfaces/usecases/IUsuarioUseCases";
import { IUsuarioRepository } from "../../interfaces/repositories/IUsuarioRepository";
import { Usuario } from "../../entities/Usuario";

@injectable()
export class UpdateUsuarioUseCase implements IUpdateUsuarioUseCase {
  private _usuarioRepository: IUsuarioRepository;

  /**
   * @param usuarioRepository - Repositorio de usuarios inyectado
   */
  constructor(
    @inject(TYPES.IUsuarioRepository) usuarioRepository: IUsuarioRepository
  ) {
    this._usuarioRepository = usuarioRepository;
  }

  async execute(idUsuario: string, datos: Partial<Usuario>): Promise<void> {
    return this._usuarioRepository.actualizarUsuario(idUsuario, datos);
  }
}
