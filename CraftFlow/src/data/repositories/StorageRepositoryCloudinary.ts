import { Platform } from 'react-native';
import { injectable } from 'inversify';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_FOLDER,
} from '@env';
import {
  IStorageRepository,
  CarpetaStorage,
  ResultadoSubida,
} from '../../domain/interfaces/repositories/IStorageRepository';

// Endpoint estándar de subida de imágenes de Cloudinary.
// La API key y el secret no son necesarios porque se usa un Upload Preset
// configurado en modo "Unsigned" desde el panel de Cloudinary.
const URL_SUBIDA = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Implementación del repositorio de almacenamiento usando Cloudinary.
 *
 * Es la única clase que conoce el proveedor concreto: el resto de la
 * aplicación depende únicamente de IStorageRepository, siguiendo el
 * principio de inversión de dependencias.
 */
@injectable()
export class StorageRepositoryCloudinary implements IStorageRepository {
  /**
   * Sube una imagen local al Cloudinary configurado y devuelve la URL
   * pública junto con el publicId del recurso.
   */
  async subirImagen(
    uriLocal: string,
    carpeta: CarpetaStorage,
  ): Promise<ResultadoSubida> {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // En web, la URI es un blob:// o data://. Hay que convertirla a un
      // Blob real para que FormData la acepte como archivo.
      const respuestaBlob = await fetch(uriLocal);
      const blob = await respuestaBlob.blob();
      formData.append('file', blob, `upload_${Date.now()}.jpg`);
    } else {
      // En React Native nativo (Android/iOS), FormData acepta objetos
      // { uri, type, name } directamente sin necesidad de leer el archivo.
      formData.append('file', {
        uri: uriLocal,
        type: 'image/jpeg',
        name: `upload_${Date.now()}.jpg`,
      } as any);
    }

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `${CLOUDINARY_FOLDER}/${carpeta}`);

    const respuesta = await fetch(URL_SUBIDA, {
      method: 'POST',
      body: formData,
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      throw new Error(`Error al subir imagen a Cloudinary: ${detalle}`);
    }

    const datos = await respuesta.json();
    return {
      url: datos.secure_url as string,
      publicId: datos.public_id as string,
    };
  }
}
