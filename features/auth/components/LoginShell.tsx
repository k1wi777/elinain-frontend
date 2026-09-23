import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";

const CONCEPTOS_PLATAFORMA = [
  "Inventario, compras y ventas del engorde",
  "Costos operativos y sanidad por contrato",
  "Ganado en participación con reparto de utilidad auditable",
  "Fincas propias o de terceros en un solo lugar",
] as const;

/** Indicadores de ejemplo: cifras mock, no datos reales del negocio. */
const INDICADORES_EJEMPLO = [
  { etiqueta: "Animales en inventario", valor: "312", unidad: "cabezas" },
  { etiqueta: "Contratos activos", valor: "8", unidad: "contratos" },
  { etiqueta: "Ganancia de peso prom.", valor: "+1,2", unidad: "kg/día" },
  { etiqueta: "Utilidad del ciclo", valor: "$ 12,4 M", unidad: "por contrato" },
] as const;

/** Panel ilustrativo del login, marcado como ejemplo y sin cifras reales. */
function PanelLogin() {
  return (
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
        {INDICADORES_EJEMPLO.map(({ etiqueta, valor, unidad }) => (
          <div
            key={etiqueta}
            className="rounded-xl bg-elinain-surface-elevated/80 p-3"
          >
            <p className="text-xs leading-snug text-elinain-muted">
              {etiqueta}
            </p>
            <p className="mt-1.5 font-display text-xl font-semibold text-elinain-gold tabular-nums">
              {valor}
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
        Valores ilustrativos: se completan con los datos reales de tu operación.
      </p>
    </figure>
  );
}

/**
 * Pantalla de acceso.
 *
 * Comparte el `AuthShell` con la pantalla de registro y añade su formulario.
 */
export function LoginShell() {
  return (
    <AuthShell
      insignia="Plataforma para comerciantes ganaderos"
      titulo="Acceso a la plataforma"
      descripcion="Inicia sesión para administrar contratos de engorde, participación con terceros y la operación de tu negocio desde un solo lugar."
      etiquetaLateral="Trazabilidad por contrato y ciclo"
      panelLateral={<PanelLogin />}
    >
      <LoginForm />
    </AuthShell>
  );
}
