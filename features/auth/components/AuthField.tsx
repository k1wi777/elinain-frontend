"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import {
  ESTILOS_CONTROL_CAMPO,
  ESTILOS_ETIQUETA_CAMPO,
} from "@/features/auth/auth-styles";

/** Props de un campo de formulario en pantallas de acceso. */
export type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icono?: ReactNode;
  /** Contenido a la derecha del input (p. ej. alternar visibilidad de contraseña). */
  accionDerecha?: ReactNode;
};

/**
 * Campo accesible con estilo oscuro para login y registro.
 */
export function AuthField({
  label,
  error,
  icono,
  accionDerecha,
  id,
  className,
  ...props
}: AuthFieldProps) {
  const idGenerado = useId();
  const controlId = id ?? idGenerado;
  const errorId = `${controlId}-error`;

  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={controlId} className={ESTILOS_ETIQUETA_CAMPO}>
        {label}
      </label>
      <div className="relative flex items-center">
        {icono ? (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 text-elinain-muted/80"
          >
            {icono}
          </span>
        ) : null}
        <input
          id={controlId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            ESTILOS_CONTROL_CAMPO,
            icono && "pl-11",
            accionDerecha && "pr-11",
            error &&
              "border-red-500/60 focus:border-red-500 focus:ring-red-500/30",
            className,
          )}
          {...props}
        />
        {accionDerecha ? (
          <div className="absolute right-1">{accionDerecha}</div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-sm leading-relaxed text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
