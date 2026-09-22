import {
  fincasDeTercero,
  indexarNombres,
  nombreDeFinca,
  nombreDeTercero,
  TEXTO_FINCA_DESCONOCIDA,
  TEXTO_TERCERO_DESCONOCIDO,
} from "@/features/contratos/relaciones";

describe("indexarNombres", () => {
  it("indexa los elementos por su identificador", () => {
    const indice = indexarNombres([
      { id: "tercero-1", nombre: "Juan Pérez" },
      { id: "tercero-2", nombre: "María Gómez" },
    ]);

    expect(indice.get("tercero-1")).toBe("Juan Pérez");
    expect(indice.get("tercero-2")).toBe("María Gómez");
  });
});

describe("nombreDeTercero", () => {
  it("devuelve el nombre cuando el tercero está indexado", () => {
    const indice = indexarNombres([{ id: "tercero-1", nombre: "Juan Pérez" }]);

    expect(nombreDeTercero(indice, "tercero-1")).toBe("Juan Pérez");
  });

  it("devuelve el texto de respaldo cuando el tercero no está indexado", () => {
    const indice = indexarNombres([]);

    expect(nombreDeTercero(indice, "tercero-9")).toBe(
      TEXTO_TERCERO_DESCONOCIDO,
    );
  });

  it("devuelve el texto de respaldo cuando el nombre está vacío", () => {
    const indice = indexarNombres([{ id: "tercero-1", nombre: "   " }]);

    expect(nombreDeTercero(indice, "tercero-1")).toBe(
      TEXTO_TERCERO_DESCONOCIDO,
    );
  });
});

describe("nombreDeFinca", () => {
  it("devuelve el nombre cuando la finca está indexada", () => {
    const indice = indexarNombres([{ id: "finca-1", nombre: "La Esperanza" }]);

    expect(nombreDeFinca(indice, "finca-1")).toBe("La Esperanza");
  });

  it("devuelve el texto de respaldo cuando la finca no está indexada", () => {
    const indice = indexarNombres([]);

    expect(nombreDeFinca(indice, "finca-9")).toBe(TEXTO_FINCA_DESCONOCIDA);
  });
});

describe("fincasDeTercero", () => {
  const fincas = [
    { id: "finca-1", nombre: "La Esperanza", tercero_id: "tercero-1" },
    { id: "finca-2", nombre: "El Porvenir", tercero_id: "tercero-1" },
    { id: "finca-3", nombre: "Las Palmas", tercero_id: "tercero-2" },
  ];

  it("filtra las fincas asociadas al tercero", () => {
    expect(fincasDeTercero(fincas, "tercero-1")).toEqual([
      fincas[0],
      fincas[1],
    ]);
  });

  it("devuelve un conjunto vacío cuando no hay coincidencias", () => {
    expect(fincasDeTercero(fincas, "tercero-9")).toEqual([]);
  });

  it("devuelve un conjunto vacío cuando no se ha elegido tercero", () => {
    expect(fincasDeTercero(fincas, "")).toEqual([]);
  });
});
