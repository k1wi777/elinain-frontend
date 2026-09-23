import Image from "next/image";

import {
  ESTILOS_SUBTITULO_SECCION,
  ESTILOS_TITULO_SECCION,
} from "@/features/landing/landing-styles";

/** Bloque de audiencia y visión de producto, con imagen de `public/assets`. */
export function LandingAudienceSection() {
  return (
    <section
      id="para-quien"
      className="flex scroll-mt-24 flex-col gap-16 py-20"
    >
      <div className="flex flex-col gap-4">
        <h2 className={ESTILOS_TITULO_SECCION}>Para quién es</h2>
        <p className={ESTILOS_SUBTITULO_SECCION}>
          Para comerciantes ganaderos —personas y pymes que compran animales,
          los engordan y los venden—. No es una herramienta de cría,
          reproducción ni producción agrícola; el foco es compra, engorde y
          comercialización de bovinos.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src="/assets/cows-hero.png"
          alt="Ganado bovino en potrero al amanecer"
          width={1920}
          height={900}
          className="h-64 w-full object-cover sm:h-80 lg:h-96"
          priority={false}
        />
        <div className="absolute inset-0 bg-linear-to-t from-elinain-bg via-elinain-bg/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <h3 className="text-xl font-semibold text-white sm:text-2xl">
            Hacia una gestión basada en datos
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Elinain reemplaza la gestión empírica por información consolidada y
            confiable. La analítica avanzada y la inteligencia artificial se
            incorporarán en fases posteriores como evolución del producto.
          </p>
        </div>
      </div>
    </section>
  );
}
