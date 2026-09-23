import { formatearConteo, formatearMoneda } from "@/features/dashboard/formato";

/**
 * Los valores de salida son absolutos para el locale `es-CO`, por lo que estas
 * comprobaciones no dependen de la configuración regional del sistema donde se ejecuten.
 * El separador entre símbolo y cifra es un espacio duro (`\u00a0`).
 */
describe("formatearMoneda", () => {
  it("formatea COP con separador de miles y sin decimales", () => {
    expect(formatearMoneda(12500000)).toBe("$\u00a012.500.000");
  });

  it("formatea el cero", () => {
    expect(formatearMoneda(0)).toBe("$\u00a00");
  });

  it("conserva el signo en montos negativos", () => {
    expect(formatearMoneda(-1500)).toBe("-$\u00a01.500");
  });
});

describe("formatearConteo", () => {
  it("formatea el conteo con separador de miles es-CO", () => {
    expect(formatearConteo(1234567)).toBe("1.234.567");
  });

  it("formatea conteos pequeños sin separador", () => {
    expect(formatearConteo(85)).toBe("85");
  });

  it("formatea el cero", () => {
    expect(formatearConteo(0)).toBe("0");
  });
});
