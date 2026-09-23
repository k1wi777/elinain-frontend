import type { Metadata } from "next";

import { HistorialVentasReporte } from "@/features/reportes";

export const metadata: Metadata = { title: "Historial de ventas | Elinain" };

/**
 * Página del historial de ventas.
 *
 * Server Component delgado: compone la vista del feature `reportes`. La obtención de
 * datos y los estados de carga y error viven dentro del feature.
 */
export default function HistorialVentasPage() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">
        Historial de ventas
      </h1>
      <HistorialVentasReporte />
    </section>
  );
}
