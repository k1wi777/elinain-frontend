import { calcularResumenVentas } from "@/features/ventas/resumen";
import type { Venta } from "@/features/ventas/types";

/** Construye una venta con los valores indicados. */
function venta(id: string, datos: Partial<Venta> = {}): Venta {
  return {
    id,
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

describe("calcularResumenVentas", () => {
  it("devuelve sumas en cero y rentabilidad nula sin ventas", () => {
    expect(calcularResumenVentas([])).toEqual({
      valorBrutoTotal: 0,
      utilidadTotalLiquidada: 0,
      valorComerciante: 0,
      valorTercero: 0,
      rentabilidad: null,
    });
  });

  it("suma los campos reales de las ventas recibidas", () => {
    const resumen = calcularResumenVentas([
      venta("1", {
        valor_bruto: 100000,
        utilidad_total: 40000,
        valor_comerciante: 24000,
        valor_tercero: 16000,
        costo_estimado_compra: 60000,
      }),
      venta("2", {
        valor_bruto: 50000,
        utilidad_total: 10000,
        valor_comerciante: 6000,
        valor_tercero: 4000,
        costo_estimado_compra: 40000,
      }),
    ]);

    expect(resumen.valorBrutoTotal).toBe(150000);
    expect(resumen.utilidadTotalLiquidada).toBe(50000);
    expect(resumen.valorComerciante).toBe(30000);
    expect(resumen.valorTercero).toBe(20000);
    // 50000 / 100000 * 100 = 50 %
    expect(resumen.rentabilidad).toBe(50);
  });

  it("devuelve rentabilidad `null` cuando el costo sumado es cero", () => {
    const resumen = calcularResumenVentas([
      venta("1", { costo_estimado_compra: 0 }),
      venta("2", { costo_estimado_compra: 0 }),
    ]);

    expect(resumen.rentabilidad).toBeNull();
  });

  it("ignora valores nulos al sumar sin distorsionar los agregados", () => {
    const conNulos = venta("1", {
      valor_bruto: null as unknown as number,
      utilidad_total: null as unknown as number,
      valor_comerciante: undefined as unknown as number,
      valor_tercero: null as unknown as number,
      costo_estimado_compra: null as unknown as number,
    });

    const resumen = calcularResumenVentas([
      conNulos,
      venta("2", {
        valor_bruto: 1000,
        utilidad_total: 500,
        valor_comerciante: 300,
        valor_tercero: 200,
        costo_estimado_compra: 1000,
      }),
    ]);

    expect(resumen).toEqual({
      valorBrutoTotal: 1000,
      utilidadTotalLiquidada: 500,
      valorComerciante: 300,
      valorTercero: 200,
      rentabilidad: 50,
    });
  });
});
