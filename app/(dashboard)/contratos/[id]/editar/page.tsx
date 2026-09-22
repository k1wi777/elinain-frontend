import type { Metadata } from "next";

import { EditarConRelaciones } from "../../_components/editar-con-relaciones";

export const metadata: Metadata = { title: "Editar contrato | Elinain" };

/** Props de la página, con el identificador del contrato en la ruta. */
type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Página de edición de un contrato.
 *
 * Server Component delgado: resuelve el identificador de la ruta y renderiza el formulario
 * del feature `contratos` con los terceros y las fincas que resuelve `app/`.
 */
export default async function EditarContratoPage({ params }: Props) {
  const { id } = await params;

  return <EditarConRelaciones id={id} />;
}
