/**
 * API pública del feature `ventas`.
 *
 * Expone los dos contenedores que `app/` compone —la sección embebida en el detalle del
 * contrato y el listado global— y el tipo de la proyección `ContratoVenta` que `app/`
 * construye para el selector. `api/`, `hooks/`, `schemas.ts`, `formatos.ts`,
 * `mensajes-error.ts` y el resto de componentes son internos.
 */
export { VentasListado } from "@/features/ventas/components/VentasListado";
export { VentasSeccion } from "@/features/ventas/components/VentasSeccion";
export type { ContratoVenta } from "@/features/ventas/types";
