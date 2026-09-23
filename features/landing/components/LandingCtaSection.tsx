import Link from "next/link";

import {
  ESTILOS_CTA_PRIMARIO,
  ESTILOS_CTA_SECUNDARIO,
} from "@/features/landing/landing-styles";

/** Cierre con llamada a la acción. */
export function LandingCtaSection() {
  return (
    <section className="py-20">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-elinain-surface px-6 py-14 text-center shadow-xl shadow-black/30 sm:px-12">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          ¿Listo para gestionar tu engorde con datos confiables?
        </h2>
        <p className="max-w-xl text-elinain-muted">
          Crea tu cuenta o inicia sesión para acceder al panel de gestión.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/registro" className={ESTILOS_CTA_PRIMARIO}>
            Crear cuenta
          </Link>
          <Link href="/login" className={ESTILOS_CTA_SECUNDARIO}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Pie de página institucional. */
export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-elinain-muted">
          Elinain — Plataforma de gestión para la compra, engorde y
          comercialización de ganado bovino.
        </p>
        <nav aria-label="Legal" className="flex gap-6 text-sm">
          <Link
            href="/login"
            className="text-elinain-muted transition-colors hover:text-white"
          >
            Acceso
          </Link>
          <Link
            href="/registro"
            className="text-elinain-muted transition-colors hover:text-white"
          >
            Registro
          </Link>
        </nav>
      </div>
    </footer>
  );
}
