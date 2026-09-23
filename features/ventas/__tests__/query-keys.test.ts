import { clavesVentas } from "@/features/ventas/query-keys";

describe("clavesVentas", () => {
  it("expone la raíz de todas las consultas", () => {
    expect(clavesVentas.todas).toEqual(["ventas"]);
  });

  it("listas() devuelve la raíz del listado sin filtros", () => {
    expect(clavesVentas.listas()).toEqual(["ventas", "list"]);
  });

  it("lista() incluye la paginación y el contrato", () => {
    const filtros = { limite: 20, offset: 0, contrato_id: "contrato-1" };

    expect(clavesVentas.lista(filtros)).toEqual(["ventas", "list", filtros]);
  });

  it("lista() distingue el listado global sin contrato", () => {
    const filtros = { limite: 20, offset: 0 };

    expect(clavesVentas.lista(filtros)).toEqual(["ventas", "list", filtros]);
  });
});
