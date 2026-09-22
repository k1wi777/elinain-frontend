import {
  mensajeErrorEliminarFinca,
  mensajeErrorGeocodificacion,
  mensajeErrorGuardarFinca,
  mensajeErrorListarFincas,
} from "@/features/fincas/mensajes-error";

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

describe("mensajeErrorListarFincas", () => {
  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorListarFincas(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorListarFincas(500)).toBe(
      "No se pudo cargar el listado de fincas. Inténtalo de nuevo.",
    );
    expect(mensajeErrorListarFincas(401)).toBe(
      "No se pudo cargar el listado de fincas. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorGuardarFinca", () => {
  it("mapea 400 a datos por revisar", () => {
    expect(mensajeErrorGuardarFinca(400)).toBe("Revisa los datos de la finca.");
  });

  it("mapea 404 a finca inexistente", () => {
    expect(mensajeErrorGuardarFinca(404)).toBe("La finca no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorGuardarFinca(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorGuardarFinca(500)).toBe(
      "No se pudo guardar la finca. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorEliminarFinca", () => {
  it("mapea 409 al texto de contratos vinculados", () => {
    expect(mensajeErrorEliminarFinca(409)).toBe(
      "No se puede eliminar la finca porque tiene contratos vinculados.",
    );
  });

  it("mapea 404 a finca inexistente", () => {
    expect(mensajeErrorEliminarFinca(404)).toBe("La finca no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorEliminarFinca(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorEliminarFinca(500)).toBe(
      "No se pudo eliminar la finca. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorGeocodificacion", () => {
  it("mapea 404 a dirección no encontrada", () => {
    expect(mensajeErrorGeocodificacion(404)).toBe(
      "No se encontró la dirección indicada.",
    );
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorGeocodificacion(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorGeocodificacion(502)).toBe(
      "No se pudo buscar la dirección. Inténtalo de nuevo.",
    );
  });
});
