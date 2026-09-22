import type { Metadata } from "next";

import { NuevaConPropietarios } from "../_components/nueva-con-propietarios";

export const metadata: Metadata = { title: "Nueva finca | Elinain" };

/**
 * Página de creación de fincas.
 *
 * Server Component delgado: renderiza el formulario del feature `fincas` con los
 * propietarios que resuelve `app/`.
 */
export default function NuevaFincaPage() {
  return <NuevaConPropietarios />;
}
