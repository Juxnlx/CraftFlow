import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IResetPasswordUseCase } from "../../interfaces/usecases/IAuthUseCases";
import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";

/**
 * Caso de uso para enviar un correo de restablecimiento de contraseña.
 * Delega en el repositorio de autenticación.
 */
@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  private _authRepository: IAuthRepository;

  constructor(
    @inject(TYPES.IAuthRepository) authRepository: IAuthRepository
  ) {
    this._authRepository = authRepository;
  }

  /** Envía un correo de restablecimiento de contraseña al email indicado. */
  async execute(email: string): Promise<void> {
    return this._authRepository.resetPassword(email);
  }
}
