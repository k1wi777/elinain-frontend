import type { Metadata } from "next";

import { VentasProximamente } from "@/features/ventas";

export const metadata: Metadata = { title: "Ventas | Elinain" };

/**
 * Página del módulo de ventas.
 *
 * Módulo bloqueado por el backend: compone el marcador de posición del feature `ventas`.
 */
export default function VentasPage() {
  return <VentasProximamente />;
}
