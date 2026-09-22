import type { Metadata } from "next";

import { ListadoConPropietarios } from "./_components/listado-con-propietarios";

export const metadata: Metadata = { title: "Fincas | Elinain" };

/**
 * Página de fincas.
 *
 * Server Component delgado: compone el listado y el mapa del feature `fincas` con los
 * propietarios que resuelve `app/`.
 */
export default function FincasPage() {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Fincas</h1>
      <ListadoConPropietarios />
    </section>
  );
}
