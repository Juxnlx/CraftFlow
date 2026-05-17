import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IUploadImageUseCase } from "../../interfaces/usecases/IStorageUseCases";
import {
  IStorageRepository,
  CarpetaStorage,
  ResultadoSubida,
} from "../../interfaces/repositories/IStorageRepository";

/**
 * Caso de uso para subir una imagen al almacenamiento remoto.
 *
 * Se mantiene como fachada fina sobre el repositorio para poder añadir
 * en el futuro validaciones (tamaño máximo, compresión, etc.) sin
 * tocar ni la implementación de almacenamiento ni el ViewModel.
 */
@injectable()
export class UploadImageUseCase implements IUploadImageUseCase {
  private _storageRepository: IStorageRepository;

  constructor(
    @inject(TYPES.IStorageRepository) storageRepository: IStorageRepository
  ) {
    this._storageRepository = storageRepository;
  }

  /**
   * Sube una imagen local al almacenamiento remoto.
   * @returns URL pública y publicId del recurso almacenado
   */
  async execute(
    uriLocal: string,
    carpeta: CarpetaStorage
  ): Promise<ResultadoSubida> {
    return this._storageRepository.subirImagen(uriLocal, carpeta);
  }
}
