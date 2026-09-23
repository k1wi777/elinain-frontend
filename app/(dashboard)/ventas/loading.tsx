import { Skeleton } from "@/shared/ui";

/**
 * Skeleton del listado global de ventas (`/ventas`).
 *
 * Reproduce la estructura final de la ruta: encabezado con eyebrow, título y descripción,
 * CTA, cinco tarjetas de resumen, barra de filtro por contrato y tarjetas de venta, con el
 * mismo ancho `max-w-7xl` de `page.tsx` para que la transición al contenido real no
 * provoque saltos de layout.
 */
export default function VentasLoading() {
  return (
    <section
      aria-busy="true"
      className="mx-auto flex w-full max-w-7xl flex-col gap-8"
    >
      <span className="sr-only">Cargando…</span>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <Skeleton className="mb-4 h-3 w-56 bg-white/10" />
          <Skeleton className="h-12 w-40 bg-white/10" />
          <Skeleton className="mt-4 h-5 w-full max-w-2xl bg-white/10" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl bg-elinain-surface sm:w-48" />
      </header>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[0, 1, 2, 3, 4].map((indice) => (
            <Skeleton
              key={indice}
              className="h-32 rounded-2xl bg-elinain-surface"
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36 bg-white/10" />
            <Skeleton className="h-10 w-full max-w-sm rounded-md bg-elinain-surface" />
          </div>
          {[0, 1].map((indice) => (
            <Skeleton
              key={indice}
              className="h-40 rounded-2xl bg-elinain-surface"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
