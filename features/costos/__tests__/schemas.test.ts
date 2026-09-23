import { esquemaCosto } from "@/features/costos/schemas";

const datosValidos = {
  tipo: "flete",
  monto: 450000,
  fecha: "2026-09-22",
  descripcion: "Transporte de novillos desde la subasta hasta la finca",
};

/** Extrae los mensajes de error de un resultado fallido. */
function mensajes(resultado: {
  success: boolean;
  error?: { issues: { message: string }[] };
}): string[] {
  return resultado.success || resultado.error === undefined
    ? []
    : resultado.error.issues.map((issue) => issue.message);
}

describe("esquemaCosto", () => {
  it("acepta un costo válido", () => {
    expect(esquemaCosto.safeParse(datosValidos).success).toBe(true);
  });

  it("rechaza el tipo vacío", () => {
    const resultado = esquemaCosto.safeParse({ ...datosValidos, tipo: "  " });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa el tipo de costo.");
  });

  it("rechaza el monto ausente", () => {
    const resultado = esquemaCosto.safeParse({
      ...datosValidos,
      monto: undefined,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa el monto.");
  });

  it("rechaza el monto no numérico", () => {
    const resultado = esquemaCosto.safeParse({
      ...datosValidos,
      monto: Number.NaN,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa el monto.");
  });

  it("rechaza el monto no positivo", () => {
    const resultado = esquemaCosto.safeParse({ ...datosValidos, monto: 0 });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("El monto debe ser mayor que cero.");
  });

  it("rechaza la fecha vacía", () => {
    const resultado = esquemaCosto.safeParse({ ...datosValidos, fecha: "  " });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa la fecha del costo.");
  });

  it("rechaza la fecha inválida", () => {
    const resultado = esquemaCosto.safeParse({
      ...datosValidos,
      fecha: "2026-02-30",
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa una fecha válida.");
  });

  it("rechaza la descripción vacía", () => {
    const resultado = esquemaCosto.safeParse({
      ...datosValidos,
      descripcion: "  ",
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa una descripción del costo.");
  });

  it("aplica trim al tipo, la fecha y la descripción antes de devolverlos", () => {
    const resultado = esquemaCosto.parse({
      ...datosValidos,
      tipo: "  flete  ",
      fecha: "  2026-09-22  ",
      descripcion: "  Transporte de novillos  ",
    });

    expect(resultado.tipo).toBe("flete");
    expect(resultado.fecha).toBe("2026-09-22");
    expect(resultado.descripcion).toBe("Transporte de novillos");
  });
});
