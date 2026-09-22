import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Elinain — Gestión integral del engorde bovino",
  description:
    "Plataforma para comerciantes ganaderos que centraliza inventario, compras y ventas, costos, sanidad y ganado en participación, con trazabilidad y métricas de rentabilidad.",
};

const ESTILOS_BASE_CTA =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

const ESTILOS_CTA_PRIMARIO = `${ESTILOS_BASE_CTA} bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500`;

const ESTILOS_CTA_SECUNDARIO = `${ESTILOS_BASE_CTA} border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 focus-visible:ring-zinc-400`;

/**
 * Landing pública e institucional de Elinain.
 *
 * Server Component presentacional: no gestiona estado, no consume la API y solo enlaza a las
 * rutas de autenticación existentes.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="rounded-md text-lg font-semibold tracking-tight text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Elinain
          </Link>
          <nav
            aria-label="Principal"
            className="flex items-center gap-2 sm:gap-4"
          >
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-16">
        <section className="flex flex-col items-start gap-6">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Gestiona tu negocio ganadero con datos, no con libretas.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600">
            Elinain centraliza inventario, compras y ventas, costos, sanidad y
            ganado en participación para que conozcas la rentabilidad real de
            cada ciclo y de cada animal.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/registro" className={ESTILOS_CTA_PRIMARIO}>
              Crear cuenta
            </Link>
            <Link href="/login" className={ESTILOS_CTA_SECUNDARIO}>
              Iniciar sesión
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            De la libreta y el Excel a decisiones con datos
          </h2>
          <ul className="flex list-disc flex-col gap-2 pl-6 text-zinc-600">
            <li>Información manual dispersa y difícil de conciliar.</li>
            <li>
              Dificultad para calcular el costo real por animal y la
              rentabilidad por ciclo.
            </li>
            <li>
              Reparto de utilidades del ganado en participación propenso a
              errores.
            </li>
            <li>
              Falta de una vista consolidada cuando se opera en varias fincas.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Lo que centraliza Elinain
          </h2>
          <ul className="grid list-disc gap-2 pl-6 text-zinc-600 sm:grid-cols-2">
            <li>Inventario de animales.</li>
            <li>Compras y ventas.</li>
            <li>Costos operativos.</li>
            <li>Sanidad animal.</li>
            <li>Ganado en participación con terceros.</li>
            <li>Facturación.</li>
            <li>Operación en varias fincas, propias o de terceros.</li>
            <li>Trazabilidad y métricas de rentabilidad.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Para quién es
          </h2>
          <p className="max-w-2xl text-zinc-600">
            Para comerciantes ganaderos —personas y pymes que compran animales,
            los engordan y los venden—. No es una herramienta de cría ni de
            producción agrícola.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Hacia una gestión basada en datos
          </h2>
          <p className="max-w-2xl text-zinc-600">
            Elinain reemplaza la gestión empírica por información consolidada y
            confiable. La analítica avanzada y la inteligencia artificial se
            incorporarán en fases posteriores.
          </p>
        </section>

        <section className="flex flex-col items-start gap-6 rounded-lg border border-zinc-200 bg-white p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Empieza a gestionar con datos
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/registro" className={ESTILOS_CTA_PRIMARIO}>
              Crear cuenta
            </Link>
            <Link href="/login" className={ESTILOS_CTA_SECUNDARIO}>
              Iniciar sesión
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-6 text-sm text-zinc-600">
          Elinain — Plataforma de gestión para la compra, engorde y
          comercialización de ganado bovino.
        </div>
      </footer>
    </div>
  );
}
