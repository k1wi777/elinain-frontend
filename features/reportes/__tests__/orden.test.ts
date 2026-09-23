import {
  LIMITE_VENTAS_VISIBLES,
  ordenarContratosPorUtilidadDescendente,
  ordenarVentasPorFechaDescendente,
  recortarVentas,
} from "@/features/reportes/orden";
import type {
  ContratoActivoDetalle,
  VentaHistorialItem,
} from "@/features/reportes/types";

function crearContrato(
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

function crearVenta(
  overrides: Partial<VentaHistorialItem> = {},
): VentaHistorialItem {
  return {
    venta_id: "venta-1",
    contrato_id: "contrato-1",
    fecha: "2026-01-01T00:00:00.000Z",
    cantidad_vendida: 10,
    peso_promedio_venta: 410,
    precio_kilo_venta: 9200,
    valor_bruto: 3772000,
    costo_estimado_compra: 2500000,
    utilidad_total: 1272000,
    valor_comerciante: 763200,
    valor_tercero: 508800,
    kilos_ganados_promedio: 95,
    porcentaje_utilidad_total: 50.88,
    ...overrides,
  };
}

describe("ordenarContratosPorUtilidadDescendente", () => {
  it("ordena de mayor a menor utilidad generada por el comerciante", () => {
    const contratos = [
      crearContrato({ contrato_id: "a", utilidad_generada_comerciante: 100 }),
      crearContrato({ contrato_id: "b", utilidad_generada_comerciante: 500 }),
      crearContrato({ contrato_id: "c", utilidad_generada_comerciante: 300 }),
    ];

    const ordenados = ordenarContratosPorUtilidadDescendente(contratos);

    expect(ordenados.map((contrato) => contrato.contrato_id)).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  it("no muta el arreglo original", () => {
    const contratos = [
      crearContrato({ contrato_id: "a", utilidad_generada_comerciante: 100 }),
      crearContrato({ contrato_id: "b", utilidad_generada_comerciante: 500 }),
    ];

    ordenarContratosPorUtilidadDescendente(contratos);

    expect(contratos.map((contrato) => contrato.contrato_id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("admite utilidades negativas", () => {
    const contratos = [
      crearContrato({ contrato_id: "a", utilidad_generada_comerciante: -100 }),
      crearContrato({ contrato_id: "b", utilidad_generada_comerciante: 50 }),
      crearContrato({ contrato_id: "c", utilidad_generada_comerciante: 0 }),
    ];

    const ordenados = ordenarContratosPorUtilidadDescendente(contratos);

    expect(ordenados.map((contrato) => contrato.contrato_id)).toEqual([
      "b",
      "c",
      "a",
    ]);
  });
});

describe("ordenarVentasPorFechaDescendente", () => {
  it("ordena de la fecha más reciente a la más antigua", () => {
    const ventas = [
      crearVenta({ venta_id: "antigua", fecha: "2026-01-01T00:00:00.000Z" }),
      crearVenta({ venta_id: "reciente", fecha: "2026-09-22T10:00:00.000Z" }),
      crearVenta({ venta_id: "media", fecha: "2026-05-10T10:00:00.000Z" }),
    ];

    const ordenadas = ordenarVentasPorFechaDescendente(ventas);

    expect(ordenadas.map((venta) => venta.venta_id)).toEqual([
      "reciente",
      "media",
      "antigua",
    ]);
  });

  it("no muta el arreglo original", () => {
    const ventas = [
      crearVenta({ venta_id: "antigua", fecha: "2026-01-01T00:00:00.000Z" }),
      crearVenta({ venta_id: "reciente", fecha: "2026-09-22T10:00:00.000Z" }),
    ];

    ordenarVentasPorFechaDescendente(ventas);

    expect(ventas.map((venta) => venta.venta_id)).toEqual([
      "antigua",
      "reciente",
    ]);
  });
});

describe("recortarVentas", () => {
  const ventas = Array.from({ length: 60 }, (_, indice) =>
    crearVenta({
      venta_id: `venta-${indice}`,
      fecha: new Date(Date.UTC(2026, 0, 1 + indice)).toISOString(),
    }),
  );

  it("muestra como máximo el límite de ventas visibles cuando no está expandido", () => {
    const visibles = recortarVentas(ventas, false);

    expect(visibles).toHaveLength(LIMITE_VENTAS_VISIBLES);
    expect(visibles[0].venta_id).toBe("venta-0");
  });

  it("devuelve todas las ventas cuando está expandido", () => {
    expect(recortarVentas(ventas, true)).toHaveLength(60);
  });

  it("no recorta cuando hay menos ventas que el límite", () => {
    expect(recortarVentas(ventas.slice(0, 10), false)).toHaveLength(10);
  });

  it("expone el límite de ventas visibles en 50", () => {
    expect(LIMITE_VENTAS_VISIBLES).toBe(50);
  });
});
