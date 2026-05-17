import { makeAutoObservable, runInAction } from "mobx";
import { container } from "../../core/container";
import { TYPES } from "../../core/types";
import {
  ILoginUseCase,
  IRegisterUseCase,
  ILogoutUseCase,
  IResetPasswordUseCase,
} from "../../domain/interfaces/usecases/IAuthUseCases";
import { Usuario } from "../../domain/entities/Usuario";

/**
 * ViewModel que gestiona el estado de autenticación.
 * Controla login, registro, logout y recuperación de contraseña.
 * Los errores de Firebase se traducen a mensajes en español.
 */
export class AuthViewModel {
  /** Usuario autenticado actualmente, o null si no hay sesión iniciada */
  usuario: Usuario | null = null;
  /** Indica si hay una operación de auth en curso (login, registro...) */
  isLoading: boolean = false;
  /** Mensaje de error a mostrar en la UI, o null si no hay */
  error: string | null = null;
  /** True cuando ya se ha enviado el correo de recuperación de contraseña */
  resetPasswordSent: boolean = false;

  /** Caso de uso para iniciar sesión */
  private _loginUseCase: ILoginUseCase;
  /** Caso de uso para registrar un nuevo usuario */
  private _registerUseCase: IRegisterUseCase;
  /** Caso de uso para cerrar la sesión */
  private _logoutUseCase: ILogoutUseCase;
  /** Caso de uso para enviar el correo de recuperación */
  private _resetPasswordUseCase: IResetPasswordUseCase;

  /**
   * Activa la reactividad de MobX y resuelve los casos de uso desde
   * el contenedor de inyección de dependencias.
   */
  constructor() {
    makeAutoObservable(this);
    this._loginUseCase = container.get<ILoginUseCase>(TYPES.ILoginUseCase);
    this._registerUseCase = container.get<IRegisterUseCase>(TYPES.IRegisterUseCase);
    this._logoutUseCase = container.get<ILogoutUseCase>(TYPES.ILogoutUseCase);
    this._resetPasswordUseCase = container.get<IResetPasswordUseCase>(TYPES.IResetPasswordUseCase);
  }

  /**
   * Inicia sesión con email y contraseña.
   * @returns true si el login fue exitoso
   */
  async login(email: string, password: string): Promise<boolean> {
    if (!email.trim() || !password.trim()) {
      runInAction(() => {
        this.error = "Rellena todos los campos";
      });
      return false;
    }

    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const usuario = await this._loginUseCase.execute(email, password);
      runInAction(() => {
        this.usuario = usuario;
        this.isLoading = false;
      });
      return true;
    } catch (e: any) {
      runInAction(() => {
        this.error = this._parseFirebaseError(e.code);
        this.isLoading = false;
      });
      return false;
    }
  }

  /**
   * Registra un nuevo usuario.
   * @returns true si el registro fue exitoso
   */
  async register(email: string, password: string, nombre: string): Promise<boolean> {
    if (!email.trim() || !password.trim() || !nombre.trim()) {
      runInAction(() => {
        this.error = "Rellena todos los campos";
      });
      return false;
    }

    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const usuario = await this._registerUseCase.execute(email, password, nombre);
      runInAction(() => {
        this.usuario = usuario;
        this.isLoading = false;
      });
      return true;
    } catch (e: any) {
      runInAction(() => {
        this.error = this._parseFirebaseError(e.code);
        this.isLoading = false;
      });
      return false;
    }
  }

  /** Cierra la sesión del usuario actual. */
  async logout(): Promise<void> {
    try {
      await this._logoutUseCase.execute();
      runInAction(() => {
        this.usuario = null;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = "Error al cerrar sesión";
      });
    }
  }

  /**
   * Envía un correo para restablecer la contraseña.
   * @returns true si el correo se envió correctamente
   */
  async resetPassword(email: string): Promise<boolean> {
    if (!email.trim()) {
      runInAction(() => {
        this.error = "Introduce tu email";
      });
      return false;
    }

    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await this._resetPasswordUseCase.execute(email);
      runInAction(() => {
        this.resetPasswordSent = true;
        this.isLoading = false;
      });
      return true;
    } catch (e: any) {
      runInAction(() => {
        this.error = this._parseFirebaseError(e.code);
        this.isLoading = false;
      });
      return false;
    }
  }

  /** Limpia el mensaje de error actual. */
  clearError(): void {
    this.error = null;
  }

  /**
   * Traduce códigos de error de Firebase Authentication a mensajes en español.
   * @param code - Código de error de Firebase (ej: "auth/invalid-email")
   * @returns Mensaje en español para mostrar al usuario
   */
  private _parseFirebaseError(code: string): string {
    switch (code) {
      case "auth/invalid-email":
        return "El email no es válido";
      case "auth/user-not-found":
        return "No existe una cuenta con este email";
      case "auth/wrong-password":
        return "La contraseña es incorrecta";
      case "auth/email-already-in-use":
        return "Ya existe una cuenta con este email";
      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres";
      case "auth/too-many-requests":
        return "Demasiados intentos. Espera un momento";
      case "auth/invalid-credential":
        return "Email o contraseña incorrectos";
      default:
        return "Ha ocurrido un error. Inténtalo de nuevo";
    }
  }
}
