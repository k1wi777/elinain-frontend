import { Skeleton } from "@/shared/ui";

/**
 * Fallback de carga de los segmentos del área protegida.
 *
 * Next lo aplica a las rutas que no definen su propio `loading.tsx`. Reproduce la composición
 * visual del dashboard para que el contenido no salte al hidratar; la cabecera del layout
 * sigue visible porque el límite solo suspende el contenido de la página.
 */
export default function DashboardLoading() {
  return (
    <section
      aria-busy="true"
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
    >
      <span className="sr-only">Cargando…</span>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <Skeleton className="h-3 w-32 bg-elinain-gold/20" />
          <Skeleton className="h-12 w-72 bg-elinain-surface" />
          <Skeleton className="h-5 w-full max-w-xl bg-elinain-surface" />
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
          <Skeleton className="h-24 w-full rounded-xl bg-elinain-surface" />
          <Skeleton className="h-24 w-full rounded-xl bg-elinain-surface" />
        </div>
      </div>
      <div>
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-3 w-40 bg-elinain-surface" />
          <span aria-hidden className="h-px flex-1 bg-white/8" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]">
          <Skeleton className="h-40 w-full rounded-2xl bg-elinain-surface sm:h-44" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Skeleton className="h-28 w-full rounded-xl bg-elinain-surface" />
            <Skeleton className="h-28 w-full rounded-xl bg-elinain-surface" />
          </div>
        </div>
      </div>
      <div>
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-3 w-32 bg-elinain-surface" />
          <span aria-hidden className="h-px flex-1 bg-white/8" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 w-full rounded-xl bg-elinain-surface" />
          <Skeleton className="h-28 w-full rounded-xl bg-elinain-surface" />
          <Skeleton className="h-28 w-full rounded-xl bg-elinain-surface" />
          <Skeleton className="h-28 w-full rounded-xl bg-elinain-surface" />
          <Skeleton className="h-28 w-full rounded-xl bg-elinain-surface sm:col-span-2 lg:col-span-2" />
        </div>
      </div>
    </section>
  );
}
