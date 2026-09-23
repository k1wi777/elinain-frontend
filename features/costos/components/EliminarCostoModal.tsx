"use client";

import { formatearFechaDia } from "@/shared/lib/fechas";
import { Button, Modal } from "@/shared/ui";
import type { Costo } from "@/features/costos/types";

/** Props del componente `EliminarCostoModal`. */
type Props = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Costo a eliminar; los datos se muestran en el mensaje de confirmación. */
  costo: Costo | null;
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
 * Confirmación de borrado de un costo.
 *
 * Reutiliza el `Modal` accesible del sistema de diseño en lugar de `window.confirm`: pide
 * confirmación previa, advierte que la acción no se puede deshacer y expone el error de la
 * operación sin cerrar el diálogo.
 */
export function EliminarCostoModal({
  abierto,
  costo,
  enviando,
  mensajeError,
  onConfirmar,
  onCerrar,
}: Props) {
  return (
    <Modal
      abierto={abierto}
      titulo="Eliminar costo"
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
        ¿Seguro que quieres eliminar el costo{" "}
        <span className="font-medium">{describirCosto(costo)}</span>? Esta
        acción no se puede deshacer.
      </p>

      {mensajeError ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {mensajeError}
        </p>
      ) : null}
    </Modal>
  );
}

/** Describe el costo con su tipo y fecha, o un texto de reemplazo si faltan datos. */
function describirCosto(costo: Costo | null): string {
  if (!costo) {
    return "seleccionado";
  }

  const tipo = costo.tipo.trim() !== "" ? costo.tipo : "sin tipo";
  const fecha = formatearFechaDia(costo.fecha);

  return fecha !== "" ? `«${tipo}» del ${fecha}` : `«${tipo}»`;
}
