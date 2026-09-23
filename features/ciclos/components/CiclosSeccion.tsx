"use client";

import { useEffect, useState } from "react";

import {
  calcularPagina,
  calcularTotalPaginas,
  normalizarPagina,
} from "@/shared/api/pagination";
import { usePagination } from "@/shared/api/usePagination";
import { cn } from "@/shared/lib/cn";
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
import { calcularEvolucionPesajes } from "@/features/ciclos/evolucion";
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
const FORMATO_NUMERO = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 1,
});

/** Texto con el que se presenta un valor no informado. */
const SIN_INFORMAR = "—";

/** Estilos del CTA de registro, alineados con el resto del tema oscuro. */
const ESTILOS_CTA =
  "rounded-xl bg-elinain-gold px-5 py-2.5 text-sm font-semibold text-elinain-bg shadow-[0_10px_24px_rgb(232_185_35_/_0.16)] hover:bg-elinain-gold-hover focus-visible:ring-elinain-gold";

/** Estilos de las acciones de fila, alineados con los listados oscuros. */
const ESTILOS_ACCION_SECUNDARIA =
  "border-white/8 bg-white/[0.03] px-3 text-xs text-zinc-300 hover:bg-white/[0.08] hover:text-white focus-visible:ring-elinain-gold";

const ESTILOS_ACCION_PELIGRO =
  "bg-red-400/10 px-3 text-xs text-red-200 hover:bg-red-400/20 focus-visible:ring-red-300";

/** Presenta un delta de peso con su signo. */
function formatearDelta(delta: number): string {
  return `${delta > 0 ? "+" : ""}${FORMATO_NUMERO.format(delta)}`;
}

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
  /**
   * Notifica el total de ciclos registrados para alimentar el contador de la pestaña.
   * Es una notificación al contenedor; no obtiene datos ni deriva estado en render.
   */
  onTotal?: (total: number) => void;
};

/**
 * Sección de ciclos de un contrato.
 *
 * Compone el listado paginado y filtrado por contrato, el registro y la edición en diálogo
 * y la eliminación con confirmación previa. La columna de evolución y el aviso del último
 * checkpoint comparan cada peso observado con el del pesaje inmediatamente anterior de la
 * página cargada. El registro solo se habilita con el contrato activo; editar y eliminar
 * están siempre disponibles y sus errores se traducen a mensajes en español sin cerrar el
 * diálogo.
 */
export function CiclosSeccion({
  contratoId,
  contratoEstado,
  onCambio,
  onTotal,
}: Props) {
  const paginacion = usePagination({ total: TOTAL_PROVISIONAL });
  const { limite, offset } = paginacion;

  const consulta = useCiclos({ limite, offset, contrato_id: contratoId });
  const filas = consulta.data?.elementos ?? [];
  const total = consulta.data?.total ?? 0;

  useEffect(() => {
    onTotal?.(total);
  }, [onTotal, total]);

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

  const evolucion = calcularEvolucionPesajes(filas);
  const esGanancia = (evolucion.ultimoDelta ?? 0) >= 0;

  const columnas: ColumnaTabla<Ciclo>[] = [
    {
      clave: "fecha",
      encabezado: "Fecha de control",
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
      clave: "evolucion",
      encabezado: "Evolución",
      render: (ciclo) => {
        const delta = evolucion.deltasPorId.get(ciclo.id);

        if (delta === null || delta === undefined) {
          return <span className="text-zinc-500">{SIN_INFORMAR}</span>;
        }

        return (
          <span
            className={cn(
              "font-medium",
              delta >= 0 ? "text-emerald-300" : "text-red-300",
            )}
          >
            {formatearDelta(delta)} kg
          </span>
        );
      },
    },
    {
      clave: "notas",
      encabezado: "Observaciones",
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
            className={ESTILOS_ACCION_SECUNDARIA}
            aria-label={`Editar el ciclo del ${formatearFechaDia(ciclo.fecha) || "fecha no informada"}`}
          >
            Editar
          </Button>
          <Button
            variante="peligro"
            onClick={() => abrirEliminar(ciclo)}
            className={ESTILOS_ACCION_PELIGRO}
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
        <h2 className="text-lg font-semibold text-white">Ciclos</h2>
        <Button
          onClick={abrirCrear}
          disabled={registroDeshabilitado}
          className={ESTILOS_CTA}
        >
          Registrar ciclo
        </Button>
      </div>

      {registroDeshabilitado ? (
        <p className="text-sm text-zinc-400">
          El contrato está cerrado: no se pueden registrar ciclos nuevos.
        </p>
      ) : null}

      {consulta.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
        >
          {mensajeErrorListarCiclos(consulta.error.status)}
        </p>
      ) : null}

      {filas.length > 0 && evolucion.ultimoDelta !== null ? (
        <p className="rounded-xl border border-elinain-gold/20 bg-elinain-gold/8 px-4 py-3 text-sm text-zinc-300">
          <span className="font-semibold text-elinain-gold">
            Alerta de Ganancia Diaria (GMD):
          </span>{" "}
          <span
            className={cn(
              "font-semibold",
              esGanancia ? "text-emerald-300" : "text-red-300",
            )}
          >
            {formatearDelta(evolucion.ultimoDelta)} kg
          </span>{" "}
          en el último checkpoint frente al pesaje anterior.
        </p>
      ) : null}

      <Table
        columnas={columnas}
        filas={filas}
        obtenerClave={(ciclo) => ciclo.id}
        cargando={consulta.isPending}
        mensajeVacio="Aún no hay ciclos registrados en este contrato"
        paginacion={paginacionTabla}
        tema="oscuro"
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
