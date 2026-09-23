import { calcularTotalesCompras } from "@/features/compras/totales";
import type { Compra } from "@/features/compras/types";

/** Construye una compra con los valores indicados. */
function compra(datos: Partial<Compra> = {}): Compra {
  return {
    id: "compra-1",
    contrato_id: "contrato-1",
    fecha: "2026-09-21T10:00:00.000Z",
    cantidad: 25,
    peso_promedio: 320.5,
    precio_kilo: 8500,
    valor_total: 68106250,
    nota: "",
    ...datos,
  };
}

describe("calcularTotalesCompras", () => {
  it("devuelve ceros sin compras", () => {
    expect(calcularTotalesCompras([])).toEqual({
      cabezas: 0,
      inversion: 0,
    });
  });

  it("suma cabezas y valor total de todas las filas", () => {
    const totales = calcularTotalesCompras([
      compra({ id: "1", cantidad: 25, valor_total: 68106250 }),
      compra({ id: "2", cantidad: 10, valor_total: 30000000 }),
      compra({ id: "3", cantidad: 5, valor_total: 15000000 }),
    ]);

    expect(totales).toEqual({ cabezas: 40, inversion: 113106250 });
  });

  it("solo suma las filas recibidas (página parcial)", () => {
    const pagina = [compra({ id: "1", cantidad: 25, valor_total: 68106250 })];

    expect(calcularTotalesCompras(pagina)).toEqual({
      cabezas: 25,
      inversion: 68106250,
    });
  });

  it("usa el `valor_total` del backend sin recalcularlo", () => {
    const totales = calcularTotalesCompras([
      compra({
        cantidad: 2,
        peso_promedio: 100,
        precio_kilo: 10,
        valor_total: 1,
      }),
    ]);

    expect(totales.inversion).toBe(1);
  });
});
