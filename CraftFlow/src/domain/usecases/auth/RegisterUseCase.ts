import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IRegisterUseCase } from "../../interfaces/usecases/IAuthUseCases";
import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";
import { Usuario } from "../../entities/Usuario";

@injectable()
export class RegisterUseCase implements IRegisterUseCase {
  private _authRepository: IAuthRepository;

  /**
   * @param authRepository - Repositorio de autenticación inyectado
   */
  constructor(
    @inject(TYPES.IAuthRepository) authRepository: IAuthRepository
  ) {
    this._authRepository = authRepository;
  }

  async execute(email: string, password: string, nombre: string): Promise<Usuario> {
    return this._authRepository.register(email, password, nombre);
  }
}
