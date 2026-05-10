import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IResetPasswordUseCase } from "../../interfaces/usecases/IAuthUseCases";
import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  private _authRepository: IAuthRepository;

  /**
   * @param authRepository - Repositorio de autenticación inyectado
   */
  constructor(
    @inject(TYPES.IAuthRepository) authRepository: IAuthRepository
  ) {
    this._authRepository = authRepository;
  }

  async execute(email: string): Promise<void> {
    return this._authRepository.resetPassword(email);
  }
}
