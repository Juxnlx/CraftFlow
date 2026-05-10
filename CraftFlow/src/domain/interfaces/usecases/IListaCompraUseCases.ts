import { ItemCompra } from "../../entities/ItemCompra";

export interface IGetListaCompraUseCase {
  /**
   * Ejecuta el caso de uso para generar la lista de la compra del usuario.
   * Analiza los proyectos guardados como favoritos y devuelve todos los
   * materiales y herramientas que le faltan para hacerlos, agrupados y
   * con sugerencias de URL cuando es posible.
   *
   * @param idUsuario - ID del usuario para el que se genera la lista
   * @returns Promesa que resuelve a un array de ítems que faltan por comprar
   */
  execute(idUsuario: string): Promise<ItemCompra[]>;
}
