import { PROBLEMAS } from "@/features/landing/content";
import {
  ESTILOS_SUBTITULO_SECCION,
  ESTILOS_TITULO_SECCION,
} from "@/features/landing/landing-styles";

function IconoDocumento() {
  return (
    <svg
      aria-hidden
      className="size-5 text-elinain-gold"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

/** Cuadrícula de dolores del negocio documentados en la contextualización. */
export function LandingProblemSection() {
  return (
    <section id="problema" className="flex scroll-mt-24 flex-col gap-10 py-20">
      <div className="flex flex-col gap-4">
        <h2 className={ESTILOS_TITULO_SECCION}>
          De la libreta y el Excel a decisiones con datos comprobables
        </h2>
        <p className={ESTILOS_SUBTITULO_SECCION}>
          Los comerciantes ganaderos pierden visibilidad cuando la información
          vive en registros manuales dispersos.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {PROBLEMAS.map(({ titulo, descripcion }) => (
          <li
            key={titulo}
            className="rounded-2xl bg-elinain-surface p-6 shadow-lg shadow-black/25"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-elinain-gold-muted">
              <IconoDocumento />
            </div>
            <h3 className="text-lg font-semibold text-white">{titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-elinain-muted">
              {descripcion}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
