import type { Metadata } from "next";

import { ListadoConRelaciones } from "./_components/listado-con-relaciones";

export const metadata: Metadata = { title: "Contratos | Elinain" };

/**
 * Página del listado de contratos.
 *
 * Server Component delgado: compone el listado del feature `contratos` con los terceros y
 * las fincas que resuelve `app/`.
 */
export default function ContratosPage() {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Contratos</h1>
      <ListadoConRelaciones />
    </section>
  );
}
