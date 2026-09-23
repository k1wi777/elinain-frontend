import Link from "next/link";

import { PILARES_CONFIANZA } from "@/features/landing/content";
import {
  ESTILOS_CTA_PRIMARIO,
  ESTILOS_CTA_SECUNDARIO,
} from "@/features/landing/landing-styles";

import { LandingDashboardPreview } from "./LandingDashboardPreview";

/** Sección principal de la landing. */
export function LandingHero() {
  return (
    <section className="flex flex-col gap-12 pt-8 pb-4 lg:gap-16 lg:pt-12">
      <div className="flex flex-col items-center gap-8 text-center lg:items-start lg:text-left">
        <p className="rounded-full border border-elinain-gold/30 bg-elinain-gold-muted px-4 py-1.5 text-xs font-semibold tracking-widest text-elinain-gold uppercase">
          Plataforma para comerciantes ganaderos
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
          Gestiona tu negocio ganadero{" "}
          <span className="text-elinain-gold">con datos</span>, no con libretas.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-elinain-muted">
          Elinain centraliza inventario, compras y ventas, costos, sanidad y
          ganado en participación para que conozcas la rentabilidad real de cada
          ciclo y de cada animal.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/registro" className={ESTILOS_CTA_PRIMARIO}>
            Crear cuenta
          </Link>
          <Link href="#funciones" className={ESTILOS_CTA_SECUNDARIO}>
            Conocer más
          </Link>
        </div>
        <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 lg:justify-start">
          {PILARES_CONFIANZA.map((texto) => (
            <li
              key={texto}
              className="flex items-center gap-2 text-sm text-elinain-muted"
            >
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-elinain-gold"
              />
              {texto}
            </li>
          ))}
        </ul>
      </div>
      <LandingDashboardPreview />
    </section>
  );
}
