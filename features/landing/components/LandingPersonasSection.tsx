import {
  ESTILOS_SUBTITULO_SECCION,
  ESTILOS_TITULO_SECCION,
} from "@/features/landing/landing-styles";

const PERSONAS = [
  {
    titulo: "Comerciante ganadero",
    descripcion:
      "Compras animales, los engordas en fincas propias o de terceros y los vendes. Necesitas saber cuánto te cuesta cada ciclo y cuánto ganas por animal.",
    puntos: [
      "Inventario y costos en un solo flujo",
      "Compras, ventas y facturación alineadas",
      "Reportes de contratos activos e historial de ventas",
    ],
  },
  {
    titulo: "Tercero en participación",
    descripcion:
      "Inviertes en animales que engorda un comerciante. Requieres claridad sobre utilidades, reparto y trazabilidad del contrato.",
    puntos: [
      "Contratos con reparto de utilidad auditable",
      "Visibilidad del ganado en participación",
      "Confianza basada en registros consolidados",
    ],
  },
] as const;

/** Dos perfiles del ecosistema de participación, sin inventar roles ajenos al producto. */
export function LandingPersonasSection() {
  return (
    <section className="flex flex-col gap-10 py-20">
      <div className="flex flex-col gap-4">
        <h2 className={ESTILOS_TITULO_SECCION}>
          Claridad entre quien opera el engorde y quien participa
        </h2>
        <p className={ESTILOS_SUBTITULO_SECCION}>
          Elinain está pensado para comerciantes ganaderos; el ganado en
          participación con terceros es parte central del modelo, no un
          accesorio.
        </p>
      </div>
      <ul className="grid gap-6 lg:grid-cols-2">
        {PERSONAS.map(({ titulo, descripcion, puntos }) => (
          <li
            key={titulo}
            className="rounded-2xl border border-white/5 bg-elinain-surface p-8 shadow-xl shadow-black/30"
          >
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-elinain-gold-muted">
              <span
                aria-hidden
                className="font-display text-lg font-semibold text-elinain-gold"
              >
                {titulo.charAt(0)}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white">{titulo}</h3>
            <p className="mt-3 text-sm leading-relaxed text-elinain-muted">
              {descripcion}
            </p>
            <ul className="mt-6 flex flex-col gap-2">
              {puntos.map((punto) => (
                <li
                  key={punto}
                  className="flex gap-2 text-sm text-elinain-muted"
                >
                  <span aria-hidden className="text-elinain-gold">
                    ·
                  </span>
                  {punto}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
