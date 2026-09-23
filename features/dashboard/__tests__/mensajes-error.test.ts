import { mensajeErrorDashboard } from "@/features/dashboard/mensajes-error";

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

describe("mensajeErrorDashboard", () => {
  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorDashboard(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorDashboard(500)).toBe(
      "No se pudo cargar el resumen del panel. Inténtalo de nuevo.",
    );
    expect(mensajeErrorDashboard(401)).toBe(
      "No se pudo cargar el resumen del panel. Inténtalo de nuevo.",
    );
    expect(mensajeErrorDashboard(502)).toBe(
      "No se pudo cargar el resumen del panel. Inténtalo de nuevo.",
    );
  });
});
