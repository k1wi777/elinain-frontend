import type { Metadata } from "next";

import { DetalleConRelaciones } from "../_components/detalle-con-relaciones";

export const metadata: Metadata = { title: "Detalle del contrato | Elinain" };

/** Props de la página, con el identificador del contrato en la ruta. */
type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Página de detalle de un contrato.
 *
 * Server Component delgado: resuelve el identificador de la ruta y renderiza el detalle
 * del feature `contratos` con los terceros y las fincas que resuelve `app/`.
 */
export default async function DetalleContratoPage({ params }: Props) {
  const { id } = await params;

  return <DetalleConRelaciones id={id} />;
}
