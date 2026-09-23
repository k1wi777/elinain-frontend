import Image from "next/image";
import Link from "next/link";

import { ESTILOS_ENLACE_FOCUS } from "@/features/auth/auth-styles";
import { LoginForm } from "@/features/auth/components/LoginForm";

const CONCEPTOS_PLATAFORMA = [
  "Inventario, compras y ventas del engorde",
  "Costos operativos y sanidad por contrato",
  "Ganado en participación con reparto de utilidad auditable",
  "Fincas propias o de terceros en un solo lugar",
] as const;

/** Indicadores ilustrativos: sin cifras reales, solo las métricas que el producto consolida. */
const INDICADORES_EJEMPLO = [
  { etiqueta: "Animales en inventario", unidad: "cabezas" },
  { etiqueta: "Contratos activos", unidad: "contratos" },
  { etiqueta: "Ganancia de peso prom.", unidad: "kg/día" },
  { etiqueta: "Utilidad del ciclo", unidad: "por contrato" },
] as const;

/**
 * Layout de dos columnas para la pantalla de acceso.
 *
 * `LoginShell` pinta su propio fondo oscuro a pantalla completa, de modo que
 * `/login` no depende del fondo del layout compartido. La columna lateral usa la
 * imagen del proyecto con un panel ilustrativo marcado como ejemplo.
 */
export function LoginShell() {
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
              Plataforma para comerciantes ganaderos
            </p>
            <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl">
              Acceso a la plataforma
            </h1>
            <p className="mt-4 text-sm leading-7 text-elinain-muted sm:text-base">
              Inicia sesión para administrar contratos de engorde, participación
              con terceros y la operación de tu negocio desde un solo lugar.
            </p>
          </div>

          <LoginForm />
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
          Trazabilidad por contrato y ciclo
        </p>

        <div className="absolute inset-x-8 bottom-8 z-10 max-w-lg xl:inset-x-12 xl:bottom-12">
          <figure className="rounded-2xl p-5 glass-panel sm:p-6">
            <figcaption className="sr-only">
              Vista ilustrativa del panel de gestión; no muestra datos reales.
            </figcaption>
            <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-elinain-gold uppercase">
              Vista de ejemplo · panel de gestión
            </p>
            <p className="mt-3 font-display text-2xl leading-tight font-semibold text-white">
              Compra, engorde y comercialización con datos confiables
            </p>
            <p className="mt-2 text-sm leading-relaxed text-elinain-muted">
              Elinain consolida la operación del negocio para que conozcas la
              rentabilidad real de cada ciclo.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {INDICADORES_EJEMPLO.map(({ etiqueta, unidad }) => (
                <div
                  key={etiqueta}
                  className="rounded-xl bg-elinain-surface-elevated/80 p-3"
                >
                  <p className="text-xs leading-snug text-elinain-muted">
                    {etiqueta}
                  </p>
                  <p className="mt-1.5 font-display text-xl font-semibold text-elinain-gold tabular-nums">
                    —
                    <span className="ml-1 text-xs font-normal text-elinain-muted">
                      {unidad}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <ul className="mt-4 flex flex-col gap-1.5 border-t border-white/10 pt-4">
              {CONCEPTOS_PLATAFORMA.map((concepto) => (
                <li
                  key={concepto}
                  className="flex gap-2.5 text-xs leading-relaxed text-elinain-muted"
                >
                  <span
                    className="mt-1.5 size-1 shrink-0 rounded-full bg-elinain-gold"
                    aria-hidden
                  />
                  {concepto}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[0.7rem] text-elinain-muted/70">
              Valores ilustrativos: se completan con los datos reales de tu
              operación.
            </p>
          </figure>
        </div>
      </aside>
    </div>
  );
}
