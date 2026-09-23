import {
  mensajeErrorEliminarCompra,
  mensajeErrorGuardarCompra,
  mensajeErrorListarCompras,
} from "@/features/compras/mensajes-error";

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

describe("mensajeErrorListarCompras", () => {
  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorListarCompras(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorListarCompras(500)).toBe(
      "No se pudo cargar el listado de compras. Inténtalo de nuevo.",
    );
    expect(mensajeErrorListarCompras(401)).toBe(
      "No se pudo cargar el listado de compras. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorGuardarCompra", () => {
  it("mapea 400 a datos por revisar", () => {
    expect(mensajeErrorGuardarCompra(400)).toBe(
      "Revisa los datos de la compra.",
    );
  });

  it("mapea 404 a compra inexistente", () => {
    expect(mensajeErrorGuardarCompra(404)).toBe("La compra no existe.");
  });

  it("mapea 409 al texto de contrato con ventas registradas", () => {
    expect(mensajeErrorGuardarCompra(409)).toBe(
      "No se puede modificar la compra: el contrato ya tiene ventas registradas.",
    );
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorGuardarCompra(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorGuardarCompra(500)).toBe(
      "No se pudo guardar la compra. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorEliminarCompra", () => {
  it("mapea 409 al texto de contrato con ventas registradas", () => {
    expect(mensajeErrorEliminarCompra(409)).toBe(
      "No se puede eliminar la compra: el contrato ya tiene ventas registradas.",
    );
  });

  it("mapea 404 a compra inexistente", () => {
    expect(mensajeErrorEliminarCompra(404)).toBe("La compra no existe.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorEliminarCompra(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorEliminarCompra(500)).toBe(
      "No se pudo eliminar la compra. Inténtalo de nuevo.",
    );
  });
});
