/** Vista ilustrativa del panel; cifras de ejemplo, no métricas reales del producto. */

const KPI_EJEMPLO = [
  { etiqueta: "Animales en inventario", valor: "312" },
  { etiqueta: "Contratos activos", valor: "8" },
  { etiqueta: "Ganancia de peso prom.", valor: "+1,2" },
  { etiqueta: "Utilidad del ciclo", valor: "—" },
] as const;

const ACTIVIDAD_EJEMPLO = [
  { id: "A-1042", detalle: "Peso registrado · 428 kg" },
  { id: "C-08", detalle: "Costo de flete · ciclo activo" },
  { id: "V-019", detalle: "Venta registrada · pendiente factura" },
] as const;

/** Mock del dashboard con glassmorphism sutil. */
export function LandingDashboardPreview() {
  return (
    <figure className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl p-1 glass-panel">
      <figcaption className="sr-only">
        Ejemplo ilustrativo de métricas que la plataforma puede consolidar
      </figcaption>
      <div className="rounded-xl bg-elinain-bg/40 p-4 sm:p-6">
        <p className="mb-4 text-xs font-medium tracking-wide text-elinain-muted uppercase">
          Vista de ejemplo · panel de gestión
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_EJEMPLO.map(({ etiqueta, valor }) => (
            <div
              key={etiqueta}
              className="rounded-xl bg-elinain-surface-elevated/80 p-4 shadow-lg shadow-black/20"
            >
              <p className="text-xs text-elinain-muted">{etiqueta}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-elinain-gold tabular-nums">
                {valor}
                {etiqueta.includes("peso") ? (
                  <span className="text-base text-elinain-muted"> kg/día</span>
                ) : null}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_minmax(0,220px)]">
          <div
            aria-hidden
            className="relative min-h-40 overflow-hidden rounded-xl bg-elinain-surface-elevated/60 p-4"
          >
            <p className="text-xs text-elinain-muted">
              Evolución de peso (ejemplo)
            </p>
            <svg
              className="mt-6 h-24 w-full text-elinain-gold"
              viewBox="0 0 400 80"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="curva-oro" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="currentColor"
                    stopOpacity="0.35"
                  />
                  <stop
                    offset="100%"
                    stopColor="currentColor"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path
                d="M0 70 Q 80 65, 120 50 T 240 35 T 400 15 L 400 80 L 0 80 Z"
                fill="url(#curva-oro)"
              />
              <path
                d="M0 70 Q 80 65, 120 50 T 240 35 T 400 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="rounded-xl bg-elinain-surface-elevated/80 p-4">
            <p className="text-xs font-medium text-elinain-muted uppercase">
              Actividad reciente
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {ACTIVIDAD_EJEMPLO.map(({ id, detalle }) => (
                <li
                  key={id}
                  className="border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <p className="text-sm font-medium text-white">{id}</p>
                  <p className="text-xs text-elinain-muted">{detalle}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </figure>
  );
}
