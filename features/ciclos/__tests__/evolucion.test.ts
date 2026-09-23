import { calcularEvolucionPesajes } from "@/features/ciclos/evolucion";
import type { Ciclo } from "@/features/ciclos/types";

/** Construye un ciclo con los valores indicados. */
function ciclo(datos: Partial<Ciclo> = {}): Ciclo {
  return {
    id: "ciclo-1",
    contrato_id: "contrato-1",
    fecha: "2026-09-21T10:00:00.000Z",
    peso_observado: 350,
    notas: "",
    ...datos,
  };
}

describe("calcularEvolucionPesajes", () => {
  it("ordena cronológicamente una entrada desordenada antes de comparar", () => {
    const { deltasPorId } = calcularEvolucionPesajes([
      ciclo({
        id: "c",
        fecha: "2026-09-23T10:00:00.000Z",
        peso_observado: 390,
      }),
      ciclo({
        id: "a",
        fecha: "2026-09-21T10:00:00.000Z",
        peso_observado: 350,
      }),
      ciclo({
        id: "b",
        fecha: "2026-09-22T10:00:00.000Z",
        peso_observado: 370,
      }),
    ]);

    expect(deltasPorId.get("a")).toBeNull();
    expect(deltasPorId.get("b")).toBe(20);
    expect(deltasPorId.get("c")).toBe(20);
  });

  it("calcula el delta de cada checkpoint frente al inmediatamente anterior", () => {
    const { deltasPorId, ultimoDelta } = calcularEvolucionPesajes([
      ciclo({
        id: "a",
        fecha: "2026-09-21T10:00:00.000Z",
        peso_observado: 350,
      }),
      ciclo({
        id: "b",
        fecha: "2026-09-22T10:00:00.000Z",
        peso_observado: 372.5,
      }),
      ciclo({
        id: "c",
        fecha: "2026-09-23T10:00:00.000Z",
        peso_observado: 360,
      }),
    ]);

    expect(deltasPorId.get("a")).toBeNull();
    expect(deltasPorId.get("b")).toBe(22.5);
    expect(deltasPorId.get("c")).toBe(-12.5);
    expect(ultimoDelta).toBe(-12.5);
  });

  it("devuelve `null` cuando falta el peso de cualquiera de los dos checkpoints", () => {
    const { deltasPorId } = calcularEvolucionPesajes([
      ciclo({
        id: "a",
        fecha: "2026-09-21T10:00:00.000Z",
        peso_observado: 350,
      }),
      ciclo({
        id: "b",
        fecha: "2026-09-22T10:00:00.000Z",
        peso_observado: undefined,
      }),
      ciclo({
        id: "c",
        fecha: "2026-09-23T10:00:00.000Z",
        peso_observado: 380,
      }),
    ]);

    expect(deltasPorId.get("b")).toBeNull();
    expect(deltasPorId.get("c")).toBeNull();
  });

  it("devuelve `ultimoDelta` nulo con menos de dos pesajes", () => {
    expect(calcularEvolucionPesajes([]).ultimoDelta).toBeNull();

    const { deltasPorId, ultimoDelta } = calcularEvolucionPesajes([
      ciclo({ id: "a", peso_observado: 350 }),
    ]);

    expect(deltasPorId.get("a")).toBeNull();
    expect(ultimoDelta).toBeNull();
  });

  it("mantiene el orden de entrada ante fechas empatadas", () => {
    const { deltasPorId } = calcularEvolucionPesajes([
      ciclo({
        id: "primero",
        fecha: "2026-09-21T10:00:00.000Z",
        peso_observado: 350,
      }),
      ciclo({
        id: "segundo",
        fecha: "2026-09-21T10:00:00.000Z",
        peso_observado: 360,
      }),
    ]);

    expect(deltasPorId.get("primero")).toBeNull();
    expect(deltasPorId.get("segundo")).toBe(10);
  });
});
