"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/cn";

import {
  ESTILOS_ENLACE_FOCUS_DASHBOARD,
  ESTILOS_ENLACE_NAVEGACION,
} from "../dashboard-styles";

/** Props del componente `EnlaceNavegacion`. */
type Props = {
  /** Ruta de destino del enlace. */
  href: string;
  /** Texto visible del enlace. */
  children: ReactNode;
};

/**
 * Enlace de la navegación principal que marca la página actual.
 *
 * Compara la ruta activa con `usePathname` (incluidas sus subrutas) y, cuando coincide,
 * expone `aria-current="page"` y deja visible el subrayado dorado que el resto de enlaces
 * solo muestra en hover.
 */
export function EnlaceNavegacion({ href, children }: Props) {
  const pathname = usePathname();
  const activo = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={cn(
        ESTILOS_ENLACE_FOCUS_DASHBOARD,
        ESTILOS_ENLACE_NAVEGACION,
        activo && "text-elinain-gold after:scale-x-100",
      )}
    >
      {children}
    </Link>
  );
}
