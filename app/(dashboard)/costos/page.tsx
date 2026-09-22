import type { Metadata } from "next";

import { CostosProximamente } from "@/features/costos";

export const metadata: Metadata = { title: "Costos | Elinain" };

/**
 * Página del módulo de costos.
 *
 * Módulo bloqueado por el backend: compone el marcador de posición del feature `costos`.
 */
export default function CostosPage() {
  return <CostosProximamente />;
}
