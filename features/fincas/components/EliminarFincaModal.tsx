"use client";

import { Button, Modal } from "@/shared/ui";
import type { Finca } from "@/features/fincas/types";

/** Props del componente `EliminarFincaModal`. */
type Props = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Finca a eliminar; los datos se muestran en el mensaje de confirmación. */
  finca: Finca | null;
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
 * Confirmación de borrado de una finca.
 *
 * Reutiliza el `Modal` accesible del sistema de diseño: advierte que la acción no se puede
 * deshacer, nombra la finca y expone el error de la operación (incluido el `409` de
 * contratos vinculados) sin cerrar el diálogo.
 */
export function EliminarFincaModal({
  abierto,
  finca,
  enviando,
  mensajeError,
  onConfirmar,
  onCerrar,
}: Props) {
  return (
    <Modal
      abierto={abierto}
      titulo="Eliminar finca"
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
        ¿Seguro que quieres eliminar la finca{" "}
        <span className="font-medium">{finca?.nombre}</span>? Esta acción no se
        puede deshacer.
      </p>

      {mensajeError ? (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {mensajeError}
        </p>
      ) : null}
    </Modal>
  );
}
