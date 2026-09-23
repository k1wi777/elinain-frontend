import type { Metadata } from "next";

import { RegistroShell } from "@/features/auth";

export const metadata: Metadata = { title: "Crear cuenta | Elinain" };

/** Página de registro con el layout oscuro compartido de las pantallas de acceso. */
export default function RegistroPage() {
  return <RegistroShell />;
}
