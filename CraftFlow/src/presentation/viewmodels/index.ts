import { AuthViewModel } from "./AuthViewModel";
import { MaterialViewModel } from "./MaterialViewModel";
import { HerramientaViewModel } from "./HerramientaViewModel";
import { ProyectoViewModel } from "./ProyectoViewModel";
import { FavoritoViewModel } from "./FavoritoViewModel";
import { RecomendacionViewModel } from "./RecomendacionViewModel";
import { UsuarioViewModel } from "./UsuarioViewModel";
import { ListaCompraViewModel } from "./ListaCompraViewModel";
import { ProyectoEnProgresoViewModel } from "./ProyectoEnProgresoViewModel";

/**
 * Instancias globales de los ViewModels compartidas entre pantallas.
 * Al ser instancias únicas, el estado se mantiene sincronizado
 * entre todas las pantallas que usen el mismo ViewModel.
 */
export const authVM = new AuthViewModel();
export const materialVM = new MaterialViewModel();
export const herramientaVM = new HerramientaViewModel();
export const proyectoVM = new ProyectoViewModel();
export const favoritoVM = new FavoritoViewModel();
export const recomendacionVM = new RecomendacionViewModel();
export const usuarioVM = new UsuarioViewModel();
export const listaCompraVM = new ListaCompraViewModel();
export const proyectoEnProgresoVM = new ProyectoEnProgresoViewModel();
