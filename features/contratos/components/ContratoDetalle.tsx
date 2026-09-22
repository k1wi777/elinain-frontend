"use client";

import Link from "next/link";

import { formatearFechaHora } from "@/features/contratos/fechas";
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

/** Estilos de un enlace que se comporta visualmente como botón secundario. */
const ESTILOS_ENLACE_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none";

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

/** Fila de dato del detalle. */
function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="font-medium text-zinc-600">{etiqueta}</dt>
      <dd className="text-zinc-900">{valor}</dd>
    </div>
  );
}

/**
 * Vista de detalle de un contrato.
 *
 * Muestra todos los datos del contrato resolviendo los nombres de tercero y finca con
 * las proyecciones que compone `app/`, indica con `—` los valores no informados, incluye
 * un placeholder de las secciones que llegarán con el backend (compras, ventas, ciclos y
 * costos) y ofrece la acción de editar.
 */
export function ContratoDetalle({ id, terceros, fincas }: Props) {
  const consulta = useContrato(id);

  if (consulta.isPending) {
    return (
      <p className="mx-auto w-full max-w-2xl text-sm text-zinc-500">
        Cargando contrato…
      </p>
    );
  }

  if (consulta.error) {
    return (
      <p role="alert" className="mx-auto w-full max-w-2xl text-sm text-red-600">
        {mensajeErrorDetalleContrato(consulta.error.status)}
      </p>
    );
  }

  const contrato = consulta.data;
  const tercerosPorId = indexarNombres(terceros);
  const fincasPorId = indexarNombres(fincas);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Detalle del contrato
          </h1>
          <p className="text-sm text-zinc-600">
            Participación {formatearParticipacion(contrato)} ·{" "}
            {ETIQUETAS_ESTADO[contrato.estado]}
          </p>
        </div>
        <Link
          href={`/contratos/${contrato.id}/editar`}
          className={ESTILOS_ENLACE_SECUNDARIO}
        >
          Editar
        </Link>
      </div>

      <dl className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-6 text-sm">
        <Dato
          etiqueta="Socio de participación"
          valor={nombreDeTercero(tercerosPorId, contrato.tercero_id)}
        />
        <Dato
          etiqueta="Finca"
          valor={nombreDeFinca(fincasPorId, contrato.finca_id)}
        />
        <Dato
          etiqueta="Fecha de apertura"
          valor={textoODefecto(formatearFechaHora(contrato.fecha_apertura))}
        />
        <Dato etiqueta="Estado" valor={ETIQUETAS_ESTADO[contrato.estado]} />
        <Dato
          etiqueta="Fecha de cierre"
          valor={textoODefecto(formatearFechaHora(contrato.fecha_cierre ?? ""))}
        />
        <Dato
          etiqueta="Participación (comerciante / tercero)"
          valor={formatearParticipacion(contrato)}
        />
        <Dato etiqueta="Raza" valor={textoODefecto(contrato.raza)} />
        <Dato
          etiqueta="Peso promedio actual"
          valor={
            contrato.peso_promedio_actual === null ||
            contrato.peso_promedio_actual === undefined
              ? "—"
              : `${contrato.peso_promedio_actual} kg`
          }
        />
        <Dato
          etiqueta="Cantidad actual"
          valor={textoODefecto(contrato.cantidad_actual)}
        />
        <Dato
          etiqueta="Valor por kilo de referencia"
          valor={textoODefecto(contrato.valor_kilo_referencia)}
        />
      </dl>

      <section
        aria-label="Secciones futuras del contrato"
        className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500"
      >
        Próximamente: compras, ventas, ciclos y costos.
      </section>
    </section>
  );
}
