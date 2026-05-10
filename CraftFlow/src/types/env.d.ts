/**
 * Declaración de tipos para el módulo virtual "@env".
 *
 * react-native-dotenv inyecta las variables del archivo .env como un módulo
 * llamado "@env" en tiempo de compilación. TypeScript no conoce ese módulo
 * por defecto, así que aquí se declara manualmente para obtener tipado y
 * autocompletado en toda la app.
 *
 * Al añadir nuevas variables al .env, también deben declararse aquí.
 */
declare module '@env' {
  export const CLOUDINARY_CLOUD_NAME: string;
  export const CLOUDINARY_UPLOAD_PRESET: string;
  export const CLOUDINARY_FOLDER: string;
}
