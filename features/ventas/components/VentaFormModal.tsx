"use client";

import { Modal } from "@/shared/ui";
import { VentaForm } from "@/features/ventas/components/VentaForm";
import type { DatosFormularioVenta } from "@/features/ventas/schemas";
import type { ContratoVenta } from "@/features/ventas/types";

/** Props del componente `VentaFormModal`. */
type Props = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Contrato fijo del registro embebido; si se informa no se muestra el selector. */
  contratoFijo?: string;
  /** Contratos para el selector del registro global. */
  contratos?: ContratoVenta[];
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioVenta) => void;
  /** Se invoca al cancelar o cerrar el diálogo. */
  onCerrar: () => void;
};

/**
 * Diálogo de registro de una venta.
 *
 * Compone el `Modal` accesible del sistema de diseño con `VentaForm`. El formulario solo se
 * monta mientras el diálogo está abierto, de modo que cada apertura parte de valores
 * vacíos; el diálogo no se cierra por sí solo y la sección que lo usa solo lo cierra cuando
 * la mutación tiene éxito, manteniendo los datos ingresados ante un error.
 */
export function VentaFormModal({
  abierto,
  contratoFijo,
  contratos,
  enviando,
  mensajeError,
  onGuardar,
  onCerrar,
}: Props) {
  return (
    <Modal abierto={abierto} titulo="Registrar venta" onCerrar={onCerrar}>
      {abierto ? (
        <VentaForm
          contratoFijo={contratoFijo}
          contratos={contratos}
          enviando={enviando}
          mensajeError={mensajeError}
          onGuardar={onGuardar}
          onCancelar={onCerrar}
        />
      ) : null}
    </Modal>
  );
}
