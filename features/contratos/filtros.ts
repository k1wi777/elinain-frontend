import type {
  Contrato,
  EstadoFiltroContrato,
} from "@/features/contratos/types";

/**
 * Filtrado y paginación en el cliente del listado de contratos.
 *
 * El backend no acepta filtro por estado y la paginación del servidor haría que el total
 * y las páginas no reflejen el filtro; por eso se cargan todos los contratos y estas
 * funciones puras resuelven el subconjunto visible.
 */

/**
 * Filtra los contratos por estado; `todos` devuelve el conjunto completo.
 *
 * @param contratos Contratos cargados.
 * @param filtro Estado por el que filtrar.
 */
export function filtrarContratosPorEstado(
  contratos: Contrato[],
  filtro: EstadoFiltroContrato,
): Contrato[] {
  if (filtro === "todos") {
    return contratos;
  }

  return contratos.filter((contrato) => contrato.estado === filtro);
}

/**
 * Devuelve la página visible acotando el offset a un rango válido.
 *
 * Si el offset quedara fuera de rango (por ejemplo tras cambiar el filtro), se retrocede
 * al inicio de la última página con datos en lugar de dejar la tabla vacía.
 *
 * @param contratos Conjunto ya filtrado.
 * @param limite Cantidad de registros por página.
 * @param offset Registros omitidos solicitados.
 */
export function paginarContratos(
  contratos: Contrato[],
  limite: number,
  offset: number,
): Contrato[] {
  const tamano = Math.max(1, Math.floor(limite));
  const ultimaPagina = Math.max(
    0,
    (Math.ceil(contratos.length / tamano) - 1) * tamano,
  );
  const inicio = Math.min(Math.max(0, Math.floor(offset)), ultimaPagina);

  return contratos.slice(inicio, inicio + tamano);
}
