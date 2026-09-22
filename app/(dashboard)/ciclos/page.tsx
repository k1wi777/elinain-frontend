import type { Metadata } from "next";

import { CiclosProximamente } from "@/features/ciclos";

export const metadata: Metadata = { title: "Ciclos | Elinain" };

/**
 * Página del módulo de ciclos.
 *
 * Módulo bloqueado por el backend: compone el marcador de posición del feature `ciclos`.
 */
export default function CiclosPage() {
  return <CiclosProximamente />;
}
