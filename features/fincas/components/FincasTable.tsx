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

/** Estilos de un enlace que se comporta visualmente como botón secundario. */
const ESTILOS_ENLACE_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none";

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
 * claves del feature y el listado se refresca sin recargar la página.
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
    { clave: "nombre", encabezado: "Nombre", render: (finca) => finca.nombre },
    {
      clave: "direccion",
      encabezado: "Dirección",
      render: (finca) => finca.direccion,
    },
    {
      clave: "propietario",
      encabezado: "Propietario",
      render: (finca) =>
        nombreDePropietario(propietariosPorId, finca.tercero_id),
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alineacion: "derecha",
      render: (finca) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/fincas/${finca.id}/editar`}
            className={ESTILOS_ENLACE_SECUNDARIO}
            aria-label={`Editar ${finca.nombre}`}
          >
            Editar
          </Link>
          <Button
            variante="peligro"
            onClick={() => abrirEliminar(finca)}
            aria-label={`Eliminar ${finca.nombre}`}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link href="/fincas/nueva" className={ESTILOS_ENLACE_SECUNDARIO}>
          Nueva finca
        </Link>
      </div>

      {consulta.error ? (
        <p role="alert" className="text-sm text-red-600">
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
