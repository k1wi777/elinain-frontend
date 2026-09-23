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
import {
  formatearMoneda,
  formatearPorcentaje,
} from "@/features/ventas/formatos";
import { useCrearVenta } from "@/features/ventas/hooks/useCrearVenta";
import { useVentas } from "@/features/ventas/hooks/useVentas";
import {
  mensajeErrorGuardarVenta,
  mensajeErrorListarVentas,
} from "@/features/ventas/mensajes-error";
import { calcularResumenVentas } from "@/features/ventas/resumen";
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

/** Estilos del CTA de registro, alineados con el tema oscuro del shell. */
const ESTILOS_CTA_REGISTRAR =
  "inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-elinain-gold px-5 py-3.5 text-sm font-semibold text-elinain-bg shadow-[0_10px_24px_rgb(232_185_35_/_0.16)] transition-colors hover:bg-elinain-gold-hover focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto";

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

  const cargandoResumen = consulta.isPending || Boolean(consulta.error);
  const resumen = calcularResumenVentas(filas);

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
    <section aria-labelledby="ventas-title" className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-elinain-gold uppercase">
            Liquidaciones &amp; arbitraje de ganado
          </p>
          <h1
            id="ventas-title"
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            Ventas
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            Registro auditable de las liquidaciones: pesaje y distribución
            proporcional de las utilidades de cada lote.
          </p>
        </div>
        <Button onClick={abrirFormulario} className={ESTILOS_CTA_REGISTRAR}>
          <span aria-hidden className="text-lg leading-none font-normal">
            +
          </span>
          <span>Registrar venta</span>
        </Button>
      </header>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                Valor bruto total
              </p>
              <p
                className="mt-3 font-display text-3xl tracking-tight text-elinain-gold tabular-nums"
                aria-live="polite"
              >
                {cargandoResumen
                  ? "—"
                  : formatearMoneda(resumen.valorBrutoTotal)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Facturado en esta página
              </p>
            </article>
            <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                Utilidad bruta liquidada
              </p>
              <p
                className="mt-3 font-display text-3xl tracking-tight text-white tabular-nums"
                aria-live="polite"
              >
                {cargandoResumen
                  ? "—"
                  : formatearMoneda(resumen.utilidadTotalLiquidada)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Liquidado en esta página
              </p>
            </article>
            <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                A favor del comerciante
              </p>
              <p
                className="mt-3 font-display text-3xl tracking-tight text-white tabular-nums"
                aria-live="polite"
              >
                {cargandoResumen
                  ? "—"
                  : formatearMoneda(resumen.valorComerciante)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Reparto de esta página
              </p>
            </article>
            <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                A favor del tercero
              </p>
              <p
                className="mt-3 font-display text-3xl tracking-tight text-white tabular-nums"
                aria-live="polite"
              >
                {cargandoResumen ? "—" : formatearMoneda(resumen.valorTercero)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Reparto de esta página
              </p>
            </article>
            <article className="rounded-2xl px-5 py-5 glass-panel sm:px-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                Rentabilidad / margen
              </p>
              <p
                className="mt-3 font-display text-3xl tracking-tight text-white tabular-nums"
                aria-live="polite"
              >
                {cargandoResumen || resumen.rentabilidad === null
                  ? "—"
                  : formatearPorcentaje(resumen.rentabilidad)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Sobre el costo de esta página
              </p>
            </article>
          </div>
          <p className="text-xs text-zinc-500">
            Los agregados corresponden a las ventas de esta página, no al total
            global.
          </p>
        </div>

        <div className="w-full max-w-sm [&_label]:text-zinc-300 [&_option]:bg-elinain-surface [&_option]:text-white">
          <Select
            label="Filtrar por contrato"
            opciones={opcionesFiltro}
            value={contratoId}
            onChange={alCambiarFiltro}
            className="border-white/10 bg-white/[0.03] text-white focus:border-elinain-gold focus:ring-elinain-gold/40"
          />
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
          tema="oscuro"
        />
      </div>

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
