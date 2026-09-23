import type { Metadata } from "next";

import { ContratosActivosReporte } from "@/features/reportes";

export const metadata: Metadata = { title: "Contratos activos | Elinain" };

/**
 * Página del reporte de contratos activos.
 *
 * Server Component delgado: compone la vista del feature `reportes`, que incluye el
 * encabezado, los estados de carga, error y vacío y la obtención de datos.
 */
export default function ContratosActivosPage() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <ContratosActivosReporte />
    </section>
  );
}
