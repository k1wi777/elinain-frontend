import { Skeleton } from "@/shared/ui";

/**
 * Skeleton del listado de contratos (`/contratos`).
 *
 * Reproduce el contenedor y el ancho de `page.tsx` para que la transición al contenido real
 * no provoque saltos de layout.
 */
export default function ContratosLoading() {
  return (
    <section aria-busy="true" className="mx-auto w-full max-w-4xl">
      <span className="sr-only">Cargando…</span>
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="flex items-center gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
          <div className="flex items-center gap-4 border-t border-zinc-200 px-4 py-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="ml-auto h-8 w-24" />
          </div>
          <div className="flex items-center gap-4 border-t border-zinc-200 px-4 py-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="ml-auto h-8 w-24" />
          </div>
          <div className="flex items-center gap-4 border-t border-zinc-200 px-4 py-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-auto h-8 w-24" />
          </div>
          <div className="flex items-center gap-4 border-t border-zinc-200 px-4 py-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="ml-auto h-8 w-24" />
          </div>
        </div>
      </div>
    </section>
  );
}
