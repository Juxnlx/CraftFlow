/**
 * Símbolos de Inversify para inyección de dependencias.
 *
 * Cada símbolo actúa como identificador único para que el contenedor
 * de Inversify sepa qué implementación concreta inyectar cuando un
 * use case o ViewModel solicita una interfaz.
 *
 * @example
 * // En un use case:
 * constructor(@inject(TYPES.IAuthRepository) authRepo: IAuthRepository)
 *
 * // En el contenedor (container.ts):
 * container.bind<IAuthRepository>(TYPES.IAuthRepository).to(AuthRepositoryFirebase)
 */
export const TYPES = {
  // Repositories
  IAuthRepository: Symbol.for("IAuthRepository"),
  IMaterialRepository: Symbol.for("IMaterialRepository"),
  IHerramientaRepository: Symbol.for("IHerramientaRepository"),
  IProyectoRepository: Symbol.for("IProyectoRepository"),
  IFavoritoRepository: Symbol.for("IFavoritoRepository"),
  IUsuarioRepository: Symbol.for("IUsuarioRepository"),
  IStorageRepository: Symbol.for("IStorageRepository"),
  IProyectoEnProgresoRepository: Symbol.for("IProyectoEnProgresoRepository"),

  // Use Cases - Auth
  ILoginUseCase: Symbol.for("ILoginUseCase"),
  IRegisterUseCase: Symbol.for("IRegisterUseCase"),
  ILogoutUseCase: Symbol.for("ILogoutUseCase"),
  IResetPasswordUseCase: Symbol.for("IResetPasswordUseCase"),

  // Use Cases - Material
  IGetMaterialesUseCase: Symbol.for("IGetMaterialesUseCase"),
  ICreateMaterialUseCase: Symbol.for("ICreateMaterialUseCase"),
  IUpdateMaterialUseCase: Symbol.for("IUpdateMaterialUseCase"),
  IDeleteMaterialUseCase: Symbol.for("IDeleteMaterialUseCase"),

  // Use Cases - Herramienta
  IGetHerramientasUseCase: Symbol.for("IGetHerramientasUseCase"),
  ICreateHerramientaUseCase: Symbol.for("ICreateHerramientaUseCase"),
  IUpdateHerramientaUseCase: Symbol.for("IUpdateHerramientaUseCase"),
  IDeleteHerramientaUseCase: Symbol.for("IDeleteHerramientaUseCase"),

  // Use Cases - Proyecto
  IGetProyectosPublicosUseCase: Symbol.for("IGetProyectosPublicosUseCase"),
  IGetMisProyectosUseCase: Symbol.for("IGetMisProyectosUseCase"),
  IGetProyectoByIdUseCase: Symbol.for("IGetProyectoByIdUseCase"),
  ICreateProyectoUseCase: Symbol.for("ICreateProyectoUseCase"),
  IUpdateProyectoUseCase: Symbol.for("IUpdateProyectoUseCase"),
  IDeleteProyectoUseCase: Symbol.for("IDeleteProyectoUseCase"),

  // Use Cases - Favorito
  IGetFavoritosUseCase: Symbol.for("IGetFavoritosUseCase"),
  IToggleFavoritoUseCase: Symbol.for("IToggleFavoritoUseCase"),

  // Use Cases - Recomendacion
  IGetRecomendacionesUseCase: Symbol.for("IGetRecomendacionesUseCase"),

  // Use Cases - Storage
  IUploadImageUseCase: Symbol.for("IUploadImageUseCase"),

  // Use Cases - Usuario
  IGetUsuarioPorIdUseCase: Symbol.for("IGetUsuarioPorIdUseCase"),
  IUpdateUsuarioUseCase: Symbol.for("IUpdateUsuarioUseCase"),

  // Use Cases - Lista de compra
  IGetListaCompraUseCase: Symbol.for("IGetListaCompraUseCase"),

  // Use Cases - Proyecto en progreso
  IIniciarProyectoUseCase: Symbol.for("IIniciarProyectoUseCase"),
  IGetProyectoEnProgresoUseCase: Symbol.for("IGetProyectoEnProgresoUseCase"),
  IActualizarProgresoUseCase: Symbol.for("IActualizarProgresoUseCase"),
  ICompletarProyectoUseCase: Symbol.for("ICompletarProyectoUseCase"),
  IGetProyectosCompletadosUseCase: Symbol.for("IGetProyectosCompletadosUseCase"),
  IGetMisProyectosEnProgresoUseCase: Symbol.for("IGetMisProyectosEnProgresoUseCase"),
  IAbandonarProyectoUseCase: Symbol.for("IAbandonarProyectoUseCase"),
};
