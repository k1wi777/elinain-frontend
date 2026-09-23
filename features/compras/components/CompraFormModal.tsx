"use client";

import { Modal } from "@/shared/ui";
import { CompraForm } from "@/features/compras/components/CompraForm";
import type { DatosFormularioCompra } from "@/features/compras/schemas";
import type { Compra } from "@/features/compras/types";

/** Props del componente `CompraFormModal`. */
type Props = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Modo del formulario: registro o edición. */
  modo: "crear" | "editar";
  /** Compra a editar; solo en modo edición. */
  compra?: Compra;
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioCompra) => void;
  /** Se invoca al cancelar o cerrar el diálogo. */
  onCerrar: () => void;
};

/**
 * Diálogo de registro y edición de una compra.
 *
 * Compone el `Modal` accesible del sistema de diseño con `CompraForm`. El diálogo no se
 * cierra por sí solo: la sección que lo usa solo lo cierra cuando la mutación tiene éxito,
 * de modo que un `409` u otro error mantienen el formulario abierto con los datos
 * ingresados.
 */
export function CompraFormModal({
  abierto,
  modo,
  compra,
  enviando,
  mensajeError,
  onGuardar,
  onCerrar,
}: Props) {
  return (
    <Modal
      abierto={abierto}
      titulo={modo === "editar" ? "Editar compra" : "Registrar compra"}
      onCerrar={onCerrar}
    >
      <CompraForm
        key={compra?.id ?? "crear"}
        modo={modo}
        compra={compra}
        enviando={enviando}
        mensajeError={mensajeError}
        onGuardar={onGuardar}
        onCancelar={onCerrar}
      />
    </Modal>
  );
}
