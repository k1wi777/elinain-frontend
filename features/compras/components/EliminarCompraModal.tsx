"use client";

import { formatearFechaHora } from "@/shared/lib/fechas";
import { Button, Modal } from "@/shared/ui";
import type { Compra } from "@/features/compras/types";

/** Props del componente `EliminarCompraModal`. */
type Props = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Compra a eliminar; los datos se muestran en el mensaje de confirmación. */
  compra: Compra | null;
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
 * Confirmación de borrado de una compra.
 *
 * Reutiliza el `Modal` accesible del sistema de diseño en lugar de `window.confirm`: pide
 * confirmación previa, advierte que la acción no se puede deshacer y expone el error de la
 * operación (incluido el `409` de contrato con ventas registradas) sin cerrar el diálogo.
 */
export function EliminarCompraModal({
  abierto,
  compra,
  enviando,
  mensajeError,
  onConfirmar,
  onCerrar,
}: Props) {
  return (
    <Modal
      abierto={abierto}
      titulo="Eliminar compra"
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
        ¿Seguro que quieres eliminar la compra del{" "}
        <span className="font-medium">
          {compra ? formatearFecha(compra.fecha) : ""}
        </span>
        ? Esta acción no se puede deshacer.
      </p>

      {mensajeError ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {mensajeError}
        </p>
      ) : null}
    </Modal>
  );
}

/** Presenta la fecha de la compra o un guion cuando no es válida. */
function formatearFecha(fecha: string): string {
  return formatearFechaHora(fecha) || "fecha no informada";
}
