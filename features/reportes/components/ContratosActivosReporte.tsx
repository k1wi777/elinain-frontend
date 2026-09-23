"use client";

import { Skeleton, Table, type ColumnaTabla } from "@/shared/ui";
import { formatearConteo, formatearMoneda } from "@/features/reportes/formatos";
import { useReporteContratosActivos } from "@/features/reportes/hooks/useReporteContratosActivos";
import { mensajeErrorContratosActivos } from "@/features/reportes/mensajes-error";
import { ordenarContratosPorUtilidadDescendente } from "@/features/reportes/orden";
import type { ContratoActivoDetalle } from "@/features/reportes/types";

/** Columnas del reporte de contratos activos. */
const COLUMNAS: ColumnaTabla<ContratoActivoDetalle>[] = [
  {
    clave: "tercero",
    encabezado: "Tercero",
    render: (contrato) => contrato.tercero_nombre,
  },
  {
    clave: "finca",
    encabezado: "Finca",
    render: (contrato) => contrato.finca_nombre,
  },
  {
    clave: "cantidad-actual",
    encabezado: "Cantidad actual",
    render: (contrato) => formatearConteo(contrato.cantidad_actual),
  },
  {
    clave: "total-compras",
    encabezado: "Total compras",
    render: (contrato) => formatearConteo(contrato.total_compras),
  },
  {
    clave: "total-ventas",
    encabezado: "Total ventas",
    render: (contrato) => formatearConteo(contrato.total_ventas),
  },
  {
    clave: "utilidad",
    encabezado: "Utilidad generada",
    alineacion: "derecha",
    render: (contrato) =>
      formatearMoneda(contrato.utilidad_generada_comerciante),
  },
];

/**
 * Vista del reporte de contratos activos del comerciante.
 *
 * Consume la consulta de solo lectura y reproduce la forma de la tabla con `Skeleton`
 * mientras carga. En error muestra un mensaje en español sin detalle técnico; en éxito
 * presenta cada contrato con sus métricas, ordenado por utilidad generada por el
 * comerciante de forma descendente para comparar de un vistazo qué contratos rinden
 * mejor. Los valores se muestran tal como los entrega el backend.
 */
export function ContratosActivosReporte() {
  const consulta = useReporteContratosActivos();

  if (consulta.isPending) {
    return (
      <section
        aria-busy="true"
        aria-label="Reporte de contratos activos"
        className="flex flex-col gap-4"
      >
        <span className="sr-only">Cargando el reporte…</span>
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  if (consulta.error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {mensajeErrorContratosActivos(consulta.error.status)}
      </p>
    );
  }

  const contratos = ordenarContratosPorUtilidadDescendente(
    consulta.data.contratos,
  );

  return (
    <section aria-label="Reporte de contratos activos">
      <Table
        columnas={COLUMNAS}
        filas={contratos}
        obtenerClave={(contrato) => contrato.contrato_id}
        mensajeVacio="Aún no hay contratos activos"
      />
    </section>
  );
}
