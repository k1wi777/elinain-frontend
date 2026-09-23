"use client";

import {
  ContratoEditar,
  type FincaContrato,
  type TerceroContrato,
} from "@/features/contratos";
import { useTodasLasFincas } from "@/features/fincas";
import { useTodosLosTerceros } from "@/features/terceros";

/** Props del componente `EditarConRelaciones`. */
type Props = {
  /** Identificador del contrato a editar. */
  id: string;
};

/**
 * Composición del formulario de edición con terceros y fincas.
 *
 * Carga los terceros y las fincas para mostrar los inmutables y los pasa por props a
 * `features/contratos`, sin que el feature importe de otros features.
 */
export function EditarConRelaciones({ id }: Props) {
  const terceros = useTodosLosTerceros();
  const fincas = useTodasLasFincas();

  if (terceros.isPending || fincas.isPending) {
    return <p className="text-sm text-zinc-400">Cargando…</p>;
  }

  if (terceros.error || fincas.error) {
    return (
      <p role="alert" className="text-sm text-red-400">
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
    <ContratoEditar
      id={id}
      terceros={tercerosContrato}
      fincas={fincasContrato}
    />
  );
}
