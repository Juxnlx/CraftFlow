import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { ILoginUseCase } from "../../interfaces/usecases/IAuthUseCases";
import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";
import { Usuario } from "../../entities/Usuario";

@injectable()
export class LoginUseCase implements ILoginUseCase {
  private _authRepository: IAuthRepository;

  /**
   * @param authRepository - Repositorio de autenticación inyectado
   */
  constructor(
    @inject(TYPES.IAuthRepository) authRepository: IAuthRepository
  ) {
    this._authRepository = authRepository;
  }

  async execute(email: string, password: string): Promise<Usuario> {
    return this._authRepository.login(email, password);
  }
}
