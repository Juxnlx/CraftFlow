// Carpeta lógica dentro del storage (avatares, portadas de proyecto, etc.)
// Se usa un union type en lugar de strings sueltos para evitar errores de
// tipeo y obtener autocompletado en cualquier capa que invoque al repositorio.
export type CarpetaStorage = 'avatares' | 'proyectos' | 'materiales';

// Resultado de una subida: la URL pública para mostrar la imagen
// y el publicId para poder referenciarla después (p. ej. marcarla obsoleta).
export interface ResultadoSubida {
  url: string;
  publicId: string;
}

/**
 * Contrato de almacenamiento de archivos del dominio.
 *
 * El dominio no conoce el proveedor concreto (Cloudinary, Firebase Storage,
 * S3...). Define únicamente qué operaciones necesita la aplicación.
 * La implementación vive en la capa data y se inyecta vía Inversify.
 */
export interface IStorageRepository {
  /**
   * Sube una imagen local (uri del dispositivo) al almacenamiento remoto.
   *
   * @param uriLocal ruta local devuelta por expo-image-picker.
   * @param carpeta carpeta lógica donde organizar el archivo subido.
   * @returns URL pública y publicId del recurso almacenado.
   */
  subirImagen(uriLocal: string, carpeta: CarpetaStorage): Promise<ResultadoSubida>;
}
