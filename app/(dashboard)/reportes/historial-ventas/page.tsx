import type { Metadata } from "next";

import { HistorialVentasReporte } from "@/features/reportes";

export const metadata: Metadata = { title: "Historial de ventas | Elinain" };

/**
 * Página del historial de ventas.
 *
 * Server Component delgado: compone la vista del feature `reportes`, que incluye el
 * encabezado, los estados de carga, error y vacío y la obtención de datos.
 */
export default function HistorialVentasPage() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <HistorialVentasReporte />
    </section>
  );
}
