import type { Metadata } from "next";

import { ResumenDashboard } from "@/features/dashboard";

export const metadata: Metadata = { title: "Panel | Elinain" };

/**
 * Vista principal del panel del comerciante.
 *
 * Server Component delgado: compone la vista de reportes del feature `dashboard`. La
 * obtención de datos y los estados de carga y error viven dentro del feature.
 */
export default function DashboardPage() {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Panel</h1>
      <ResumenDashboard />
    </section>
  );
}
