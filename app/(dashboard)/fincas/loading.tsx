import { Skeleton } from "@/shared/ui";

/**
 * Skeleton del listado y mapa de fincas (`/fincas`).
 *
 * Reproduce el contenedor y el ancho de `page.tsx`, con las pestañas Listado/Mapa y bloques
 * de filas en lugar de una tabla detallada.
 */
export default function FincasLoading() {
  return (
    <section aria-busy="true" className="mx-auto w-full max-w-4xl">
      <span className="sr-only">Cargando…</span>
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 border-b border-zinc-200">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </section>
  );
}
