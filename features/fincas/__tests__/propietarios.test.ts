import {
  indexarPropietarios,
  nombreDePropietario,
  TEXTO_PROPIETARIO_DESCONOCIDO,
} from "@/features/fincas/propietarios";

describe("indexarPropietarios", () => {
  it("indexa los propietarios por su identificador", () => {
    const indice = indexarPropietarios([
      { id: "tercero-1", nombre: "Juan Pérez" },
      { id: "tercero-2", nombre: "María Gómez" },
    ]);

    expect(indice.get("tercero-1")).toBe("Juan Pérez");
    expect(indice.get("tercero-2")).toBe("María Gómez");
  });
});

describe("nombreDePropietario", () => {
  it("devuelve el nombre cuando el tercero está indexado", () => {
    const indice = indexarPropietarios([
      { id: "tercero-1", nombre: "Juan Pérez" },
    ]);

    expect(nombreDePropietario(indice, "tercero-1")).toBe("Juan Pérez");
  });

  it("devuelve el texto de respaldo cuando el tercero no está indexado", () => {
    const indice = indexarPropietarios([
      { id: "tercero-1", nombre: "Juan Pérez" },
    ]);

    expect(nombreDePropietario(indice, "tercero-9")).toBe(
      TEXTO_PROPIETARIO_DESCONOCIDO,
    );
  });

  it("devuelve el texto de respaldo cuando el nombre está vacío", () => {
    const indice = indexarPropietarios([{ id: "tercero-1", nombre: "   " }]);

    expect(nombreDePropietario(indice, "tercero-1")).toBe(
      TEXTO_PROPIETARIO_DESCONOCIDO,
    );
  });
});
