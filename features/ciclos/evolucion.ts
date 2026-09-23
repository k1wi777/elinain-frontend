import type { Ciclo } from "@/features/ciclos/types";

/**
 * Evolución de peso calculada a partir de los checkpoints recibidos.
 *
 * El cálculo se hace sobre los ciclos cargados por `useCiclos` (la página actual,
 * `LIMITE_POR_DEFECTO` = 20) porque el alcance del Work Item no permite consultas nuevas;
 * con más de una página, la evolución se limita a los pesajes visibles.
 */
export type EvolucionPesajes = {
  /**
   * Delta de cada checkpoint por id frente al pesaje inmediatamente anterior.
   * `null` cuando no hay anterior o cuando falta el peso de alguno de los dos.
   */
  deltasPorId: Map<string, number | null>;
  /**
   * Delta del último checkpoint cronológico; `null` con menos de dos pesajes o cuando no
   * se puede calcular.
   */
  ultimoDelta: number | null;
};

/** Indica si un peso opcional es un número utilizable. */
function esPeso(valor: number | undefined): valor is number {
  return typeof valor === "number" && Number.isFinite(valor);
}

/**
 * Calcula la evolución de peso de los checkpoints de un contrato.
 *
 * Ordena los ciclos cronológicamente por `fecha` de forma ascendente y estable ante
 * empates, y compara cada `peso_observado` con el del checkpoint inmediatamente anterior.
 *
 * @param ciclos Ciclos cargados del contrato.
 */
export function calcularEvolucionPesajes(ciclos: Ciclo[]): EvolucionPesajes {
  const ordenados = [...ciclos].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  );

  const deltasPorId = new Map<string, number | null>();
  let ultimoDelta: number | null = null;

  ordenados.forEach((ciclo, indice) => {
    const anterior = indice > 0 ? ordenados[indice - 1] : undefined;
    const delta =
      anterior !== undefined &&
      esPeso(anterior.peso_observado) &&
      esPeso(ciclo.peso_observado)
        ? ciclo.peso_observado - anterior.peso_observado
        : null;

    deltasPorId.set(ciclo.id, delta);
    ultimoDelta = delta;
  });

  return {
    deltasPorId,
    ultimoDelta: ordenados.length >= 2 ? ultimoDelta : null,
  };
}
