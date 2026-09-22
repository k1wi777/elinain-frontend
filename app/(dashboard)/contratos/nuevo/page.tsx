import type { Metadata } from "next";

import { NuevoConRelaciones } from "../_components/nuevo-con-relaciones";

export const metadata: Metadata = { title: "Nuevo contrato | Elinain" };

/**
 * Página de apertura de contratos.
 *
 * Server Component delgado: renderiza el formulario del feature `contratos` con los
 * terceros y las fincas que resuelve `app/`.
 */
export default function NuevoContratoPage() {
  return <NuevoConRelaciones />;
}
