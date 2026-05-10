import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IGetUsuarioPorIdUseCase } from "../../interfaces/usecases/IUsuarioUseCases";
import { IUsuarioRepository } from "../../interfaces/repositories/IUsuarioRepository";
import { Usuario } from "../../entities/Usuario";

@injectable()
export class GetUsuarioPorIdUseCase implements IGetUsuarioPorIdUseCase {
  private _usuarioRepository: IUsuarioRepository;

  /**
   * @param usuarioRepository - Repositorio de usuarios inyectado
   */
  constructor(
    @inject(TYPES.IUsuarioRepository) usuarioRepository: IUsuarioRepository
  ) {
    this._usuarioRepository = usuarioRepository;
  }

  async execute(idUsuario: string): Promise<Usuario> {
    return this._usuarioRepository.getUsuarioPorId(idUsuario);
  }
}
