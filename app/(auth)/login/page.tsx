import type { Metadata } from "next";

import { LoginShell } from "@/features/auth";

export const metadata: Metadata = { title: "Iniciar sesión | Elinain" };

/** Página de acceso con layout premium de dos columnas. */
export default function LoginPage() {
  return <LoginShell />;
}
