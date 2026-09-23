"use client";

import { FincaEditar, type Propietario } from "@/features/fincas";
import { useTodosLosTerceros } from "@/features/terceros";

/** Props del componente `EditarConPropietarios`. */
type Props = {
  /** Identificador de la finca a editar. */
  id: string;
};

/**
 * Composición del formulario de edición con los propietarios.
 *
 * Carga los terceros y los transforma a `Propietario[]` para resolver el nombre del
 * propietario, sin que `features/fincas` conozca `features/terceros`.
 */
export function EditarConPropietarios({ id }: Props) {
  const terceros = useTodosLosTerceros();

  if (terceros.isPending) {
    return <p className="text-sm text-zinc-400">Cargando…</p>;
  }

  if (terceros.error) {
    return (
      <p role="alert" className="text-sm text-red-400">
        No se pudieron cargar los socios de participación.
      </p>
    );
  }

  const propietarios: Propietario[] = (terceros.data ?? []).map((tercero) => ({
    id: tercero.id,
    nombre: tercero.nombre,
  }));

  return <FincaEditar id={id} propietarios={propietarios} />;
}
