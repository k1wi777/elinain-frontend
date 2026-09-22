/**
 * API pública del feature `contratos`.
 *
 * Expone los componentes que `app/` compone en sus páginas y los tipos de las
 * proyecciones que `app/` construye a partir de terceros y fincas. `api/`, `hooks/`,
 * `schemas.ts`, las utilidades y el resto de componentes son internos.
 */
export { ContratoCrear } from "@/features/contratos/components/ContratoCrear";
export { ContratoDetalle } from "@/features/contratos/components/ContratoDetalle";
export { ContratoEditar } from "@/features/contratos/components/ContratoEditar";
export { ContratosListado } from "@/features/contratos/components/ContratosListado";
export type {
  FincaContrato,
  TerceroContrato,
} from "@/features/contratos/types";
