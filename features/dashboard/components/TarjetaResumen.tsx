/** Nivel tipográfico de la tarjeta dentro de la jerarquía del dashboard. */
export type NivelTarjeta = "protagonista" | "secundario" | "menor";

/** Props del componente `TarjetaResumen`. */
type Props = {
  /** Etiqueta en español que describe el indicador. */
  titulo: string;
  /** Cifra ya formateada que muestra la tarjeta. */
  valor: string;
  /** Nivel tipográfico; determina tamaño, peso y realce cromático. */
  nivel: NivelTarjeta;
};

const CLASES_TARJETA: Record<NivelTarjeta, string> = {
  protagonista: "rounded-xl border border-emerald-200 bg-emerald-50 p-6",
  secundario: "rounded-lg border border-zinc-200 bg-white p-4",
  menor: "rounded-lg border border-zinc-200 bg-white p-4",
};

const CLASES_ETIQUETA: Record<NivelTarjeta, string> = {
  protagonista: "text-sm font-medium tracking-wide text-emerald-800 uppercase",
  secundario: "text-sm font-medium text-zinc-600",
  menor: "text-sm text-zinc-500",
};

const CLASES_VALOR: Record<NivelTarjeta, string> = {
  protagonista: "mt-2 text-4xl font-bold tabular-nums text-emerald-700",
  secundario: "mt-1 text-3xl font-semibold tabular-nums text-zinc-900",
  menor: "mt-1 text-2xl font-medium tabular-nums text-zinc-600",
};

/**
 * Tarjeta presentacional con un indicador del resumen.
 *
 * No conoce el DTO ni TanStack Query: recibe los textos ya formateados y el nivel
 * tipográfico que define su jerarquía visual. Mantiene siempre su etiqueta textual, de
 * modo que la jerarquía no depende solo del color.
 */
export function TarjetaResumen({ titulo, valor, nivel }: Props) {
  return (
    <article className={CLASES_TARJETA[nivel]}>
      <p className={CLASES_ETIQUETA[nivel]}>{titulo}</p>
      <p className={CLASES_VALOR[nivel]}>{valor}</p>
    </article>
  );
}
