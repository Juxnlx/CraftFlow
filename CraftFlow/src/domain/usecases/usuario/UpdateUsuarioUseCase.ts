import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IUpdateUsuarioUseCase } from "../../interfaces/usecases/IUsuarioUseCases";
import { IUsuarioRepository } from "../../interfaces/repositories/IUsuarioRepository";
import { Usuario } from "../../entities/Usuario";

/**
 * Caso de uso para actualizar los datos de perfil de un usuario.
 * Solo se modifican los campos incluidos en el objeto parcial.
 */
@injectable()
export class UpdateUsuarioUseCase implements IUpdateUsuarioUseCase {
  private _usuarioRepository: IUsuarioRepository;

  constructor(
    @inject(TYPES.IUsuarioRepository) usuarioRepository: IUsuarioRepository
  ) {
    this._usuarioRepository = usuarioRepository;
  }

  /** Actualiza el perfil del usuario con los campos del objeto parcial. */
  async execute(idUsuario: string, datos: Partial<Usuario>): Promise<void> {
    return this._usuarioRepository.actualizarUsuario(idUsuario, datos);
  }
}
