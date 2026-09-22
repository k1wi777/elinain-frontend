import { clavesTerceros } from "@/features/terceros/query-keys";

describe("clavesTerceros", () => {
  it("expone la raíz de todas las consultas", () => {
    expect(clavesTerceros.todas).toEqual(["terceros"]);
  });

  it("listas() devuelve la raíz del listado sin filtros", () => {
    expect(clavesTerceros.listas()).toEqual(["terceros", "list"]);
  });

  it("lista() incluye los filtros de paginación", () => {
    const filtros = { limite: 20, offset: 40 };

    expect(clavesTerceros.lista(filtros)).toEqual([
      "terceros",
      "list",
      filtros,
    ]);
  });
});
