import type { Metadata } from "next";

import { ListadoConPropietarios } from "./_components/listado-con-propietarios";

export const metadata: Metadata = { title: "Fincas | Elinain" };

/**
 * Página de fincas.
 *
 * Server Component delgado: compone el listado y el mapa del feature `fincas` con los
 * propietarios que resuelve `app/`. El encabezado, el control de vistas y el resumen viven
 * dentro del feature; aquí solo se define el ancho del contenedor, igual que en `/terceros`.
 */
export default function FincasPage() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <ListadoConPropietarios />
    </section>
  );
}
