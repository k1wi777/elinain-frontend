"use client";

import { useState, type ChangeEvent } from "react";

import {
  calcularPagina,
  calcularTotalPaginas,
  normalizarPagina,
} from "@/shared/api/pagination";
import { usePagination } from "@/shared/api/usePagination";
import { fechaLocalAIso } from "@/shared/lib/fechas";
import { Button, Select, type PaginacionTabla } from "@/shared/ui";
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
import type {
  ContratoVenta,
  CrearVenta,
  FiltrosVentas,
  Venta,
} from "@/features/ventas/types";

/**
 * Total provisional con el que se inicializa `usePagination`.
 *
 * El total real solo se conoce cuando responde la consulta, y el hook debe invocarse antes
 * de consultar para aportar `limite`/`offset`. Al desconocer el total, los campos derivados
 * se recalculan en render con `calcularTotalPaginas`, `calcularPagina` y
 * `normalizarPagina`.
 */
const TOTAL_PROVISIONAL = Number.MAX_SAFE_INTEGER;

/** Props del componente `VentasListado`. */
type Props = {
  /** Contratos para el filtro y el selector del formulario; los compone `app/`. */
  contratos: ContratoVenta[];
  /**
   * Notifica que una venta cambió para que quien componga el listado refresque datos
   * derivados, como los agregados de los contratos.
   */
  onCambio?: () => void;
};

/**
 * Listado global de ventas con filtro opcional por contrato.
 *
 * Consulta el backend con paginación y, cuando hay un contrato elegido, con `contrato_id`;
 * al cambiar el filtro vuelve a la primera página. Compone el registro con selector de
 * contrato y el modal de resultado. Las ventas son de solo lectura: no se ofrecen acciones
 * de edición ni de eliminación.
 */
export function VentasListado({ contratos, onCambio }: Props) {
  const paginacion = usePagination({ total: TOTAL_PROVISIONAL });
  const { limite, offset } = paginacion;

  const [contratoId, setContratoId] = useState("");

  const filtros: FiltrosVentas = contratoId
    ? { limite, offset, contrato_id: contratoId }
    : { limite, offset };

  const consulta = useVentas(filtros);
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

  const alCambiarFiltro = (evento: ChangeEvent<HTMLSelectElement>) => {
    setContratoId(evento.target.value);
    paginacion.reiniciar();
  };

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
      contrato_id: datos.contrato_id,
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

  const opcionesFiltro = [
    { valor: "", etiqueta: "Todos los contratos" },
    ...contratos.map((contrato) => ({
      valor: contrato.id,
      etiqueta: contrato.etiqueta,
    })),
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-sm">
          <Select
            label="Filtrar por contrato"
            opciones={opcionesFiltro}
            value={contratoId}
            onChange={alCambiarFiltro}
          />
        </div>
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
        mensajeVacio={
          contratoId
            ? "No hay ventas registradas en el contrato seleccionado"
            : "Aún no hay ventas registradas"
        }
        paginacion={paginacionTarjetas}
      />

      <VentaFormModal
        abierto={formularioAbierto}
        contratos={contratos}
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
