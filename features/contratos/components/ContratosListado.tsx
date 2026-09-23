"use client";

import { useState } from "react";
import Link from "next/link";

import { usePagination } from "@/shared/api/usePagination";
import { cn } from "@/shared/lib/cn";
import { formatearFechaHora } from "@/shared/lib/fechas";
import { Table, type ColumnaTabla, type PaginacionTabla } from "@/shared/ui";
import {
  filtrarContratosPorEstado,
  paginarContratos,
} from "@/features/contratos/filtros";
import { useContratos } from "@/features/contratos/hooks/useContratos";
import { mensajeErrorListarContratos } from "@/features/contratos/mensajes-error";
import { formatearParticipacion } from "@/features/contratos/participacion";
import {
  indexarNombres,
  nombreDeFinca,
  nombreDeTercero,
} from "@/features/contratos/relaciones";
import { calcularResumenContratos } from "@/features/contratos/resumen";
import type {
  Contrato,
  EstadoContrato,
  EstadoFiltroContrato,
  FincaContrato,
  TerceroContrato,
} from "@/features/contratos/types";

/** Etiquetas visibles de cada estado del contrato. */
const ETIQUETAS_ESTADO: Record<EstadoContrato, string> = {
  activo: "Activo",
  cerrado: "Cerrado",
};

/** Opciones del filtro por estado. */
const OPCIONES_ESTADO: { valor: EstadoFiltroContrato; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "activo", etiqueta: "Activos" },
  { valor: "cerrado", etiqueta: "Cerrados" },
];

/** Estilos de los enlaces de acción, alineados con las acciones de fincas. */
const ESTILOS_ENLACE_ACCION =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-white/8 bg-white/[0.03] px-3 py-2 text-xs font-medium whitespace-nowrap text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:outline-none";

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

/** Estilos del CTA de alta, alineados con los de fincas y socios de participación. */
const ESTILOS_CTA_NUEVO_CONTRATO =
  "inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-elinain-gold px-5 py-3.5 text-sm font-semibold text-elinain-bg shadow-[0_10px_24px_rgb(232_185_35_/_0.16)] transition-colors hover:bg-elinain-gold-hover focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto";

/** Props del componente `ContratosListado`. */
type Props = {
  /** Terceros para resolver el nombre por `tercero_id`; los compone `app/`. */
  terceros: TerceroContrato[];
  /** Fincas para resolver el nombre por `finca_id`; las compone `app/`. */
  fincas: FincaContrato[];
};

/**
 * Listado de contratos con filtro por estado y paginación en el cliente.
 *
 * Carga todos los contratos con `useContratos`, filtra en render por el estado elegido y
 * pagina el conjunto filtrado, de modo que el total y las páginas reflejen el filtro. Los
 * nombres de tercero y finca se resuelven con las proyecciones que compone `app/`.
 */
export function ContratosListado({ terceros, fincas }: Props) {
  const [filtro, setFiltro] = useState<EstadoFiltroContrato>("todos");
  const consulta = useContratos();
  const contratos = consulta.data ?? [];

  const filtrados = filtrarContratosPorEstado(contratos, filtro);
  const paginacion = usePagination({ total: filtrados.length });
  const visibles = paginarContratos(
    filtrados,
    paginacion.limite,
    paginacion.offset,
  );

  const tercerosPorId = indexarNombres(terceros);
  const fincasPorId = indexarNombres(fincas);

  const paginacionTabla: PaginacionTabla = {
    paginaActual: paginacion.paginaActual,
    totalPaginas: paginacion.totalPaginas,
    total: paginacion.total,
    limite: paginacion.limite,
    hayPaginaAnterior: paginacion.hayPaginaAnterior,
    hayPaginaSiguiente: paginacion.hayPaginaSiguiente,
    irAPaginaAnterior: paginacion.irAPaginaAnterior,
    irAPaginaSiguiente: paginacion.irAPaginaSiguiente,
  };

  const conteos: Record<EstadoFiltroContrato, number> = {
    todos: contratos.length,
    activo: filtrarContratosPorEstado(contratos, "activo").length,
    cerrado: filtrarContratosPorEstado(contratos, "cerrado").length,
  };

  const cargandoResumen = consulta.isPending || Boolean(consulta.error);
  const resumen = calcularResumenContratos(contratos);
  const splitPromedio =
    resumen.porcentaje_comerciante !== null &&
    resumen.porcentaje_tercero !== null
      ? formatearParticipacion({
          porcentaje_comerciante: resumen.porcentaje_comerciante,
          porcentaje_tercero: resumen.porcentaje_tercero,
        })
      : null;

  const alCambiarFiltro = (valor: EstadoFiltroContrato) => {
    setFiltro(valor);
    paginacion.reiniciar();
  };

  const columnas: ColumnaTabla<Contrato>[] = [
    {
      clave: "codigo",
      encabezado: "Código / Apertura",
      render: (contrato) => (
        <div className="flex flex-col">
          <span className="max-w-[12rem] truncate font-mono text-xs font-medium text-white">
            {contrato.id}
          </span>
          <span className="text-xs text-zinc-500">
            {formatearFechaHora(contrato.fecha_apertura) || "—"}
          </span>
        </div>
      ),
    },
    {
      clave: "tercero",
      encabezado: "Tercero",
      render: (contrato) => {
        const nombre = nombreDeTercero(tercerosPorId, contrato.tercero_id);

        return (
          <span className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[0.65rem] font-semibold text-zinc-300"
            >
              {obtenerIniciales(nombre)}
            </span>
            <span className="text-zinc-300">{nombre}</span>
          </span>
        );
      },
    },
    {
      clave: "finca",
      encabezado: "Finca / Predio",
      render: (contrato) => (
        <span className="flex items-center gap-2">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="size-4 shrink-0 text-zinc-500"
          >
            <path
              d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="11"
              r="2.25"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
          <span className="text-zinc-300">
            {nombreDeFinca(fincasPorId, contrato.finca_id)}
          </span>
        </span>
      ),
    },
    {
      clave: "estado",
      encabezado: "Estatus",
      render: (contrato) => (
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium",
              contrato.estado === "activo"
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-white/[0.06] text-zinc-400",
            )}
          >
            {ETIQUETAS_ESTADO[contrato.estado]}
          </span>
          {contrato.fecha_cierre ? (
            <span className="text-xs text-zinc-500">
              Cierre: {formatearFechaHora(contrato.fecha_cierre)}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      clave: "participacion",
      encabezado: "Participación",
      render: (contrato) => (
        <div className="flex min-w-[8rem] flex-col gap-2">
          <span className="text-zinc-300">
            {formatearParticipacion(contrato)}
          </span>
          <span
            aria-hidden
            className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]"
          >
            <span
              className="bg-elinain-gold"
              style={{ width: `${contrato.porcentaje_comerciante}%` }}
            />
            <span
              className="bg-white/20"
              style={{ width: `${contrato.porcentaje_tercero}%` }}
            />
          </span>
        </div>
      ),
    },
    {
      clave: "lote",
      encabezado: "Lote & Peso prom.",
      render: (contrato) => {
        const cantidad = contrato.cantidad_actual ?? null;
        const peso = contrato.peso_promedio_actual ?? null;
        const detalles = [
          peso === null ? null : `${peso} kg`,
          contrato.raza ? contrato.raza : null,
        ].filter((detalle): detalle is string => detalle !== null);

        return (
          <div className="flex min-w-[8rem] flex-col">
            <span className="text-zinc-300">
              {cantidad === null ? "—" : `${cantidad} cabezas`}
            </span>
            <span className="text-xs text-zinc-500">
              {detalles.length > 0 ? detalles.join(" · ") : "—"}
            </span>
          </div>
        );
      },
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alineacion: "derecha",
      render: (contrato) => (
        <div className="flex shrink-0 justify-end gap-2">
          <Link
            href={`/contratos/${contrato.id}`}
            className={ESTILOS_ENLACE_ACCION}
            aria-label={`Ver detalle del contrato ${contrato.id}`}
          >
            Ver detalle
          </Link>
          <Link
            href={`/contratos/${contrato.id}/editar`}
            className={ESTILOS_ENLACE_ACCION}
            aria-label={`Editar el contrato ${contrato.id}`}
          >
            Editar
          </Link>
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="contratos-title" className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-elinain-gold uppercase">
            Participación y engorde
          </p>
          <h1
            id="contratos-title"
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            Contratos
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            Registro fiduciario de los lotes en participación y seguimiento de
            sus pesajes hasta la liquidación.
          </p>
        </div>
        <Link href="/contratos/nuevo" className={ESTILOS_CTA_NUEVO_CONTRATO}>
          <span aria-hidden className="text-lg leading-none font-normal">
            +
          </span>
          <span>Nuevo contrato</span>
        </Link>
      </header>

      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
              Contratos activos
            </p>
            <p
              className="mt-3 font-display text-4xl tracking-tight text-elinain-gold"
              aria-live="polite"
            >
              {cargandoResumen ? "—" : resumen.contratosActivos}
            </p>
            <p className="mt-1 text-sm text-zinc-500">En operación ahora</p>
          </article>
          <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
              Cabezas en pie
            </p>
            <p
              className="mt-3 font-display text-4xl tracking-tight text-white"
              aria-live="polite"
            >
              {cargandoResumen ? "—" : resumen.cabezasEnPie}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Cabezas registradas</p>
          </article>
          <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
              Peso promedio en pie
            </p>
            <p
              className="mt-3 font-display text-4xl tracking-tight text-white"
              aria-live="polite"
            >
              {cargandoResumen || resumen.pesoPromedioEnPie === null
                ? "—"
                : `${resumen.pesoPromedioEnPie} kg`}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Kilogramos por animal</p>
          </article>
          <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
              Split promedio
            </p>
            <p
              className="mt-3 font-display text-4xl tracking-tight text-white"
              aria-live="polite"
            >
              {cargandoResumen ? "—" : (splitPromedio ?? "—")}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Comerciante / tercero</p>
          </article>
        </div>

        <div className="flex flex-col gap-4">
          <div
            role="group"
            aria-label="Filtrar por estado"
            className="flex flex-wrap gap-2"
          >
            {OPCIONES_ESTADO.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                aria-pressed={filtro === opcion.valor}
                onClick={() => alCambiarFiltro(opcion.valor)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:outline-none",
                  filtro === opcion.valor
                    ? "border-elinain-gold/40 bg-elinain-gold/15 text-elinain-gold"
                    : "border-white/8 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <span>{opcion.etiqueta}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    filtro === opcion.valor
                      ? "bg-elinain-gold/20 text-elinain-gold"
                      : "bg-white/[0.06] text-zinc-400",
                  )}
                >
                  {conteos[opcion.valor]}
                </span>
              </button>
            ))}
          </div>

          {consulta.error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
            >
              {mensajeErrorListarContratos(consulta.error.status)}
            </p>
          ) : null}

          <Table
            columnas={columnas}
            filas={visibles}
            obtenerClave={(contrato) => contrato.id}
            cargando={consulta.isPending}
            mensajeVacio="No hay contratos que coincidan con el filtro"
            paginacion={paginacionTabla}
            tema="oscuro"
            paddingFilas="py-6"
          />
        </div>
      </div>
    </section>
  );
}
