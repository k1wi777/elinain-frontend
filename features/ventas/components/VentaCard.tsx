import { cn } from "@/shared/lib/cn";
import { formatearFechaHora } from "@/shared/lib/fechas";
import {
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
} from "@/features/ventas/formatos";
import type { Venta } from "@/features/ventas/types";

/** Props de la cifra destacada de una venta. */
type CifraProps = {
  /** Etiqueta visible de la cifra. */
  etiqueta: string;
  /** Valor ya formateado. */
  valor: string;
  /** Cuando es `true` la cifra se presenta con mayor peso visual. */
  prominente?: boolean;
};

/** Cifra destacada de la tarjeta, con jerarquía visual configurable. */
function Cifra({ etiqueta, valor, prominente = false }: CifraProps) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        {etiqueta}
      </dt>
      <dd
        className={cn(
          "mt-1 text-zinc-900 tabular-nums",
          prominente ? "text-xl font-semibold" : "text-base font-medium",
        )}
      >
        {valor}
      </dd>
    </div>
  );
}

/** Props de un dato secundario de la venta. */
type DatoProps = {
  /** Etiqueta visible del dato. */
  etiqueta: string;
  /** Valor ya formateado. */
  valor: string;
};

/** Dato secundario de la venta, en la fila discreta inferior. */
function Dato({ etiqueta, valor }: DatoProps) {
  return (
    <div className="flex gap-1">
      <dt className="font-medium text-zinc-500">{etiqueta}:</dt>
      <dd className="text-zinc-600">{valor}</dd>
    </div>
  );
}

/** Props del componente `VentaCard`. */
type Props = {
  /** Venta a presentar. */
  venta: Venta;
};

/**
 * Tarjeta de solo lectura de una venta.
 *
 * Destaca las cifras que más le importan al comerciante —valor bruto, utilidad total,
 * valor del comerciante, valor del tercero, porcentaje de utilidad y kilos ganados
 * promedio— y deja en una fila secundaria los datos de identificación de la venta. No
 * expone acciones de edición ni de eliminación porque las ventas son inmutables.
 */
export function VentaCard({ venta }: Props) {
  const fecha = formatearFechaHora(venta.fecha) || "—";

  return (
    <article
      aria-label={`Venta del ${fecha}`}
      className="rounded-lg border border-zinc-200 bg-white p-4"
    >
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Cifra
          etiqueta="Valor bruto"
          valor={formatearMoneda(venta.valor_bruto)}
          prominente
        />
        <Cifra
          etiqueta="Utilidad total"
          valor={formatearMoneda(venta.utilidad_total)}
          prominente
        />
        <Cifra
          etiqueta="Valor del comerciante"
          valor={formatearMoneda(venta.valor_comerciante)}
        />
        <Cifra
          etiqueta="Valor del tercero"
          valor={formatearMoneda(venta.valor_tercero)}
        />
        <Cifra
          etiqueta="Porcentaje de utilidad"
          valor={formatearPorcentaje(venta.porcentaje_utilidad_total)}
        />
        <Cifra
          etiqueta="Kilos ganados promedio"
          valor={`${formatearNumero(venta.kilos_ganados_promedio)} kg`}
        />
      </dl>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-zinc-200 pt-3 text-sm">
        <Dato etiqueta="Fecha" valor={fecha} />
        <Dato
          etiqueta="Cantidad"
          valor={`${formatearNumero(venta.cantidad_vendida)} cabezas`}
        />
        <Dato
          etiqueta="Peso promedio"
          valor={`${formatearNumero(venta.peso_promedio_venta)} kg`}
        />
        <Dato
          etiqueta="Precio por kilo"
          valor={formatearMoneda(venta.precio_kilo_venta)}
        />
      </dl>
    </article>
  );
}
