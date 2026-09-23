"use client";

import { formatearFechaDia } from "@/shared/lib/fechas";
import { Button, Modal } from "@/shared/ui";
import type { Ciclo } from "@/features/ciclos/types";

/** Props del componente `EliminarCicloModal`. */
type Props = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Ciclo a eliminar; los datos se muestran en el mensaje de confirmación. */
  ciclo: Ciclo | null;
  /** Indica si la eliminación está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del diálogo. */
  mensajeError: string | null;
  /** Se invoca al confirmar la eliminación. */
  onConfirmar: () => void;
  /** Se invoca al cancelar o cerrar el diálogo. */
  onCerrar: () => void;
};

/**
 * Confirmación de borrado de un ciclo.
 *
 * Reutiliza el `Modal` accesible del sistema de diseño en lugar de `window.confirm`: pide
 * confirmación previa, advierte que la acción no se puede deshacer y expone el error de la
 * operación sin cerrar el diálogo.
 */
export function EliminarCicloModal({
  abierto,
  ciclo,
  enviando,
  mensajeError,
  onConfirmar,
  onCerrar,
}: Props) {
  return (
    <Modal
      abierto={abierto}
      titulo="Eliminar ciclo"
      onCerrar={onCerrar}
      pie={
        <>
          <Button variante="secundario" onClick={onCerrar} disabled={enviando}>
            Cancelar
          </Button>
          <Button variante="peligro" onClick={onConfirmar} disabled={enviando}>
            Eliminar
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-300">
        ¿Seguro que quieres eliminar el ciclo del{" "}
        <span className="font-medium">
          {ciclo ? formatearFecha(ciclo.fecha) : ""}
        </span>
        ? Esta acción no se puede deshacer.
      </p>

      {mensajeError ? (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {mensajeError}
        </p>
      ) : null}
    </Modal>
  );
}

/** Presenta la fecha del ciclo o un texto de reemplazo cuando no es válida. */
function formatearFecha(fecha: string): string {
  return formatearFechaDia(fecha) || "fecha no informada";
}
