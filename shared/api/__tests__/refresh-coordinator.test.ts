import {
  crearCoordinadorRefresco,
  RETENCION_REFRESCO_MS,
} from "@/shared/api/refresh-coordinator";

/** Promesa controlable manualmente desde el test. */
function crearDiferida<T>() {
  let resolver: (valor: T) => void = () => undefined;
  let rechazar: (error: unknown) => void = () => undefined;
  const promesa = new Promise<T>((res, rej) => {
    resolver = res;
    rechazar = rej;
  });

  return { promesa, resolver, rechazar };
}

afterEach(() => {
  jest.useRealTimers();
});

describe("crearCoordinadorRefresco", () => {
  it("comparte una única renovación entre llamadas concurrentes del mismo token", async () => {
    const diferida = crearDiferida<string>();
    const renovar = jest.fn(() => diferida.promesa);
    const coordinar = crearCoordinadorRefresco(renovar);

    const primera = coordinar("token-concurrente");
    const segunda = coordinar("token-concurrente");

    expect(renovar).toHaveBeenCalledTimes(1);

    diferida.resolver("renovado");

    await expect(primera).resolves.toBe("renovado");
    await expect(segunda).resolves.toBe("renovado");
    expect(renovar).toHaveBeenCalledTimes(1);
  });

  it("no comparte la renovación entre tokens distintos", async () => {
    const renovar = jest.fn((token: string) => Promise.resolve(token));
    const coordinar = crearCoordinadorRefresco(renovar);

    await expect(coordinar("token-distinto-a")).resolves.toBe(
      "token-distinto-a",
    );
    await expect(coordinar("token-distinto-b")).resolves.toBe(
      "token-distinto-b",
    );
    expect(renovar).toHaveBeenCalledTimes(2);
  });

  it("libera la entrada ante un rechazo y permite reintentar", async () => {
    const renovar = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new Error("fallo de red"))
      .mockResolvedValueOnce("renovado");
    const coordinar = crearCoordinadorRefresco(renovar);

    await expect(coordinar("token-fallo")).rejects.toThrow("fallo de red");
    await expect(coordinar("token-fallo")).resolves.toBe("renovado");
    expect(renovar).toHaveBeenCalledTimes(2);
  });

  it("propaga el rechazo a todas las llamadas concurrentes", async () => {
    const diferida = crearDiferida<string>();
    const renovar = jest.fn(() => diferida.promesa);
    const coordinar = crearCoordinadorRefresco(renovar);

    const primera = coordinar("token-rechazo-compartido");
    const segunda = coordinar("token-rechazo-compartido");

    diferida.rechazar(new Error("rechazado"));

    await expect(primera).rejects.toThrow("rechazado");
    await expect(segunda).rejects.toThrow("rechazado");
    expect(renovar).toHaveBeenCalledTimes(1);
  });

  it("reutiliza el éxito durante la retención y lo descarta al expirar", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const renovar = jest.fn((token: string) => Promise.resolve(token));
    const coordinar = crearCoordinadorRefresco(renovar, { retencionMs: 1_000 });

    await expect(coordinar("token-retencion")).resolves.toBe("token-retencion");
    await expect(coordinar("token-retencion")).resolves.toBe("token-retencion");
    expect(renovar).toHaveBeenCalledTimes(1);

    jest.setSystemTime(Date.now() + 1_001);
    await expect(coordinar("token-retencion")).resolves.toBe("token-retencion");
    expect(renovar).toHaveBeenCalledTimes(2);
  });

  it("usa un margen de retención por defecto de 15 s", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const renovar = jest.fn((token: string) => Promise.resolve(token));
    const coordinar = crearCoordinadorRefresco(renovar);

    await coordinar("token-retencion-defecto");
    jest.setSystemTime(Date.now() + RETENCION_REFRESCO_MS - 1);
    await coordinar("token-retencion-defecto");
    expect(renovar).toHaveBeenCalledTimes(1);

    jest.setSystemTime(Date.now() + 1);
    await coordinar("token-retencion-defecto");
    expect(renovar).toHaveBeenCalledTimes(2);
  });
});
