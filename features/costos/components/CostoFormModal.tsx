"use client";

import { Modal } from "@/shared/ui";
import { CostoForm } from "@/features/costos/components/CostoForm";
import type { DatosFormularioCosto } from "@/features/costos/schemas";
import type { Costo } from "@/features/costos/types";

/** Props del componente `CostoFormModal`. */
type Props = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Modo del formulario: registro o edición. */
  modo: "crear" | "editar";
  /** Costo a editar; solo en modo edición. */
  costo?: Costo;
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioCosto) => void;
  /** Se invoca al cancelar o cerrar el diálogo. */
  onCerrar: () => void;
};

/**
 * Diálogo de registro y edición de un costo.
 *
 * Compone el `Modal` accesible del sistema de diseño con `CostoForm`. El diálogo no se
 * cierra por sí solo: la sección que lo usa solo lo cierra cuando la mutación tiene éxito,
 * de modo que un error mantiene el formulario abierto con los datos ingresados.
 */
export function CostoFormModal({
  abierto,
  modo,
  costo,
  enviando,
  mensajeError,
  onGuardar,
  onCerrar,
}: Props) {
  return (
    <Modal
      abierto={abierto}
      titulo={modo === "editar" ? "Editar costo" : "Registrar costo"}
      onCerrar={onCerrar}
    >
      <CostoForm
        key={costo?.id ?? "crear"}
        modo={modo}
        costo={costo}
        enviando={enviando}
        mensajeError={mensajeError}
        onGuardar={onGuardar}
        onCancelar={onCerrar}
      />
    </Modal>
  );
}
