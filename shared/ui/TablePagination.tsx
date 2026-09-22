import { Button } from "@/shared/ui/Button";

/**
 * Datos de paginación que la tabla necesita para renderizar sus controles.
 *
 * El tipo es estructural: comparte los nombres de campo de `EstadoPaginacion` del hook,
 * de modo que el resultado de `usePagination` sea asignable directamente sin que
 * `shared/ui` dependa de `shared/api`.
 */
export type PaginacionTabla = {
  /** Página actual (base 1). */
  paginaActual: number;
  /** Total de páginas disponibles. */
  totalPaginas: number;
  /** Total de registros. */
  total: number;
  /** Cantidad de registros por página. */
  limite: number;
  /** Indica si existe una página anterior. */
  hayPaginaAnterior: boolean;
  /** Indica si existe una página siguiente. */
  hayPaginaSiguiente: boolean;
  /** Navega a la página anterior. */
  irAPaginaAnterior: () => void;
  /** Navega a la página siguiente. */
  irAPaginaSiguiente: () => void;
  /** Navega a una página concreta. */
  irAPagina?: (pagina: number) => void;
};

/**
 * Controles de navegación entre páginas de la `Table`.
 *
 * Es interno de `shared/ui` y no se exporta en el barrel del sistema de diseño.
 */
export function TablePagination({
  paginaActual,
  totalPaginas,
  hayPaginaAnterior,
  hayPaginaSiguiente,
  irAPaginaAnterior,
  irAPaginaSiguiente,
}: PaginacionTabla) {
  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-between gap-4 border-t border-zinc-200 px-4 py-3"
    >
      <Button
        variante="secundario"
        onClick={irAPaginaAnterior}
        disabled={!hayPaginaAnterior}
      >
        Anterior
      </Button>
      <span className="text-sm text-zinc-600" aria-live="polite">
        Página {paginaActual} de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        onClick={irAPaginaSiguiente}
        disabled={!hayPaginaSiguiente}
      >
        Siguiente
      </Button>
    </nav>
  );
}
