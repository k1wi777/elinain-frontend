import { calcularParticipacionComerciante } from "@/features/reportes/participacion";
import type { ResumenHistorialVentas } from "@/features/reportes/types";

/** Construye un resumen del historial con los valores indicados. */
function resumen(
  overrides: Partial<ResumenHistorialVentas> = {},
): ResumenHistorialVentas {
  return {
    total_ventas: 0,
    total_animales_vendidos: 0,
    valor_bruto_acumulado: 0,
    costo_estimado_acumulado: 0,
    utilidad_total_acumulada: 0,
    utilidad_comerciante_acumulada: 0,
    utilidad_terceros_acumulada: 0,
    ...overrides,
  };
}

describe("calcularParticipacionComerciante", () => {
  it("deriva el porcentaje del comerciante sobre la utilidad total", () => {
    const participacion = calcularParticipacionComerciante(
      resumen({
        utilidad_total_acumulada: 50000000,
        utilidad_comerciante_acumulada: 30000000,
      }),
    );

    expect(participacion).toBe(60);
  });

  it("devuelve `null` cuando la utilidad total es cero", () => {
    const participacion = calcularParticipacionComerciante(
      resumen({
        utilidad_total_acumulada: 0,
        utilidad_comerciante_acumulada: 1000000,
      }),
    );

    expect(participacion).toBeNull();
  });

  it("devuelve `null` cuando el resumen viene vacío", () => {
    expect(calcularParticipacionComerciante(resumen())).toBeNull();
  });
});
