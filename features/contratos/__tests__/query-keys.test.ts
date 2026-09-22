import { clavesContratos } from "@/features/contratos/query-keys";

describe("clavesContratos", () => {
  it("expone la raíz de todas las consultas", () => {
    expect(clavesContratos.todas).toEqual(["contratos"]);
  });

  it("lista() identifica el conjunto completo sin filtros", () => {
    expect(clavesContratos.lista()).toEqual(["contratos", "list"]);
  });

  it("detalle() incluye el identificador del contrato", () => {
    expect(clavesContratos.detalle("contrato-1")).toEqual([
      "contratos",
      "detail",
      "contrato-1",
    ]);
  });
});
