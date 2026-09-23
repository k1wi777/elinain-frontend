import { clavesReportes } from "@/features/reportes/query-keys";

describe("clavesReportes", () => {
  it("expone la raíz de todas las consultas", () => {
    expect(clavesReportes.todas).toEqual(["reportes"]);
  });

  it("contratosActivos() devuelve la clave del reporte de contratos activos", () => {
    expect(clavesReportes.contratosActivos()).toEqual([
      "reportes",
      "contratos-activos",
    ]);
  });

  it("historialVentas() devuelve la clave del historial de ventas", () => {
    expect(clavesReportes.historialVentas()).toEqual([
      "reportes",
      "historial-ventas",
    ]);
  });
});
