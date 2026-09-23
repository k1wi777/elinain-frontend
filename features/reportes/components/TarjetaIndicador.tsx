import { cn } from "@/shared/lib/cn";

/** Props del componente `TarjetaIndicador`. */
type Props = {
  /** Etiqueta en español que describe el indicador. */
  titulo: string;
  /** Cifra ya formateada que muestra la tarjeta. */
  valor: string;
  /** Realza la tarjeta como cifra protagonista del resumen. */
  realce?: boolean;
};

/**
 * Tarjeta presentacional con un indicador del historial.
 *
 * No conoce el DTO ni TanStack Query: recibe los textos ya formateados y un realce
 * opcional que eleva la cifra protagonista. Mantiene siempre su etiqueta textual, de
 * modo que la jerarquía no depende solo del color.
 */
export function TarjetaIndicador({ titulo, valor, realce = false }: Props) {
  return (
    <article
      className={cn(
        "rounded-lg border p-4",
        realce
          ? "border-emerald-200 bg-emerald-50"
          : "border-zinc-200 bg-white",
      )}
    >
      <p
        className={cn(
          "text-sm",
          realce
            ? "font-medium tracking-wide text-emerald-800 uppercase"
            : "text-zinc-500",
        )}
      >
        {titulo}
      </p>
      <p
        className={cn(
          "mt-1 tabular-nums",
          realce
            ? "text-3xl font-semibold text-emerald-700"
            : "text-2xl font-medium text-zinc-700",
        )}
      >
        {valor}
      </p>
    </article>
  );
}
