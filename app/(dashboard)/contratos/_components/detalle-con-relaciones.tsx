"use client";

import {
  ContratoDetalle,
  type FincaContrato,
  type TerceroContrato,
} from "@/features/contratos";
import { useTodasLasFincas } from "@/features/fincas";
import { useTodosLosTerceros } from "@/features/terceros";

/** Props del componente `DetalleConRelaciones`. */
type Props = {
  /** Identificador del contrato a mostrar. */
  id: string;
};

/**
 * Composición del detalle de contrato con terceros y fincas.
 *
 * Carga los terceros y las fincas para resolver los nombres y los pasa por props a
 * `features/contratos`, sin que el feature importe de otros features.
 */
export function DetalleConRelaciones({ id }: Props) {
  const terceros = useTodosLosTerceros();
  const fincas = useTodasLasFincas();

  if (terceros.isPending || fincas.isPending) {
    return <p className="text-sm text-zinc-500">Cargando…</p>;
  }

  if (terceros.error || fincas.error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        No se pudieron cargar los socios de participación ni las fincas.
      </p>
    );
  }

  const tercerosContrato: TerceroContrato[] = (terceros.data ?? []).map(
    (tercero) => ({ id: tercero.id, nombre: tercero.nombre }),
  );
  const fincasContrato: FincaContrato[] = (fincas.data ?? []).map((finca) => ({
    id: finca.id,
    nombre: finca.nombre,
    tercero_id: finca.tercero_id,
  }));

  return (
    <ContratoDetalle
      id={id}
      terceros={tercerosContrato}
      fincas={fincasContrato}
    />
  );
}
