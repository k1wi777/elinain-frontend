import type { FincaContrato } from "@/features/contratos/types";

/**
 * Resolución de nombres de tercero y finca a partir de sus identificadores.
 *
 * `ContratoRespuestaDto` solo devuelve `tercero_id` y `finca_id`; `app/` compone las
 * proyecciones con nombre y estas funciones puras las indexan y resuelven el nombre con
 * un texto de respaldo cuando el id no está disponible.
 */

/** Texto mostrado cuando el nombre del tercero no se puede resolver. */
export const TEXTO_TERCERO_DESCONOCIDO = "Socio no disponible";

/** Texto mostrado cuando el nombre de la finca no se puede resolver. */
export const TEXTO_FINCA_DESCONOCIDA = "Finca no disponible";

/**
 * Indexa elementos con nombre por su identificador.
 *
 * @param elementos Terceros o fincas con `id` y `nombre`.
 */
export function indexarNombres(
  elementos: { id: string; nombre: string }[],
): Map<string, string> {
  return new Map(elementos.map((elemento) => [elemento.id, elemento.nombre]));
}

/** Resuelve un nombre del índice o devuelve el texto de respaldo indicado. */
function nombreDesdeIndice(
  indice: ReadonlyMap<string, string>,
  id: string,
  textoDesconocido: string,
): string {
  const nombre = indice.get(id);

  if (nombre === undefined || nombre.trim() === "") {
    return textoDesconocido;
  }

  return nombre;
}

/**
 * Obtiene el nombre del tercero de un contrato.
 *
 * @param indice Índice construido con {@link indexarNombres}.
 * @param terceroId Identificador del tercero.
 */
export function nombreDeTercero(
  indice: ReadonlyMap<string, string>,
  terceroId: string,
): string {
  return nombreDesdeIndice(indice, terceroId, TEXTO_TERCERO_DESCONOCIDO);
}

/**
 * Obtiene el nombre de la finca de un contrato.
 *
 * @param indice Índice construido con {@link indexarNombres}.
 * @param fincaId Identificador de la finca.
 */
export function nombreDeFinca(
  indice: ReadonlyMap<string, string>,
  fincaId: string,
): string {
  return nombreDesdeIndice(indice, fincaId, TEXTO_FINCA_DESCONOCIDA);
}

/**
 * Devuelve las fincas asociadas a un tercero para el selector filtrado.
 *
 * @param fincas Fincas disponibles, cada una con su `tercero_id`.
 * @param terceroId Identificador del tercero elegido.
 */
export function fincasDeTercero(
  fincas: FincaContrato[],
  terceroId: string,
): FincaContrato[] {
  if (terceroId === "") {
    return [];
  }

  return fincas.filter((finca) => finca.tercero_id === terceroId);
}
