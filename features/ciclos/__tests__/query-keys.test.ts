import { clavesCiclos } from "@/features/ciclos/query-keys";

describe("clavesCiclos", () => {
  it("expone la raíz de todas las consultas", () => {
    expect(clavesCiclos.todas).toEqual(["ciclos"]);
  });

  it("listas() devuelve la raíz del listado sin filtros", () => {
    expect(clavesCiclos.listas()).toEqual(["ciclos", "list"]);
  });

  it("lista() incluye la paginación y el contrato", () => {
    const filtros = { limite: 20, offset: 0, contrato_id: "contrato-1" };

    expect(clavesCiclos.lista(filtros)).toEqual(["ciclos", "list", filtros]);
  });
});
