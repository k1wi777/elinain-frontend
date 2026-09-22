import {
  esquemaCrearContrato,
  esquemaEditarContrato,
} from "@/features/contratos/schemas";

const datosValidos = {
  tercero_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  finca_id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  fecha_apertura: "2026-09-21T10:00",
  porcentaje_comerciante: 60,
  porcentaje_tercero: 40,
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

describe("esquemaCrearContrato", () => {
  it("acepta un contrato válido", () => {
    expect(esquemaCrearContrato.safeParse(datosValidos).success).toBe(true);
  });

  it("rechaza el tercero vacío", () => {
    const resultado = esquemaCrearContrato.safeParse({
      ...datosValidos,
      tercero_id: "   ",
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "Selecciona el socio de participación.",
    );
  });

  it("rechaza la finca vacía", () => {
    const resultado = esquemaCrearContrato.safeParse({
      ...datosValidos,
      finca_id: "",
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Selecciona la finca del contrato.");
  });

  it("rechaza la fecha de apertura vacía", () => {
    const resultado = esquemaCrearContrato.safeParse({
      ...datosValidos,
      fecha_apertura: "",
    });

    expect(mensajes(resultado)).toContain(
      "Ingresa la fecha y hora de apertura del contrato.",
    );
  });

  it("rechaza la fecha de apertura inválida", () => {
    const resultado = esquemaCrearContrato.safeParse({
      ...datosValidos,
      fecha_apertura: "2026-02-30T10:00",
    });

    expect(mensajes(resultado)).toContain(
      "Ingresa una fecha y hora de apertura válidas.",
    );
  });

  it("rechaza porcentajes fuera de rango", () => {
    expect(
      mensajes(
        esquemaCrearContrato.safeParse({
          ...datosValidos,
          porcentaje_comerciante: 120,
          porcentaje_tercero: -20,
        }),
      ),
    ).toContain("El porcentaje debe estar entre 0 y 100.");
  });

  it("rechaza porcentajes que no suman exactamente 100", () => {
    const resultado = esquemaCrearContrato.safeParse({
      ...datosValidos,
      porcentaje_comerciante: 60,
      porcentaje_tercero: 30,
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "Los porcentajes del comerciante y del tercero deben sumar exactamente 100.",
    );
  });

  it("acepta la suma exactamente 100 en los extremos", () => {
    expect(
      esquemaCrearContrato.safeParse({
        ...datosValidos,
        porcentaje_comerciante: 100,
        porcentaje_tercero: 0,
      }).success,
    ).toBe(true);
  });

  it("rechaza opcionales numéricos no positivos", () => {
    expect(
      mensajes(
        esquemaCrearContrato.safeParse({
          ...datosValidos,
          peso_promedio_actual: 0,
        }),
      ),
    ).toContain("El valor debe ser mayor que cero.");
    expect(
      mensajes(
        esquemaCrearContrato.safeParse({
          ...datosValidos,
          cantidad_actual: -5,
        }),
      ),
    ).toContain("El valor debe ser mayor que cero.");
  });

  it("acepta los opcionales omitidos", () => {
    expect(esquemaCrearContrato.safeParse(datosValidos).success).toBe(true);
  });

  it("aplica trim a los textos antes de devolverlos", () => {
    const resultado = esquemaCrearContrato.parse({
      ...datosValidos,
      tercero_id: "  a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11  ",
      raza: "  Brahman  ",
    });

    expect(resultado.tercero_id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
    expect(resultado.raza).toBe("Brahman");
  });
});

describe("esquemaEditarContrato", () => {
  it("acepta un contrato activo sin fecha de cierre", () => {
    expect(esquemaEditarContrato.safeParse({ estado: "activo" }).success).toBe(
      true,
    );
  });

  it("rechaza el estado vacío o inválido", () => {
    const resultado = esquemaEditarContrato.safeParse({ estado: "" });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain("Selecciona el estado del contrato.");
  });

  it("exige la fecha de cierre cuando el contrato está cerrado", () => {
    const resultado = esquemaEditarContrato.safeParse({
      estado: "cerrado",
      fecha_cierre: "",
    });

    expect(resultado.success).toBe(false);
    expect(mensajes(resultado)).toContain(
      "Ingresa la fecha de cierre del contrato.",
    );
  });

  it("acepta un contrato cerrado con fecha de cierre", () => {
    expect(
      esquemaEditarContrato.safeParse({
        estado: "cerrado",
        fecha_cierre: "2026-12-31T18:00",
      }).success,
    ).toBe(true);
  });

  it("rechaza los mutables numéricos no positivos", () => {
    const resultado = esquemaEditarContrato.safeParse({
      estado: "activo",
      valor_kilo_referencia: 0,
    });

    expect(mensajes(resultado)).toContain("El valor debe ser mayor que cero.");
  });
});
