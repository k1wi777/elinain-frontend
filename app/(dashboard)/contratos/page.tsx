import type { Metadata } from "next";

import { ListadoConRelaciones } from "./_components/listado-con-relaciones";

export const metadata: Metadata = { title: "Contratos | Elinain" };

/**
 * Página del listado de contratos.
 *
 * Server Component delgado: compone el listado del feature `contratos` con los terceros y
 * las fincas que resuelve `app/`. El encabezado y el resumen viven dentro del feature; aquí
 * solo se define el ancho del contenedor, igual que en `/fincas` y `/terceros`.
 */
export default function ContratosPage() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <ListadoConRelaciones />
    </section>
  );
}
