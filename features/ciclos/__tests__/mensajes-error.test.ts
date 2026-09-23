import {
  mensajeErrorEliminarCiclo,
  mensajeErrorGuardarCiclo,
  mensajeErrorListarCiclos,
} from "@/features/ciclos/mensajes-error";

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

describe("mensajeErrorListarCiclos", () => {
  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorListarCiclos(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorListarCiclos(500)).toBe(
      "No se pudo cargar el listado de ciclos. Inténtalo de nuevo.",
    );
    expect(mensajeErrorListarCiclos(401)).toBe(
      "No se pudo cargar el listado de ciclos. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorGuardarCiclo", () => {
  it("mapea 400 a datos por revisar o contrato cerrado", () => {
    expect(mensajeErrorGuardarCiclo(400)).toBe(
      "No se pudo guardar el ciclo: revisa los datos o verifica que el contrato no esté cerrado.",
    );
  });

  it("mapea 404 a ciclo inexistente", () => {
    expect(mensajeErrorGuardarCiclo(404)).toBe("El ciclo no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorGuardarCiclo(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorGuardarCiclo(500)).toBe(
      "No se pudo guardar el ciclo. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorEliminarCiclo", () => {
  it("mapea 400 a solicitud por revisar o contrato cerrado", () => {
    expect(mensajeErrorEliminarCiclo(400)).toBe(
      "No se pudo eliminar el ciclo: revisa la solicitud o verifica el estado del contrato.",
    );
  });

  it("mapea 404 a ciclo inexistente", () => {
    expect(mensajeErrorEliminarCiclo(404)).toBe("El ciclo no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorEliminarCiclo(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorEliminarCiclo(500)).toBe(
      "No se pudo eliminar el ciclo. Inténtalo de nuevo.",
    );
  });
});
