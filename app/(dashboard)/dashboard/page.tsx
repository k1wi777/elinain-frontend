import type { Metadata } from "next";
import Link from "next/link";

import { ResumenDashboard } from "@/features/dashboard";

import { ESTILOS_ENLACE_FOCUS_DASHBOARD } from "../dashboard-styles";

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
    <section
      aria-labelledby="dashboard-title"
      className="mx-auto w-full max-w-6xl"
    >
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <header className="max-w-2xl">
          <p className="mb-3 text-[0.68rem] font-semibold tracking-[0.2em] text-elinain-gold uppercase">
            Vista general
          </p>
          <h1
            id="dashboard-title"
            className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            Panel del comerciante
          </h1>
          <p className="mt-3 text-sm leading-7 text-elinain-muted sm:text-base">
            Consulta el rendimiento acumulado de tu operación y accede a los
            reportes que requieren seguimiento.
          </p>
        </header>

        <nav
          aria-label="Reportes"
          className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl"
        >
          <Link
            href="/reportes/contratos-activos"
            className={`${ESTILOS_ENLACE_FOCUS_DASHBOARD} group rounded-xl border border-white/8 bg-elinain-surface p-4 shadow-lg shadow-black/10 transition-colors hover:border-elinain-gold/30 hover:bg-elinain-surface-elevated`}
          >
            <span className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-semibold text-white">
                  Contratos activos
                </span>
                <span className="mt-1 block text-xs leading-5 text-elinain-muted">
                  Revisa el estado de los ciclos en curso.
                </span>
              </span>
              <span
                aria-hidden
                className="text-lg text-elinain-gold transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
          <Link
            href="/reportes/historial-ventas"
            className={`${ESTILOS_ENLACE_FOCUS_DASHBOARD} group rounded-xl border border-white/8 bg-elinain-surface p-4 shadow-lg shadow-black/10 transition-colors hover:border-elinain-gold/30 hover:bg-elinain-surface-elevated`}
          >
            <span className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-semibold text-white">
                  Historial de ventas
                </span>
                <span className="mt-1 block text-xs leading-5 text-elinain-muted">
                  Consulta las operaciones comerciales registradas.
                </span>
              </span>
              <span
                aria-hidden
                className="text-lg text-elinain-gold transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        </nav>
      </div>
      <ResumenDashboard />
    </section>
  );
}
