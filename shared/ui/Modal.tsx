"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";

/** Tema visual opcional del diálogo. */
type TemaModal = "claro" | "oscuro";

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
  /** Tema visual opcional; conserva el tema claro por defecto. */
  tema?: TemaModal;
};

/**
 * Diálogo modal accesible construido sobre el elemento nativo `<dialog>`.
 *
 * `showModal()` aporta de forma nativa el atrapado de foco, `aria-modal`, el cierre con
 * `Escape` y la restauración del foco al elemento que lo abrió; no requiere `createPortal`
 * ni manejo manual de foco.
 */
export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
  pie,
  tema = "claro",
}: ModalProps) {
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  const esOscuro = tema === "oscuro";

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
      className={cn(
        "m-auto w-full max-w-lg rounded-lg p-0 shadow-xl backdrop:bg-black/40",
        esOscuro
          ? "border border-white/8 bg-elinain-surface text-zinc-200"
          : "border border-zinc-200 bg-white text-zinc-900",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-4 border-b px-4 py-3",
          esOscuro ? "border-white/8" : "border-zinc-200",
        )}
      >
        <h2 id={tituloId} className="text-base font-semibold">
          {titulo}
        </h2>
        <Button
          variante="secundario"
          onClick={onCerrar}
          className={
            esOscuro
              ? "border-white/8 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08] hover:text-white focus-visible:ring-elinain-gold"
              : undefined
          }
        >
          Cerrar
        </Button>
      </div>
      <div className="px-4 py-4">{children}</div>
      {pie ? (
        <div
          className={cn(
            "flex justify-end gap-2 border-t px-4 py-3",
            esOscuro ? "border-white/8" : "border-zinc-200",
          )}
        >
          {pie}
        </div>
      ) : null}
    </dialog>
  );
}
