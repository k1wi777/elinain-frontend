import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/features/auth";

import { ESTILOS_ENLACE_FOCUS_DASHBOARD } from "./dashboard-styles";

/** Props del layout del área protegida. */
type Props = { children: ReactNode };

/** Layout del área protegida: shell oscuro con navegación y acceso al cierre de sesión. */
export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-elinain-bg text-white">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-elinain-bg/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3.5 sm:px-8">
          <Link
            href="/dashboard"
            className={`${ESTILOS_ENLACE_FOCUS_DASHBOARD} flex items-center gap-2.5 text-white`}
          >
            <span
              aria-hidden
              className="size-2 rounded-full bg-elinain-gold shadow-[0_0_16px_rgb(232_185_35_/_0.75)]"
            />
            <span className="font-display text-lg font-semibold tracking-tight">
              Elinain
            </span>
          </Link>

          <nav
            aria-label="Navegación principal"
            className="order-3 flex w-full items-center gap-1 overflow-x-auto pb-0.5 sm:order-2 sm:w-auto sm:gap-2"
          >
            <Link
              href="/terceros"
              className={`${ESTILOS_ENLACE_FOCUS_DASHBOARD} shrink-0 px-2.5 py-1.5 text-xs font-medium  transition-colors hover:bg-white/5 hover:text-white sm:text-sm`}
            >
              Socios de participación
            </Link>
            <Link
              href="/fincas"
              className={`${ESTILOS_ENLACE_FOCUS_DASHBOARD} shrink-0 px-2.5 py-1.5 text-xs font-medium  transition-colors hover:bg-white/5 hover:text-white sm:text-sm`}
            >
              Fincas
            </Link>
            <Link
              href="/contratos"
              className={`${ESTILOS_ENLACE_FOCUS_DASHBOARD} shrink-0 px-2.5 py-1.5 text-xs font-medium  transition-colors hover:bg-white/5 hover:text-white sm:text-sm`}
            >
              Contratos
            </Link>
            <Link
              href="/ventas"
              className={`${ESTILOS_ENLACE_FOCUS_DASHBOARD} shrink-0 px-2.5 py-1.5 text-xs font-medium  transition-colors hover:bg-white/5 hover:text-white sm:text-sm`}
            >
              Ventas
            </Link>
          </nav>

          <div className="order-2 sm:order-3">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="relative flex-1 overflow-hidden bg-elinain-bg px-5 py-8 sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgb(232_185_35_/_0.08),transparent_32%)]"
        />
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}
