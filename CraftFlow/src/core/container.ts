import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";

// Interfaces de repositorios
import { IAuthRepository } from "../domain/interfaces/repositories/IAuthRepository";
import { IMaterialRepository } from "../domain/interfaces/repositories/IMaterialRepository";
import { IHerramientaRepository } from "../domain/interfaces/repositories/IHerramientaRepository";
import { IProyectoRepository } from "../domain/interfaces/repositories/IProyectoRepository";
import { IFavoritoRepository } from "../domain/interfaces/repositories/IFavoritoRepository";
import { IUsuarioRepository } from "../domain/interfaces/repositories/IUsuarioRepository";
import { IStorageRepository } from "../domain/interfaces/repositories/IStorageRepository";
import { IProyectoEnProgresoRepository } from "../domain/interfaces/repositories/IProyectoEnProgresoRepository";

// Implementaciones de repositorios (Firebase)
import { AuthRepositoryFirebase } from "../data/repositories/AuthRepositoryFirebase";
import { MaterialRepositoryFirebase } from "../data/repositories/MaterialRepositoryFirebase";
import { HerramientaRepositoryFirebase } from "../data/repositories/HerramientaRepositoryFirebase";
import { ProyectoRepositoryFirebase } from "../data/repositories/ProyectoRepositoryFirebase";
import { FavoritoRepositoryFirebase } from "../data/repositories/FavoritoRepositoryFirebase";
import { UsuarioRepositoryFirebase } from "../data/repositories/UsuarioRepositoryFirebase";

// Implementaciones de repositorios (Cloudinary)
import { StorageRepositoryCloudinary } from "../data/repositories/StorageRepositoryCloudinary";

// Implementaciones de repositorios - Proyecto en progreso
import { ProyectoEnProgresoRepositoryFirebase } from "../data/repositories/ProyectoEnProgresoRepositoryFirebase";

// Interfaces de use cases
import { ILoginUseCase, IRegisterUseCase, ILogoutUseCase, IResetPasswordUseCase } from "../domain/interfaces/usecases/IAuthUseCases";
import { IGetMaterialesUseCase, ICreateMaterialUseCase, IUpdateMaterialUseCase, IDeleteMaterialUseCase } from "../domain/interfaces/usecases/IMaterialUseCases";
import { IGetHerramientasUseCase, ICreateHerramientaUseCase, IUpdateHerramientaUseCase, IDeleteHerramientaUseCase } from "../domain/interfaces/usecases/IHerramientaUseCases";
import { IGetProyectosPublicosUseCase, IGetMisProyectosUseCase, IGetProyectoByIdUseCase, ICreateProyectoUseCase, IUpdateProyectoUseCase, IDeleteProyectoUseCase } from "../domain/interfaces/usecases/IProyectoUseCases";
import { IGetFavoritosUseCase, IToggleFavoritoUseCase } from "../domain/interfaces/usecases/IFavoritoUseCases";
import { IGetRecomendacionesUseCase } from "../domain/interfaces/usecases/IRecomendacionUseCases";
import { IUploadImageUseCase } from "../domain/interfaces/usecases/IStorageUseCases";
import { IGetUsuarioPorIdUseCase, IUpdateUsuarioUseCase } from "../domain/interfaces/usecases/IUsuarioUseCases";
import { IGetListaCompraUseCase } from "../domain/interfaces/usecases/IListaCompraUseCases";
import {
  IIniciarProyectoUseCase,
  IGetProyectoEnProgresoUseCase,
  IActualizarProgresoUseCase,
  ICompletarProyectoUseCase,
  IGetProyectosCompletadosUseCase,
  IGetMisProyectosEnProgresoUseCase,
  IAbandonarProyectoUseCase,
} from "../domain/interfaces/usecases/IProyectoEnProgresoUseCases";

// Implementaciones de use cases - Auth
import { LoginUseCase } from "../domain/usecases/auth/LoginUseCase";
import { RegisterUseCase } from "../domain/usecases/auth/RegisterUseCase";
import { LogoutUseCase } from "../domain/usecases/auth/LogoutUseCase";
import { ResetPasswordUseCase } from "../domain/usecases/auth/ResetPasswordUseCase";

// Implementaciones de use cases - Material
import { GetMaterialesUseCase } from "../domain/usecases/material/GetMaterialesUseCase";
import { CreateMaterialUseCase } from "../domain/usecases/material/CreateMaterialUseCase";
import { UpdateMaterialUseCase } from "../domain/usecases/material/UpdateMaterialUseCase";
import { DeleteMaterialUseCase } from "../domain/usecases/material/DeleteMaterialUseCase";

// Implementaciones de use cases - Herramienta
import { GetHerramientasUseCase } from "../domain/usecases/herramienta/GetHerramientasUseCase";
import { CreateHerramientaUseCase } from "../domain/usecases/herramienta/CreateHerramientaUseCase";
import { UpdateHerramientaUseCase } from "../domain/usecases/herramienta/UpdateHerramientaUseCase";
import { DeleteHerramientaUseCase } from "../domain/usecases/herramienta/DeleteHerramientaUseCase";

// Implementaciones de use cases - Proyecto
import { GetProyectosPublicosUseCase } from "../domain/usecases/proyecto/GetProyectosPublicosUseCase";
import { GetMisProyectosUseCase } from "../domain/usecases/proyecto/GetMisProyectosUseCase";
import { GetProyectoByIdUseCase } from "../domain/usecases/proyecto/GetProyectoByIdUseCase";
import { CreateProyectoUseCase } from "../domain/usecases/proyecto/CreateProyectoUseCase";
import { UpdateProyectoUseCase } from "../domain/usecases/proyecto/UpdateProyectoUseCase";
import { DeleteProyectoUseCase } from "../domain/usecases/proyecto/DeleteProyectoUseCase";

// Implementaciones de use cases - Favorito
import { GetFavoritosUseCase } from "../domain/usecases/favorito/GetFavoritosUseCase";
import { ToggleFavoritoUseCase } from "../domain/usecases/favorito/ToggleFavoritoUseCase";

// Implementaciones de use cases - Recomendacion
import { GetRecomendacionesUseCase } from "../domain/usecases/recomendacion/GetRecomendacionesUseCase";

// Implementaciones de use cases - Storage
import { UploadImageUseCase } from "../domain/usecases/storage/UploadImageUseCase";

// Implementaciones de use cases - Usuario
import { GetUsuarioPorIdUseCase } from "../domain/usecases/usuario/GetUsuarioPorIdUseCase";
import { UpdateUsuarioUseCase } from "../domain/usecases/usuario/UpdateUsuarioUseCase";

// Implementaciones de use cases - Lista de compra
import { GetListaCompraUseCase } from "../domain/usecases/listacompra/GetListaCompraUseCase";

// Implementaciones de use cases - Proyecto en progreso
import { IniciarProyectoUseCase } from "../domain/usecases/proyectoenprogreso/IniciarProyectoUseCase";
import { GetProyectoEnProgresoUseCase } from "../domain/usecases/proyectoenprogreso/GetProyectoEnProgresoUseCase";
import { ActualizarProgresoUseCase } from "../domain/usecases/proyectoenprogreso/ActualizarProgresoUseCase";
import { CompletarProyectoUseCase } from "../domain/usecases/proyectoenprogreso/CompletarProyectoUseCase";
import { GetProyectosCompletadosUseCase } from "../domain/usecases/proyectoenprogreso/GetProyectosCompletadosUseCase";
import { GetMisProyectosEnProgresoUseCase } from "../domain/usecases/proyectoenprogreso/GetMisProyectosEnProgresoUseCase";
import { AbandonarProyectoUseCase } from "../domain/usecases/proyectoenprogreso/AbandonarProyectoUseCase";

/**
 * Contenedor de inyección de dependencias de Inversify.
 */
const container = new Container();

// Repositories
container.bind<IAuthRepository>(TYPES.IAuthRepository).to(AuthRepositoryFirebase);
container.bind<IMaterialRepository>(TYPES.IMaterialRepository).to(MaterialRepositoryFirebase);
container.bind<IHerramientaRepository>(TYPES.IHerramientaRepository).to(HerramientaRepositoryFirebase);
container.bind<IProyectoRepository>(TYPES.IProyectoRepository).to(ProyectoRepositoryFirebase);
container.bind<IFavoritoRepository>(TYPES.IFavoritoRepository).to(FavoritoRepositoryFirebase);
container.bind<IUsuarioRepository>(TYPES.IUsuarioRepository).to(UsuarioRepositoryFirebase);
container.bind<IStorageRepository>(TYPES.IStorageRepository).to(StorageRepositoryCloudinary);
container.bind<IProyectoEnProgresoRepository>(TYPES.IProyectoEnProgresoRepository).to(ProyectoEnProgresoRepositoryFirebase);

// Use Cases - Auth
container.bind<ILoginUseCase>(TYPES.ILoginUseCase).to(LoginUseCase);
container.bind<IRegisterUseCase>(TYPES.IRegisterUseCase).to(RegisterUseCase);
container.bind<ILogoutUseCase>(TYPES.ILogoutUseCase).to(LogoutUseCase);
container.bind<IResetPasswordUseCase>(TYPES.IResetPasswordUseCase).to(ResetPasswordUseCase);

// Use Cases - Material
container.bind<IGetMaterialesUseCase>(TYPES.IGetMaterialesUseCase).to(GetMaterialesUseCase);
container.bind<ICreateMaterialUseCase>(TYPES.ICreateMaterialUseCase).to(CreateMaterialUseCase);
container.bind<IUpdateMaterialUseCase>(TYPES.IUpdateMaterialUseCase).to(UpdateMaterialUseCase);
container.bind<IDeleteMaterialUseCase>(TYPES.IDeleteMaterialUseCase).to(DeleteMaterialUseCase);

// Use Cases - Herramienta
container.bind<IGetHerramientasUseCase>(TYPES.IGetHerramientasUseCase).to(GetHerramientasUseCase);
container.bind<ICreateHerramientaUseCase>(TYPES.ICreateHerramientaUseCase).to(CreateHerramientaUseCase);
container.bind<IUpdateHerramientaUseCase>(TYPES.IUpdateHerramientaUseCase).to(UpdateHerramientaUseCase);
container.bind<IDeleteHerramientaUseCase>(TYPES.IDeleteHerramientaUseCase).to(DeleteHerramientaUseCase);

// Use Cases - Proyecto
container.bind<IGetProyectosPublicosUseCase>(TYPES.IGetProyectosPublicosUseCase).to(GetProyectosPublicosUseCase);
container.bind<IGetMisProyectosUseCase>(TYPES.IGetMisProyectosUseCase).to(GetMisProyectosUseCase);
container.bind<IGetProyectoByIdUseCase>(TYPES.IGetProyectoByIdUseCase).to(GetProyectoByIdUseCase);
container.bind<ICreateProyectoUseCase>(TYPES.ICreateProyectoUseCase).to(CreateProyectoUseCase);
container.bind<IUpdateProyectoUseCase>(TYPES.IUpdateProyectoUseCase).to(UpdateProyectoUseCase);
container.bind<IDeleteProyectoUseCase>(TYPES.IDeleteProyectoUseCase).to(DeleteProyectoUseCase);

// Use Cases - Favorito
container.bind<IGetFavoritosUseCase>(TYPES.IGetFavoritosUseCase).to(GetFavoritosUseCase);
container.bind<IToggleFavoritoUseCase>(TYPES.IToggleFavoritoUseCase).to(ToggleFavoritoUseCase);

// Use Cases - Recomendacion
container.bind<IGetRecomendacionesUseCase>(TYPES.IGetRecomendacionesUseCase).to(GetRecomendacionesUseCase);

// Use Cases - Storage
container.bind<IUploadImageUseCase>(TYPES.IUploadImageUseCase).to(UploadImageUseCase);

// Use Cases - Usuario
container.bind<IGetUsuarioPorIdUseCase>(TYPES.IGetUsuarioPorIdUseCase).to(GetUsuarioPorIdUseCase);
container.bind<IUpdateUsuarioUseCase>(TYPES.IUpdateUsuarioUseCase).to(UpdateUsuarioUseCase);

// Use Cases - Lista de compra
container.bind<IGetListaCompraUseCase>(TYPES.IGetListaCompraUseCase).to(GetListaCompraUseCase);

// Use Cases - Proyecto en progreso
container.bind<IIniciarProyectoUseCase>(TYPES.IIniciarProyectoUseCase).to(IniciarProyectoUseCase);
container.bind<IGetProyectoEnProgresoUseCase>(TYPES.IGetProyectoEnProgresoUseCase).to(GetProyectoEnProgresoUseCase);
container.bind<IActualizarProgresoUseCase>(TYPES.IActualizarProgresoUseCase).to(ActualizarProgresoUseCase);
container.bind<ICompletarProyectoUseCase>(TYPES.ICompletarProyectoUseCase).to(CompletarProyectoUseCase);
container.bind<IGetProyectosCompletadosUseCase>(TYPES.IGetProyectosCompletadosUseCase).to(GetProyectosCompletadosUseCase);
container.bind<IGetMisProyectosEnProgresoUseCase>(TYPES.IGetMisProyectosEnProgresoUseCase).to(GetMisProyectosEnProgresoUseCase);
container.bind<IAbandonarProyectoUseCase>(TYPES.IAbandonarProyectoUseCase).to(AbandonarProyectoUseCase);

export { container };
