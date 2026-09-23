"use client";

import { FincaCrear, type Propietario } from "@/features/fincas";
import { useTodosLosTerceros } from "@/features/terceros";

/**
 * Composición del formulario de creación con los propietarios.
 *
 * Carga los terceros y los transforma a `Propietario[]` para el selector del formulario,
 * sin que `features/fincas` conozca `features/terceros`.
 */
export function NuevaConPropietarios() {
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

  return <FincaCrear propietarios={propietarios} />;
}
