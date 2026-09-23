import { cn } from "@/shared/lib/cn";
import { formatearFechaHora } from "@/shared/lib/fechas";
import { type TemaTabla } from "@/shared/ui";
import {
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
} from "@/features/ventas/formatos";
import { calcularDistribucionLiquidacion } from "@/features/ventas/liquidacion";
import type { Venta } from "@/features/ventas/types";

/** Props de la cifra destacada de una venta. */
type CifraProps = {
  /** Etiqueta visible de la cifra. */
  etiqueta: string;
  /** Valor ya formateado. */
  valor: string;
  /** Cuando es `true` la cifra se presenta con mayor peso visual. */
  prominente?: boolean;
  /** Indica si la tarjeta se presenta sobre el tema oscuro. */
  oscuro: boolean;
};

/** Cifra destacada de la tarjeta, con jerarquía visual configurable. */
function Cifra({ etiqueta, valor, prominente = false, oscuro }: CifraProps) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        {etiqueta}
      </dt>
      <dd
        className={cn(
          "mt-1 tabular-nums",
          oscuro ? "text-white" : "text-zinc-900",
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
  /** Indica si la tarjeta se presenta sobre el tema oscuro. */
  oscuro: boolean;
};

/** Dato secundario de la venta, en la fila discreta inferior. */
function Dato({ etiqueta, valor, oscuro }: DatoProps) {
  return (
    <div className="flex gap-1">
      <dt className="font-medium text-zinc-500">{etiqueta}:</dt>
      <dd className={oscuro ? "text-zinc-300" : "text-zinc-600"}>{valor}</dd>
    </div>
  );
}

/** Props del componente `VentaCard`. */
type Props = {
  /** Venta a presentar. */
  venta: Venta;
  /** Tema visual opcional; conserva el tema claro por defecto. */
  tema?: TemaTabla;
};

/**
 * Tarjeta de solo lectura de una venta.
 *
 * Destaca las cifras que más le importan al comerciante —valor bruto, utilidad total,
 * valor del comerciante, valor del tercero, porcentaje de utilidad y kilos ganados
 * promedio— y presenta la distribución contractual con los montos reales y los porcentajes
 * derivados de ellos. Deja en una fila secundaria los datos de identificación de la venta.
 * No expone acciones de edición ni de eliminación porque las ventas son inmutables.
 */
export function VentaCard({ venta, tema = "claro" }: Props) {
  const esOscuro = tema === "oscuro";
  const fecha = formatearFechaHora(venta.fecha) || "—";
  const distribucion = calcularDistribucionLiquidacion(venta);

  return (
    <article
      aria-label={`Venta del ${fecha}`}
      className={cn(
        esOscuro
          ? "rounded-2xl border border-white/6 bg-elinain-surface p-5"
          : "rounded-lg border border-zinc-200 bg-white p-4",
      )}
    >
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Cifra
          oscuro={esOscuro}
          etiqueta="Valor bruto"
          valor={formatearMoneda(venta.valor_bruto)}
          prominente
        />
        <Cifra
          oscuro={esOscuro}
          etiqueta="Utilidad total"
          valor={formatearMoneda(venta.utilidad_total)}
          prominente
        />
        <Cifra
          oscuro={esOscuro}
          etiqueta="Valor del comerciante"
          valor={formatearMoneda(venta.valor_comerciante)}
        />
        <Cifra
          oscuro={esOscuro}
          etiqueta="Valor del tercero"
          valor={formatearMoneda(venta.valor_tercero)}
        />
        <Cifra
          oscuro={esOscuro}
          etiqueta="Porcentaje de utilidad"
          valor={formatearPorcentaje(venta.porcentaje_utilidad_total)}
        />
        <Cifra
          oscuro={esOscuro}
          etiqueta="Kilos ganados promedio"
          valor={`${formatearNumero(venta.kilos_ganados_promedio)} kg`}
        />
      </dl>

      <div
        className={cn(
          "mt-4 border-t pt-4",
          esOscuro ? "border-white/6" : "border-zinc-200",
        )}
      >
        <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Distribución contractual
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Comerciante
            </dt>
            <dd
              className={cn(
                "mt-1 tabular-nums",
                esOscuro ? "text-white" : "text-zinc-900",
              )}
            >
              {formatearMoneda(venta.valor_comerciante)}
            </dd>
            <dd className="text-xs text-zinc-500">
              {distribucion
                ? formatearPorcentaje(distribucion.porcentajeComerciante)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Tercero
            </dt>
            <dd
              className={cn(
                "mt-1 tabular-nums",
                esOscuro ? "text-white" : "text-zinc-900",
              )}
            >
              {formatearMoneda(venta.valor_tercero)}
            </dd>
            <dd className="text-xs text-zinc-500">
              {distribucion
                ? formatearPorcentaje(distribucion.porcentajeTercero)
                : "—"}
            </dd>
          </div>
        </dl>
        {distribucion ? (
          <span
            aria-hidden
            className={cn(
              "mt-3 flex h-1.5 w-full overflow-hidden rounded-full",
              esOscuro ? "bg-white/[0.06]" : "bg-zinc-100",
            )}
          >
            <span
              className="bg-elinain-gold"
              style={{ width: `${distribucion.porcentajeComerciante}%` }}
            />
            <span
              className={esOscuro ? "bg-white/20" : "bg-zinc-300"}
              style={{ width: `${distribucion.porcentajeTercero}%` }}
            />
          </span>
        ) : null}
      </div>

      <dl
        className={cn(
          "mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-sm",
          esOscuro ? "border-white/6" : "border-zinc-200",
        )}
      >
        <Dato oscuro={esOscuro} etiqueta="Fecha" valor={fecha} />
        <Dato
          oscuro={esOscuro}
          etiqueta="Cantidad"
          valor={`${formatearNumero(venta.cantidad_vendida)} cabezas`}
        />
        <Dato
          oscuro={esOscuro}
          etiqueta="Peso promedio"
          valor={`${formatearNumero(venta.peso_promedio_venta)} kg`}
        />
        <Dato
          oscuro={esOscuro}
          etiqueta="Precio por kilo"
          valor={formatearMoneda(venta.precio_kilo_venta)}
        />
      </dl>
    </article>
  );
}
