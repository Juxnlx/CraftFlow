import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGetUsuarioPorIdUseCase } from "../../interfaces/usecases/IUsuarioUseCases";
import { IUsuarioRepository } from "../../interfaces/repositories/IUsuarioRepository";
import { Usuario } from "../../entities/Usuario";

/**
 * Caso de uso para obtener los datos de perfil de un usuario por su UID.
 * Lo usan tanto la pantalla de perfil propio como las recomendaciones
 * (para mostrar el autor de cada proyecto).
 */
@injectable()
export class GetUsuarioPorIdUseCase implements IGetUsuarioPorIdUseCase {
  private _usuarioRepository: IUsuarioRepository;

  constructor(
    @inject(TYPES.IUsuarioRepository) usuarioRepository: IUsuarioRepository
  ) {
    this._usuarioRepository = usuarioRepository;
  }

  /** Devuelve los datos de perfil del usuario indicado. */
  async execute(idUsuario: string): Promise<Usuario> {
    return this._usuarioRepository.getUsuarioPorId(idUsuario);
  }
}
