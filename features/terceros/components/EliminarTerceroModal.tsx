"use client";

import { Button, Modal } from "@/shared/ui";
import type { Tercero } from "@/features/terceros/types";

/** Props del componente `EliminarTerceroModal`. */
type Props = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Socio a eliminar; los datos se muestran en el mensaje de confirmación. */
  tercero: Tercero | null;
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
 * Confirmación de borrado de un socio de participación.
 *
 * Reutiliza el `Modal` accesible del sistema de diseño en lugar de `window.confirm`:
 * advierte que la acción no se puede deshacer, nombra al socio y expone el error de la
 * operación (incluido el `409` de contratos activos) sin cerrar el diálogo.
 */
export function EliminarTerceroModal({
  abierto,
  tercero,
  enviando,
  mensajeError,
  onConfirmar,
  onCerrar,
}: Props) {
  return (
    <Modal
      abierto={abierto}
      titulo="Eliminar socio de participación"
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
      <p className="text-sm text-zinc-700">
        ¿Seguro que quieres eliminar a{" "}
        <span className="font-medium">{tercero?.nombre}</span>? Esta acción no
        se puede deshacer.
      </p>

      {mensajeError ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {mensajeError}
        </p>
      ) : null}
    </Modal>
  );
}
