import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../../../core/types";
import { IUploadImageUseCase } from "../../interfaces/usecases/IStorageUseCases";
import {
  IStorageRepository,
  CarpetaStorage,
  ResultadoSubida,
} from "../../interfaces/repositories/IStorageRepository";

@injectable()
export class UploadImageUseCase implements IUploadImageUseCase {
  private _storageRepository: IStorageRepository;

  /**
   * @param storageRepository - Repositorio de almacenamiento inyectado
   */
  constructor(
    @inject(TYPES.IStorageRepository) storageRepository: IStorageRepository
  ) {
    this._storageRepository = storageRepository;
  }

  /**
   * Delega la subida de la imagen al repositorio de almacenamiento.
   * La capa de use case se mantiene fina a propósito: permite añadir en el
   * futuro validaciones (tamaño máximo, compresión, logging) sin tocar ni el
   * repositorio ni el viewmodel que lo invoca.
   */
  async execute(
    uriLocal: string,
    carpeta: CarpetaStorage
  ): Promise<ResultadoSubida> {
    return this._storageRepository.subirImagen(uriLocal, carpeta);
  }
}
