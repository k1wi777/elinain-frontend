import type { Metadata } from "next";

import { ListadoConContratos } from "./_components/listado-con-contratos";

export const metadata: Metadata = { title: "Ventas | Elinain" };

/**
 * Página del listado global de ventas.
 *
 * Server Component delgado: compone el listado del feature `ventas` con los contratos que
 * resuelve `app/` para el filtro y el registro.
 */
export default function VentasPage() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <ListadoConContratos />
    </section>
  );
}
