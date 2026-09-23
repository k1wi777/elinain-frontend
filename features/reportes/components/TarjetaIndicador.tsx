import { cn } from "@/shared/lib/cn";

/** Temas visuales disponibles para la tarjeta. */
type TemaTarjetaIndicador = "claro" | "oscuro";

/** Variante según el indicador sea protagonista (`realce`) o secundario (`base`). */
type Variante = "base" | "realce";

/** Props del componente `TarjetaIndicador`. */
type Props = {
  /** Etiqueta en español que describe el indicador. */
  titulo: string;
  /** Cifra ya formateada que muestra la tarjeta. */
  valor: string;
  /** Realza la tarjeta como cifra protagonista del resumen. */
  realce?: boolean;
  /** Tema visual opcional; conserva el tema claro por defecto. */
  tema?: TemaTarjetaIndicador;
};

const ESTILOS_CAJA: Record<TemaTarjetaIndicador, Record<Variante, string>> = {
  claro: {
    base: "border-zinc-200 bg-white",
    realce: "border-emerald-200 bg-emerald-50",
  },
  oscuro: {
    base: "border-white/6 bg-elinain-surface",
    realce: "border-elinain-gold/30 bg-elinain-gold/10",
  },
};

const ESTILOS_TITULO: Record<TemaTarjetaIndicador, Record<Variante, string>> = {
  claro: {
    base: "text-zinc-500",
    realce: "font-medium tracking-wide text-emerald-800 uppercase",
  },
  oscuro: {
    base: "text-zinc-500",
    realce: "font-medium tracking-wide text-elinain-gold uppercase",
  },
};

const ESTILOS_VALOR: Record<TemaTarjetaIndicador, Record<Variante, string>> = {
  claro: {
    base: "text-2xl font-medium text-zinc-700",
    realce: "text-3xl font-semibold text-emerald-700",
  },
  oscuro: {
    base: "text-2xl font-medium text-white",
    realce: "text-3xl font-semibold text-elinain-gold",
  },
};

/**
 * Tarjeta presentacional con un indicador del historial.
 *
 * No conoce el DTO ni TanStack Query: recibe los textos ya formateados y un realce
 * opcional que eleva la cifra protagonista. Mantiene siempre su etiqueta textual, de
 * modo que la jerarquía no depende solo del color. El tema claro se conserva por defecto
 * para no alterar a los demás consumidores; el tema oscuro aporta la paleta del shell.
 */
export function TarjetaIndicador({
  titulo,
  valor,
  realce = false,
  tema = "claro",
}: Props) {
  const variante: Variante = realce ? "realce" : "base";

  return (
    <article
      className={cn("rounded-lg border p-4", ESTILOS_CAJA[tema][variante])}
    >
      <p className={cn("text-sm", ESTILOS_TITULO[tema][variante])}>{titulo}</p>
      <p className={cn("mt-1 tabular-nums", ESTILOS_VALOR[tema][variante])}>
        {valor}
      </p>
    </article>
  );
}
