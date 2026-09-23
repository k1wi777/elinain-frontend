"use client";

import { FincasTabs, type Propietario } from "@/features/fincas";
import { useTodosLosTerceros } from "@/features/terceros";

/**
 * Composición del listado y el mapa de fincas con los propietarios.
 *
 * Carga los terceros con el hook de `features/terceros`, los transforma a `Propietario[]` y
 * los pasa por props a `features/fincas`, de modo que el feature de fincas nunca importa
 * del de terceros.
 */
export function ListadoConPropietarios() {
  const terceros = useTodosLosTerceros();

  if (terceros.isPending) {
    return <p className="text-sm text-zinc-400">Cargando…</p>;
  }

  if (terceros.error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200"
      >
        No se pudieron cargar los socios de participación.
      </p>
    );
  }

  const propietarios: Propietario[] = (terceros.data ?? []).map((tercero) => ({
    id: tercero.id,
    nombre: tercero.nombre,
  }));

  return <FincasTabs propietarios={propietarios} />;
}
