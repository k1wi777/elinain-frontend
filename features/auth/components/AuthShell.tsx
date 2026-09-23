import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { ESTILOS_ENLACE_FOCUS } from "@/features/auth/auth-styles";

type Props = {
  /** Insignia superior con el contexto de la pantalla. */
  insignia: string;
  /** Título principal de la pantalla. */
  titulo: string;
  /** Descripción breve bajo el título. */
  descripcion: string;
  /** Texto del pill sobre la imagen lateral. */
  etiquetaLateral: string;
  /** Panel inferior del aside (contenido ilustrativo de cada pantalla). */
  panelLateral: ReactNode;
  /** Formulario de acceso. */
  children: ReactNode;
};

/**
 * Shell compartido de las pantallas de acceso.
 *
 * Pinta su propio fondo oscuro a pantalla completa y compone la columna del
 * formulario con el aside de imagen. `LoginShell` y `RegistroShell` aportan su
 * copy y el contenido del panel lateral.
 */
export function AuthShell({
  insignia,
  titulo,
  descripcion,
  etiquetaLateral,
  panelLateral,
  children,
}: Props) {
  return (
    <div className="relative flex min-h-dvh w-full flex-1 flex-col bg-elinain-bg bg-[radial-gradient(circle_at_8%_0%,rgb(232_185_35_/_0.1),transparent_34%)] text-white lg:flex-row">
      <div className="relative flex w-full flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:w-[min(100%,34rem)] lg:flex-none lg:px-14 xl:w-[38rem]">
        <div className="mx-auto flex w-full max-w-md flex-col">
          <Link
            href="/"
            className={`${ESTILOS_ENLACE_FOCUS} mb-12 inline-flex w-fit flex-col gap-1`}
          >
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="size-2 rounded-full bg-elinain-gold shadow-[0_0_16px_rgb(232_185_35_/_0.75)]"
              />
              <span className="font-display text-xl font-semibold tracking-tight text-white">
                Elinain
              </span>
            </span>
            <span className="pl-[18px] text-[0.65rem] font-medium tracking-[0.22em] text-elinain-muted uppercase">
              Gestión ganadera
            </span>
          </Link>

          <div className="mb-8">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-elinain-gold/30 bg-elinain-gold-muted px-3 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-elinain-gold uppercase">
              {insignia}
            </p>
            <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl">
              {titulo}
            </h1>
            <p className="mt-4 text-sm leading-7 text-elinain-muted sm:text-base">
              {descripcion}
            </p>
          </div>

          {children}
        </div>
      </div>

      <aside className="relative hidden min-h-[560px] flex-1 overflow-hidden lg:block">
        <Image
          src="/assets/cows-hero.png"
          alt=""
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 0px"
          priority
        />
        <div className="absolute inset-0 bg-elinain-bg/60" />
        <div className="absolute inset-0 bg-linear-to-r from-elinain-bg via-elinain-bg/25 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-elinain-bg via-elinain-bg/15 to-elinain-bg/40" />

        <p className="absolute top-8 right-8 z-10 rounded-full border border-white/10 bg-elinain-bg/55 px-3.5 py-1.5 text-[0.65rem] font-semibold tracking-[0.18em] text-elinain-muted uppercase backdrop-blur-sm xl:top-10 xl:right-12">
          {etiquetaLateral}
        </p>

        <div className="absolute inset-x-8 bottom-8 z-10 max-w-lg xl:inset-x-12 xl:bottom-12">
          {panelLateral}
        </div>
      </aside>
    </div>
  );
}
