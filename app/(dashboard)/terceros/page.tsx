import type { Metadata } from "next";

import { TercerosTable } from "@/features/terceros";

export const metadata: Metadata = {
  title: "Socios de participación | Elinain",
};

/**
 * Página de socios de participación.
 *
 * Server Component delgado: compone el listado del feature `terceros` sin lógica de
 * negocio.
 */
export default function TercerosPage() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <TercerosTable />
    </section>
  );
}
