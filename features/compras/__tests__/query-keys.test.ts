import { clavesCompras } from "@/features/compras/query-keys";

describe("clavesCompras", () => {
  it("expone la raíz de todas las consultas", () => {
    expect(clavesCompras.todas).toEqual(["compras"]);
  });

  it("listas() devuelve la raíz del listado sin filtros", () => {
    expect(clavesCompras.listas()).toEqual(["compras", "list"]);
  });

  it("lista() incluye la paginación y el contrato", () => {
    const filtros = { limite: 20, offset: 0, contrato_id: "contrato-1" };

    expect(clavesCompras.lista(filtros)).toEqual(["compras", "list", filtros]);
  });
});
