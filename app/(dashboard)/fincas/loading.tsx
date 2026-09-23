import { Skeleton } from "@/shared/ui";

/**
 * Skeleton del listado y mapa de fincas (`/fincas`).
 *
 * Reproduce la estructura final de la ruta: encabezado con descripción, CTA y control
 * segmentado, resumen de tarjetas y tabla oscura, con el mismo ancho `max-w-7xl` de
 * `page.tsx` para que la transición al contenido real no provoque saltos de layout.
 */
export default function FincasLoading() {
  return (
    <section
      aria-busy="true"
      className="mx-auto flex w-full max-w-7xl flex-col gap-8"
    >
      <span className="sr-only">Cargando…</span>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <Skeleton className="mb-4 h-3 w-48 bg-white/10" />
          <Skeleton className="h-12 w-40 bg-white/10" />
          <Skeleton className="mt-4 h-5 w-full max-w-2xl bg-white/10" />
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
          <Skeleton className="h-11 w-full rounded-xl bg-elinain-surface sm:w-40" />
          <Skeleton className="h-11 w-full rounded-full bg-elinain-surface sm:w-56" />
        </div>
      </header>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 rounded-2xl bg-elinain-surface" />
          <Skeleton className="h-32 rounded-2xl bg-elinain-surface" />
        </div>
        <div className="overflow-x-auto">
          <div className="flex min-w-[720px] flex-col gap-2">
            <div className="flex items-center gap-4 px-5 pt-1 pb-3">
              <Skeleton className="h-3 w-24 bg-white/10" />
              <Skeleton className="h-3 w-32 bg-white/10" />
              <Skeleton className="h-3 w-40 bg-white/10" />
              <Skeleton className="ml-auto h-3 w-16 bg-white/10" />
            </div>
            {["w-40", "w-44", "w-36", "w-40"].map((ancho, indice) => (
              <div
                key={`${ancho}-${indice}`}
                className="flex items-center gap-4 rounded-2xl border border-white/6 bg-elinain-surface px-5 py-6"
              >
                <Skeleton className="h-4 w-36 bg-white/10" />
                <Skeleton className="h-4 w-40 bg-white/10" />
                <Skeleton className="h-4 w-28 bg-white/10" />
                <Skeleton className="ml-auto h-8 w-24 bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
