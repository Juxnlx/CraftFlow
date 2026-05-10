import {
  CarpetaStorage,
  ResultadoSubida,
} from '../repositories/IStorageRepository';

export interface IUploadImageUseCase {
  /**
   * Ejecuta el caso de uso para subir una imagen al almacenamiento remoto.
   * @param uriLocal - URI local de la imagen (devuelta por expo-image-picker)
   * @param carpeta - Carpeta lógica donde organizar el archivo
   * @returns Promesa que resuelve a la URL pública y el publicId del recurso
   */
  execute(uriLocal: string, carpeta: CarpetaStorage): Promise<ResultadoSubida>;
}
