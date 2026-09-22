/**
 * API pública del feature `terceros`.
 *
 * Expone el componente que `app/` compone en la página del listado y el hook y el tipo
 * que `app/` necesita para resolver los propietarios de fincas. El resto es interno.
 */
export { TercerosTable } from "@/features/terceros/components/TercerosTable";
export { useTodosLosTerceros } from "@/features/terceros/hooks/useTodosLosTerceros";
export type { Tercero } from "@/features/terceros/types";
