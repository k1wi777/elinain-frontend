import { esquemaCompra } from "@/features/compras/schemas";

const datosValidos = {
  fecha: "2026-09-21T10:00",
  cantidad: 25,
  peso_promedio: 320.5,
  precio_kilo: 8500,
  nota: "Compra de 25 novillos en subasta ganadera",
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

describe("esquemaCompra", () => {
  it("acepta una compra válida", () => {
    expect(esquemaCompra.safeParse(datosValidos).success).toBe(true);
  });

  it("rechaza la fecha vacía", () => {
    const resultado = esquemaCompra.safeParse({ ...datosValidos, fecha: "  " });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "Ingresa la fecha y hora de la compra.",
    );
  });

  it("rechaza la fecha inválida", () => {
    const resultado = esquemaCompra.safeParse({
      ...datosValidos,
      fecha: "2026-02-30T10:00",
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa una fecha y hora válidas.");
  });

  it("rechaza la cantidad no positiva", () => {
    const resultado = esquemaCompra.safeParse({ ...datosValidos, cantidad: 0 });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "La cantidad debe ser mayor que cero.",
    );
  });

  it("rechaza la cantidad no entera", () => {
    const resultado = esquemaCompra.safeParse({
      ...datosValidos,
      cantidad: 2.5,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "La cantidad debe ser un número entero.",
    );
  });

  it("rechaza el peso promedio no positivo", () => {
    const resultado = esquemaCompra.safeParse({
      ...datosValidos,
      peso_promedio: 0,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "El peso promedio debe ser mayor que cero.",
    );
  });

  it("rechaza el precio por kilo no positivo", () => {
    const resultado = esquemaCompra.safeParse({
      ...datosValidos,
      precio_kilo: -1,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "El precio por kilo debe ser mayor que cero.",
    );
  });

  it("rechaza la nota vacía", () => {
    const resultado = esquemaCompra.safeParse({ ...datosValidos, nota: "   " });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa una nota para la compra.");
  });

  it("rechaza los campos numéricos no informados", () => {
    const resultado = esquemaCompra.safeParse({
      ...datosValidos,
      cantidad: undefined,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa la cantidad de animales.");
  });

  it("aplica trim a la fecha y a la nota antes de devolverlas", () => {
    const resultado = esquemaCompra.parse({
      ...datosValidos,
      fecha: "  2026-09-21T10:00  ",
      nota: "  Compra de novillos  ",
    });

    expect(resultado.fecha).toBe("2026-09-21T10:00");
    expect(resultado.nota).toBe("Compra de novillos");
  });
});
