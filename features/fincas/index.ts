/**
 * API pública del feature `fincas`.
 *
 * Expone los componentes que `app/` compone en sus páginas, el hook de todas las fincas y
 * el tipo `Finca` que `app/` usa para resolver el nombre de la finca de un contrato y
 * filtrar el selector por tercero, además del tipo `Propietario` que `app/` construye a
 * partir de `features/terceros`. `api/`, `schemas.ts`, `mensajes-error.ts` y el resto de
 * componentes y hooks son internos.
 */
export { FincaCrear } from "@/features/fincas/components/FincaCrear";
export { FincaEditar } from "@/features/fincas/components/FincaEditar";
export { FincasTabs } from "@/features/fincas/components/FincasTabs";
export { useTodasLasFincas } from "@/features/fincas/hooks/useTodasLasFincas";
export type { Finca, Propietario } from "@/features/fincas/types";
