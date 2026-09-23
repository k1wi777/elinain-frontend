/** Props del componente `ResumenNarrativo`. */
type Props = {
  /** Frases ya construidas por la lógica pura del feature. */
  frases: string[];
};

/**
 * Panel presentacional del resumen narrativo del dashboard.
 *
 * Solo recibe las frases ya calculadas: no conoce el DTO, la API ni TanStack Query. Se
 * presenta como panel destacado con acento dorado y añade un `h2` que continúa la
 * jerarquía de encabezados del dashboard.
 */
export function ResumenNarrativo({ frases }: Props) {
  return (
    <section
      aria-labelledby="resumen-narrativo"
      className="rounded-2xl border border-elinain-gold/20 p-5 glass-panel"
    >
      <h2
        id="resumen-narrativo"
        className="text-xs font-semibold tracking-[0.18em] text-elinain-gold uppercase"
      >
        Tu operación en resumen
      </h2>
      <ul className="mt-3 space-y-2">
        {frases.map((frase) => (
          <li
            key={frase}
            className="flex items-start gap-3 text-sm leading-6 text-white"
          >
            <span
              aria-hidden
              className="mt-2 size-1.5 shrink-0 rounded-full bg-elinain-gold"
            />
            <span>{frase}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
