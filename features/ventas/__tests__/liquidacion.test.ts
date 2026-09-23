import { calcularDistribucionLiquidacion } from "@/features/ventas/liquidacion";
import type { Venta } from "@/features/ventas/types";

/** Construye una venta con el desglose financiero indicado. */
function venta(datos: Partial<Venta> = {}): Venta {
  return {
    id: "venta-1",
    contrato_id: "contrato-1",
    fecha: "2026-09-21T15:00:00.000Z",
    cantidad_vendida: 20,
    peso_promedio_venta: 410.5,
    precio_kilo_venta: 9200,
    valor_bruto: 75532000,
    precio_compra_por_animal_promedio: 2400000,
    peso_promedio_compra_simple: 320,
    costo_estimado_compra: 48000000,
    utilidad_total: 27532000,
    valor_comerciante: 16519200,
    valor_tercero: 11012800,
    kilos_ganados_promedio: 90.5,
    utilidad_real: 16519200,
    porcentaje_utilidad_total: 57.3583,
    ...datos,
  };
}

describe("calcularDistribucionLiquidacion", () => {
  it("deriva los porcentajes de los montos del reparto", () => {
    const distribucion = calcularDistribucionLiquidacion(
      venta({ valor_comerciante: 60, valor_tercero: 40 }),
    );

    expect(distribucion).toEqual({
      porcentajeComerciante: 60,
      porcentajeTercero: 40,
    });
  });

  it("devuelve `null` cuando la suma del reparto es cero", () => {
    const distribucion = calcularDistribucionLiquidacion(
      venta({ valor_comerciante: 0, valor_tercero: 0 }),
    );

    expect(distribucion).toBeNull();
  });

  it("admite un reparto desproporcionado y suma cien", () => {
    const distribucion = calcularDistribucionLiquidacion(
      venta({ valor_comerciante: 1, valor_tercero: 999 }),
    );

    expect(distribucion).not.toBeNull();
    expect(distribucion?.porcentajeComerciante).toBeCloseTo(0.1);
    expect(distribucion?.porcentajeTercero).toBeCloseTo(99.9);
    expect(
      (distribucion?.porcentajeComerciante ?? 0) +
        (distribucion?.porcentajeTercero ?? 0),
    ).toBeCloseTo(100);
  });

  it("asigna todo el reparto a un extremo cuando el otro es cero", () => {
    const distribucion = calcularDistribucionLiquidacion(
      venta({ valor_comerciante: 500, valor_tercero: 0 }),
    );

    expect(distribucion).toEqual({
      porcentajeComerciante: 100,
      porcentajeTercero: 0,
    });
  });
});
