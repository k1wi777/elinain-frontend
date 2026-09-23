import { clavesCostos } from "@/features/costos/query-keys";

describe("clavesCostos", () => {
  it("expone la raíz de todas las consultas", () => {
    expect(clavesCostos.todas).toEqual(["costos"]);
  });

  it("listas() devuelve la raíz del listado sin filtros", () => {
    expect(clavesCostos.listas()).toEqual(["costos", "list"]);
  });

  it("lista() incluye la paginación y el contrato", () => {
    const filtros = { limite: 20, offset: 0, contrato_id: "contrato-1" };

    expect(clavesCostos.lista(filtros)).toEqual(["costos", "list", filtros]);
  });
});
