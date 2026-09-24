import Link from "next/link";

/** Estilos del enlace principal, alineados con el CTA dorado del shell. */
const ESTILOS_ENLACE_PRIMARIO =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-elinain-gold px-6 py-3 text-sm font-semibold text-elinain-bg shadow-[0_10px_24px_rgb(232_185_35_/_0.18)] transition-colors hover:bg-elinain-gold-hover focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:ring-offset-elinain-bg focus-visible:outline-none";

/** Estilos del enlace secundario, alineados con las acciones oscuras del shell. */
const ESTILOS_ENLACE_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-elinain-gold focus-visible:ring-offset-2 focus-visible:ring-offset-elinain-bg focus-visible:outline-none";

/**
 * Página 404 de la aplicación.
 *
 * Se renderiza para cualquier ruta no encontrada. Reutiliza el shell oscuro y el acento
 * dorado del producto y ofrece dos salidas claras: el panel del comerciante y el inicio.
 */
export default function NotFound() {
  return (
    <main
      aria-labelledby="not-found-title"
      className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-elinain-bg px-6 py-16 text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(232_185_35_/_0.1),transparent_45%)]"
      />

      <div className="relative w-full max-w-lg rounded-2xl px-8 py-10 text-center glass-panel sm:px-10">
        <span
          aria-hidden
          className="mx-auto mb-6 flex size-3 rounded-full bg-elinain-gold shadow-[0_0_18px_rgb(232_185_35_/_0.75)]"
        />
        <p className="text-xs font-semibold tracking-[0.24em] text-elinain-gold uppercase">
          Error 404
        </p>
        <p
          aria-hidden
          className="mt-4 font-display text-6xl font-semibold tracking-tight text-elinain-gold sm:text-7xl"
        >
          404
        </p>
        <h1
          id="not-found-title"
          className="mt-4 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Página no encontrada
        </h1>
        <p className="mt-3 text-sm leading-6 text-elinain-muted">
          La página que buscas no existe o cambió de dirección. Revisa el enlace
          o vuelve a tu panel para seguir gestionando tu operación.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className={ESTILOS_ENLACE_PRIMARIO}>
            Ir al panel
          </Link>
          <Link href="/" className={ESTILOS_ENLACE_SECUNDARIO}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
