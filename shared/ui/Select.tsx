"use client";

import { useId, type SelectHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

/** Opción de un `Select`. */
export type OpcionSelect = {
  /** Valor enviado al formulario. */
  valor: string;
  /** Texto visible para el usuario. */
  etiqueta: string;
};

/** Props del componente `Select`. */
export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Etiqueta asociada al control. */
  label: string;
  /** Opciones a mostrar. */
  opciones: OpcionSelect[];
  /** Mensaje de error; cuando existe se marca el control como inválido. */
  error?: string;
};

const ESTILOS_CONTROL =
  "rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-elinain-gold focus:ring-2 focus:ring-elinain-gold/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:dark] [&>option]:bg-elinain-surface [&>option]:text-white";

/**
 * Selector accesible con etiqueta y mensaje de error vinculados.
 *
 * Comparte el patrón de accesibilidad de `Input`: `useId()` como respaldo del `id` y
 * `aria-invalid`/`aria-describedby` cuando existe un error.
 */
export function Select({
  label,
  opciones,
  error,
  id,
  className,
  ...props
}: SelectProps) {
  const idGenerado = useId();
  const controlId = id ?? idGenerado;
  const errorId = `${controlId}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={controlId} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <select
        id={controlId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          ESTILOS_CONTROL,
          error &&
            "border-red-500/60 focus:border-red-500 focus:ring-red-500/40",
          className,
        )}
        {...props}
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
