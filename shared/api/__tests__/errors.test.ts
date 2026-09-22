import { ApiError, mapErrorResponse, toApiError } from "@/shared/api/errors";

describe("mapErrorResponse", () => {
  it("usa el mensaje y los errores del DTO de validación", () => {
    const error = mapErrorResponse(400, {
      exito: false,
      mensaje: "Error de validación en la petición",
      errores: ["El email no es válido", "La contraseña es muy corta"],
      ruta: "/api/v1/usuarios/registro",
      marcaTiempo: "2026-09-21T16:00:00.000Z",
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe("Error de validación en la petición");
    expect(error.errores).toEqual([
      "El email no es válido",
      "La contraseña es muy corta",
    ]);
    expect(error.ruta).toBe("/api/v1/usuarios/registro");
    expect(error.marcaTiempo).toBe("2026-09-21T16:00:00.000Z");
  });

  it("usa el mensaje por defecto cuando el cuerpo no trae mensaje", () => {
    const error = mapErrorResponse(404, {});

    expect(error.status).toBe(404);
    expect(error.message).toBe("El recurso solicitado no existe.");
    expect(error.errores).toEqual([]);
  });

  it("ignora los elementos de errores que no son strings", () => {
    const error = mapErrorResponse(500, {
      errores: [1, "Error real", null, { detalle: "x" }],
    });

    expect(error.errores).toEqual(["Error real"]);
  });

  it("usa el mensaje por defecto cuando el cuerpo no es un objeto", () => {
    const error = mapErrorResponse(401, "No autorizado");

    expect(error.status).toBe(401);
    expect(error.message).toBe("Tu sesión no es válida o ha expirado.");
  });

  it("usa un mensaje genérico para un estado sin mensaje por defecto", () => {
    const error = mapErrorResponse(418, undefined);

    expect(error.message).toBe("Ocurrió un error inesperado.");
  });
});

describe("toApiError", () => {
  it("devuelve el mismo ApiError cuando ya lo es", () => {
    const original = new ApiError(409, "Conflicto");

    expect(toApiError(original)).toBe(original);
  });

  it("mapea un error de axios con respuesta usando el cuerpo", () => {
    const error = toApiError({
      isAxiosError: true,
      response: {
        status: 404,
        data: { mensaje: "Tercero no encontrado" },
      },
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe("Tercero no encontrado");
  });

  it("devuelve status 0 con mensaje de red ante un fallo sin respuesta", () => {
    const error = toApiError({ isAxiosError: true, message: "Network Error" });

    expect(error.status).toBe(0);
    expect(error.message).toBe(
      "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
    );
  });

  it("devuelve status 0 con mensaje genérico ante un error desconocido", () => {
    const error = toApiError(new Error("boom"));

    expect(error.status).toBe(0);
    expect(error.message).toBe("Ocurrió un error inesperado.");
  });
});
