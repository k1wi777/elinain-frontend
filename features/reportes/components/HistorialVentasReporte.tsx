"use client";

import { useState, type ReactNode } from "react";

import { formatearFechaHora } from "@/shared/lib/fechas";
import { Button, Skeleton, Table, type ColumnaTabla } from "@/shared/ui";
import { NavegacionReportes } from "@/features/reportes/components/NavegacionReportes";
import { TarjetaIndicador } from "@/features/reportes/components/TarjetaIndicador";
import {
  formatearConteo,
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
} from "@/features/reportes/formatos";
import { useReporteHistorialVentas } from "@/features/reportes/hooks/useReporteHistorialVentas";
import { mensajeErrorHistorialVentas } from "@/features/reportes/mensajes-error";
import {
  LIMITE_VENTAS_VISIBLES,
  ordenarVentasPorFechaDescendente,
  recortarVentas,
} from "@/features/reportes/orden";
import { calcularParticipacionComerciante } from "@/features/reportes/participacion";
import type { VentaHistorialItem } from "@/features/reportes/types";

/** Columnas del detalle del historial de ventas. */
const COLUMNAS: ColumnaTabla<VentaHistorialItem>[] = [
  {
    clave: "fecha",
    encabezado: "Fecha",
    render: (venta) => formatearFechaHora(venta.fecha),
  },
  {
    clave: "cantidad",
    encabezado: "Cantidad",
    alineacion: "derecha",
    render: (venta) => formatearConteo(venta.cantidad_vendida),
  },
  {
    clave: "peso-promedio",
    encabezado: "Peso promedio",
    alineacion: "derecha",
    render: (venta) => formatearNumero(venta.peso_promedio_venta),
  },
  {
    clave: "precio-kilo",
    encabezado: "Precio por kilo",
    alineacion: "derecha",
    render: (venta) => formatearMoneda(venta.precio_kilo_venta),
  },
  {
    clave: "valor-bruto",
    encabezado: "Valor bruto",
    alineacion: "derecha",
    render: (venta) => formatearMoneda(venta.valor_bruto),
  },
  {
    clave: "costo-estimado",
    encabezado: "Costo estimado",
    alineacion: "derecha",
    render: (venta) => formatearMoneda(venta.costo_estimado_compra),
  },
  {
    clave: "utilidad-total",
    encabezado: "Utilidad total",
    alineacion: "derecha",
    render: (venta) => formatearMoneda(venta.utilidad_total),
  },
  {
    clave: "valor-comerciante",
    encabezado: "Comerciante",
    alineacion: "derecha",
    render: (venta) => formatearMoneda(venta.valor_comerciante),
  },
  {
    clave: "valor-tercero",
    encabezado: "Tercero",
    alineacion: "derecha",
    render: (venta) => formatearMoneda(venta.valor_tercero),
  },
  {
    clave: "kilos-ganados",
    encabezado: "Kilos ganados",
    alineacion: "derecha",
    render: (venta) => formatearNumero(venta.kilos_ganados_promedio),
  },
  {
    clave: "porcentaje-utilidad",
    encabezado: "Rentabilidad",
    alineacion: "derecha",
    render: (venta) => formatearPorcentaje(venta.porcentaje_utilidad_total),
  },
];

/**
 * Vista del historial de ventas del comerciante.
 *
 * Consume la consulta de solo lectura y presenta el encabezado oscuro del reporte, la
 * navegación entre reportes, un panel destacado con la utilidad del comerciante y la
 * participación derivada sobre la utilidad total, las seis tarjetas del resumen en tema
 * oscuro y la tabla en `tema="oscuro"`. En error muestra un mensaje en español sin detalle
 * técnico; los valores se muestran tal como los entrega el backend. Mientras el historial no
 * está expandido solo se muestran las ventas más recientes y el control "Ver todo" / "Ver
 * menos" aparece únicamente cuando hay más ventas que el límite visible.
 */
export function HistorialVentasReporte() {
  const [expandido, setExpandido] = useState(false);
  const consulta = useReporteHistorialVentas();

  let cuerpo: ReactNode;

  if (consulta.isPending) {
    cuerpo = (
      <div aria-busy="true" className="flex flex-col gap-6">
        <span className="sr-only">Cargando el historial…</span>
        <Skeleton className="h-28 w-full rounded-2xl bg-elinain-surface" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((indice) => (
            <Skeleton
              key={indice}
              className="h-24 rounded-2xl bg-elinain-surface"
            />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl bg-elinain-surface" />
      </div>
    );
  } else if (consulta.isError) {
    cuerpo = (
      <p
        role="alert"
        className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
      >
        {mensajeErrorHistorialVentas(consulta.error.status)}
      </p>
    );
  } else {
    const { resumen, ventas } = consulta.data;
    const participacion = calcularParticipacionComerciante(resumen);
    const ventasVisibles = recortarVentas(
      ordenarVentasPorFechaDescendente(ventas),
      expandido,
    );
    const hayMasVentas = ventas.length > LIMITE_VENTAS_VISIBLES;

    cuerpo = (
      <div className="flex flex-col gap-6">
        <article className="rounded-2xl px-5 py-6 glass-panel sm:px-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            Utilidad del comerciante
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-display text-4xl tracking-tight text-elinain-gold">
              {formatearMoneda(resumen.utilidad_comerciante_acumulada)}
            </p>
            <p className="text-sm text-zinc-400">
              Participación sobre la utilidad total:{" "}
              <span className="font-medium text-white">
                {participacion === null
                  ? "—"
                  : formatearPorcentaje(participacion)}
              </span>
            </p>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaIndicador
            tema="oscuro"
            titulo="Ventas registradas"
            valor={formatearConteo(resumen.total_ventas)}
          />
          <TarjetaIndicador
            tema="oscuro"
            titulo="Animales vendidos"
            valor={formatearConteo(resumen.total_animales_vendidos)}
          />
          <TarjetaIndicador
            tema="oscuro"
            titulo="Valor bruto acumulado"
            valor={formatearMoneda(resumen.valor_bruto_acumulado)}
          />
          <TarjetaIndicador
            tema="oscuro"
            titulo="Costo estimado acumulado"
            valor={formatearMoneda(resumen.costo_estimado_acumulado)}
          />
          <TarjetaIndicador
            tema="oscuro"
            titulo="Utilidad total acumulada"
            valor={formatearMoneda(resumen.utilidad_total_acumulada)}
          />
          <TarjetaIndicador
            tema="oscuro"
            titulo="Utilidad de terceros"
            valor={formatearMoneda(resumen.utilidad_terceros_acumulada)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Table
            columnas={COLUMNAS}
            filas={ventasVisibles}
            obtenerClave={(venta) => venta.venta_id}
            mensajeVacio="Aún no hay ventas registradas"
            tema="oscuro"
            paddingFilas="py-6"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">
              Utilidad = Valor bruto − Costo estimado
            </p>
            {hayMasVentas ? (
              <Button
                variante="secundario"
                aria-expanded={expandido}
                onClick={() => setExpandido((valor) => !valor)}
                className="border-white/8 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08] hover:text-white focus-visible:ring-elinain-gold"
              >
                {expandido ? "Ver menos" : "Ver todo"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="historial-ventas-title"
      className="flex flex-col gap-8"
    >
      <header className="max-w-3xl">
        <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-elinain-gold uppercase">
          Comercialización
        </p>
        <h1
          id="historial-ventas-title"
          className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
        >
          Historial de ventas
        </h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
          Ventas registradas y su reparto de utilidad entre el comerciante y los
          terceros socios.
        </p>
      </header>

      <NavegacionReportes />

      {cuerpo}
    </section>
  );
}
