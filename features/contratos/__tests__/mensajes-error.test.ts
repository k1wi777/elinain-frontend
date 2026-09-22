import {
  mensajeErrorDetalleContrato,
  mensajeErrorGuardarContrato,
  mensajeErrorListarContratos,
} from "@/features/contratos/mensajes-error";

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

describe("mensajeErrorListarContratos", () => {
  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorListarContratos(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorListarContratos(500)).toBe(
      "No se pudo cargar el listado de contratos. Inténtalo de nuevo.",
    );
    expect(mensajeErrorListarContratos(401)).toBe(
      "No se pudo cargar el listado de contratos. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorGuardarContrato", () => {
  it("mapea 400 a datos por revisar", () => {
    expect(mensajeErrorGuardarContrato(400)).toBe(
      "Revisa los datos del contrato.",
    );
  });

  it("mapea 404 a contrato inexistente", () => {
    expect(mensajeErrorGuardarContrato(404)).toBe("El contrato no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorGuardarContrato(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorGuardarContrato(500)).toBe(
      "No se pudo guardar el contrato. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorDetalleContrato", () => {
  it("mapea 404 a contrato inexistente", () => {
    expect(mensajeErrorDetalleContrato(404)).toBe("El contrato no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorDetalleContrato(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorDetalleContrato(500)).toBe(
      "No se pudo cargar el contrato. Inténtalo de nuevo.",
    );
  });
});
