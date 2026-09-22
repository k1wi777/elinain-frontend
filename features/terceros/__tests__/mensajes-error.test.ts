import {
  mensajeErrorEliminarTercero,
  mensajeErrorGuardarTercero,
  mensajeErrorListarTerceros,
} from "@/features/terceros/mensajes-error";

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

describe("mensajeErrorListarTerceros", () => {
  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorListarTerceros(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorListarTerceros(500)).toBe(
      "No se pudo cargar el listado de socios de participación. Inténtalo de nuevo.",
    );
    expect(mensajeErrorListarTerceros(401)).toBe(
      "No se pudo cargar el listado de socios de participación. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorGuardarTercero", () => {
  it("mapea 400 a datos por revisar", () => {
    expect(mensajeErrorGuardarTercero(400)).toBe(
      "Revisa los datos del socio de participación.",
    );
  });

  it("mapea 404 a socio inexistente", () => {
    expect(mensajeErrorGuardarTercero(404)).toBe(
      "El socio de participación no existe.",
    );
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorGuardarTercero(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorGuardarTercero(500)).toBe(
      "No se pudo guardar el socio de participación. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorEliminarTercero", () => {
  it("mapea 409 al texto de contratos activos", () => {
    expect(mensajeErrorEliminarTercero(409)).toBe(
      "No se puede eliminar el socio de participación porque tiene contratos activos asociados.",
    );
  });

  it("mapea 404 a socio inexistente", () => {
    expect(mensajeErrorEliminarTercero(404)).toBe(
      "El socio de participación no existe.",
    );
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorEliminarTercero(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorEliminarTercero(500)).toBe(
      "No se pudo eliminar el socio de participación. Inténtalo de nuevo.",
    );
  });
});
