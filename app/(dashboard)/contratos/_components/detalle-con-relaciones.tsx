"use client";

import { useQueryClient } from "@tanstack/react-query";

import { CiclosSeccion } from "@/features/ciclos";
import { ComprasSeccion } from "@/features/compras";
import {
  clavesContratos,
  ContratoDetalle,
  useContrato,
  type FincaContrato,
  type TerceroContrato,
} from "@/features/contratos";
import { CostosSeccion } from "@/features/costos";
import { useTodasLasFincas } from "@/features/fincas";
import { useTodosLosTerceros } from "@/features/terceros";
import { VentasSeccion } from "@/features/ventas";

/** Props del componente `DetalleConRelaciones`. */
type Props = {
  /** Identificador del contrato a mostrar. */
  id: string;
};

/**
 * Composición del detalle de contrato con terceros, fincas, compras, ciclos, costos y
 * ventas.
 *
 * Carga los terceros y las fincas para resolver los nombres y los pasa por props a
 * `features/contratos`, sin que el feature importe de otros features. Las compras, los
 * ciclos, los costos y las ventas se componen aquí, junto al detalle, sin que sus features
 * importen de `features/contratos` ni al revés. El estado del contrato se obtiene con
 * `useContrato` —que TanStack Query deduplica con la consulta de `ContratoDetalle`— y se
 * pasa a `CiclosSeccion` y `CostosSeccion` para deshabilitar el registro cuando el contrato
 * está cerrado.
 */
export function DetalleConRelaciones({ id }: Props) {
  const queryClient = useQueryClient();
  const terceros = useTodosLosTerceros();
  const fincas = useTodasLasFincas();
  const contrato = useContrato(id);

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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <ContratoDetalle
        id={id}
        terceros={tercerosContrato}
        fincas={fincasContrato}
      />
      <ComprasSeccion
        contratoId={id}
        onCambio={() => {
          void queryClient.invalidateQueries({
            queryKey: clavesContratos.todas,
          });
        }}
      />
      <CiclosSeccion
        contratoId={id}
        contratoEstado={contrato.data?.estado}
        onCambio={() => {
          void queryClient.invalidateQueries({
            queryKey: clavesContratos.todas,
          });
        }}
      />
      <CostosSeccion
        contratoId={id}
        contratoEstado={contrato.data?.estado}
        onCambio={() => {
          void queryClient.invalidateQueries({
            queryKey: clavesContratos.todas,
          });
        }}
      />
      <VentasSeccion
        contratoId={id}
        onCambio={() => {
          void queryClient.invalidateQueries({
            queryKey: clavesContratos.todas,
          });
        }}
      />
    </div>
  );
}
