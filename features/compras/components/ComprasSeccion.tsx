"use client";

import { useEffect, useState } from "react";

import {
  calcularPagina,
  calcularTotalPaginas,
  normalizarPagina,
} from "@/shared/api/pagination";
import { usePagination } from "@/shared/api/usePagination";
import { fechaLocalAIso, formatearFechaHora } from "@/shared/lib/fechas";
import {
  Button,
  Table,
  Toast,
  type ColumnaTabla,
  type PaginacionTabla,
} from "@/shared/ui";
import { CompraFormModal } from "@/features/compras/components/CompraFormModal";
import { EliminarCompraModal } from "@/features/compras/components/EliminarCompraModal";
import { useActualizarCompra } from "@/features/compras/hooks/useActualizarCompra";
import { useCompras } from "@/features/compras/hooks/useCompras";
import { useCrearCompra } from "@/features/compras/hooks/useCrearCompra";
import { useEliminarCompra } from "@/features/compras/hooks/useEliminarCompra";
import {
  mensajeErrorEliminarCompra,
  mensajeErrorGuardarCompra,
  mensajeErrorListarCompras,
} from "@/features/compras/mensajes-error";
import type { DatosFormularioCompra } from "@/features/compras/schemas";
import { calcularTotalesCompras } from "@/features/compras/totales";
import type {
  ActualizarCompra,
  Compra,
  CrearCompra,
} from "@/features/compras/types";

/**
 * Total provisional con el que se inicializa `usePagination`.
 *
 * El total real solo se conoce cuando responde la consulta, y el hook debe invocarse antes
 * de consultar para aportar `limite`/`offset`. Al desconocer el total, los campos derivados
 * se recalculan en render con `calcularTotalPaginas`, `calcularPagina` y
 * `normalizarPagina`.
 */
const TOTAL_PROVISIONAL = Number.MAX_SAFE_INTEGER;

/** Formato numérico local para presentar cantidades y pesos del backend. */
const FORMATO_NUMERO = new Intl.NumberFormat("es-CO");

/** Formato de moneda local para la inversión y el precio por kilo. */
const FORMATO_MONEDA = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Estilos del CTA de registro, alineados con el resto del tema oscuro. */
const ESTILOS_CTA =
  "rounded-xl bg-elinain-gold px-5 py-2.5 text-sm font-semibold text-elinain-bg shadow-[0_10px_24px_rgb(232_185_35_/_0.16)] hover:bg-elinain-gold-hover focus-visible:ring-elinain-gold";

/** Estilos de las acciones de fila, alineados con los listados oscuros. */
const ESTILOS_ACCION_SECUNDARIA =
  "border-white/8 bg-white/[0.03] px-3 text-xs text-zinc-300 hover:bg-white/[0.08] hover:text-white focus-visible:ring-elinain-gold";

const ESTILOS_ACCION_PELIGRO =
  "bg-red-400/10 px-3 text-xs text-red-200 hover:bg-red-400/20 focus-visible:ring-red-300";

/** Props del componente `ComprasSeccion`. */
type Props = {
  /** Identificador del contrato cuyas compras se gestionan. */
  contratoId: string;
  /**
   * Notifica que una compra cambió (registrada, actualizada o eliminada) para que quien
   * componga la sección refresque datos derivados, como los del contrato.
   */
  onCambio?: () => void;
  /**
   * Notifica el total de compras registradas para alimentar el contador de la pestaña.
   * Es una notificación al contenedor; no obtiene datos ni deriva estado en render.
   */
  onTotal?: (total: number) => void;
};

/**
 * Sección de compras de un contrato.
 *
 * Compone el listado paginado y filtrado por contrato, el registro y la edición en diálogo
 * y la eliminación con confirmación previa. `valor_total` se muestra tal como lo devuelve
 * el backend (no se recalcula en el cliente) y las acciones de editar y eliminar están
 * siempre visibles; el `409` de contrato con ventas registradas se traduce a un mensaje
 * específico sin cerrar el diálogo. Bajo la tabla resume el volumen acumulado y la
 * inversión de las filas visibles.
 */
export function ComprasSeccion({ contratoId, onCambio, onTotal }: Props) {
  const paginacion = usePagination({ total: TOTAL_PROVISIONAL });
  const { limite, offset } = paginacion;

  const consulta = useCompras({ limite, offset, contrato_id: contratoId });
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
  const [compraEnEdicion, setCompraEnEdicion] = useState<Compra | null>(null);
  const [compraAEliminar, setCompraAEliminar] = useState<Compra | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const crear = useCrearCompra();
  const actualizar = useActualizarCompra();
  const eliminar = useEliminarCompra();

  const guardando = crear.isPending || actualizar.isPending;
  const errorGuardar = crear.error ?? actualizar.error;

  const abrirCrear = () => {
    crear.reset();
    actualizar.reset();
    setCompraEnEdicion(null);
    setFormularioAbierto(true);
  };

  const abrirEditar = (compra: Compra) => {
    crear.reset();
    actualizar.reset();
    setCompraEnEdicion(compra);
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setCompraEnEdicion(null);
    crear.reset();
    actualizar.reset();
  };

  const handleGuardar = async (datos: DatosFormularioCompra) => {
    const fecha = fechaLocalAIso(datos.fecha);

    try {
      if (compraEnEdicion) {
        const actualizables: ActualizarCompra = {
          fecha,
          cantidad: datos.cantidad,
          peso_promedio: datos.peso_promedio,
          precio_kilo: datos.precio_kilo,
          nota: datos.nota,
        };

        await actualizar.mutateAsync({
          id: compraEnEdicion.id,
          datos: actualizables,
        });
        setMensajeExito("Compra actualizada.");
      } else {
        const nueva: CrearCompra = {
          contrato_id: contratoId,
          fecha,
          cantidad: datos.cantidad,
          peso_promedio: datos.peso_promedio,
          precio_kilo: datos.precio_kilo,
          nota: datos.nota,
        };

        await crear.mutateAsync(nueva);
        setMensajeExito("Compra registrada.");
      }

      cerrarFormulario();
      onCambio?.();
    } catch {
      // El error de la mutación se muestra dentro del formulario.
    }
  };

  const abrirEliminar = (compra: Compra) => {
    eliminar.reset();
    setCompraAEliminar(compra);
  };

  const cerrarEliminar = () => {
    setCompraAEliminar(null);
    eliminar.reset();
  };

  const handleEliminar = async () => {
    if (!compraAEliminar) {
      return;
    }

    const eraUnicaFilaDePagina = filas.length === 1 && paginaActual > 1;

    try {
      await eliminar.mutateAsync(compraAEliminar.id);
      setMensajeExito("Compra eliminada.");
      cerrarEliminar();
      onCambio?.();

      if (eraUnicaFilaDePagina) {
        paginacion.irAPaginaAnterior();
      }
    } catch {
      // El error de la mutación se muestra dentro del modal.
    }
  };

  const totales = calcularTotalesCompras(filas);

  const columnas: ColumnaTabla<Compra>[] = [
    {
      clave: "fecha",
      encabezado: "Fecha y hora",
      render: (compra) => formatearFechaHora(compra.fecha) || "—",
    },
    {
      clave: "cantidad",
      encabezado: "Cabezas",
      render: (compra) => `${FORMATO_NUMERO.format(compra.cantidad)} cabezas`,
    },
    {
      clave: "peso_promedio",
      encabezado: "Peso promedio",
      render: (compra) => `${FORMATO_NUMERO.format(compra.peso_promedio)} kg`,
    },
    {
      clave: "precio_kilo",
      encabezado: "Precio / kg",
      render: (compra) => FORMATO_MONEDA.format(compra.precio_kilo),
    },
    {
      clave: "valor_total",
      encabezado: "Inversión total",
      render: (compra) => FORMATO_MONEDA.format(compra.valor_total),
    },
    {
      clave: "nota",
      encabezado: "Nota",
      render: (compra) => (compra.nota.trim() !== "" ? compra.nota : "—"),
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alineacion: "derecha",
      render: (compra) => (
        <div className="flex justify-end gap-2">
          <Button
            variante="secundario"
            onClick={() => abrirEditar(compra)}
            className={ESTILOS_ACCION_SECUNDARIA}
            aria-label={`Editar la compra del ${formatearFechaHora(compra.fecha)}`}
          >
            Editar
          </Button>
          <Button
            variante="peligro"
            onClick={() => abrirEliminar(compra)}
            className={ESTILOS_ACCION_PELIGRO}
            aria-label={`Eliminar la compra del ${formatearFechaHora(compra.fecha)}`}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section aria-label="Compras del contrato" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Compras</h2>
        <Button onClick={abrirCrear} className={ESTILOS_CTA}>
          Registrar compra
        </Button>
      </div>

      {consulta.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
        >
          {mensajeErrorListarCompras(consulta.error.status)}
        </p>
      ) : null}

      <Table
        columnas={columnas}
        filas={filas}
        obtenerClave={(compra) => compra.id}
        cargando={consulta.isPending}
        mensajeVacio="Aún no hay compras registradas en este contrato"
        paginacion={paginacionTabla}
        tema="oscuro"
      />

      {filas.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/6 bg-elinain-glass-panel px-5 py-4">
          <p className="text-sm text-zinc-400">
            Volumen acumulado:{" "}
            <span className="font-semibold text-white">
              {FORMATO_NUMERO.format(totales.cabezas)} cabezas ingresadas
            </span>
          </p>
          <p className="text-sm text-zinc-400">
            Inversión total en biomasa:{" "}
            <span className="font-semibold text-elinain-gold">
              {FORMATO_MONEDA.format(totales.inversion)}
            </span>
          </p>
        </div>
      ) : null}

      <CompraFormModal
        abierto={formularioAbierto}
        modo={compraEnEdicion ? "editar" : "crear"}
        compra={compraEnEdicion ?? undefined}
        enviando={guardando}
        mensajeError={
          errorGuardar ? mensajeErrorGuardarCompra(errorGuardar.status) : null
        }
        onGuardar={handleGuardar}
        onCerrar={cerrarFormulario}
      />

      <EliminarCompraModal
        abierto={compraAEliminar !== null}
        compra={compraAEliminar}
        enviando={eliminar.isPending}
        mensajeError={
          eliminar.error
            ? mensajeErrorEliminarCompra(eliminar.error.status)
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
