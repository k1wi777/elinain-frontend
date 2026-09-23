import {
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
} from "@/features/ventas/formatos";

describe("formatearMoneda", () => {
  it("presenta el valor en pesos sin decimales", () => {
    expect(formatearMoneda(75532000)).toMatch(/^\$\s?75\.532\.000$/);
  });

  it("redondea al peso cuando el monto trae decimales", () => {
    expect(formatearMoneda(1500.6)).toMatch(/^\$\s?1\.501$/);
  });
});

describe("formatearNumero", () => {
  it("usa la coma como separador decimal y hasta un decimal", () => {
    expect(formatearNumero(90.5)).toBe("90,5");
  });

  it("omite los decimales cuando el número es entero", () => {
    expect(formatearNumero(90)).toBe("90");
  });
});

describe("formatearPorcentaje", () => {
  it("limita a dos decimales y añade el símbolo", () => {
    expect(formatearPorcentaje(57.3583)).toBe("57,36%");
  });

  it("presenta los enteros sin decimales", () => {
    expect(formatearPorcentaje(0)).toBe("0%");
  });
});
