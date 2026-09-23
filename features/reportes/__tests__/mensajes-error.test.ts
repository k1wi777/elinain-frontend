import {
  mensajeErrorContratosActivos,
  mensajeErrorHistorialVentas,
} from "@/features/reportes/mensajes-error";

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

describe("mensajeErrorContratosActivos", () => {
  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorContratosActivos(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    const generico =
      "No se pudo cargar el reporte de contratos activos. Inténtalo de nuevo.";

    expect(mensajeErrorContratosActivos(401)).toBe(generico);
    expect(mensajeErrorContratosActivos(500)).toBe(generico);
    expect(mensajeErrorContratosActivos(502)).toBe(generico);
  });
});

describe("mensajeErrorHistorialVentas", () => {
  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorHistorialVentas(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    const generico =
      "No se pudo cargar el historial de ventas. Inténtalo de nuevo.";

    expect(mensajeErrorHistorialVentas(401)).toBe(generico);
    expect(mensajeErrorHistorialVentas(500)).toBe(generico);
    expect(mensajeErrorHistorialVentas(502)).toBe(generico);
  });
});
