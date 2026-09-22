"use client";

import Link from "next/link";

import { Modal } from "@/shared/ui";
import {
  indexarPropietarios,
  nombreDePropietario,
} from "@/features/fincas/propietarios";
import type { Finca, Propietario } from "@/features/fincas/types";

/** Estilos de un enlace que se comporta visualmente como botón secundario. */
const ESTILOS_ENLACE_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none";

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
 * Modal con la información general de una finca.
 *
 * Se abre desde el popup del mapa ("Ver detalle") sin cambiar de ruta, muestra nombre,
 * propietario, dirección y coordenadas, y ofrece la acción de editar.
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
            className={ESTILOS_ENLACE_SECUNDARIO}
          >
            Editar
          </Link>
        ) : undefined
      }
    >
      {finca ? (
        <dl className="flex flex-col gap-3 text-sm">
          <div>
            <dt className="font-medium text-zinc-600">Nombre</dt>
            <dd className="text-zinc-900">{finca.nombre}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-600">Propietario</dt>
            <dd className="text-zinc-900">
              {nombreDePropietario(propietariosPorId, finca.tercero_id)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-600">Dirección</dt>
            <dd className="text-zinc-900">{finca.direccion}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-600">Coordenadas</dt>
            <dd className="text-zinc-900">
              {finca.latitud}, {finca.longitud}
            </dd>
          </div>
        </dl>
      ) : null}
    </Modal>
  );
}
