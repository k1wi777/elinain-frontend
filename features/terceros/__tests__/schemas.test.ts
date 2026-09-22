import { esquemaTercero } from "@/features/terceros/schemas";

const datosValidos = {
  nombre: "Juan Pérez",
  documento: "900123456-7",
  contacto: "+57 300 123 4567",
};

describe("esquemaTercero", () => {
  it("acepta nombre, documento y contacto válidos", () => {
    expect(esquemaTercero.safeParse(datosValidos).success).toBe(true);
  });

  it("rechaza el nombre vacío o solo con espacios", () => {
    const resultado = esquemaTercero.safeParse({
      ...datosValidos,
      nombre: "   ",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain(
        "Ingresa el nombre del socio de participación.",
      );
    }
  });

  it("rechaza el documento vacío o solo con espacios", () => {
    const resultado = esquemaTercero.safeParse({
      ...datosValidos,
      documento: "   ",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain(
        "Ingresa el documento del socio de participación.",
      );
    }
  });

  it("rechaza el contacto vacío o solo con espacios", () => {
    const resultado = esquemaTercero.safeParse({
      ...datosValidos,
      contacto: "   ",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain(
        "Ingresa el contacto del socio de participación.",
      );
    }
  });

  it("aplica trim a los campos antes de devolverlos", () => {
    const resultado = esquemaTercero.parse({
      nombre: "  Juan Pérez  ",
      documento: "  900123456-7 ",
      contacto: " +57 300 123 4567 ",
    });

    expect(resultado).toEqual({
      nombre: "Juan Pérez",
      documento: "900123456-7",
      contacto: "+57 300 123 4567",
    });
  });
});
