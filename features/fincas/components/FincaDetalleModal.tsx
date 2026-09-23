"use client";

import Link from "next/link";

import { Modal } from "@/shared/ui";
import {
  indexarPropietarios,
  nombreDePropietario,
} from "@/features/fincas/propietarios";
import type { Finca, Propietario } from "@/features/fincas/types";

/** Estilos de un enlace que se comporta visualmente como acción dorada del panel. */
const ESTILOS_ENLACE_EDITAR =
  "inline-flex items-center justify-center gap-2 rounded-md border border-elinain-gold/40 bg-elinain-gold-muted px-4 py-2 text-sm font-medium text-elinain-gold transition-colors hover:border-elinain-gold hover:bg-elinain-gold/20 focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:outline-none";

/** Props del componente `FincaDetalleModal`. */
type Props = {
  /** Finca a mostrar; el modal se abre cuando no es `null`. */
  finca: Finca | null;
  /** Propietarios para resolver el nombre; los compone `app/`. */
  propietarios: Propietario[];
  /** Se invoca al cerrar el diálogo. */
  onCerrar: () => void;
};

/**
 * Panel oscuro con la información general de una finca.
 *
 * Se abre desde el popup del mapa ("Ver detalle") sin cambiar de ruta, muestra nombre,
 * propietario, dirección y coordenadas, y ofrece la acción de editar. Reutiliza el `Modal`
 * accesible del sistema de diseño, que ya usa el tema oscuro del shell.
 */
export function FincaDetalleModal({ finca, propietarios, onCerrar }: Props) {
  const propietariosPorId = indexarPropietarios(propietarios);

  return (
    <Modal
      abierto={finca !== null}
      titulo="Detalle de la finca"
      onCerrar={onCerrar}
      pie={
        finca ? (
          <Link
            href={`/fincas/${finca.id}/editar`}
            className={ESTILOS_ENLACE_EDITAR}
          >
            Editar
          </Link>
        ) : undefined
      }
    >
      {finca ? (
        <dl className="flex flex-col gap-3 text-sm">
          <div className="rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
            <dt className="text-xs font-semibold tracking-[0.14em] text-zinc-500 uppercase">
              Nombre
            </dt>
            <dd className="mt-1 text-white">{finca.nombre}</dd>
          </div>
          <div className="rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
            <dt className="text-xs font-semibold tracking-[0.14em] text-zinc-500 uppercase">
              Propietario
            </dt>
            <dd className="mt-1 text-zinc-200">
              {nombreDePropietario(propietariosPorId, finca.tercero_id)}
            </dd>
          </div>
          <div className="rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
            <dt className="text-xs font-semibold tracking-[0.14em] text-zinc-500 uppercase">
              Dirección
            </dt>
            <dd className="mt-1 text-zinc-200">{finca.direccion}</dd>
          </div>
          <div className="rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
            <dt className="text-xs font-semibold tracking-[0.14em] text-zinc-500 uppercase">
              Coordenadas
            </dt>
            <dd className="mt-1 text-zinc-200">
              {finca.latitud}, {finca.longitud}
            </dd>
          </div>
        </dl>
      ) : null}
    </Modal>
  );
}
