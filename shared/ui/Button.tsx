import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

/** Variantes visuales disponibles para el botón. */
export type VarianteBoton = "primario" | "secundario" | "peligro";

/** Props del componente `Button`. */
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Variante visual; por defecto `"primario"`. */
  variante?: VarianteBoton;
};

const ESTILOS_POR_VARIANTE: Record<VarianteBoton, string> = {
  primario:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  secundario:
    "border border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08] focus-visible:ring-elinain-gold",
  peligro: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const ESTILOS_BASE =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

/**
 * Botón base del sistema de diseño.
 *
 * `type` es `"button"` por defecto para evitar envíos accidentales de formulario; puede
 * sobrescribirse con `type="submit"` cuando corresponda.
 */
export function Button({
  variante = "primario",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(ESTILOS_BASE, ESTILOS_POR_VARIANTE[variante], className)}
      {...props}
    />
  );
}
