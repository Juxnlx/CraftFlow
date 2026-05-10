import { makeAutoObservable, runInAction } from "mobx";
import { container } from "../../core/container";
import { TYPES } from "../../core/types";
import {
  IGetUsuarioPorIdUseCase,
  IUpdateUsuarioUseCase,
} from "../../domain/interfaces/usecases/IUsuarioUseCases";
import { IUploadImageUseCase } from "../../domain/interfaces/usecases/IStorageUseCases";
import { Usuario } from "../../domain/entities/Usuario";

/**
 * ViewModel que gestiona el perfil del usuario actual.
 * Centraliza la carga del perfil, la edición de datos y la subida de avatar.
 */
export class UsuarioViewModel {
  usuarioActual: Usuario | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;
  mensajeError: string | null = null;

  private _getUsuarioPorIdUseCase: IGetUsuarioPorIdUseCase;
  private _updateUsuarioUseCase: IUpdateUsuarioUseCase;
  private _uploadImageUseCase: IUploadImageUseCase;

  constructor() {
    makeAutoObservable(this);
    this._getUsuarioPorIdUseCase = container.get<IGetUsuarioPorIdUseCase>(
      TYPES.IGetUsuarioPorIdUseCase
    );
    this._updateUsuarioUseCase = container.get<IUpdateUsuarioUseCase>(
      TYPES.IUpdateUsuarioUseCase
    );
    this._uploadImageUseCase = container.get<IUploadImageUseCase>(
      TYPES.IUploadImageUseCase
    );
  }

  /** Carga el perfil del usuario desde Firestore. */
  async cargarUsuario(idUsuario: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.mensajeError = null;
    });

    try {
      const usuario = await this._getUsuarioPorIdUseCase.execute(idUsuario);
      runInAction(() => {
        this.usuarioActual = usuario;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.mensajeError =
          error instanceof Error ? error.message : "Error al cargar perfil";
        this.isLoading = false;
      });
    }
  }

  /**
   * Actualiza los campos editables del perfil.
   * Tras guardar, refresca el usuarioActual con los nuevos datos.
   */
  async actualizarPerfil(
    idUsuario: string,
    datos: { nombre?: string; intereses?: string[]; fotoPerfil?: string | null }
  ): Promise<boolean> {
    runInAction(() => {
      this.isSaving = true;
      this.mensajeError = null;
    });

    try {
      await this._updateUsuarioUseCase.execute(
        idUsuario,
        datos as Partial<Usuario>
      );
      // Recarga el perfil completo para sincronizar el estado local
      await this.cargarUsuario(idUsuario);
      runInAction(() => {
        this.isSaving = false;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.mensajeError =
          error instanceof Error ? error.message : "Error al guardar perfil";
        this.isSaving = false;
      });
      return false;
    }
  }

  /**
   * Sube una nueva imagen de avatar y la asocia al usuario.
   * Flujo: subir a Cloudinary → actualizar campo fotoPerfil en Firestore.
   * @returns URL pública del nuevo avatar, o null si falló
   */
  async cambiarAvatar(
    idUsuario: string,
    uriLocal: string
  ): Promise<string | null> {
    runInAction(() => {
      this.isSaving = true;
      this.mensajeError = null;
    });

    try {
      // Paso 1: subir la imagen a Cloudinary (carpeta "avatares")
      const { url } = await this._uploadImageUseCase.execute(
        uriLocal,
        "avatares"
      );

      // Paso 2: guardar la URL pública en Firestore
      await this._updateUsuarioUseCase.execute(idUsuario, {
        fotoPerfil: url,
      } as Partial<Usuario>);

      // Paso 3: refrescar el usuario local con la nueva foto
      await this.cargarUsuario(idUsuario);

      runInAction(() => {
        this.isSaving = false;
      });
      return url;
    } catch (error) {
      runInAction(() => {
        this.mensajeError =
          error instanceof Error ? error.message : "Error al subir avatar";
        this.isSaving = false;
      });
      return null;
    }
  }
}
