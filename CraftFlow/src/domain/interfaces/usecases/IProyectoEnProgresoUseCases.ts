import { ProyectoEnProgreso } from "../../entities/ProyectoEnProgreso";

export interface IIniciarProyectoUseCase {
  /**
   * Ejecuta el caso de uso para iniciar un nuevo seguimiento de proyecto.
   * Si ya existe uno activo del mismo proyecto, lo devuelve sin crear otro
   * (evita duplicados cuando el usuario vuelve a entrar al detalle).
   *
   * @param idUsuario - ID del usuario que empieza el proyecto
   * @param idProyecto - ID del proyecto original
   * @param numeroPasos - Número de pasos del proyecto (para inicializar el array)
   * @returns Promesa que resuelve al seguimiento creado o existente
   */
  execute(
    idUsuario: string,
    idProyecto: string,
    numeroPasos: number
  ): Promise<ProyectoEnProgreso>;
}

export interface IGetProyectoEnProgresoUseCase {
  /**
   * Ejecuta el caso de uso para obtener el seguimiento activo de un usuario
   * sobre un proyecto, si existe.
   *
   * @param idUsuario - ID del usuario
   * @param idProyecto - ID del proyecto
   * @returns Promesa que resuelve al seguimiento o null si no existe
   */
  execute(
    idUsuario: string,
    idProyecto: string
  ): Promise<ProyectoEnProgreso | null>;
}

export interface IActualizarProgresoUseCase {
  /**
   * Ejecuta el caso de uso para actualizar el progreso de un seguimiento.
   * Permite marcar pasos completados, añadir fotos de progreso o sumar
   * tiempo invertido.
   *
   * @param idSeguimiento - ID del seguimiento a actualizar
   * @param datos - Cambios parciales (pasos, tiempo, etc.)
   */
  execute(
    idSeguimiento: string,
    datos: Partial<ProyectoEnProgreso>
  ): Promise<void>;
}

export interface ICompletarProyectoUseCase {
  /**
   * Ejecuta el caso de uso para cerrar un seguimiento como completado.
   * Marca el estado, fija la fecha de finalización y guarda la imagen
   * del resultado y la nota opcional.
   *
   * @param idSeguimiento - ID del seguimiento a completar
   * @param imagenResultado - URL de la imagen final (puede ser null)
   * @param notaFinal - Reflexión opcional del usuario (puede ser null)
   */
  execute(
    idSeguimiento: string,
    imagenResultado: string | null,
    notaFinal: string | null
  ): Promise<void>;
}

export interface IGetProyectosCompletadosUseCase {
  /**
   * Ejecuta el caso de uso para obtener todos los proyectos que un usuario
   * ha completado. Se muestran en el perfil como historial de creaciones.
   *
   * @param idUsuario - ID del usuario
   * @returns Promesa que resuelve al array de proyectos completados
   */
  execute(idUsuario: string): Promise<ProyectoEnProgreso[]>;
}

export interface IGetMisProyectosEnProgresoUseCase {
  /**
   * Ejecuta el caso de uso para obtener todos los seguimientos del usuario
   * que están en progreso (no completados). Se usan en el Home para la
   * sección "Sigue trabajando" y en el perfil para los proyectos en proceso.
   *
   * @param idUsuario - ID del usuario
   * @returns Promesa que resuelve al array de seguimientos activos
   */
  execute(idUsuario: string): Promise<ProyectoEnProgreso[]>;
}

export interface IAbandonarProyectoUseCase {
  /**
   * Ejecuta el caso de uso para abandonar un proyecto en curso, eliminando
   * su seguimiento. No afecta al proyecto original ni al historial de
   * proyectos completados del usuario.
   *
   * @param idSeguimiento - ID del seguimiento a eliminar
   */
  execute(idSeguimiento: string): Promise<void>;
}
