import {
  formatearParticipacion,
  type PorcentajesParticipacion,
} from "@/features/contratos/participacion";

describe("formatearParticipacion", () => {
  it("compone ambos porcentajes en una sola cadena", () => {
    expect(
      formatearParticipacion({
        porcentaje_comerciante: 60,
        porcentaje_tercero: 40,
      }),
    ).toBe("60% / 40%");
  });

  it("admite valores decimales", () => {
    const porcentajes: PorcentajesParticipacion = {
      porcentaje_comerciante: 33.33,
      porcentaje_tercero: 66.67,
    };

    expect(formatearParticipacion(porcentajes)).toBe("33.33% / 66.67%");
  });

  it("admite extremos de la escala", () => {
    expect(
      formatearParticipacion({
        porcentaje_comerciante: 100,
        porcentaje_tercero: 0,
      }),
    ).toBe("100% / 0%");
  });
});
