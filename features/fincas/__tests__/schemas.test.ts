import { esquemaFinca } from "@/features/fincas/schemas";

const datosValidos = {
  tercero_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  nombre: "Hacienda La Esperanza",
  direccion: "Vereda El Porvenir, Km 14 Vía Montería",
  latitud: 8.754321,
  longitud: -75.881234,
};

describe("esquemaFinca", () => {
  it("acepta una finca válida", () => {
    expect(esquemaFinca.safeParse(datosValidos).success).toBe(true);
  });

  it("rechaza el propietario vacío", () => {
    const resultado = esquemaFinca.safeParse({
      ...datosValidos,
      tercero_id: "   ",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("Selecciona el propietario de la finca.");
    }
  });

  it("rechaza el nombre vacío o solo con espacios", () => {
    const resultado = esquemaFinca.safeParse({
      ...datosValidos,
      nombre: "   ",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("Ingresa el nombre de la finca.");
    }
  });

  it("rechaza la dirección vacía o solo con espacios", () => {
    const resultado = esquemaFinca.safeParse({
      ...datosValidos,
      direccion: "   ",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("Ingresa la dirección de la finca.");
    }
  });

  it("rechaza la finca sin ubicación en el mapa", () => {
    const resultado = esquemaFinca.safeParse({
      ...datosValidos,
      latitud: undefined,
      longitud: undefined,
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("Ubica la finca en el mapa.");
    }
  });

  it("acepta los límites de latitud y longitud", () => {
    expect(
      esquemaFinca.safeParse({
        ...datosValidos,
        latitud: -90,
        longitud: -180,
      }).success,
    ).toBe(true);
    expect(
      esquemaFinca.safeParse({ ...datosValidos, latitud: 90, longitud: 180 })
        .success,
    ).toBe(true);
  });

  it("rechaza la latitud fuera de rango", () => {
    const resultado = esquemaFinca.safeParse({ ...datosValidos, latitud: 91 });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("La latitud debe estar entre -90 y 90.");
    }
  });

  it("rechaza la longitud fuera de rango", () => {
    const resultado = esquemaFinca.safeParse({
      ...datosValidos,
      longitud: -181,
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("La longitud debe estar entre -180 y 180.");
    }
  });

  it("aplica trim a los textos antes de devolverlos", () => {
    const resultado = esquemaFinca.parse({
      ...datosValidos,
      nombre: "  Hacienda La Esperanza  ",
      direccion: "  Vereda El Porvenir  ",
    });

    expect(resultado).toEqual({
      ...datosValidos,
      nombre: "Hacienda La Esperanza",
      direccion: "Vereda El Porvenir",
    });
  });
});
