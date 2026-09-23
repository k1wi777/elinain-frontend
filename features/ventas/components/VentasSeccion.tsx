"use client";

import { useState } from "react";

import {
  calcularPagina,
  calcularTotalPaginas,
  normalizarPagina,
} from "@/shared/api/pagination";
import { usePagination } from "@/shared/api/usePagination";
import { fechaLocalAIso } from "@/shared/lib/fechas";
import { Button, type PaginacionTabla } from "@/shared/ui";
import { ResultadoVentaModal } from "@/features/ventas/components/ResultadoVentaModal";
import { VentaFormModal } from "@/features/ventas/components/VentaFormModal";
import { VentasLista } from "@/features/ventas/components/VentasLista";
import { useCrearVenta } from "@/features/ventas/hooks/useCrearVenta";
import { useVentas } from "@/features/ventas/hooks/useVentas";
import {
  mensajeErrorGuardarVenta,
  mensajeErrorListarVentas,
} from "@/features/ventas/mensajes-error";
import type { DatosFormularioVenta } from "@/features/ventas/schemas";
import type { CrearVenta, Venta } from "@/features/ventas/types";

/**
 * Total provisional con el que se inicializa `usePagination`.
 *
 * El total real solo se conoce cuando responde la consulta, y el hook debe invocarse antes
 * de consultar para aportar `limite`/`offset`. Al desconocer el total, los campos derivados
 * se recalculan en render con `calcularTotalPaginas`, `calcularPagina` y
 * `normalizarPagina`.
 */
const TOTAL_PROVISIONAL = Number.MAX_SAFE_INTEGER;

/** Props del componente `VentasSeccion`. */
type Props = {
  /** Identificador del contrato cuyas ventas se gestionan. */
  contratoId: string;
  /**
   * Notifica que una venta cambió para que quien componga la sección refresque datos
   * derivados, como los agregados del contrato.
   */
  onCambio?: () => void;
};

/**
 * Sección de ventas de un contrato.
 *
 * Compone el listado paginado y filtrado por contrato y el registro con el contrato fijo.
 * Al registrar una venta se abre el modal con el desglose completo que devuelve el backend
 * y se notifica `onCambio` para refrescar los agregados del contrato. Las ventas son de
 * solo lectura: no se ofrecen acciones de edición ni de eliminación.
 */
export function VentasSeccion({ contratoId, onCambio }: Props) {
  const paginacion = usePagination({ total: TOTAL_PROVISIONAL });
  const { limite, offset } = paginacion;

  const consulta = useVentas({ limite, offset, contrato_id: contratoId });
  const filas = consulta.data?.elementos ?? [];
  const total = consulta.data?.total ?? 0;

  const totalPaginas = calcularTotalPaginas(total, limite);
  const paginaActual = normalizarPagina(
    calcularPagina(offset, limite),
    totalPaginas,
  );

  const paginacionTarjetas: PaginacionTabla = {
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
  const [ventaRegistrada, setVentaRegistrada] = useState<Venta | null>(null);

  const crear = useCrearVenta();

  const abrirFormulario = () => {
    crear.reset();
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    crear.reset();
  };

  const handleGuardar = async (datos: DatosFormularioVenta) => {
    const nueva: CrearVenta = {
      contrato_id: contratoId,
      fecha: fechaLocalAIso(datos.fecha),
      cantidad_vendida: datos.cantidad_vendida,
      peso_promedio_venta: datos.peso_promedio_venta,
      precio_kilo_venta: datos.precio_kilo_venta,
    };

    try {
      const venta = await crear.mutateAsync(nueva);
      setFormularioAbierto(false);
      crear.reset();
      setVentaRegistrada(venta);
      onCambio?.();
    } catch {
      // El error de la mutación se muestra dentro del formulario, que permanece abierto.
    }
  };

  return (
    <section aria-label="Ventas del contrato" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900">Ventas</h2>
        <Button onClick={abrirFormulario}>Registrar venta</Button>
      </div>

      <VentasLista
        ventas={filas}
        cargando={consulta.isPending}
        mensajeError={
          consulta.error
            ? mensajeErrorListarVentas(consulta.error.status)
            : null
        }
        mensajeVacio="Aún no hay ventas registradas en este contrato"
        paginacion={paginacionTarjetas}
      />

      <VentaFormModal
        abierto={formularioAbierto}
        contratoFijo={contratoId}
        enviando={crear.isPending}
        mensajeError={
          crear.error ? mensajeErrorGuardarVenta(crear.error.status) : null
        }
        onGuardar={handleGuardar}
        onCerrar={cerrarFormulario}
      />

      <ResultadoVentaModal
        abierto={ventaRegistrada !== null}
        venta={ventaRegistrada}
        onCerrar={() => setVentaRegistrada(null)}
      />
    </section>
  );
}
