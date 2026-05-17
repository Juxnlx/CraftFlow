import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IRegisterUseCase } from "../../interfaces/usecases/IAuthUseCases";
import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";
import { Usuario } from "../../entities/Usuario";

/**
 * Caso de uso de registro de un nuevo usuario.
 * Delega en el repositorio de autenticación para no acoplar la lógica
 * de la aplicación a la implementación concreta de Firebase.
 */
@injectable()
export class RegisterUseCase implements IRegisterUseCase {
  private _authRepository: IAuthRepository;

  constructor(
    @inject(TYPES.IAuthRepository) authRepository: IAuthRepository
  ) {
    this._authRepository = authRepository;
  }

  /**
   * Registra un nuevo usuario con email, contraseña y nombre.
   * @returns El usuario recién creado
   */
  async execute(email: string, password: string, nombre: string): Promise<Usuario> {
    return this._authRepository.register(email, password, nombre);
  }
}
