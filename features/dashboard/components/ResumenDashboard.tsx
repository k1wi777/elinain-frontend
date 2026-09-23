"use client";

import { Skeleton } from "@/shared/ui";
import { ResumenNarrativo } from "@/features/dashboard/components/ResumenNarrativo";
import { TarjetaResumen } from "@/features/dashboard/components/TarjetaResumen";
import { formatearConteo, formatearMoneda } from "@/features/dashboard/formato";
import { useReporteDashboard } from "@/features/dashboard/hooks/useReporteDashboard";
import { mensajeErrorDashboard } from "@/features/dashboard/mensajes-error";
import { construirNarrativa } from "@/features/dashboard/narrativa";

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
        className="flex flex-col gap-8"
      >
        <span className="sr-only">Cargando el resumen…</span>
        <div className="rounded-2xl border border-elinain-gold/20 p-5 glass-panel">
          <Skeleton className="h-3 w-44 bg-elinain-surface" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full bg-elinain-surface" />
            <Skeleton className="h-4 w-5/6 bg-elinain-surface" />
            <Skeleton className="h-4 w-3/4 bg-elinain-surface" />
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

  if (consulta.error) {
    return (
      <div
        role="alert"
        className="flex max-w-2xl items-start gap-3 rounded-xl border border-elinain-gold/20 bg-elinain-surface p-5 text-sm text-white shadow-lg shadow-black/15"
      >
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-elinain-gold-muted font-semibold text-elinain-gold"
        >
          !
        </span>
        <p className="leading-6">
          {mensajeErrorDashboard(consulta.error.status)}
        </p>
      </div>
    );
  }

  const { resumen } = consulta.data;
  const frases = construirNarrativa(resumen);

  return (
    <section aria-label="Resumen de reportes" className="flex flex-col gap-10">
      <ResumenNarrativo frases={frases} />

      <section aria-labelledby="resultado-financiero">
        <div className="mb-4 flex items-center gap-3">
          <h2
            id="resultado-financiero"
            className="text-xs font-semibold tracking-[0.18em] text-elinain-muted uppercase"
          >
            Resultado financiero
          </h2>
          <span aria-hidden className="h-px flex-1 bg-white/8" />
        </div>
        <p className="mb-4 text-sm leading-6 text-elinain-muted">
          La utilidad bruta acumulada es la ganancia total de las ventas
          registradas. De esa ganancia, la utilidad real es la parte que te
          corresponde como comerciante y la utilidad de terceros es la parte de
          los socios de participación.
        </p>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]">
          <TarjetaResumen
            nivel="protagonista"
            titulo="Utilidad real acumulada"
            valor={formatearMoneda(resumen.utilidad_real_comerciante_acumulada)}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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
        </div>
      </section>

      <section aria-labelledby="resumen-operativo">
        <div className="mb-4 flex items-center gap-3">
          <h2
            id="resumen-operativo"
            className="text-xs font-semibold tracking-[0.18em] text-elinain-muted uppercase"
          >
            Resumen operativo
          </h2>
          <span aria-hidden className="h-px flex-1 bg-white/8" />
        </div>
        <p className="mb-4 text-sm leading-6 text-elinain-muted">
          Resume lo que tienes en movimiento: contratos activos y cerrados,
          animales en inventario, ventas registradas y costos operativos
          informativos acumulados. Complementa el resultado financiero; no
          representa ganancia.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            className="sm:col-span-2 lg:col-span-2"
          />
        </div>
      </section>
    </section>
  );
}
