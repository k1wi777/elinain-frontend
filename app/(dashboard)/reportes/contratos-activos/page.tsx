import type { Metadata } from "next";

import { ContratosActivosReporte } from "@/features/reportes";

export const metadata: Metadata = { title: "Contratos activos | Elinain" };

/**
 * Página del reporte de contratos activos.
 *
 * Server Component delgado: compone la vista del feature `reportes`. La obtención de
 * datos y los estados de carga y error viven dentro del feature.
 */
export default function ContratosActivosPage() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">
        Contratos activos
      </h1>
      <ContratosActivosReporte />
    </section>
  );
}
