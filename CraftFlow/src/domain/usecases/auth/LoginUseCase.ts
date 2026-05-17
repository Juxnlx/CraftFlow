import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { ILoginUseCase } from "../../interfaces/usecases/IAuthUseCases";
import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";
import { Usuario } from "../../entities/Usuario";

/**
 * Caso de uso de inicio de sesión.
 * Delega en el repositorio de autenticación, manteniendo a los
 * ViewModels desacoplados de la implementación concreta (Firebase Auth).
 */
@injectable()
export class LoginUseCase implements ILoginUseCase {
  private _authRepository: IAuthRepository;

  constructor(
    @inject(TYPES.IAuthRepository) authRepository: IAuthRepository
  ) {
    this._authRepository = authRepository;
  }

  /**
   * Inicia sesión con email y contraseña.
   * @returns El usuario autenticado
   */
  async execute(email: string, password: string): Promise<Usuario> {
    return this._authRepository.login(email, password);
  }
}
