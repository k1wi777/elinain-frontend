import { Skeleton } from "@/shared/ui";

/**
 * Fallback de carga de los segmentos del área protegida.
 *
 * Next lo aplica a las rutas que no definen su propio `loading.tsx`. Reproduce el ancho de
 * página (`max-w-4xl`) para que el contenido no salte al hidratar; la cabecera del layout
 * sigue visible porque el límite solo suspende el contenido de la página.
 */
export default function DashboardLoading() {
  return (
    <section
      aria-busy="true"
      className="mx-auto flex w-full max-w-4xl flex-col gap-6"
    >
      <span className="sr-only">Cargando…</span>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </section>
  );
}
