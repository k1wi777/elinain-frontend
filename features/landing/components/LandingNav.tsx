import Link from "next/link";

import {
  ESTILOS_CTA_PRIMARIO,
  ESTILOS_ENLACE_FOCUS,
} from "@/features/landing/landing-styles";

const ENLACES_ANcla = [
  { href: "#problema", etiqueta: "El problema" },
  { href: "#funciones", etiqueta: "Funciones" },
  { href: "#para-quien", etiqueta: "Para quién" },
] as const;

/** Barra superior de la landing pública. */
export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-elinain-bg/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className={`${ESTILOS_ENLACE_FOCUS} text-lg font-semibold tracking-tight text-white`}
        >
          Elinain
        </Link>
        <nav
          aria-label="Principal"
          className="hidden items-center gap-6 md:flex"
        >
          {ENLACES_ANcla.map(({ href, etiqueta }) => (
            <Link
              key={href}
              href={href}
              className={`${ESTILOS_ENLACE_FOCUS} text-sm font-medium text-elinain-muted transition-colors hover:text-white`}
            >
              {etiqueta}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className={`${ESTILOS_ENLACE_FOCUS} hidden px-3 py-2 text-sm font-medium text-elinain-muted transition-colors hover:text-white sm:inline-flex`}
          >
            Iniciar sesión
          </Link>
          <Link href="/registro" className={ESTILOS_CTA_PRIMARIO}>
            Crear cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}
