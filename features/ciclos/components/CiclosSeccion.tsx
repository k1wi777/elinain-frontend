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
import { CicloFormModal } from "@/features/ciclos/components/CicloFormModal";
import { EliminarCicloModal } from "@/features/ciclos/components/EliminarCicloModal";
import { useActualizarCiclo } from "@/features/ciclos/hooks/useActualizarCiclo";
import { useCiclos } from "@/features/ciclos/hooks/useCiclos";
import { useCrearCiclo } from "@/features/ciclos/hooks/useCrearCiclo";
import { useEliminarCiclo } from "@/features/ciclos/hooks/useEliminarCiclo";
import {
  mensajeErrorEliminarCiclo,
  mensajeErrorGuardarCiclo,
  mensajeErrorListarCiclos,
} from "@/features/ciclos/mensajes-error";
import type { DatosFormularioCiclo } from "@/features/ciclos/schemas";
import type {
  ActualizarCiclo,
  Ciclo,
  CrearCiclo,
} from "@/features/ciclos/types";

/**
 * Total provisional con el que se inicializa `usePagination`.
 *
 * El total real solo se conoce cuando responde la consulta, y el hook debe invocarse antes
 * de consultar para aportar `limite`/`offset`. Al desconocer el total, los campos derivados
 * se recalculan en render con `calcularTotalPaginas`, `calcularPagina` y
 * `normalizarPagina`.
 */
const TOTAL_PROVISIONAL = Number.MAX_SAFE_INTEGER;

/** Formato numérico local para presentar el peso observado del backend. */
const FORMATO_NUMERO = new Intl.NumberFormat("es-CO");

/** Texto con el que se presenta un valor no informado. */
const SIN_INFORMAR = "—";

/** Props del componente `CiclosSeccion`. */
type Props = {
  /** Identificador del contrato cuyos ciclos se gestionan. */
  contratoId: string;
  /**
   * Estado del contrato; cuando es `cerrado` se deshabilita el registro. Editar y eliminar
   * permanecen disponibles.
   */
  contratoEstado?: "activo" | "cerrado";
  /**
   * Notifica que un ciclo cambió (registrado, actualizado o eliminado) para que quien
   * componga la sección refresque datos derivados, como los del contrato.
   */
  onCambio?: () => void;
};

/**
 * Sección de ciclos de un contrato.
 *
 * Compone el listado paginado y filtrado por contrato, el registro y la edición en diálogo
 * y la eliminación con confirmación previa. El registro solo se habilita con el contrato
 * activo; editar y eliminar están siempre disponibles y sus errores se traducen a mensajes
 * en español sin cerrar el diálogo.
 */
export function CiclosSeccion({ contratoId, contratoEstado, onCambio }: Props) {
  const paginacion = usePagination({ total: TOTAL_PROVISIONAL });
  const { limite, offset } = paginacion;

  const consulta = useCiclos({ limite, offset, contrato_id: contratoId });
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
  const [cicloEnEdicion, setCicloEnEdicion] = useState<Ciclo | null>(null);
  const [cicloAEliminar, setCicloAEliminar] = useState<Ciclo | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const crear = useCrearCiclo();
  const actualizar = useActualizarCiclo();
  const eliminar = useEliminarCiclo();

  const guardando = crear.isPending || actualizar.isPending;
  const errorGuardar = crear.error ?? actualizar.error;
  const registroDeshabilitado = contratoEstado === "cerrado";

  const abrirCrear = () => {
    crear.reset();
    actualizar.reset();
    setCicloEnEdicion(null);
    setFormularioAbierto(true);
  };

  const abrirEditar = (ciclo: Ciclo) => {
    crear.reset();
    actualizar.reset();
    setCicloEnEdicion(ciclo);
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setCicloEnEdicion(null);
    crear.reset();
    actualizar.reset();
  };

  const handleGuardar = async (datos: DatosFormularioCiclo) => {
    const fecha = fechaDiaAIso(datos.fecha);
    const notas = datos.notas && datos.notas.trim() !== "" ? datos.notas : null;

    try {
      if (cicloEnEdicion) {
        const actualizables: ActualizarCiclo = { fecha, notas };

        if (datos.peso_observado !== undefined) {
          actualizables.peso_observado = datos.peso_observado;
        }

        await actualizar.mutateAsync({
          id: cicloEnEdicion.id,
          datos: actualizables,
        });
        setMensajeExito("Ciclo actualizado.");
      } else {
        const nuevo: CrearCiclo = { contrato_id: contratoId, fecha, notas };

        if (datos.peso_observado !== undefined) {
          nuevo.peso_observado = datos.peso_observado;
        }

        await crear.mutateAsync(nuevo);
        setMensajeExito("Ciclo registrado.");
      }

      cerrarFormulario();
      onCambio?.();
    } catch {
      // El error de la mutación se muestra dentro del formulario.
    }
  };

  const abrirEliminar = (ciclo: Ciclo) => {
    eliminar.reset();
    setCicloAEliminar(ciclo);
  };

  const cerrarEliminar = () => {
    setCicloAEliminar(null);
    eliminar.reset();
  };

  const handleEliminar = async () => {
    if (!cicloAEliminar) {
      return;
    }

    const eraUnicaFilaDePagina = filas.length === 1 && paginaActual > 1;

    try {
      await eliminar.mutateAsync(cicloAEliminar.id);
      setMensajeExito("Ciclo eliminado.");
      cerrarEliminar();
      onCambio?.();

      if (eraUnicaFilaDePagina) {
        paginacion.irAPaginaAnterior();
      }
    } catch {
      // El error de la mutación se muestra dentro del modal.
    }
  };

  const columnas: ColumnaTabla<Ciclo>[] = [
    {
      clave: "fecha",
      encabezado: "Fecha",
      render: (ciclo) => formatearFechaDia(ciclo.fecha) || SIN_INFORMAR,
    },
    {
      clave: "peso_observado",
      encabezado: "Peso observado",
      render: (ciclo) =>
        typeof ciclo.peso_observado === "number"
          ? `${FORMATO_NUMERO.format(ciclo.peso_observado)} kg`
          : SIN_INFORMAR,
    },
    {
      clave: "notas",
      encabezado: "Notas",
      render: (ciclo) =>
        ciclo.notas && ciclo.notas.trim() !== "" ? ciclo.notas : SIN_INFORMAR,
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alineacion: "derecha",
      render: (ciclo) => (
        <div className="flex justify-end gap-2">
          <Button
            variante="secundario"
            onClick={() => abrirEditar(ciclo)}
            aria-label={`Editar el ciclo del ${formatearFechaDia(ciclo.fecha) || "fecha no informada"}`}
          >
            Editar
          </Button>
          <Button
            variante="peligro"
            onClick={() => abrirEliminar(ciclo)}
            aria-label={`Eliminar el ciclo del ${formatearFechaDia(ciclo.fecha) || "fecha no informada"}`}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section aria-label="Ciclos del contrato" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900">Ciclos</h2>
        <Button onClick={abrirCrear} disabled={registroDeshabilitado}>
          Registrar ciclo
        </Button>
      </div>

      {registroDeshabilitado ? (
        <p className="text-sm text-zinc-500">
          El contrato está cerrado: no se pueden registrar ciclos nuevos.
        </p>
      ) : null}

      {consulta.error ? (
        <p role="alert" className="text-sm text-red-600">
          {mensajeErrorListarCiclos(consulta.error.status)}
        </p>
      ) : null}

      <Table
        columnas={columnas}
        filas={filas}
        obtenerClave={(ciclo) => ciclo.id}
        cargando={consulta.isPending}
        mensajeVacio="Aún no hay ciclos registrados en este contrato"
        paginacion={paginacionTabla}
      />

      <CicloFormModal
        abierto={formularioAbierto}
        modo={cicloEnEdicion ? "editar" : "crear"}
        ciclo={cicloEnEdicion ?? undefined}
        enviando={guardando}
        mensajeError={
          errorGuardar ? mensajeErrorGuardarCiclo(errorGuardar.status) : null
        }
        onGuardar={handleGuardar}
        onCerrar={cerrarFormulario}
      />

      <EliminarCicloModal
        abierto={cicloAEliminar !== null}
        ciclo={cicloAEliminar}
        enviando={eliminar.isPending}
        mensajeError={
          eliminar.error
            ? mensajeErrorEliminarCiclo(eliminar.error.status)
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
