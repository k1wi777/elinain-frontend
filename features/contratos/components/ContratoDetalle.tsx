"use client";

import Link from "next/link";

import { formatearFechaHora } from "@/shared/lib/fechas";
import { useContrato } from "@/features/contratos/hooks/useContrato";
import { mensajeErrorDetalleContrato } from "@/features/contratos/mensajes-error";
import { formatearParticipacion } from "@/features/contratos/participacion";
import {
  indexarNombres,
  nombreDeFinca,
  nombreDeTercero,
} from "@/features/contratos/relaciones";
import type {
  EstadoContrato,
  FincaContrato,
  TerceroContrato,
} from "@/features/contratos/types";

/** Etiquetas visibles de cada estado del contrato. */
const ETIQUETAS_ESTADO: Record<EstadoContrato, string> = {
  activo: "Activo",
  cerrado: "Cerrado",
};

/** Formato numérico local para cantidades y pesos del backend. */
const FORMATO_NUMERO = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 1,
});

/** Formato de moneda local para el valor base de referencia. */
const FORMATO_MONEDA = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Estilos del enlace de retorno al listado. */
const ESTILOS_VOLVER =
  "inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:outline-none";

/** Estilos de la única acción del detalle: editar el contrato. */
const ESTILOS_EDITAR =
  "inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-elinain-gold/40 bg-elinain-gold/15 px-5 py-3 text-sm font-semibold text-elinain-gold transition-colors hover:bg-elinain-gold/25 focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto";

/** Props del componente `ContratoDetalle`. */
type Props = {
  /** Identificador del contrato a mostrar. */
  id: string;
  /** Terceros para resolver el nombre; los compone `app/`. */
  terceros: TerceroContrato[];
  /** Fincas para resolver el nombre; las compone `app/`. */
  fincas: FincaContrato[];
};

/** Muestra un valor o `—` cuando no está informado. */
function textoODefecto(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) {
    return "—";
  }

  if (typeof valor === "string") {
    return valor.trim() === "" ? "—" : valor;
  }

  return String(valor);
}

/** Presenta el valor base por kilo o `—` cuando no está informado. */
function formatearValorKilo(valor: number | null | undefined): string {
  return valor === null || valor === undefined
    ? "—"
    : `${FORMATO_MONEDA.format(valor)} / kg`;
}

/** Presenta un peso en kilos o `—` cuando no está informado. */
function formatearKilos(valor: number | null | undefined): string {
  return valor === null || valor === undefined
    ? "—"
    : `${FORMATO_NUMERO.format(valor)} kg`;
}

/** Presenta una cantidad de cabezas o `—` cuando no está informada. */
function formatearCabezas(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? "—" : `${valor} cabezas`;
}

/** Dato de la ficha técnica del contrato. */
function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
        {etiqueta}
      </dt>
      <dd className="mt-1 text-sm text-zinc-200">{valor}</dd>
    </div>
  );
}

/**
 * Vista de detalle de un contrato.
 *
 * Presenta el encabezado oscuro con el código, la participación y el estado, y una ficha
 * técnica con los campos reales de `ContratoRespuestaDto` más los nombres de tercero y
 * finca resueltos con las proyecciones que compone `app/`. Indica con `—` los valores no
 * informados y ofrece la única acción de editar.
 */
export function ContratoDetalle({ id, terceros, fincas }: Props) {
  const consulta = useContrato(id);

  if (consulta.isPending) {
    return <p className="w-full text-sm text-zinc-400">Cargando contrato…</p>;
  }

  if (consulta.error) {
    return (
      <p
        role="alert"
        className="w-full rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
      >
        {mensajeErrorDetalleContrato(consulta.error.status)}
      </p>
    );
  }

  const contrato = consulta.data;
  const tercerosPorId = indexarNombres(terceros);
  const fincasPorId = indexarNombres(fincas);
  const nombreTercero = nombreDeTercero(tercerosPorId, contrato.tercero_id);
  const nombreFinca = nombreDeFinca(fincasPorId, contrato.finca_id);
  const apertura = formatearFechaHora(contrato.fecha_apertura) || "—";
  const cierre = contrato.fecha_cierre
    ? formatearFechaHora(contrato.fecha_cierre) || "—"
    : "—";
  const vigencia = contrato.fecha_cierre ? `${apertura} – ${cierre}` : apertura;
  const partesSubtitulo = [
    nombreFinca,
    contrato.raza && contrato.raza.trim() !== "" ? contrato.raza : null,
    vigencia,
  ].filter((parte): parte is string => parte !== null);

  return (
    <section className="flex w-full flex-col gap-8">
      <Link href="/contratos" className={ESTILOS_VOLVER}>
        <span aria-hidden>←</span>
        <span>Volver a Contratos</span>
      </Link>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-elinain-gold uppercase">
            Participación y engorde
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Detalle del contrato
            </h1>
            <span className="max-w-[12rem] truncate rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 font-mono text-xs text-zinc-400">
              {contrato.id}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-elinain-gold/30 bg-elinain-gold/10 px-3 py-1 text-xs font-medium text-elinain-gold">
              Reparto {formatearParticipacion(contrato)}
            </span>
            <span
              className={
                contrato.estado === "activo"
                  ? "inline-flex items-center rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300"
                  : "inline-flex items-center rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-zinc-400"
              }
            >
              {ETIQUETAS_ESTADO[contrato.estado]}
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            {partesSubtitulo.join(" · ")}
          </p>
        </div>

        <Link
          href={`/contratos/${contrato.id}/editar`}
          className={ESTILOS_EDITAR}
        >
          Editar contrato
        </Link>
      </header>

      <div className="rounded-2xl px-5 py-6 glass-panel sm:px-8 sm:py-7">
        <h2 className="text-xs font-semibold tracking-[0.24em] text-elinain-gold uppercase">
          Ficha técnica &amp; balance de custodia
        </h2>

        <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Dato etiqueta="Socio de participación" valor={nombreTercero} />
          <Dato etiqueta="Finca / Predio" valor={nombreFinca} />
          <Dato etiqueta="Raza" valor={textoODefecto(contrato.raza)} />
          <Dato etiqueta="Fecha de apertura" valor={apertura} />
          <Dato etiqueta="Fecha de cierre" valor={cierre} />
          <Dato
            etiqueta="Valor base de referencia"
            valor={formatearValorKilo(contrato.valor_kilo_referencia)}
          />
          <Dato
            etiqueta="Inventario actual"
            valor={formatearCabezas(contrato.cantidad_actual)}
          />
          <Dato
            etiqueta="Biomasa promedio actual"
            valor={formatearKilos(contrato.peso_promedio_actual)}
          />

          <div>
            <dt className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
              Régimen de reparto
            </dt>
            <dd className="mt-1 flex flex-col gap-2">
              <span className="text-sm text-zinc-200">
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
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
