import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/features/auth";

/** Props del layout del área protegida. */
type Props = { children: ReactNode };

/** Layout del área protegida: cabecera mínima con acceso al cierre de sesión. */
export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <Link
          href="/dashboard"
          className="text-base font-semibold text-zinc-900"
        >
          Elinain
        </Link>
        <LogoutButton />
      </header>
      <main className="flex-1 bg-zinc-50 px-6 py-8">{children}</main>
    </div>
  );
}
