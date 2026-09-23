"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "@/shared/ui/Button";

/** Props del componente `Modal`. */
export type ModalProps = {
  /** Controla la visibilidad del diálogo. */
  abierto: boolean;
  /** Título asociado al diálogo mediante `aria-labelledby`. */
  titulo: string;
  /** Se invoca al cerrar con `Escape` o con el botón "Cerrar". */
  onCerrar: () => void;
  /** Contenido principal del diálogo. */
  children: ReactNode;
  /** Contenido opcional del pie, por ejemplo acciones de confirmación. */
  pie?: ReactNode;
};

/**
 * Diálogo modal accesible construido sobre el elemento nativo `<dialog>`.
 *
 * `showModal()` aporta de forma nativa el atrapado de foco, `aria-modal`, el cierre con
 * `Escape` y la restauración del foco al elemento que lo abrió; no requiere `createPortal`
 * ni manejo manual de foco. Usa siempre el tema oscuro con glassmorphism del shell.
 */
export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
  pie,
}: ModalProps) {
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const tituloId = useId();

  useEffect(() => {
    const dialogo = dialogoRef.current;

    if (!dialogo) {
      return;
    }

    if (abierto && !dialogo.open) {
      dialogo.showModal();
    } else if (!abierto && dialogo.open) {
      dialogo.close();
    }
  }, [abierto]);

  return (
    <dialog
      ref={dialogoRef}
      aria-labelledby={tituloId}
      onCancel={(evento) => {
        evento.preventDefault();
        onCerrar();
      }}
      className="m-auto w-full max-w-lg rounded-2xl p-0 text-zinc-200 glass-panel backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/8 px-4 py-3">
        <h2 id={tituloId} className="text-base font-semibold text-white">
          {titulo}
        </h2>
        <Button
          variante="secundario"
          onClick={onCerrar}
          className="border-white/8 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08] hover:text-white focus-visible:ring-elinain-gold"
        >
          Cerrar
        </Button>
      </div>
      <div className="px-4 py-4">{children}</div>
      {pie ? (
        <div className="flex justify-end gap-2 border-t border-white/8 px-4 py-3">
          {pie}
        </div>
      ) : null}
    </dialog>
  );
}
