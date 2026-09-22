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
    <section className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">
        Socios de participación
      </h1>
      <TercerosTable />
    </section>
  );
}
