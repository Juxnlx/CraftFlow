import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { ILogoutUseCase } from "../../interfaces/usecases/IAuthUseCases";
import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";

/**
 * Caso de uso de cierre de sesión.
 * Delega en el repositorio de autenticación.
 */
@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  private _authRepository: IAuthRepository;

  constructor(
    @inject(TYPES.IAuthRepository) authRepository: IAuthRepository
  ) {
    this._authRepository = authRepository;
  }

  /** Cierra la sesión del usuario actual. */
  async execute(): Promise<void> {
    return this._authRepository.logout();
  }
}
