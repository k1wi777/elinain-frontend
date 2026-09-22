import {
  calcularOffset,
  calcularPagina,
  calcularTotalPaginas,
  LIMITE_MAXIMO,
  LIMITE_MINIMO,
  LIMITE_POR_DEFECTO,
  normalizarLimite,
  normalizarPagina,
} from "@/shared/api/pagination";

describe("normalizarLimite", () => {
  it("deja pasar un límite dentro del rango", () => {
    expect(normalizarLimite(20)).toBe(20);
    expect(normalizarLimite(LIMITE_MINIMO)).toBe(1);
    expect(normalizarLimite(LIMITE_MAXIMO)).toBe(100);
  });

  it("recorta un límite superior al máximo del backend", () => {
    expect(normalizarLimite(500)).toBe(LIMITE_MAXIMO);
  });

  it("eleva un límite inferior al mínimo", () => {
    expect(normalizarLimite(0)).toBe(LIMITE_MINIMO);
    expect(normalizarLimite(-10)).toBe(LIMITE_MINIMO);
  });

  it("devuelve el límite por defecto cuando el valor no es finito", () => {
    expect(normalizarLimite(Number.NaN)).toBe(LIMITE_POR_DEFECTO);
    expect(normalizarLimite(Number.POSITIVE_INFINITY)).toBe(LIMITE_POR_DEFECTO);
  });
});

describe("calcularTotalPaginas", () => {
  it("divide el total entre el límite, redondeando hacia arriba", () => {
    expect(calcularTotalPaginas(45, 20)).toBe(3);
  });

  it("devuelve 1 página cuando no hay registros", () => {
    expect(calcularTotalPaginas(0, 20)).toBe(1);
  });

  it("devuelve 1 página cuando el total cabe exactamente en el límite", () => {
    expect(calcularTotalPaginas(20, 20)).toBe(1);
  });
});

describe("calcularPagina", () => {
  it("calcula la página base 1 a partir del offset", () => {
    expect(calcularPagina(0, 20)).toBe(1);
    expect(calcularPagina(20, 20)).toBe(2);
    expect(calcularPagina(45, 20)).toBe(3);
  });

  it("redondea hacia abajo un offset intermedio", () => {
    expect(calcularPagina(25, 20)).toBe(2);
  });
});

describe("calcularOffset", () => {
  it("calcula el offset de la página solicitada", () => {
    expect(calcularOffset(1, 20)).toBe(0);
    expect(calcularOffset(3, 20)).toBe(40);
  });

  it("nunca devuelve un offset negativo", () => {
    expect(calcularOffset(0, 20)).toBe(0);
    expect(calcularOffset(-3, 20)).toBe(0);
  });
});

describe("normalizarPagina", () => {
  it("mantiene una página dentro del rango", () => {
    expect(normalizarPagina(2, 5)).toBe(2);
  });

  it("acota una página superior al total de páginas", () => {
    expect(normalizarPagina(9, 5)).toBe(5);
  });

  it("eleva una página inferior a 1", () => {
    expect(normalizarPagina(0, 5)).toBe(1);
    expect(normalizarPagina(-4, 5)).toBe(1);
  });

  it("devuelve 1 cuando no hay páginas reportadas", () => {
    expect(normalizarPagina(3, 0)).toBe(1);
  });
});
