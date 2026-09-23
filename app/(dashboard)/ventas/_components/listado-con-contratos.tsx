"use client";

import { useQueryClient } from "@tanstack/react-query";

import { formatearFechaHora } from "@/shared/lib/fechas";
import {
  clavesContratos,
  useContratos,
  type Contrato,
} from "@/features/contratos";
import { VentasListado, type ContratoVenta } from "@/features/ventas";

/** Construye la etiqueta legible de un contrato para el selector. */
function etiquetaContrato(contrato: Contrato): string {
  return `Contrato del ${formatearFechaHora(contrato.fecha_apertura) || "—"} · ${
    contrato.estado
  }`;
}

/**
 * Composición del listado global de ventas con los contratos del comerciante.
 *
 * Carga los contratos con `useContratos`, los proyecta a `ContratoVenta` para el filtro y
 * el formulario, y pasa la colección por props a `features/ventas`, de modo que el feature
 * de ventas nunca importa de `features/contratos`. Al registrar una venta se invalidan los
 * contratos para reflejar sus agregados actualizados.
 */
export function ListadoConContratos() {
  const queryClient = useQueryClient();
  const consulta = useContratos();

  if (consulta.isPending) {
    return <p className="text-sm text-zinc-500">Cargando…</p>;
  }

  if (consulta.error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        No se pudieron cargar los contratos para el filtro.
      </p>
    );
  }

  const contratos: ContratoVenta[] = (consulta.data ?? []).map((contrato) => ({
    id: contrato.id,
    etiqueta: etiquetaContrato(contrato),
  }));

  return (
    <VentasListado
      contratos={contratos}
      onCambio={() => {
        void queryClient.invalidateQueries({
          queryKey: clavesContratos.todas,
        });
      }}
    />
  );
}
