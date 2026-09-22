/**
 * API pública del feature `fincas`.
 *
 * Solo expone los componentes que `app/` compone en sus páginas y el tipo `Propietario`
 * que `app/` construye a partir de `features/terceros`. `api/`, `hooks/`, `schemas.ts`,
 * `mensajes-error.ts` y el resto de componentes son internos.
 */
export { FincaCrear } from "@/features/fincas/components/FincaCrear";
export { FincaEditar } from "@/features/fincas/components/FincaEditar";
export { FincasTabs } from "@/features/fincas/components/FincasTabs";
export type { Propietario } from "@/features/fincas/types";
