import {
  mensajeErrorCrearCosto,
  mensajeErrorEditarCosto,
  mensajeErrorEliminarCosto,
  mensajeErrorListarCostos,
} from "@/features/costos/mensajes-error";

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

describe("mensajeErrorListarCostos", () => {
  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorListarCostos(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorListarCostos(500)).toBe(
      "No se pudo cargar el listado de costos. Inténtalo de nuevo.",
    );
    expect(mensajeErrorListarCostos(401)).toBe(
      "No se pudo cargar el listado de costos. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorCrearCosto", () => {
  it("mapea 400 a datos por revisar o contrato cerrado", () => {
    expect(mensajeErrorCrearCosto(400)).toBe(
      "No se pudo registrar el costo: revisa los datos o verifica que el contrato no esté cerrado.",
    );
  });

  it("mapea 404 a contrato inexistente", () => {
    expect(mensajeErrorCrearCosto(404)).toBe("El contrato no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorCrearCosto(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorCrearCosto(500)).toBe(
      "No se pudo registrar el costo. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorEditarCosto", () => {
  it("mapea 400 a datos por revisar o contrato cerrado", () => {
    expect(mensajeErrorEditarCosto(400)).toBe(
      "No se pudo guardar el costo: revisa los datos o verifica que el contrato no esté cerrado.",
    );
  });

  it("mapea 404 a costo inexistente", () => {
    expect(mensajeErrorEditarCosto(404)).toBe("El costo no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorEditarCosto(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorEditarCosto(500)).toBe(
      "No se pudo guardar el costo. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorEliminarCosto", () => {
  it("mapea 400 a solicitud por revisar o contrato cerrado", () => {
    expect(mensajeErrorEliminarCosto(400)).toBe(
      "No se pudo eliminar el costo: revisa la solicitud o verifica el estado del contrato.",
    );
  });

  it("mapea 404 a costo inexistente", () => {
    expect(mensajeErrorEliminarCosto(404)).toBe("El costo no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorEliminarCosto(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorEliminarCosto(500)).toBe(
      "No se pudo eliminar el costo. Inténtalo de nuevo.",
    );
  });
});
