import type { Metadata } from "next";
import Link from "next/link";

import { ResumenDashboard } from "@/features/dashboard";

export const metadata: Metadata = { title: "Panel | Elinain" };

/**
 * Vista principal del panel del comerciante.
 *
 * Server Component delgado: compone la vista de reportes del feature `dashboard` y los
 * enlaces de composición a las dos vistas de reportes. La obtención de datos y los
 * estados de carga y error viven dentro del feature.
 */
export default function DashboardPage() {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Panel</h1>
      <nav aria-label="Reportes" className="mb-6 flex flex-wrap gap-4">
        <Link
          href="/reportes/contratos-activos"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Contratos activos
        </Link>
        <Link
          href="/reportes/historial-ventas"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Historial de ventas
        </Link>
      </nav>
      <ResumenDashboard />
    </section>
  );
}
