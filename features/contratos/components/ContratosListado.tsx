"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";

import { usePagination } from "@/shared/api/usePagination";
import { formatearFechaHora } from "@/shared/lib/fechas";
import {
  Select,
  Table,
  type ColumnaTabla,
  type PaginacionTabla,
} from "@/shared/ui";
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
const OPCIONES_ESTADO = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "activo", etiqueta: "Activos" },
  { valor: "cerrado", etiqueta: "Cerrados" },
];

/** Estilos de un enlace que se comporta visualmente como botón secundario. */
const ESTILOS_ENLACE_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none";

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

  const alCambiarFiltro = (evento: ChangeEvent<HTMLSelectElement>) => {
    setFiltro(evento.target.value as EstadoFiltroContrato);
    paginacion.reiniciar();
  };

  const columnas: ColumnaTabla<Contrato>[] = [
    {
      clave: "fecha_apertura",
      encabezado: "Fecha de apertura",
      render: (contrato) => formatearFechaHora(contrato.fecha_apertura) || "—",
    },
    {
      clave: "tercero",
      encabezado: "Tercero",
      render: (contrato) => nombreDeTercero(tercerosPorId, contrato.tercero_id),
    },
    {
      clave: "finca",
      encabezado: "Finca",
      render: (contrato) => nombreDeFinca(fincasPorId, contrato.finca_id),
    },
    {
      clave: "estado",
      encabezado: "Estado",
      render: (contrato) => ETIQUETAS_ESTADO[contrato.estado],
    },
    {
      clave: "participacion",
      encabezado: "Participación",
      render: (contrato) => formatearParticipacion(contrato),
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alineacion: "derecha",
      render: (contrato) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/contratos/${contrato.id}`}
            className={ESTILOS_ENLACE_SECUNDARIO}
            aria-label={`Ver detalle del contrato ${contrato.id}`}
          >
            Ver detalle
          </Link>
          <Link
            href={`/contratos/${contrato.id}/editar`}
            className={ESTILOS_ENLACE_SECUNDARIO}
            aria-label={`Editar el contrato ${contrato.id}`}
          >
            Editar
          </Link>
        </div>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-xs">
          <Select
            label="Filtrar por estado"
            opciones={OPCIONES_ESTADO}
            value={filtro}
            onChange={alCambiarFiltro}
          />
        </div>
        <Link href="/contratos/nuevo" className={ESTILOS_ENLACE_SECUNDARIO}>
          Nuevo contrato
        </Link>
      </div>

      {consulta.error ? (
        <p role="alert" className="text-sm text-red-600">
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
      />
    </section>
  );
}
