"use client";

import { useState } from "react";

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

/** Formato numérico local para presentar cantidades y valores del backend. */
const FORMATO_NUMERO = new Intl.NumberFormat("es-CO");

/** Props del componente `ComprasSeccion`. */
type Props = {
  /** Identificador del contrato cuyas compras se gestionan. */
  contratoId: string;
};

/**
 * Sección de compras de un contrato.
 *
 * Compone el listado paginado y filtrado por contrato, el registro y la edición en diálogo
 * y la eliminación con confirmación previa. `valor_total` se muestra tal como lo devuelve
 * el backend (no se recalcula en el cliente) y las acciones de editar y eliminar están
 * siempre visibles; el `409` de contrato con ventas registradas se traduce a un mensaje
 * específico sin cerrar el diálogo.
 */
export function ComprasSeccion({ contratoId }: Props) {
  const paginacion = usePagination({ total: TOTAL_PROVISIONAL });
  const { limite, offset } = paginacion;

  const consulta = useCompras({ limite, offset, contrato_id: contratoId });
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

      if (eraUnicaFilaDePagina) {
        paginacion.irAPaginaAnterior();
      }
    } catch {
      // El error de la mutación se muestra dentro del modal.
    }
  };

  const columnas: ColumnaTabla<Compra>[] = [
    {
      clave: "fecha",
      encabezado: "Fecha",
      render: (compra) => formatearFechaHora(compra.fecha) || "—",
    },
    {
      clave: "cantidad",
      encabezado: "Cantidad",
      render: (compra) => `${FORMATO_NUMERO.format(compra.cantidad)} cabezas`,
    },
    {
      clave: "peso_promedio",
      encabezado: "Peso promedio",
      render: (compra) => `${FORMATO_NUMERO.format(compra.peso_promedio)} kg`,
    },
    {
      clave: "precio_kilo",
      encabezado: "Precio por kilo",
      render: (compra) => FORMATO_NUMERO.format(compra.precio_kilo),
    },
    {
      clave: "valor_total",
      encabezado: "Valor total",
      render: (compra) => FORMATO_NUMERO.format(compra.valor_total),
    },
    {
      clave: "nota",
      encabezado: "Nota",
      render: (compra) => compra.nota,
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
            aria-label={`Editar la compra del ${formatearFechaHora(compra.fecha)}`}
          >
            Editar
          </Button>
          <Button
            variante="peligro"
            onClick={() => abrirEliminar(compra)}
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
        <h2 className="text-lg font-semibold text-zinc-900">Compras</h2>
        <Button onClick={abrirCrear}>Registrar compra</Button>
      </div>

      {consulta.error ? (
        <p role="alert" className="text-sm text-red-600">
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
      />

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
