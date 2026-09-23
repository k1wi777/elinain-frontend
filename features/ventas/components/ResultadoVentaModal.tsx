"use client";

import { formatearFechaHora } from "@/shared/lib/fechas";
import { Modal } from "@/shared/ui";
import {
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
} from "@/features/ventas/formatos";
import type { Venta } from "@/features/ventas/types";

/** Props de una fila de dato del resultado. */
type DatoProps = {
  /** Etiqueta visible del dato. */
  etiqueta: string;
  /** Valor ya formateado. */
  valor: string;
};

/** Fila de dato del resultado. */
function Dato({ etiqueta, valor }: DatoProps) {
  return (
    <div className="flex flex-col">
      <dt className="text-zinc-500">{etiqueta}</dt>
      <dd className="font-medium text-zinc-900 tabular-nums">{valor}</dd>
    </div>
  );
}

/** Props del componente `ResultadoVentaModal`. */
type Props = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Venta registrada cuyo desglose se muestra. */
  venta: Venta | null;
  /** Se invoca al cerrar el diálogo. */
  onCerrar: () => void;
};

/**
 * Modal de confirmación con el resultado de una venta registrada.
 *
 * Muestra el desglose completo que devuelve el backend al ejecutar el motor financiero:
 * los datos de la venta y las cifras congeladas —costo, utilidad, participación y kilos
 * ganados—, sin recalcular nada en el cliente.
 */
export function ResultadoVentaModal({ abierto, venta, onCerrar }: Props) {
  return (
    <Modal abierto={abierto} titulo="Resultado de la venta" onCerrar={onCerrar}>
      {venta ? (
        <div className="flex flex-col gap-6 text-sm">
          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-zinc-900">Datos de la venta</h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Dato
                etiqueta="Fecha"
                valor={formatearFechaHora(venta.fecha) || "—"}
              />
              <Dato
                etiqueta="Cantidad vendida"
                valor={`${formatearNumero(venta.cantidad_vendida)} cabezas`}
              />
              <Dato
                etiqueta="Peso promedio de venta"
                valor={`${formatearNumero(venta.peso_promedio_venta)} kg`}
              />
              <Dato
                etiqueta="Precio por kilo"
                valor={formatearMoneda(venta.precio_kilo_venta)}
              />
            </dl>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-zinc-900">Desglose financiero</h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Dato
                etiqueta="Valor bruto"
                valor={formatearMoneda(venta.valor_bruto)}
              />
              <Dato
                etiqueta="Precio de compra por animal promedio"
                valor={formatearMoneda(venta.precio_compra_por_animal_promedio)}
              />
              <Dato
                etiqueta="Peso promedio de compra simple"
                valor={`${formatearNumero(venta.peso_promedio_compra_simple)} kg`}
              />
              <Dato
                etiqueta="Costo estimado de compra"
                valor={formatearMoneda(venta.costo_estimado_compra)}
              />
              <Dato
                etiqueta="Utilidad total"
                valor={formatearMoneda(venta.utilidad_total)}
              />
              <Dato
                etiqueta="Valor del comerciante"
                valor={formatearMoneda(venta.valor_comerciante)}
              />
              <Dato
                etiqueta="Valor del tercero"
                valor={formatearMoneda(venta.valor_tercero)}
              />
              <Dato
                etiqueta="Kilos ganados promedio"
                valor={`${formatearNumero(venta.kilos_ganados_promedio)} kg`}
              />
              <Dato
                etiqueta="Utilidad real"
                valor={formatearMoneda(venta.utilidad_real)}
              />
              <Dato
                etiqueta="Porcentaje de utilidad total"
                valor={formatearPorcentaje(venta.porcentaje_utilidad_total)}
              />
            </dl>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
