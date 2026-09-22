import { cn } from "@/shared/lib/cn";

/** Variantes visuales y semánticas de una notificación. */
export type VarianteToast = "exito" | "error";

/** Props del componente `Toast`. */
export type ToastProps = {
  /** Controla la visibilidad; si es `false` no se renderiza nada. */
  abierto: boolean;
  /** Mensaje anunciado al usuario. */
  mensaje: string;
  /** Variante de la notificación; por defecto `"exito"`. */
  variante?: VarianteToast;
  /** Se invoca al cerrar la notificación. */
  onCerrar?: () => void;
};

const ESTILOS_POR_VARIANTE: Record<VarianteToast, string> = {
  exito: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
};

/**
 * Notificación presentacional de éxito o error.
 *
 * No incluye temporizadores ni auto-cierre: la visibilidad la controla el consumidor con
 * su propio estado local. Anuncia el mensaje con el rol accesible correspondiente.
 */
export function Toast({
  abierto,
  mensaje,
  variante = "exito",
  onCerrar,
}: ToastProps) {
  if (!abierto) {
    return null;
  }

  const esError = variante === "error";

  return (
    <div
      role={esError ? "alert" : "status"}
      aria-live={esError ? "assertive" : "polite"}
      className={cn(
        "fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-md px-4 py-3 text-sm shadow-lg",
        ESTILOS_POR_VARIANTE[variante],
      )}
    >
      <span>{mensaje}</span>
      {onCerrar ? (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar notificación"
          className="rounded-sm px-1 text-sm font-medium underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
        >
          Cerrar
        </button>
      ) : null}
    </div>
  );
}
