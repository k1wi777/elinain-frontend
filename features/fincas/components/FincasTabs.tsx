"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

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
    loading: () => <p className="text-sm text-zinc-400">Cargando mapa…</p>,
  },
);

/** Vistas conmutables de la ruta `/fincas`. */
type Vista = "listado" | "mapa";

const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: "listado", etiqueta: "Listado" },
  { id: "mapa", etiqueta: "Mapa" },
];

/** Estilos del CTA de alta, alineados con el CTA de socios de participación. */
const ESTILOS_CTA_NUEVA_FINCA =
  "inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-elinain-gold px-5 py-3.5 text-sm font-semibold text-elinain-bg shadow-[0_10px_24px_rgb(232_185_35_/_0.16)] transition-colors hover:bg-elinain-gold-hover focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto";

/** Props del componente `FincasTabs`. */
type Props = {
  /** Propietarios para resolver el nombre; los compone `app/`. */
  propietarios: Propietario[];
};

/**
 * Pestañas Listado/Mapa de la ruta `/fincas`.
 *
 * Compone el encabezado oscuro con el eyebrow, el título y la descripción, el CTA de alta y
 * el control segmentado Listado/Mapa. Conmuta las dos vistas con estado local: el listado
 * paginado y el mapa de pines. El mapa se carga de forma diferida y sin SSR.
 */
export function FincasTabs({ propietarios }: Props) {
  const [vista, setVista] = useState<Vista>("listado");

  return (
    <section aria-labelledby="fincas-title" className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-elinain-gold uppercase">
            Territorio y operación
          </p>
          <h1
            id="fincas-title"
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            Fincas
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            Registra y administra las fincas destinadas al pastoreo, la ceba y
            la custodia del ganado bajo participación.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
          <Link href="/fincas/nueva" className={ESTILOS_CTA_NUEVA_FINCA}>
            <span aria-hidden className="text-lg leading-none font-normal">
              +
            </span>
            <span>Nueva finca</span>
          </Link>

          <div
            role="tablist"
            aria-label="Vistas de fincas"
            className="inline-flex w-full rounded-full border border-white/8 bg-white/[0.03] p-1 sm:w-auto"
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
                  "flex-1 rounded-full px-5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:outline-none sm:flex-none",
                  vista === opcion.id
                    ? "bg-elinain-gold text-elinain-bg"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
        </div>
      </header>

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
