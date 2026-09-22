import { clavesFincas } from "@/features/fincas/query-keys";

describe("clavesFincas", () => {
  it("expone la raíz de todas las consultas", () => {
    expect(clavesFincas.todas).toEqual(["fincas"]);
  });

  it("listas() devuelve la raíz del listado sin filtros", () => {
    expect(clavesFincas.listas()).toEqual(["fincas", "list"]);
  });

  it("lista() incluye los filtros de paginación", () => {
    const filtros = { limite: 20, offset: 40 };

    expect(clavesFincas.lista(filtros)).toEqual(["fincas", "list", filtros]);
  });

  it("mapa() identifica el conjunto completo de pines", () => {
    expect(clavesFincas.mapa()).toEqual(["fincas", "mapa"]);
  });

  it("detalle() incluye el identificador de la finca", () => {
    expect(clavesFincas.detalle("finca-1")).toEqual([
      "fincas",
      "detail",
      "finca-1",
    ]);
  });

  it("sugerencias() incluye la consulta de dirección", () => {
    expect(clavesFincas.sugerencias("calle 10")).toEqual([
      "fincas",
      "geocodificacion",
      "sugerencias",
      "calle 10",
    ]);
  });
});
