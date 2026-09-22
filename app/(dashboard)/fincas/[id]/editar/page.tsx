import type { Metadata } from "next";

import { EditarConPropietarios } from "../../_components/editar-con-propietarios";

export const metadata: Metadata = { title: "Editar finca | Elinain" };

/** Props de la página, con el identificador de la finca en la ruta. */
type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Página de edición de fincas.
 *
 * Server Component delgado: resuelve el identificador de la ruta y renderiza el formulario
 * del feature `fincas` con los propietarios que resuelve `app/`.
 */
export default async function EditarFincaPage({ params }: Props) {
  const { id } = await params;

  return <EditarConPropietarios id={id} />;
}
