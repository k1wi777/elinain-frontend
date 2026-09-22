import { cn } from "@/shared/lib/cn";

/** Props del componente `Skeleton`. */
type Props = {
  /** Clases que definen el tamaño y la forma del bloque. */
  className?: string;
};

/**
 * Bloque decorativo que representa contenido en carga.
 *
 * Es puramente presentacional y no conoce el dominio: aporta el lenguaje visual de "cargando"
 * y delega en `className` el tamaño y la forma. Al ser decorativo, queda oculto a las
 * tecnologías de asistencia.
 */
export function Skeleton({ className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-zinc-200", className)}
    />
  );
}
