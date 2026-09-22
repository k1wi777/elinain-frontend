import {
  fechaLocalAIso,
  formatearFechaHora,
  isoAFechaLocal,
} from "@/features/contratos/fechas";

/**
 * Los valores de entrada y salida son absolutos (ISO 8601 con desfase), por lo que estas
 * comprobaciones no dependen de la zona horaria del sistema donde se ejecuten.
 */
describe("fechaLocalAIso", () => {
  it("interpreta la hora local como zona de Colombia (UTC−5)", () => {
    expect(fechaLocalAIso("2026-09-21T10:00")).toBe("2026-09-21T15:00:00.000Z");
  });

  it("devuelve la misma fecha tras ida y vuelta", () => {
    const local = "2026-09-21T10:00";

    expect(isoAFechaLocal(fechaLocalAIso(local))).toBe(local);
  });

  it("devuelve cadena vacía para una entrada vacía", () => {
    expect(fechaLocalAIso("")).toBe("");
    expect(fechaLocalAIso("   ")).toBe("");
  });

  it("devuelve cadena vacía cuando el formato no es el esperado", () => {
    expect(fechaLocalAIso("21/09/2026 10:00")).toBe("");
    expect(fechaLocalAIso("no-es-fecha")).toBe("");
  });

  it("devuelve cadena vacía cuando la fecha no existe", () => {
    expect(fechaLocalAIso("2026-13-01T10:00")).toBe("");
    expect(fechaLocalAIso("2026-02-30T10:00")).toBe("");
  });
});

describe("isoAFechaLocal", () => {
  it("convierte un instante UTC a la hora local de Colombia", () => {
    expect(isoAFechaLocal("2026-09-21T15:00:00.000Z")).toBe("2026-09-21T10:00");
  });

  it("cruza el límite del día hacia atrás", () => {
    expect(isoAFechaLocal("2026-09-22T02:00:00.000Z")).toBe("2026-09-21T21:00");
  });

  it("devuelve cadena vacía cuando la cadena no es una fecha válida", () => {
    expect(isoAFechaLocal("")).toBe("");
    expect(isoAFechaLocal("no-es-fecha")).toBe("");
  });
});

describe("formatearFechaHora", () => {
  it("presenta la fecha en español y en la zona del negocio", () => {
    expect(formatearFechaHora("2026-09-21T15:00:00.000Z")).toBe(
      "21/09/2026 10:00",
    );
  });

  it("devuelve cadena vacía cuando la fecha no es válida", () => {
    expect(formatearFechaHora("")).toBe("");
    expect(formatearFechaHora("no-es-fecha")).toBe("");
  });
});
