"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { cn } from "@/shared/lib/cn";
import { FincasTable } from "@/features/fincas/components/FincasTable";
import type { Propietario } from "@/features/fincas/types";

/**
 * Carga diferida del mapa de fincas.
 *
 * `ssr: false` garantiza que Leaflet solo se ejecute en el navegador y que su bundle se
 * descargue únicamente al abrir la pestaña "Mapa".
 */
const FincasMapa = dynamic(
  () =>
    import("@/features/fincas/components/FincasMapa").then(
      (modulo) => modulo.FincasMapa,
    ),
  {
    ssr: false,
    loading: () => <p className="text-sm text-zinc-500">Cargando mapa…</p>,
  },
);

/** Vistas conmutables de la ruta `/fincas`. */
type Vista = "listado" | "mapa";

const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: "listado", etiqueta: "Listado" },
  { id: "mapa", etiqueta: "Mapa" },
];

/** Props del componente `FincasTabs`. */
type Props = {
  /** Propietarios para resolver el nombre; los compone `app/`. */
  propietarios: Propietario[];
};

/**
 * Pestañas Listado/Mapa de la ruta `/fincas`.
 *
 * Conmuta las dos vistas con estado local: el listado paginado y el mapa de pines. El mapa
 * se carga de forma diferida y sin SSR.
 */
export function FincasTabs({ propietarios }: Props) {
  const [vista, setVista] = useState<Vista>("listado");

  return (
    <section className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Vistas de fincas"
        className="flex gap-2 border-b border-zinc-200"
      >
        {VISTAS.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            role="tab"
            id={`fincas-tab-${opcion.id}`}
            aria-selected={vista === opcion.id}
            aria-controls={`fincas-panel-${opcion.id}`}
            onClick={() => setVista(opcion.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
              vista === opcion.id
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-zinc-600 hover:text-zinc-900",
            )}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`fincas-panel-${vista}`}
        aria-labelledby={`fincas-tab-${vista}`}
        tabIndex={0}
      >
        {vista === "listado" ? (
          <FincasTable propietarios={propietarios} />
        ) : (
          <FincasMapa propietarios={propietarios} />
        )}
      </div>
    </section>
  );
}
