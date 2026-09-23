import {
  mensajeErrorGuardarVenta,
  mensajeErrorListarVentas,
} from "@/features/ventas/mensajes-error";

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

describe("mensajeErrorListarVentas", () => {
  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorListarVentas(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorListarVentas(500)).toBe(
      "No se pudo cargar el listado de ventas. Inténtalo de nuevo.",
    );
    expect(mensajeErrorListarVentas(401)).toBe(
      "No se pudo cargar el listado de ventas. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorGuardarVenta", () => {
  it("mapea 400 a datos por revisar", () => {
    expect(mensajeErrorGuardarVenta(400)).toBe("Revisa los datos de la venta.");
  });

  it("mapea 404 a contrato inexistente", () => {
    expect(mensajeErrorGuardarVenta(404)).toBe("El contrato no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorGuardarVenta(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorGuardarVenta(500)).toBe(
      "No se pudo guardar la venta. Inténtalo de nuevo.",
    );
  });
});
