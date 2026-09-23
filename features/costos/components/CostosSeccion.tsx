"use client";

import { useState } from "react";

import {
  calcularPagina,
  calcularTotalPaginas,
  normalizarPagina,
} from "@/shared/api/pagination";
import { usePagination } from "@/shared/api/usePagination";
import { fechaDiaAIso, formatearFechaDia } from "@/shared/lib/fechas";
import {
  Button,
  Table,
  Toast,
  type ColumnaTabla,
  type PaginacionTabla,
} from "@/shared/ui";
import { CostoFormModal } from "@/features/costos/components/CostoFormModal";
import { EliminarCostoModal } from "@/features/costos/components/EliminarCostoModal";
import { useActualizarCosto } from "@/features/costos/hooks/useActualizarCosto";
import { useCostos } from "@/features/costos/hooks/useCostos";
import { useCrearCosto } from "@/features/costos/hooks/useCrearCosto";
import { useEliminarCosto } from "@/features/costos/hooks/useEliminarCosto";
import {
  mensajeErrorCrearCosto,
  mensajeErrorEditarCosto,
  mensajeErrorEliminarCosto,
  mensajeErrorListarCostos,
} from "@/features/costos/mensajes-error";
import type { DatosFormularioCosto } from "@/features/costos/schemas";
import type {
  ActualizarCosto,
  Costo,
  CrearCosto,
} from "@/features/costos/types";

/**
 * Total provisional con el que se inicializa `usePagination`.
 *
 * El total real solo se conoce cuando responde la consulta, y el hook debe invocarse antes
 * de consultar para aportar `limite`/`offset`. Al desconocer el total, los campos derivados
 * se recalculan en render con `calcularTotalPaginas`, `calcularPagina` y
 * `normalizarPagina`.
 */
const TOTAL_PROVISIONAL = Number.MAX_SAFE_INTEGER;

/** Formato de moneda local para presentar el monto de cada costo. */
const FORMATO_MONEDA = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Texto con el que se presenta un valor no informado. */
const SIN_INFORMAR = "—";

/** Props del componente `CostosSeccion`. */
type Props = {
  /** Identificador del contrato cuyos costos se gestionan. */
  contratoId: string;
  /**
   * Estado del contrato; cuando es `cerrado` se deshabilita el registro. Editar y eliminar
   * permanecen disponibles.
   */
  contratoEstado?: "activo" | "cerrado";
  /**
   * Notifica que un costo cambió (registrado, actualizado o eliminado) para que quien
   * componga la sección refresque datos derivados, como los del contrato.
   */
  onCambio?: () => void;
};

/**
 * Sección de costos informativos de un contrato.
 *
 * Compone el listado paginado y filtrado por contrato, el registro y la edición en diálogo
 * y la eliminación con confirmación previa. Recuerda de forma visible que los costos no
 * afectan el cálculo de la utilidad real. El registro solo se habilita con el contrato
 * activo; editar y eliminar están siempre disponibles y sus errores se traducen a mensajes
 * en español sin cerrar el diálogo.
 */
export function CostosSeccion({ contratoId, contratoEstado, onCambio }: Props) {
  const paginacion = usePagination({ total: TOTAL_PROVISIONAL });
  const { limite, offset } = paginacion;

  const consulta = useCostos({ limite, offset, contrato_id: contratoId });
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

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [costoEnEdicion, setCostoEnEdicion] = useState<Costo | null>(null);
  const [costoAEliminar, setCostoAEliminar] = useState<Costo | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const crear = useCrearCosto();
  const actualizar = useActualizarCosto();
  const eliminar = useEliminarCosto();

  const guardando = crear.isPending || actualizar.isPending;
  const errorGuardar = crear.error ?? actualizar.error;
  const registroDeshabilitado = contratoEstado === "cerrado";

  const mensajeErrorFormulario = errorGuardar
    ? costoEnEdicion
      ? mensajeErrorEditarCosto(errorGuardar.status)
      : mensajeErrorCrearCosto(errorGuardar.status)
    : null;

  const abrirCrear = () => {
    crear.reset();
    actualizar.reset();
    setCostoEnEdicion(null);
    setFormularioAbierto(true);
  };

  const abrirEditar = (costo: Costo) => {
    crear.reset();
    actualizar.reset();
    setCostoEnEdicion(costo);
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setCostoEnEdicion(null);
    crear.reset();
    actualizar.reset();
  };

  const handleGuardar = async (datos: DatosFormularioCosto) => {
    const fecha = fechaDiaAIso(datos.fecha);

    try {
      if (costoEnEdicion) {
        const actualizables: ActualizarCosto = {
          tipo: datos.tipo,
          monto: datos.monto,
          fecha,
          descripcion: datos.descripcion,
        };

        await actualizar.mutateAsync({
          id: costoEnEdicion.id,
          datos: actualizables,
        });
        setMensajeExito("Costo actualizado.");
      } else {
        const nuevo: CrearCosto = {
          contrato_id: contratoId,
          tipo: datos.tipo,
          monto: datos.monto,
          fecha,
          descripcion: datos.descripcion,
        };

        await crear.mutateAsync(nuevo);
        setMensajeExito("Costo registrado.");
      }

      cerrarFormulario();
      onCambio?.();
    } catch {
      // El error de la mutación se muestra dentro del formulario.
    }
  };

  const abrirEliminar = (costo: Costo) => {
    eliminar.reset();
    setCostoAEliminar(costo);
  };

  const cerrarEliminar = () => {
    setCostoAEliminar(null);
    eliminar.reset();
  };

  const handleEliminar = async () => {
    if (!costoAEliminar) {
      return;
    }

    const eraUnicaFilaDePagina = filas.length === 1 && paginaActual > 1;

    try {
      await eliminar.mutateAsync(costoAEliminar.id);
      setMensajeExito("Costo eliminado.");
      cerrarEliminar();
      onCambio?.();

      if (eraUnicaFilaDePagina) {
        paginacion.irAPaginaAnterior();
      }
    } catch {
      // El error de la mutación se muestra dentro del modal.
    }
  };

  const columnas: ColumnaTabla<Costo>[] = [
    {
      clave: "fecha",
      encabezado: "Fecha",
      render: (costo) => formatearFechaDia(costo.fecha) || SIN_INFORMAR,
    },
    {
      clave: "tipo",
      encabezado: "Tipo",
      render: (costo) => (costo.tipo.trim() !== "" ? costo.tipo : SIN_INFORMAR),
    },
    {
      clave: "monto",
      encabezado: "Monto",
      render: (costo) => FORMATO_MONEDA.format(costo.monto),
    },
    {
      clave: "descripcion",
      encabezado: "Descripción",
      render: (costo) =>
        costo.descripcion.trim() !== "" ? costo.descripcion : SIN_INFORMAR,
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alineacion: "derecha",
      render: (costo) => (
        <div className="flex justify-end gap-2">
          <Button
            variante="secundario"
            onClick={() => abrirEditar(costo)}
            aria-label={`Editar el costo «${costo.tipo}» del ${formatearFechaDia(costo.fecha) || "fecha no informada"}`}
          >
            Editar
          </Button>
          <Button
            variante="peligro"
            onClick={() => abrirEliminar(costo)}
            aria-label={`Eliminar el costo «${costo.tipo}» del ${formatearFechaDia(costo.fecha) || "fecha no informada"}`}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section aria-label="Costos del contrato" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900">Costos</h2>
        <Button onClick={abrirCrear} disabled={registroDeshabilitado}>
          Agregar costo
        </Button>
      </div>

      <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Los costos son informativos y no afectan el cálculo de la utilidad real.
      </p>

      {registroDeshabilitado ? (
        <p className="text-sm text-zinc-500">
          El contrato está cerrado: no se pueden registrar costos nuevos.
        </p>
      ) : null}

      {consulta.error ? (
        <p role="alert" className="text-sm text-red-600">
          {mensajeErrorListarCostos(consulta.error.status)}
        </p>
      ) : null}

      <Table
        columnas={columnas}
        filas={filas}
        obtenerClave={(costo) => costo.id}
        cargando={consulta.isPending}
        mensajeVacio="Aún no hay costos registrados en este contrato"
        paginacion={paginacionTabla}
      />

      <CostoFormModal
        abierto={formularioAbierto}
        modo={costoEnEdicion ? "editar" : "crear"}
        costo={costoEnEdicion ?? undefined}
        enviando={guardando}
        mensajeError={mensajeErrorFormulario}
        onGuardar={handleGuardar}
        onCerrar={cerrarFormulario}
      />

      <EliminarCostoModal
        abierto={costoAEliminar !== null}
        costo={costoAEliminar}
        enviando={eliminar.isPending}
        mensajeError={
          eliminar.error
            ? mensajeErrorEliminarCosto(eliminar.error.status)
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
