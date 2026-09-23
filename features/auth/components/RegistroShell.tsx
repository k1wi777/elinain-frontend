import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegistroForm } from "@/features/auth/components/RegistroForm";

/** Cifras de ejemplo (no son datos reales): solo ilustran lo que el producto consolida. */
const INDICADORES_EJEMPLO = [
  { etiqueta: "Animales en inventario", valor: "312", unidad: "cabezas" },
  { etiqueta: "Contratos activos", valor: "8", unidad: "contratos" },
  { etiqueta: "Ganancia de peso prom.", valor: "+1,2", unidad: "kg/día" },
  { etiqueta: "Utilidad del ciclo", valor: "—", unidad: "por contrato" },
] as const;

const CAPACIDADES = [
  "Inventario con trazabilidad por contrato y ciclo",
  "Compras, ventas y costos del engorde",
  "Ganado en participación con reparto de utilidad auditable",
  "Fincas propias o de terceros en un solo lugar",
] as const;

/** Panel ilustrativo del registro, marcado como ejemplo. */
function PanelRegistro() {
  return (
    <figure className="rounded-2xl p-5 glass-panel sm:p-6">
      <figcaption className="sr-only">
        Vista ilustrativa del panel de gestión; no muestra datos reales.
      </figcaption>
      <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-elinain-gold uppercase">
        Vista de ejemplo · panel de gestión
      </p>
      <p className="mt-3 font-display text-2xl leading-tight font-semibold text-white">
        Lo que tendrás desde el primer día
      </p>
      <p className="mt-2 text-sm leading-relaxed text-elinain-muted">
        Centraliza la operación del negocio y conoce la rentabilidad real de
        cada ciclo.
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
        {CAPACIDADES.map((capacidad) => (
          <li
            key={capacidad}
            className="flex gap-2.5 text-xs leading-relaxed text-elinain-muted"
          >
            <span
              className="mt-1.5 size-1 shrink-0 rounded-full bg-elinain-gold"
              aria-hidden
            />
            {capacidad}
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
 * Pantalla de registro.
 *
 * Comparte el `AuthShell` con la pantalla de acceso y añade su formulario.
 */
export function RegistroShell() {
  return (
    <AuthShell
      insignia="Crea tu cuenta de comerciante"
      titulo="Crear cuenta"
      descripcion="Registra tu operación y empieza a gestionar contratos de engorde, costos y participación con terceros desde un solo lugar."
      etiquetaLateral="Gestión integral del engorde"
      panelLateral={<PanelRegistro />}
    >
      <RegistroForm />
    </AuthShell>
  );
}
