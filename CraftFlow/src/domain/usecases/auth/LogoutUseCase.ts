import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { ILogoutUseCase } from "../../interfaces/usecases/IAuthUseCases";
import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  private _authRepository: IAuthRepository;

  /**
   * @param authRepository - Repositorio de autenticación inyectado
   */
  constructor(
    @inject(TYPES.IAuthRepository) authRepository: IAuthRepository
  ) {
    this._authRepository = authRepository;
  }

  async execute(): Promise<void> {
    return this._authRepository.logout();
  }
}
