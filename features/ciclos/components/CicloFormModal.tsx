"use client";

import { Modal } from "@/shared/ui";
import { CicloForm } from "@/features/ciclos/components/CicloForm";
import type { DatosFormularioCiclo } from "@/features/ciclos/schemas";
import type { Ciclo } from "@/features/ciclos/types";

/** Props del componente `CicloFormModal`. */
type Props = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Modo del formulario: registro o edición. */
  modo: "crear" | "editar";
  /** Ciclo a editar; solo en modo edición. */
  ciclo?: Ciclo;
  /** Indica si el guardado está en curso. */
  enviando: boolean;
  /** Mensaje de error general a mostrar dentro del formulario. */
  mensajeError: string | null;
  /** Se invoca con los datos validados al enviar el formulario. */
  onGuardar: (datos: DatosFormularioCiclo) => void;
  /** Se invoca al cancelar o cerrar el diálogo. */
  onCerrar: () => void;
};

/**
 * Diálogo de registro y edición de un ciclo.
 *
 * Compone el `Modal` accesible del sistema de diseño con `CicloForm`. El diálogo no se
 * cierra por sí solo: la sección que lo usa solo lo cierra cuando la mutación tiene éxito,
 * de modo que un error mantiene el formulario abierto con los datos ingresados.
 */
export function CicloFormModal({
  abierto,
  modo,
  ciclo,
  enviando,
  mensajeError,
  onGuardar,
  onCerrar,
}: Props) {
  return (
    <Modal
      abierto={abierto}
      titulo={modo === "editar" ? "Editar ciclo" : "Registrar ciclo"}
      onCerrar={onCerrar}
    >
      <CicloForm
        key={ciclo?.id ?? "crear"}
        modo={modo}
        ciclo={ciclo}
        enviando={enviando}
        mensajeError={mensajeError}
        onGuardar={onGuardar}
        onCancelar={onCerrar}
      />
    </Modal>
  );
}
