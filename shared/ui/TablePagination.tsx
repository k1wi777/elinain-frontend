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
 * Muestra a la izquierda el rango de registros visibles y a la derecha los botones tipo
 * píldora con la página actual destacada. Los usa internamente `Table` y también los
 * listados paginados que no se presentan como tabla, como el de ventas en tarjetas.
 */
export function TablePagination({
  paginaActual,
  totalPaginas,
  total,
  limite,
  hayPaginaAnterior,
  hayPaginaSiguiente,
  irAPaginaAnterior,
  irAPaginaSiguiente,
  tema = "claro",
}: PaginacionTabla & { tema?: TemaTabla }) {
  const esOscuro = tema === "oscuro";

  const desde = total === 0 ? 0 : (paginaActual - 1) * limite + 1;
  const hasta = Math.min(paginaActual * limite, total);
  const resumen =
    total === 0
      ? "Sin registros"
      : `Mostrando ${desde} a ${hasta} de ${total} registros`;

  const estilosBoton = esOscuro
    ? "rounded-full border-white/8 bg-white/[0.03] px-4 text-zinc-300 hover:bg-white/[0.07] hover:text-white focus-visible:ring-elinain-gold"
    : "rounded-full px-4";

  return (
    <nav
      aria-label="Paginación"
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t px-1 pt-4 sm:flex-row",
        esOscuro ? "border-white/6" : "border-zinc-200",
      )}
    >
      <span
        className={cn(
          "text-xs sm:text-sm",
          esOscuro ? "text-zinc-500" : "text-zinc-600",
        )}
        aria-live="polite"
      >
        {resumen}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variante="secundario"
          onClick={irAPaginaAnterior}
          disabled={!hayPaginaAnterior}
          className={estilosBoton}
        >
          Anterior
        </Button>
        <span
          className={cn(
            "flex min-w-9 items-center justify-center rounded-full px-3 py-2 text-sm font-semibold",
            esOscuro
              ? "bg-elinain-gold text-elinain-bg"
              : "bg-zinc-900 text-white",
          )}
        >
          {paginaActual}
        </span>
        <span
          className={cn(
            "text-xs",
            esOscuro ? "text-zinc-500" : "text-zinc-600",
          )}
        >
          de {totalPaginas}
        </span>
        <Button
          variante="secundario"
          onClick={irAPaginaSiguiente}
          disabled={!hayPaginaSiguiente}
          className={estilosBoton}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );
}
