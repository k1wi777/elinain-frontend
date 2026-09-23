import { cn } from "@/shared/lib/cn";
import {
  Skeleton,
  TablePagination,
  type PaginacionTabla,
  type TemaTabla,
} from "@/shared/ui";
import { VentaCard } from "@/features/ventas/components/VentaCard";
import type { Venta } from "@/features/ventas/types";

/** Props del componente `VentasLista`. */
type Props = {
  /** Ventas de la página actual. */
  ventas: Venta[];
  /** Indica si la primera carga está en curso. */
  cargando: boolean;
  /** Mensaje de error a mostrar; tiene prioridad sobre el resto de estados. */
  mensajeError: string | null;
  /** Mensaje a mostrar cuando no hay ventas. */
  mensajeVacio: string;
  /** Datos y acciones de paginación; si se omiten no se muestran controles. */
  paginacion?: PaginacionTabla;
  /** Tema visual opcional; conserva el tema claro por defecto. */
  tema?: TemaTabla;
};

/**
 * Listado presentacional de ventas.
 *
 * No conoce TanStack Query: recibe las ventas, el estado de carga, el error, el mensaje de
 * vacío y la paginación. Renderiza una `VentaCard` por venta y reutiliza `TablePagination`
 * para navegar entre páginas sin usar la `Table`. El tema es una prop visual opcional para
 * reutilizar el componente tanto en el listado global como en el detalle del contrato.
 */
export function VentasLista({
  ventas,
  cargando,
  mensajeError,
  mensajeVacio,
  paginacion,
  tema = "claro",
}: Props) {
  const esOscuro = tema === "oscuro";

  if (mensajeError) {
    return esOscuro ? (
      <p
        role="alert"
        className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
      >
        {mensajeError}
      </p>
    ) : (
      <p role="alert" className="text-sm text-red-600">
        {mensajeError}
      </p>
    );
  }

  if (cargando) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <span className="sr-only">Cargando ventas…</span>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <p
        className={cn(
          "rounded-lg border border-dashed p-6 text-center text-sm text-zinc-500",
          esOscuro
            ? "border-white/10 bg-white/[0.02]"
            : "border-zinc-300 bg-zinc-50",
        )}
      >
        {mensajeVacio}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {ventas.map((venta) => (
          <li key={venta.id}>
            <VentaCard venta={venta} tema={tema} />
          </li>
        ))}
      </ul>
      {paginacion ? <TablePagination {...paginacion} tema={tema} /> : null}
    </div>
  );
}
