import { ApiError } from "@/shared/api/errors";
import type { HttpClient } from "@/shared/api/http-client";
import { crearClienteConRefresco } from "@/shared/api/session-refresh";

const RUTAS_SIN_REFRESCO = [
  "/usuarios/acceso",
  "/usuarios/registro",
  "/usuarios/refresh",
  "/usuarios/logout",
] as const;

/** Cliente HTTP falso con métodos espiados. */
function crearClienteEspia() {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

function crearConRefresco(
  cliente: ReturnType<typeof crearClienteEspia>,
  renovarSesion: () => Promise<void>,
): HttpClient {
  return crearClienteConRefresco(
    cliente as unknown as HttpClient,
    renovarSesion,
    RUTAS_SIN_REFRESCO,
  );
}

describe("crearClienteConRefresco", () => {
  it("ante un 401 renueva y reintenta una única vez", async () => {
    const cliente = crearClienteEspia();
    cliente.get
      .mockRejectedValueOnce(new ApiError(401, "expirado"))
      .mockResolvedValueOnce({ id: "recurso" });
    const renovarSesion = jest
      .fn<Promise<void>, []>()
      .mockResolvedValue(undefined);

    const conRefresco = crearConRefresco(cliente, renovarSesion);

    await expect(conRefresco.get("/terceros")).resolves.toEqual({
      id: "recurso",
    });
    expect(renovarSesion).toHaveBeenCalledTimes(1);
    expect(cliente.get).toHaveBeenCalledTimes(2);
  });

  it("relanza el 401 original cuando la renovación es rechazada de forma definitiva", async () => {
    const cliente = crearClienteEspia();
    const original = new ApiError(401, "expirado");
    cliente.get.mockRejectedValueOnce(original);
    const renovarSesion = jest
      .fn()
      .mockRejectedValue(new ApiError(401, "refresco revocado"));

    const conRefresco = crearConRefresco(cliente, renovarSesion);
    const error = await conRefresco.get("/terceros").catch((e: unknown) => e);

    expect(error).toBe(original);
    expect(cliente.get).toHaveBeenCalledTimes(1);
  });

  it("relanza el error transitorio cuando la renovación cae por red o 5xx", async () => {
    const cliente = crearClienteEspia();
    cliente.get.mockRejectedValueOnce(new ApiError(401, "expirado"));
    const transitorio = new ApiError(503, "servicio no disponible");
    const renovarSesion = jest.fn().mockRejectedValue(transitorio);

    const conRefresco = crearConRefresco(cliente, renovarSesion);
    const error = await conRefresco.get("/terceros").catch((e: unknown) => e);

    expect(error).toBe(transitorio);
    expect(cliente.get).toHaveBeenCalledTimes(1);
  });

  it("no renueva en las rutas excluidas", async () => {
    const cliente = crearClienteEspia();
    cliente.post.mockRejectedValueOnce(new ApiError(401, "expirado"));
    const renovarSesion = jest.fn();

    const conRefresco = crearConRefresco(cliente, renovarSesion);
    const error = await conRefresco
      .post("/usuarios/acceso", {})
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect(renovarSesion).not.toHaveBeenCalled();
    expect(cliente.post).toHaveBeenCalledTimes(1);
  });

  it("reintenta solo una vez aunque el reintento vuelva a fallar con 401", async () => {
    const cliente = crearClienteEspia();
    cliente.get
      .mockRejectedValueOnce(new ApiError(401, "expirado"))
      .mockRejectedValueOnce(new ApiError(401, "sigue expirado"));
    const renovarSesion = jest
      .fn<Promise<void>, []>()
      .mockResolvedValue(undefined);

    const conRefresco = crearConRefresco(cliente, renovarSesion);
    const error = await conRefresco.get("/terceros").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect(renovarSesion).toHaveBeenCalledTimes(1);
    expect(cliente.get).toHaveBeenCalledTimes(2);
  });

  it("propaga sin cambios los errores que no son 401", async () => {
    const cliente = crearClienteEspia();
    const original = new ApiError(500, "error interno");
    cliente.get.mockRejectedValueOnce(original);
    const renovarSesion = jest.fn();

    const conRefresco = crearConRefresco(cliente, renovarSesion);
    const error = await conRefresco.get("/terceros").catch((e: unknown) => e);

    expect(error).toBe(original);
    expect(renovarSesion).not.toHaveBeenCalled();
  });

  it("propaga los errores que no son ApiError sin intentar renovar", async () => {
    const cliente = crearClienteEspia();
    const original = new Error("boom");
    cliente.get.mockRejectedValueOnce(original);
    const renovarSesion = jest.fn();

    const conRefresco = crearConRefresco(cliente, renovarSesion);
    const error = await conRefresco.get("/terceros").catch((e: unknown) => e);

    expect(error).toBe(original);
    expect(renovarSesion).not.toHaveBeenCalled();
  });
});
