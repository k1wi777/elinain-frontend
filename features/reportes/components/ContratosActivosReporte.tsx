"use client";

import { Skeleton, Table, type ColumnaTabla } from "@/shared/ui";
import { NavegacionReportes } from "@/features/reportes/components/NavegacionReportes";
import {
  formatearConteo,
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
} from "@/features/reportes/formatos";
import { useReporteContratosActivos } from "@/features/reportes/hooks/useReporteContratosActivos";
import { mensajeErrorContratosActivos } from "@/features/reportes/mensajes-error";
import { ordenarContratosPorUtilidadDescendente } from "@/features/reportes/orden";
import { calcularResumenContratos } from "@/features/reportes/resumen-contratos";
import type { ContratoActivoDetalle } from "@/features/reportes/types";

/** Iniciales de un nombre para los avatares del listado. */
function obtenerIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0] ?? "")
    .join("")
    .toUpperCase();
}

/** Columnas del reporte de contratos activos. */
const COLUMNAS: ColumnaTabla<ContratoActivoDetalle>[] = [
  {
    clave: "tercero",
    encabezado: "Tercero",
    render: (contrato) => (
      <span className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[0.65rem] font-semibold text-zinc-300"
        >
          {obtenerIniciales(contrato.tercero_nombre)}
        </span>
        <span className="text-zinc-200">{contrato.tercero_nombre}</span>
      </span>
    ),
  },
  {
    clave: "finca",
    encabezado: "Finca",
    render: (contrato) => (
      <span className="text-zinc-300">{contrato.finca_nombre}</span>
    ),
  },
  {
    clave: "cantidad-actual",
    encabezado: "Cantidad actual",
    render: (contrato) => {
      const peso = contrato.peso_promedio_actual ?? null;

      return (
        <div className="flex flex-col">
          <span className="text-zinc-200 tabular-nums">
            {formatearConteo(contrato.cantidad_actual)}
          </span>
          <span className="text-xs text-zinc-500">
            {peso === null ? "—" : `Peso prom. ${formatearNumero(peso)} kg`}
          </span>
        </div>
      );
    },
  },
  {
    clave: "total-compras",
    encabezado: "Total compras",
    render: (contrato) => (
      <span className="tabular-nums">
        {formatearConteo(contrato.total_compras)}
      </span>
    ),
  },
  {
    clave: "total-ventas",
    encabezado: "Total ventas",
    render: (contrato) => (
      <span className="tabular-nums">
        {formatearConteo(contrato.total_ventas)}
      </span>
    ),
  },
  {
    clave: "utilidad",
    encabezado: "Utilidad generada",
    alineacion: "derecha",
    render: (contrato) => (
      <div className="flex flex-col">
        <span className="text-zinc-200 tabular-nums">
          {formatearMoneda(contrato.utilidad_generada_comerciante)}
        </span>
        <span className="text-xs text-zinc-500">
          Reparto {formatearPorcentaje(contrato.porcentaje_comerciante)} /{" "}
          {formatearPorcentaje(contrato.porcentaje_tercero)}
        </span>
      </div>
    ),
  },
];

/**
 * Vista del reporte de contratos activos del comerciante.
 *
 * Consume la consulta de solo lectura y presenta el encabezado oscuro del reporte, la
 * navegación entre reportes, cuatro tarjetas con agregados reales calculados en
 * `calcularResumenContratos` y la tabla en `tema="oscuro"`. En carga o error las tarjetas
 * muestran `—`; el error se anuncia en un panel tenue sin detalle técnico. Los contratos se
 * ordenan por utilidad generada por el comerciante de forma descendente y cada valor se
 * muestra tal como lo entrega el backend.
 */
export function ContratosActivosReporte() {
  const consulta = useReporteContratosActivos();

  const contratos = consulta.data
    ? ordenarContratosPorUtilidadDescendente(consulta.data.contratos)
    : [];
  const resumen = calcularResumenContratos(consulta.data?.contratos ?? []);
  const sinDatos = consulta.isPending || consulta.isError;
  const valorResumen = (valor: string) => (sinDatos ? "—" : valor);

  return (
    <section
      aria-labelledby="contratos-activos-title"
      className="flex flex-col gap-8"
    >
      <header className="max-w-3xl">
        <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-elinain-gold uppercase">
          Participación y engorde
        </p>
        <h1
          id="contratos-activos-title"
          className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
        >
          Contratos activos
        </h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
          Lotes en participación en curso, con su avance de compras y la
          utilidad generada por el comerciante.
        </p>
      </header>

      <NavegacionReportes />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            Contratos en curso
          </p>
          <p
            aria-live="polite"
            className="mt-3 font-display text-4xl tracking-tight text-elinain-gold"
          >
            {valorResumen(formatearConteo(resumen.contratosEnCurso))}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Lotes en pie</p>
        </article>
        <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            Ganado en pastoreo
          </p>
          <p
            aria-live="polite"
            className="mt-3 font-display text-4xl tracking-tight text-white"
          >
            {valorResumen(formatearConteo(resumen.ganadoEnPastoreo))}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Cabezas actuales</p>
        </article>
        <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            Total compras
          </p>
          <p
            aria-live="polite"
            className="mt-3 font-display text-4xl tracking-tight text-white"
          >
            {valorResumen(formatearConteo(resumen.totalCompras))}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Compras y fusiones</p>
        </article>
        <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            Utilidad neta generada
          </p>
          <p
            aria-live="polite"
            className="mt-3 font-display text-4xl tracking-tight text-white"
          >
            {valorResumen(formatearMoneda(resumen.utilidadNetaGenerada))}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Del comerciante</p>
        </article>
      </div>

      {consulta.isPending ? (
        <div aria-busy="true" className="flex flex-col gap-4">
          <span className="sr-only">Cargando el reporte…</span>
          <Skeleton className="h-64 w-full rounded-2xl bg-elinain-surface" />
        </div>
      ) : consulta.isError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
        >
          {mensajeErrorContratosActivos(consulta.error.status)}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <Table
            columnas={COLUMNAS}
            filas={contratos}
            obtenerClave={(contrato) => contrato.contrato_id}
            mensajeVacio="Aún no hay contratos activos"
            tema="oscuro"
            paddingFilas="py-6"
          />
          <p className="text-xs text-zinc-500">
            {formatearConteo(contratos.length)} contratos activos
          </p>
        </div>
      )}
    </section>
  );
}
