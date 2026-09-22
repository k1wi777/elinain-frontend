import {
  filtrarContratosPorEstado,
  paginarContratos,
} from "@/features/contratos/filtros";
import type { Contrato, EstadoContrato } from "@/features/contratos/types";

/** Construye un contrato mínimo con el estado indicado. */
function contrato(id: string, estado: EstadoContrato): Contrato {
  return {
    id,
    tercero_id: "tercero-1",
    finca_id: "finca-1",
    fecha_apertura: "2026-09-21T10:00:00.000Z",
    porcentaje_comerciante: 60,
    porcentaje_tercero: 40,
    estado,
  };
}

describe("filtrarContratosPorEstado", () => {
  const contratos = [
    contrato("1", "activo"),
    contrato("2", "cerrado"),
    contrato("3", "activo"),
  ];

  it("devuelve el conjunto completo con el filtro `todos`", () => {
    expect(filtrarContratosPorEstado(contratos, "todos")).toEqual(contratos);
  });

  it("filtra los contratos activos", () => {
    expect(filtrarContratosPorEstado(contratos, "activo")).toEqual([
      contratos[0],
      contratos[2],
    ]);
  });

  it("filtra los contratos cerrados", () => {
    expect(filtrarContratosPorEstado(contratos, "cerrado")).toEqual([
      contratos[1],
    ]);
  });

  it("devuelve un conjunto vacío cuando no hay coincidencias", () => {
    expect(filtrarContratosPorEstado([contratos[0]], "cerrado")).toEqual([]);
  });
});

describe("paginarContratos", () => {
  const contratos = [
    contrato("1", "activo"),
    contrato("2", "activo"),
    contrato("3", "activo"),
    contrato("4", "activo"),
    contrato("5", "activo"),
  ];

  it("recorta la primera página", () => {
    expect(paginarContratos(contratos, 2, 0)).toEqual([
      contratos[0],
      contratos[1],
    ]);
  });

  it("recorta una página intermedia", () => {
    expect(paginarContratos(contratos, 2, 2)).toEqual([
      contratos[2],
      contratos[3],
    ]);
  });

  it("recorta la última página parcial", () => {
    expect(paginarContratos(contratos, 2, 4)).toEqual([contratos[4]]);
  });

  it("acota un offset fuera de rango a la última página", () => {
    expect(paginarContratos(contratos, 2, 99)).toEqual([contratos[4]]);
  });

  it("devuelve un conjunto vacío sin contratos", () => {
    expect(paginarContratos([], 20, 0)).toEqual([]);
  });
});
