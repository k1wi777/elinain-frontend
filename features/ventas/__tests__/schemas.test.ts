import { esquemaVenta } from "@/features/ventas/schemas";

const datosValidos = {
  contrato_id: "contrato-1",
  fecha: "2026-09-21T10:00",
  cantidad_vendida: 20,
  peso_promedio_venta: 410.5,
  precio_kilo_venta: 9200,
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

describe("esquemaVenta", () => {
  it("acepta una venta válida", () => {
    expect(esquemaVenta.safeParse(datosValidos).success).toBe(true);
  });

  it("rechaza el contrato vacío", () => {
    const resultado = esquemaVenta.safeParse({
      ...datosValidos,
      contrato_id: "   ",
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "Selecciona el contrato de la venta.",
    );
  });

  it("rechaza la fecha vacía", () => {
    const resultado = esquemaVenta.safeParse({ ...datosValidos, fecha: "  " });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "Ingresa la fecha y hora de la venta.",
    );
  });

  it("rechaza la fecha inválida", () => {
    const resultado = esquemaVenta.safeParse({
      ...datosValidos,
      fecha: "2026-02-30T10:00",
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa una fecha y hora válidas.");
  });

  it("rechaza la cantidad no positiva", () => {
    const resultado = esquemaVenta.safeParse({
      ...datosValidos,
      cantidad_vendida: 0,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "La cantidad debe ser mayor que cero.",
    );
  });

  it("rechaza la cantidad no entera", () => {
    const resultado = esquemaVenta.safeParse({
      ...datosValidos,
      cantidad_vendida: 2.5,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "La cantidad debe ser un número entero.",
    );
  });

  it("rechaza el peso promedio no positivo", () => {
    const resultado = esquemaVenta.safeParse({
      ...datosValidos,
      peso_promedio_venta: 0,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "El peso promedio debe ser mayor que cero.",
    );
  });

  it("rechaza el precio por kilo no positivo", () => {
    const resultado = esquemaVenta.safeParse({
      ...datosValidos,
      precio_kilo_venta: -1,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "El precio por kilo debe ser mayor que cero.",
    );
  });

  it("rechaza los campos numéricos no informados", () => {
    const resultado = esquemaVenta.safeParse({
      ...datosValidos,
      cantidad_vendida: undefined,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "Ingresa la cantidad de animales vendidos.",
    );
  });

  it("aplica trim a la fecha antes de devolverla", () => {
    const resultado = esquemaVenta.parse({
      ...datosValidos,
      contrato_id: "  contrato-1  ",
      fecha: "  2026-09-21T10:00  ",
    });

    expect(resultado.contrato_id).toBe("contrato-1");
    expect(resultado.fecha).toBe("2026-09-21T10:00");
  });
});
