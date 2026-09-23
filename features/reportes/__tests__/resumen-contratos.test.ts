import { calcularResumenContratos } from "@/features/reportes/resumen-contratos";
import type { ContratoActivoDetalle } from "@/features/reportes/types";

/** Construye un contrato activo con los valores indicados. */
function contrato(
  overrides: Partial<ContratoActivoDetalle> = {},
): ContratoActivoDetalle {
  return {
    contrato_id: "contrato-1",
    tercero_id: "tercero-1",
    tercero_nombre: "Tercero",
    finca_id: "finca-1",
    finca_nombre: "Finca",
    fecha_apertura: "2026-01-01T00:00:00.000Z",
    porcentaje_comerciante: 60,
    porcentaje_tercero: 40,
    cantidad_actual: 10,
    total_compras: 1,
    total_ventas: 0,
    utilidad_generada_comerciante: 0,
    ...overrides,
  };
}

describe("calcularResumenContratos", () => {
  it("devuelve ceros sin contratos", () => {
    expect(calcularResumenContratos([])).toEqual({
      contratosEnCurso: 0,
      ganadoEnPastoreo: 0,
      totalCompras: 0,
      utilidadNetaGenerada: 0,
    });
  });

  it("suma el ganado, las compras y la utilidad de todos los contratos", () => {
    const resumen = calcularResumenContratos([
      contrato({
        contrato_id: "a",
        cantidad_actual: 35,
        total_compras: 2,
        utilidad_generada_comerciante: 3450000,
      }),
      contrato({
        contrato_id: "b",
        cantidad_actual: 20,
        total_compras: 1,
        utilidad_generada_comerciante: 1500000,
      }),
    ]);

    expect(resumen).toEqual({
      contratosEnCurso: 2,
      ganadoEnPastoreo: 55,
      totalCompras: 3,
      utilidadNetaGenerada: 4950000,
    });
  });

  it("conserva el signo de las utilidades negativas", () => {
    const resumen = calcularResumenContratos([
      contrato({
        contrato_id: "a",
        utilidad_generada_comerciante: 1000000,
      }),
      contrato({
        contrato_id: "b",
        utilidad_generada_comerciante: -250000,
      }),
    ]);

    expect(resumen.utilidadNetaGenerada).toBe(750000);
  });

  it("cuenta los contratos aunque sus sumas sean cero", () => {
    const resumen = calcularResumenContratos([
      contrato({
        contrato_id: "a",
        cantidad_actual: 0,
        total_compras: 0,
        utilidad_generada_comerciante: 0,
      }),
      contrato({
        contrato_id: "b",
        cantidad_actual: 0,
        total_compras: 0,
        utilidad_generada_comerciante: 0,
      }),
    ]);

    expect(resumen).toEqual({
      contratosEnCurso: 2,
      ganadoEnPastoreo: 0,
      totalCompras: 0,
      utilidadNetaGenerada: 0,
    });
  });
});
