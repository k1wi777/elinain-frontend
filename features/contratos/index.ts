/**
 * API pública del feature `contratos`.
 *
 * Expone los componentes que `app/` compone en sus páginas, el hook `useContratos` con el
 * que `app/` construye selectores de contrato y los tipos de las proyecciones que `app/`
 * construye a partir de terceros y fincas. `api/`, `schemas.ts`, las utilidades y el resto
 * de componentes y hooks son internos.
 */
export { ContratoCrear } from "@/features/contratos/components/ContratoCrear";
export { ContratoDetalle } from "@/features/contratos/components/ContratoDetalle";
export { ContratoEditar } from "@/features/contratos/components/ContratoEditar";
export { ContratosListado } from "@/features/contratos/components/ContratosListado";
export { useContratos } from "@/features/contratos/hooks/useContratos";
export { clavesContratos } from "@/features/contratos/query-keys";
export type {
  Contrato,
  FincaContrato,
  TerceroContrato,
} from "@/features/contratos/types";
