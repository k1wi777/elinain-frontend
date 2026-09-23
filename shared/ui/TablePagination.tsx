import { cn } from "@/shared/lib/cn";
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

/** Tema visual opcional para reutilizar la paginación en superficies oscuras. */
export type TemaTabla = "claro" | "oscuro";

/**
 * Controles de navegación entre páginas de un listado.
 *
 * Los usa internamente `Table` y también los listados paginados que no se presentan como
 * tabla, como el de ventas en tarjetas.
 */
export function TablePagination({
  paginaActual,
  totalPaginas,
  hayPaginaAnterior,
  hayPaginaSiguiente,
  irAPaginaAnterior,
  irAPaginaSiguiente,
  tema = "claro",
}: PaginacionTabla & { tema?: TemaTabla }) {
  const esOscuro = tema === "oscuro";

  return (
    <nav
      aria-label="Paginación"
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t px-4 py-4 sm:flex-row",
        esOscuro ? "border-white/6" : "border-zinc-200",
      )}
    >
      <Button
        variante="secundario"
        onClick={irAPaginaAnterior}
        disabled={!hayPaginaAnterior}
        className={
          esOscuro
            ? "border-white/8 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.07] hover:text-white focus-visible:ring-elinain-gold"
            : undefined
        }
      >
        Anterior
      </Button>
      <span
        className={cn("text-sm", esOscuro ? "text-zinc-500" : "text-zinc-600")}
        aria-live="polite"
      >
        Página {paginaActual} de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        onClick={irAPaginaSiguiente}
        disabled={!hayPaginaSiguiente}
        className={
          esOscuro
            ? "border-white/8 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.07] hover:text-white focus-visible:ring-elinain-gold"
            : undefined
        }
      >
        Siguiente
      </Button>
    </nav>
  );
}
