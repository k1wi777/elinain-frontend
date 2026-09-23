import { calcularResumenContratos } from "@/features/contratos/resumen";
import type { Contrato, EstadoContrato } from "@/features/contratos/types";

/** Construye un contrato con los valores indicados. */
function contrato(
  id: string,
  estado: EstadoContrato,
  datos: Partial<Contrato> = {},
): Contrato {
  return {
    id,
    tercero_id: "tercero-1",
    finca_id: "finca-1",
    fecha_apertura: "2026-09-21T10:00:00.000Z",
    porcentaje_comerciante: 60,
    porcentaje_tercero: 40,
    estado,
    ...datos,
  };
}

describe("calcularResumenContratos", () => {
  it("devuelve ceros y promedios nulos sin contratos", () => {
    expect(calcularResumenContratos([])).toEqual({
      contratosActivos: 0,
      cabezasEnPie: 0,
      pesoPromedioEnPie: null,
      porcentaje_comerciante: null,
      porcentaje_tercero: null,
    });
  });

  it("cuenta solo los contratos activos", () => {
    const resumen = calcularResumenContratos([
      contrato("1", "activo"),
      contrato("2", "cerrado"),
      contrato("3", "activo"),
    ]);

    expect(resumen.contratosActivos).toBe(2);
  });

  it("suma las cabezas en pie ignorando valores nulos", () => {
    const resumen = calcularResumenContratos([
      contrato("1", "activo", { cantidad_actual: 50 }),
      contrato("2", "activo", { cantidad_actual: null }),
      contrato("3", "cerrado", { cantidad_actual: 30 }),
      contrato("4", "activo", { cantidad_actual: undefined }),
    ]);

    expect(resumen.cabezasEnPie).toBe(80);
  });

  it("promedia el peso en pie ignorando valores nulos y redondea a entero", () => {
    const resumen = calcularResumenContratos([
      contrato("1", "activo", { peso_promedio_actual: 350.5 }),
      contrato("2", "activo", { peso_promedio_actual: 401 }),
      contrato("3", "activo", { peso_promedio_actual: null }),
      contrato("4", "cerrado", { peso_promedio_actual: 350.5 }),
    ]);

    // (350.5 + 401 + 350.5) / 3 = 367.33…
    expect(resumen.pesoPromedioEnPie).toBe(367);
  });

  it("devuelve `null` en el peso promedio cuando ningún contrato lo informa", () => {
    const resumen = calcularResumenContratos([
      contrato("1", "activo", { peso_promedio_actual: null }),
      contrato("2", "activo", { peso_promedio_actual: undefined }),
    ]);

    expect(resumen.pesoPromedioEnPie).toBeNull();
  });

  it("promedia los porcentajes de participación y redondea a entero", () => {
    const resumen = calcularResumenContratos([
      contrato("1", "activo", {
        porcentaje_comerciante: 60,
        porcentaje_tercero: 40,
      }),
      contrato("2", "cerrado", {
        porcentaje_comerciante: 33.33,
        porcentaje_tercero: 66.67,
      }),
    ]);

    expect(resumen.porcentaje_comerciante).toBe(47);
    expect(resumen.porcentaje_tercero).toBe(53);
  });

  it("devuelve promedios nulos cuando no hay contratos con porcentajes válidos", () => {
    const resumen = calcularResumenContratos([]);

    expect(resumen.porcentaje_comerciante).toBeNull();
    expect(resumen.porcentaje_tercero).toBeNull();
  });

  it("tolera contratos con datos parciales en todos los agregados", () => {
    const resumen = calcularResumenContratos([
      contrato("1", "activo", {
        cantidad_actual: 10,
        peso_promedio_actual: 300,
        porcentaje_comerciante: 50,
        porcentaje_tercero: 50,
      }),
      contrato("2", "cerrado", {
        cantidad_actual: null,
        peso_promedio_actual: null,
      }),
    ]);

    expect(resumen).toEqual({
      contratosActivos: 1,
      cabezasEnPie: 10,
      pesoPromedioEnPie: 300,
      porcentaje_comerciante: 55,
      porcentaje_tercero: 45,
    });
  });
});
