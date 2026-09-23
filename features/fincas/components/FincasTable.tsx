"use client";

import { useState } from "react";
import Link from "next/link";

import {
  calcularPagina,
  calcularTotalPaginas,
  normalizarPagina,
} from "@/shared/api/pagination";
import { usePagination } from "@/shared/api/usePagination";
import {
  Button,
  Table,
  Toast,
  type ColumnaTabla,
  type PaginacionTabla,
} from "@/shared/ui";
import { EliminarFincaModal } from "@/features/fincas/components/EliminarFincaModal";
import { useEliminarFinca } from "@/features/fincas/hooks/useEliminarFinca";
import { useFincas } from "@/features/fincas/hooks/useFincas";
import {
  mensajeErrorEliminarFinca,
  mensajeErrorListarFincas,
} from "@/features/fincas/mensajes-error";
import {
  indexarPropietarios,
  nombreDePropietario,
} from "@/features/fincas/propietarios";
import type { Finca, Propietario } from "@/features/fincas/types";

/**
 * Total provisional con el que se inicializa `usePagination`.
 *
 * El total real solo se conoce cuando responde la consulta, y el hook debe invocarse antes
 * de consultar para aportar `limite`/`offset`. Al desconocer el total, los campos
 * derivados se recalculan en render con `calcularTotalPaginas`, `calcularPagina` y
 * `normalizarPagina`.
 */
const TOTAL_PROVISIONAL = Number.MAX_SAFE_INTEGER;

/** Estilos del enlace "Editar", alineados con las acciones de socios de participación. */
const ESTILOS_ENLACE_EDITAR =
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

/** Props del componente `FincasTable`. */
type Props = {
  /** Propietarios para resolver el nombre por `tercero_id`; los compone `app/`. */
  propietarios: Propietario[];
};

/**
 * Listado paginado de fincas con acciones de edición y borrado.
 *
 * Consume la consulta paginada, resuelve el nombre del propietario a partir de la lista que
 * compone `app/` y compone el modal de confirmación. Al eliminar, la mutación invalida las
 * claves del feature y el listado se refresca sin recargar la página. El resumen muestra
 * solo información real disponible: el total de fincas y las filas visibles en la página.
 */
export function FincasTable({ propietarios }: Props) {
  const paginacion = usePagination({ total: TOTAL_PROVISIONAL });
  const { limite, offset } = paginacion;

  const consulta = useFincas({ limite, offset });
  const filas = consulta.data?.elementos ?? [];
  const total = consulta.data?.total ?? 0;

  const totalPaginas = calcularTotalPaginas(total, limite);
  const paginaActual = normalizarPagina(
    calcularPagina(offset, limite),
    totalPaginas,
  );

  const paginacionTabla: PaginacionTabla = {
    paginaActual,
    totalPaginas,
    total,
    limite,
    hayPaginaAnterior: offset > 0,
    hayPaginaSiguiente: paginaActual < totalPaginas,
    irAPaginaAnterior: paginacion.irAPaginaAnterior,
    irAPaginaSiguiente: paginacion.irAPaginaSiguiente,
  };

  const [fincaAEliminar, setFincaAEliminar] = useState<Finca | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const eliminar = useEliminarFinca();
  const propietariosPorId = indexarPropietarios(propietarios);

  const abrirEliminar = (finca: Finca) => {
    eliminar.reset();
    setFincaAEliminar(finca);
  };

  const cerrarEliminar = () => {
    setFincaAEliminar(null);
    eliminar.reset();
  };

  const handleEliminar = async () => {
    if (!fincaAEliminar) {
      return;
    }

    const eraUnicaFilaDePagina = filas.length === 1 && paginaActual > 1;

    try {
      await eliminar.mutateAsync(fincaAEliminar.id);
      setMensajeExito("Finca eliminada.");
      cerrarEliminar();

      if (eraUnicaFilaDePagina) {
        paginacion.irAPaginaAnterior();
      }
    } catch {
      // El error de la mutación se muestra dentro del modal.
    }
  };

  const columnas: ColumnaTabla<Finca>[] = [
    {
      clave: "nombre",
      encabezado: "Nombre",
      render: (finca) => (
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-elinain-gold"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-5">
              <path
                d="m12 8 6-3-6-3v10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m6.49 12.85 11.02 6.3M17.51 12.85 6.5 19.15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-white">
              {finca.nombre}
            </span>
            <span className="max-w-[16rem] truncate text-xs text-zinc-500">
              ID: {finca.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      clave: "direccion",
      encabezado: "Dirección",
      render: (finca) => (
        <div className="flex items-start gap-2">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="mt-0.5 size-4 shrink-0 text-zinc-500"
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
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-zinc-300">{finca.direccion}</span>
            <span className="truncate text-xs text-zinc-500">
              {finca.latitud}, {finca.longitud}
            </span>
          </div>
        </div>
      ),
    },
    {
      clave: "propietario",
      encabezado: "Propietario",
      render: (finca) => {
        const nombre = nombreDePropietario(propietariosPorId, finca.tercero_id);

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
      clave: "acciones",
      encabezado: "Acciones",
      alineacion: "derecha",
      render: (finca) => (
        <div className="flex shrink-0 justify-end gap-2">
          <Link
            href={`/fincas/${finca.id}/editar`}
            className={ESTILOS_ENLACE_EDITAR}
            aria-label={`Editar ${finca.nombre}`}
          >
            Editar
          </Link>
          <Button
            variante="peligro"
            onClick={() => abrirEliminar(finca)}
            aria-label={`Eliminar ${finca.nombre}`}
            className="bg-red-400/10 px-3 text-xs whitespace-nowrap text-red-200 hover:bg-red-400/20 focus-visible:ring-red-300"
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            Total de fincas
          </p>
          <p
            className="mt-3 font-display text-4xl tracking-tight text-elinain-gold"
            aria-live="polite"
          >
            {consulta.isPending || consulta.error ? "—" : total}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Fincas registradas</p>
        </article>
        <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            En esta página
          </p>
          <p
            className="mt-3 font-display text-4xl tracking-tight text-white"
            aria-live="polite"
          >
            {consulta.isPending || consulta.error ? "—" : filas.length}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Filas visibles ahora</p>
        </article>
      </div>

      {consulta.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
        >
          {mensajeErrorListarFincas(consulta.error.status)}
        </p>
      ) : null}

      <Table
        columnas={columnas}
        filas={filas}
        obtenerClave={(finca) => finca.id}
        cargando={consulta.isPending}
        mensajeVacio="Aún no tienes fincas registradas"
        paginacion={paginacionTabla}
        tema="oscuro"
        paddingFilas="py-6"
      />

      <EliminarFincaModal
        abierto={fincaAEliminar !== null}
        finca={fincaAEliminar}
        enviando={eliminar.isPending}
        mensajeError={
          eliminar.error
            ? mensajeErrorEliminarFinca(eliminar.error.status)
            : null
        }
        onConfirmar={handleEliminar}
        onCerrar={cerrarEliminar}
      />

      <Toast
        abierto={mensajeExito !== null}
        mensaje={mensajeExito ?? ""}
        onCerrar={() => setMensajeExito(null)}
      />
    </section>
  );
}
