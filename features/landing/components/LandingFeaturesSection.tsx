import { FUNCIONALIDADES } from "@/features/landing/content";
import {
  ESTILOS_SUBTITULO_SECCION,
  ESTILOS_TITULO_SECCION,
} from "@/features/landing/landing-styles";

/** Módulos que centraliza la plataforma. */
export function LandingFeaturesSection() {
  return (
    <section id="funciones" className="flex scroll-mt-24 flex-col gap-10 py-20">
      <div className="flex flex-col gap-4">
        <h2 className={ESTILOS_TITULO_SECCION}>
          Control integral de tu negocio en una sola pantalla
        </h2>
        <p className={ESTILOS_SUBTITULO_SECCION}>
          Lo que hoy repartes entre libretas y hojas de cálculo, unificado con
          trazabilidad y métricas de rentabilidad.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FUNCIONALIDADES.map(({ numero, titulo, descripcion }) => (
          <li
            key={numero}
            className="group rounded-2xl bg-elinain-surface p-5 shadow-lg shadow-black/20 transition-colors hover:bg-elinain-surface-elevated"
          >
            <p className="font-display text-2xl font-semibold text-elinain-gold/80 tabular-nums">
              {numero}
            </p>
            <h3 className="mt-3 text-base font-semibold text-white">
              {titulo}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-elinain-muted">
              {descripcion}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
