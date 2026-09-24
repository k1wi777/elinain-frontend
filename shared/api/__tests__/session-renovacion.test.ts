import { ApiError } from "@/shared/api/errors";
import {
  crearRenovadorConFetch,
  esSesionInvalida,
} from "@/shared/api/session-renovacion";

/** Construye una respuesta `fetch` sintética. */
function respuestaFalsa(status: number, cuerpo: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(cuerpo),
  } as unknown as Response;
}

describe("esSesionInvalida", () => {
  it("considera 400 y 401 rechazos definitivos", () => {
    expect(esSesionInvalida(400)).toBe(true);
    expect(esSesionInvalida(401)).toBe(true);
  });

  it("no considera definitivos los fallos transitorios ni los estados ajenos", () => {
    expect(esSesionInvalida(0)).toBe(false);
    expect(esSesionInvalida(500)).toBe(false);
    expect(esSesionInvalida(403)).toBe(false);
  });
});

describe("crearRenovadorConFetch", () => {
  it("renueva y devuelve los tokens del sobre `{ exito, datos }`", async () => {
    const fetchFalso = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue(
        respuestaFalsa(200, {
          exito: true,
          datos: {
            tokenAcceso: "nuevo-acceso",
            tokenRefresco: "nuevo-refresco",
            usuario: { id: "usuario-1" },
          },
        }),
      );
    const renovar = crearRenovadorConFetch(
      () => "https://api.test/api/v1",
      fetchFalso,
    );

    await expect(renovar("token-viejo")).resolves.toEqual({
      tokenAcceso: "nuevo-acceso",
      tokenRefresco: "nuevo-refresco",
    });

    expect(fetchFalso).toHaveBeenCalledTimes(1);
    const [url, opciones] = fetchFalso.mock.calls[0];
    expect(url).toBe("https://api.test/api/v1/usuarios/refresh");
    expect(opciones?.method).toBe("POST");
    expect(JSON.parse(String(opciones?.body))).toEqual({
      tokenRefresco: "token-viejo",
    });
  });

  it("lanza un ApiError definitivo ante un 400", async () => {
    const fetchFalso = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue(
        respuestaFalsa(400, { mensaje: "Token de refresco obligatorio" }),
      );
    const renovar = crearRenovadorConFetch(
      () => "https://api.test",
      fetchFalso,
    );

    const error = await renovar("token-viejo").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect(esSesionInvalida((error as ApiError).status)).toBe(true);
  });

  it("lanza un ApiError definitivo ante un 401", async () => {
    const fetchFalso = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue(respuestaFalsa(401, {}));
    const renovar = crearRenovadorConFetch(
      () => "https://api.test",
      fetchFalso,
    );

    const error = await renovar("token-viejo").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect(esSesionInvalida((error as ApiError).status)).toBe(true);
  });

  it("trata un fallo de red como transitorio (status 0)", async () => {
    const fetchFalso = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockRejectedValue(new Error("Network Error"));
    const renovar = crearRenovadorConFetch(
      () => "https://api.test",
      fetchFalso,
    );

    const error = await renovar("token-viejo").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
    expect(esSesionInvalida((error as ApiError).status)).toBe(false);
  });

  it("trata un 5xx como transitorio", async () => {
    const fetchFalso = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue(
        respuestaFalsa(503, { mensaje: "Servicio no disponible" }),
      );
    const renovar = crearRenovadorConFetch(
      () => "https://api.test",
      fetchFalso,
    );

    const error = await renovar("token-viejo").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(503);
    expect(esSesionInvalida((error as ApiError).status)).toBe(false);
  });

  it("trata un 200 malformado como transitorio (500)", async () => {
    const fetchFalso = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue(respuestaFalsa(200, { exito: true, datos: {} }));
    const renovar = crearRenovadorConFetch(
      () => "https://api.test",
      fetchFalso,
    );

    const error = await renovar("token-viejo").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect(esSesionInvalida((error as ApiError).status)).toBe(false);
  });

  it("resuelve la base URL de forma diferida en cada llamada", async () => {
    let contador = 0;
    const fetchFalso = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockImplementation(() =>
        Promise.resolve(
          respuestaFalsa(200, {
            exito: true,
            datos: { tokenAcceso: "a", tokenRefresco: "b" },
          }),
        ),
      );
    const renovar = crearRenovadorConFetch(
      () => `https://api.test/v${++contador}`,
      fetchFalso,
    );

    await renovar("token-1");
    await renovar("token-2");

    expect(fetchFalso.mock.calls[0][0]).toBe(
      "https://api.test/v1/usuarios/refresh",
    );
    expect(fetchFalso.mock.calls[1][0]).toBe(
      "https://api.test/v2/usuarios/refresh",
    );
  });
});
