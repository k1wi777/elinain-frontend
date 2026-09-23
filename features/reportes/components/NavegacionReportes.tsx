"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/cn";

/** Reportes disponibles en la navegación superior, en su orden de presentación. */
const REPORTES = [
  { href: "/reportes/contratos-activos", etiqueta: "Contratos activos" },
  { href: "/reportes/historial-ventas", etiqueta: "Historial de ventas" },
] as const;

/**
 * Estilos de foco y subrayado de la navegación.
 *
 * Replican el patrón de `EnlaceNavegacion` de `app/(dashboard)/_components` sin importarlo:
 * la capa `features/` no puede depender de `app/`. No se añade ninguna dependencia.
 */
const ESTILOS_FOCO =
  "rounded-lg outline-none focus-visible:text-white focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:ring-offset-elinain-bg";

const ESTILOS_ENLACE =
  "relative shrink-0 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-elinain-gold after:transition-transform after:duration-300 hover:after:scale-x-100 sm:text-sm";

/**
 * Navegación superior entre los dos reportes.
 *
 * Solo contiene los enlaces a las rutas existentes; el enlace de la ruta activa expone
 * `aria-current="page"` y deja visible el subrayado dorado que el resto muestra en hover.
 * No crea pestañas ni rutas nuevas.
 */
export function NavegacionReportes() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Reportes"
      className="flex w-full items-center gap-1 overflow-x-auto border-b border-white/6 sm:gap-2"
    >
      {REPORTES.map((reporte) => {
        const activo =
          pathname === reporte.href || pathname.startsWith(`${reporte.href}/`);

        return (
          <Link
            key={reporte.href}
            href={reporte.href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              ESTILOS_FOCO,
              ESTILOS_ENLACE,
              activo && "text-elinain-gold after:scale-x-100",
            )}
          >
            {reporte.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
