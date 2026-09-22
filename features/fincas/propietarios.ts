import type { Propietario } from "@/features/fincas/types";

/**
 * Resolución del nombre del propietario de una finca a partir de `tercero_id`.
 *
 * El backend no devuelve el nombre del propietario en `FincaRespuestaDto`; `app/` carga
 * los terceros y los pasa a `features/fincas` como `Propietario[]`, donde estas funciones
 * puras los indexan y resuelven el nombre con un texto de respaldo.
 */

/** Texto mostrado cuando el nombre del propietario no se puede resolver. */
export const TEXTO_PROPIETARIO_DESCONOCIDO = "Propietario no disponible";

/**
 * Indexa los propietarios por su identificador.
 *
 * @param propietarios Lista de propietarios recibida desde `app/`.
 */
export function indexarPropietarios(
  propietarios: Propietario[],
): Map<string, string> {
  return new Map(propietarios.map((p) => [p.id, p.nombre]));
}

/**
 * Obtiene el nombre del propietario de una finca.
 *
 * Devuelve {@link TEXTO_PROPIETARIO_DESCONOCIDO} cuando el `tercero_id` no está en el
 * índice o su nombre está vacío, en lugar de mostrar un valor vacío.
 *
 * @param propietariosPorId Índice construido con {@link indexarPropietarios}.
 * @param terceroId Identificador del tercero propietario.
 */
export function nombreDePropietario(
  propietariosPorId: ReadonlyMap<string, string>,
  terceroId: string,
): string {
  const nombre = propietariosPorId.get(terceroId);

  if (nombre === undefined || nombre.trim() === "") {
    return TEXTO_PROPIETARIO_DESCONOCIDO;
  }

  return nombre;
}
