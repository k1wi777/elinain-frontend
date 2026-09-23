import { construirNarrativa } from "@/features/dashboard/narrativa";
import type { ResumenDashboard } from "@/features/dashboard/types";

/** Construye un `ResumenDashboard` completo con ceros, permitiendo sobrescribir campos. */
function resumen(parcial: Partial<ResumenDashboard> = {}): ResumenDashboard {
  return {
    contratos_activos: 0,
    contratos_cerrados: 0,
    total_animales_actual: 0,
    utilidad_total_acumulada: 0,
    utilidad_real_comerciante_acumulada: 0,
    utilidad_terceros_acumulada: 0,
    total_costos_informativos: 0,
    total_ventas_registradas: 0,
    ...parcial,
  };
}

describe("construirNarrativa", () => {
  it("resume operación y participación con datos típicos", () => {
    const frases = construirNarrativa(
      resumen({
        contratos_activos: 3,
        contratos_cerrados: 2,
        total_animales_actual: 85,
        utilidad_total_acumulada: 12_500_000,
        utilidad_real_comerciante_acumulada: 7_500_000,
        utilidad_terceros_acumulada: 5_000_000,
      }),
    );

    expect(frases).toEqual([
      "Tienes 3 contratos activos y 85 animales en inventario, y hasta hoy se han cerrado 2 contratos.",
      "De la utilidad acumulada de las ventas, 60% es tuya como comerciante.",
      "Los socios de participación tienen 40% de la utilidad acumulada de las ventas.",
    ]);
  });

  it("devuelve una sola frase sin divisiones cuando todo está en cero", () => {
    const frases = construirNarrativa(resumen());

    expect(frases).toEqual([
      "Ahora mismo no tienes contratos activos ni animales en inventario.",
    ]);
  });

  it("omite porcentajes cuando la utilidad total es cero", () => {
    const frases = construirNarrativa(
      resumen({
        contratos_activos: 1,
        total_animales_actual: 10,
        utilidad_total_acumulada: 0,
        utilidad_real_comerciante_acumulada: 0,
        utilidad_terceros_acumulada: 0,
      }),
    );

    expect(frases).toEqual([
      "Tienes 1 contrato activo y 10 animales en inventario.",
    ]);
  });

  it("trata valores ausentes o no finitos como cero", () => {
    const conAusentes = {
      contratos_activos: null,
      contratos_cerrados: undefined,
      total_animales_actual: Number.NaN,
      utilidad_total_acumulada: null,
      utilidad_real_comerciante_acumulada: undefined,
      utilidad_terceros_acumulada: Number.POSITIVE_INFINITY,
      total_costos_informativos: null,
      total_ventas_registradas: undefined,
    } as unknown as ResumenDashboard;

    expect(construirNarrativa(conAusentes)).toEqual([
      "Ahora mismo no tienes contratos activos ni animales en inventario.",
    ]);
  });

  it("no muestra porcentajes fuera de 0–100 cuando la parte supera el total", () => {
    const frases = construirNarrativa(
      resumen({
        contratos_activos: 2,
        utilidad_total_acumulada: 100,
        utilidad_real_comerciante_acumulada: 200,
        utilidad_terceros_acumulada: -50,
      }),
    );

    expect(frases).toEqual([
      "Tienes 2 contratos activos, sin animales en inventario por ahora.",
    ]);
  });

  it("describe la utilidad completamente propia cuando el comerciante es el 100%", () => {
    const frases = construirNarrativa(
      resumen({
        contratos_activos: 1,
        utilidad_total_acumulada: 1_000,
        utilidad_real_comerciante_acumulada: 1_000,
        utilidad_terceros_acumulada: 0,
      }),
    );

    expect(frases).toEqual([
      "Tienes 1 contrato activo, sin animales en inventario por ahora.",
      "Toda la utilidad acumulada de las ventas es tuya como comerciante.",
    ]);
  });
});
