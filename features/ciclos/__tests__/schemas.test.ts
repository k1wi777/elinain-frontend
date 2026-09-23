import { esquemaCiclo } from "@/features/ciclos/schemas";

const datosValidos = {
  fecha: "2026-09-21",
  peso_observado: 380.5,
  notas: "Buen rebrote de pasturas",
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

describe("esquemaCiclo", () => {
  it("acepta un ciclo válido", () => {
    expect(esquemaCiclo.safeParse(datosValidos).success).toBe(true);
  });

  it("acepta un ciclo sin peso observado ni notas", () => {
    const resultado = esquemaCiclo.safeParse({ fecha: "2026-09-21" });

    expect(resultado.success).toBe(true);
  });

  it("rechaza la fecha vacía", () => {
    const resultado = esquemaCiclo.safeParse({ ...datosValidos, fecha: "  " });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa la fecha del ciclo.");
  });

  it("rechaza la fecha inválida", () => {
    const resultado = esquemaCiclo.safeParse({
      ...datosValidos,
      fecha: "2026-02-30",
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Ingresa una fecha válida.");
  });

  it("rechaza el peso observado no positivo", () => {
    const resultado = esquemaCiclo.safeParse({
      ...datosValidos,
      peso_observado: 0,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "El peso observado debe ser mayor que cero.",
    );
  });

  it("rechaza el peso observado no numérico", () => {
    const resultado = esquemaCiclo.safeParse({
      ...datosValidos,
      peso_observado: Number.NaN,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "El peso observado debe ser un número.",
    );
  });

  it("aplica trim a la fecha y a las notas antes de devolverlas", () => {
    const resultado = esquemaCiclo.parse({
      ...datosValidos,
      fecha: "  2026-09-21  ",
      notas: "  Notas del lote  ",
    });

    expect(resultado.fecha).toBe("2026-09-21");
    expect(resultado.notas).toBe("Notas del lote");
  });
});
