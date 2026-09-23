"use client";

import { useState } from "react";

import { formatearFechaHora } from "@/shared/lib/fechas";
import { Button, Skeleton, Table, type ColumnaTabla } from "@/shared/ui";
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
 * Consume la consulta de solo lectura y reproduce la forma del resumen y de la tabla con
 * `Skeleton` mientras carga. En error muestra un mensaje en español sin detalle técnico;
 * en éxito presenta el resumen agregado completo y el detalle venta por venta con los
 * valores tal como los entrega el backend. Mientras el historial no está expandido solo
 * se muestran las ventas más recientes y el control "Ver todo" / "Ver menos" aparece
 * únicamente cuando hay más ventas que el límite visible.
 */
export function HistorialVentasReporte() {
  const [expandido, setExpandido] = useState(false);
  const consulta = useReporteHistorialVentas();

  if (consulta.isPending) {
    return (
      <section
        aria-busy="true"
        aria-label="Historial de ventas"
        className="flex flex-col gap-6"
      >
        <span className="sr-only">Cargando el historial…</span>
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  if (consulta.error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {mensajeErrorHistorialVentas(consulta.error.status)}
      </p>
    );
  }

  const { resumen, ventas } = consulta.data;
  const ventasVisibles = recortarVentas(
    ordenarVentasPorFechaDescendente(ventas),
    expandido,
  );
  const hayMasVentas = ventas.length > LIMITE_VENTAS_VISIBLES;

  return (
    <section aria-label="Historial de ventas" className="flex flex-col gap-6">
      <TarjetaIndicador
        realce
        titulo="Utilidad del comerciante"
        valor={formatearMoneda(resumen.utilidad_comerciante_acumulada)}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TarjetaIndicador
          titulo="Ventas registradas"
          valor={formatearConteo(resumen.total_ventas)}
        />
        <TarjetaIndicador
          titulo="Animales vendidos"
          valor={formatearConteo(resumen.total_animales_vendidos)}
        />
        <TarjetaIndicador
          titulo="Valor bruto acumulado"
          valor={formatearMoneda(resumen.valor_bruto_acumulado)}
        />
        <TarjetaIndicador
          titulo="Costo estimado acumulado"
          valor={formatearMoneda(resumen.costo_estimado_acumulado)}
        />
        <TarjetaIndicador
          titulo="Utilidad total acumulada"
          valor={formatearMoneda(resumen.utilidad_total_acumulada)}
        />
        <TarjetaIndicador
          titulo="Utilidad de terceros"
          valor={formatearMoneda(resumen.utilidad_terceros_acumulada)}
        />
      </div>

      <Table
        columnas={COLUMNAS}
        filas={ventasVisibles}
        obtenerClave={(venta) => venta.venta_id}
        mensajeVacio="Aún no hay ventas registradas"
      />

      {hayMasVentas ? (
        <div className="flex justify-end">
          <Button
            variante="secundario"
            aria-expanded={expandido}
            onClick={() => setExpandido((valor) => !valor)}
          >
            {expandido ? "Ver menos" : "Ver todo"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
