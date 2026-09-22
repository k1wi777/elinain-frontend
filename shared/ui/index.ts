/**
 * API pública del sistema de diseño base.
 *
 * Re-exporta los componentes presentacionales de `shared/ui`. `TablePagination` es
 * interno y no se exporta; de él solo se publica su tipo `PaginacionTabla`.
 */
export { Button } from "@/shared/ui/Button";
export { Input } from "@/shared/ui/Input";
export { Modal } from "@/shared/ui/Modal";
export { Select } from "@/shared/ui/Select";
export { Table, type ColumnaTabla } from "@/shared/ui/Table";
export type { PaginacionTabla } from "@/shared/ui/TablePagination";
export { Toast } from "@/shared/ui/Toast";
