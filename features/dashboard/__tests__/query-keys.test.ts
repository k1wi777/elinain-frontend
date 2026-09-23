import { clavesDashboard } from "@/features/dashboard/query-keys";

describe("clavesDashboard", () => {
  it("expone la raíz de todas las consultas", () => {
    expect(clavesDashboard.todas).toEqual(["dashboard"]);
  });

  it("resumen() devuelve la clave del resumen consolidado", () => {
    expect(clavesDashboard.resumen()).toEqual(["dashboard", "resumen"]);
  });
});
