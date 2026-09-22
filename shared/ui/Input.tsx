"use client";

import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

/** Props del componente `Input`. */
export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Etiqueta asociada al control. */
  label: string;
  /** Mensaje de error; cuando existe se marca el control como inválido. */
  error?: string;
};

const ESTILOS_CONTROL =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Campo de texto accesible con etiqueta y mensaje de error vinculados.
 *
 * El `id` se genera con `useId()` cuando el consumidor no provee uno, de modo que la
 * etiqueta y el error siempre apunten al control correcto.
 */
export function Input({ label, error, id, className, ...props }: InputProps) {
  const idGenerado = useId();
  const controlId = id ?? idGenerado;
  const errorId = `${controlId}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={controlId} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={controlId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          ESTILOS_CONTROL,
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/40",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
