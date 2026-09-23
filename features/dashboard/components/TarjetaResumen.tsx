import { cn } from "@/shared/lib/cn";

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
  /** Clases opcionales para adaptar la tarjeta a la rejilla del resumen. */
  className?: string;
};

const CLASES_TARJETA: Record<NivelTarjeta, string> = {
  protagonista:
    "rounded-2xl border border-elinain-gold/20 bg-elinain-surface p-6 shadow-[0_20px_45px_rgb(0_0_0_/_0.24)] sm:p-8",
  secundario:
    "rounded-xl border border-white/8 bg-elinain-surface-elevated p-5 shadow-lg shadow-black/15",
  menor:
    "rounded-xl border border-white/6 bg-elinain-surface-elevated p-4 shadow-lg shadow-black/15 sm:p-5",
};

const CLASES_ETIQUETA: Record<NivelTarjeta, string> = {
  protagonista:
    "text-[0.68rem] font-semibold tracking-[0.18em] text-elinain-gold uppercase",
  secundario: "text-sm font-medium text-elinain-muted",
  menor: "text-xs font-medium tracking-wide text-elinain-muted uppercase",
};

const CLASES_VALOR: Record<NivelTarjeta, string> = {
  protagonista:
    "mt-3 break-words font-display text-4xl leading-none font-semibold tracking-tight text-elinain-gold tabular-nums sm:text-5xl",
  secundario:
    "mt-2 break-words font-display text-2xl leading-tight font-semibold tracking-tight text-white tabular-nums sm:text-3xl",
  menor:
    "mt-2 break-words font-display text-2xl leading-tight font-semibold text-white tabular-nums",
};

/**
 * Tarjeta presentacional con un indicador del resumen.
 *
 * No conoce el DTO ni TanStack Query: recibe los textos ya formateados y el nivel
 * tipográfico que define su jerarquía visual. Mantiene siempre su etiqueta textual, de
 * modo que la jerarquía no depende solo del color.
 */
export function TarjetaResumen({ titulo, valor, nivel, className }: Props) {
  return (
    <article className={cn(CLASES_TARJETA[nivel], "min-w-0", className)}>
      <p className={CLASES_ETIQUETA[nivel]}>{titulo}</p>
      <p className={CLASES_VALOR[nivel]}>{valor}</p>
    </article>
  );
}
