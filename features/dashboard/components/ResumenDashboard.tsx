"use client";

import { Skeleton } from "@/shared/ui";
import { TarjetaResumen } from "@/features/dashboard/components/TarjetaResumen";
import { formatearConteo, formatearMoneda } from "@/features/dashboard/formato";
import { useReporteDashboard } from "@/features/dashboard/hooks/useReporteDashboard";
import { mensajeErrorDashboard } from "@/features/dashboard/mensajes-error";

/**
 * Vista principal del dashboard: resumen consolidado del comerciante.
 *
 * Consume la consulta de solo lectura y reproduce la forma de las tarjetas con `Skeleton`
 * mientras carga. En error muestra un mensaje en español sin detalle técnico; en éxito
 * presenta las ocho cifras tal como las entrega el backend, ordenadas por nivel
 * tipográfico: la utilidad real del comerciante como protagonista, las utilidades bruta y
 * de terceros como secundarias, y los conteos y costos en un nivel menor.
 */
export function ResumenDashboard() {
  const consulta = useReporteDashboard();

  if (consulta.isPending) {
    return (
      <section
        aria-busy="true"
        aria-label="Resumen de reportes"
        className="flex flex-col gap-6"
      >
        <span className="sr-only">Cargando el resumen…</span>
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    );
  }

  if (consulta.error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {mensajeErrorDashboard(consulta.error.status)}
      </p>
    );
  }

  const { resumen } = consulta.data;

  return (
    <section aria-label="Resumen de reportes" className="flex flex-col gap-6">
      <TarjetaResumen
        nivel="protagonista"
        titulo="Utilidad real acumulada"
        valor={formatearMoneda(resumen.utilidad_real_comerciante_acumulada)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TarjetaResumen
          nivel="secundario"
          titulo="Utilidad bruta acumulada"
          valor={formatearMoneda(resumen.utilidad_total_acumulada)}
        />
        <TarjetaResumen
          nivel="secundario"
          titulo="Utilidad de terceros acumulada"
          valor={formatearMoneda(resumen.utilidad_terceros_acumulada)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TarjetaResumen
          nivel="menor"
          titulo="Contratos activos"
          valor={formatearConteo(resumen.contratos_activos)}
        />
        <TarjetaResumen
          nivel="menor"
          titulo="Contratos cerrados"
          valor={formatearConteo(resumen.contratos_cerrados)}
        />
        <TarjetaResumen
          nivel="menor"
          titulo="Animales en inventario"
          valor={formatearConteo(resumen.total_animales_actual)}
        />
        <TarjetaResumen
          nivel="menor"
          titulo="Ventas registradas"
          valor={formatearConteo(resumen.total_ventas_registradas)}
        />
        <TarjetaResumen
          nivel="menor"
          titulo="Costos informativos acumulados"
          valor={formatearMoneda(resumen.total_costos_informativos)}
        />
      </div>
    </section>
  );
}
