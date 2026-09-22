import {
  getClientEnv,
  getServerEnv,
  readRequiredEnv,
} from "@/shared/config/env";

describe("readRequiredEnv", () => {
  it("devuelve el valor cuando está presente", () => {
    expect(readRequiredEnv("API_URL", "https://api.example.com")).toBe(
      "https://api.example.com",
    );
  });

  it("lanza cuando el valor es undefined", () => {
    expect(() => readRequiredEnv("API_URL", undefined)).toThrow(
      "Falta la variable de entorno obligatoria: API_URL",
    );
  });

  it("lanza cuando el valor es una cadena vacía", () => {
    expect(() => readRequiredEnv("API_URL", "")).toThrow(
      "Falta la variable de entorno obligatoria: API_URL",
    );
  });

  it("lanza cuando el valor solo contiene espacios", () => {
    expect(() => readRequiredEnv("API_URL", "   ")).toThrow(
      "Falta la variable de entorno obligatoria: API_URL",
    );
  });
});

describe("getClientEnv / getServerEnv", () => {
  const originalClientUrl = process.env.NEXT_PUBLIC_API_URL;
  const originalServerUrl = process.env.API_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  /** `NODE_ENV` es de solo lectura en los tipos de Node; se asigna de forma controlada. */
  function asignarNodeEnv(valor: string | undefined): void {
    (process.env as Record<string, string | undefined>).NODE_ENV = valor;
  }

  afterEach(() => {
    if (originalClientUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalClientUrl;
    }

    if (originalServerUrl === undefined) {
      delete process.env.API_URL;
    } else {
      process.env.API_URL = originalServerUrl;
    }

    asignarNodeEnv(originalNodeEnv);
  });

  it("getClientEnv lee NEXT_PUBLIC_API_URL", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://cliente.example.com";

    expect(getClientEnv()).toEqual({
      apiUrl: "https://cliente.example.com",
      isProduction: false,
    });
  });

  it("getServerEnv lee API_URL", () => {
    process.env.API_URL = "https://servidor.example.com";

    expect(getServerEnv()).toEqual({
      apiUrl: "https://servidor.example.com",
      isProduction: false,
    });
  });

  it("getClientEnv marca isProduction según NODE_ENV", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://cliente.example.com";
    asignarNodeEnv("production");

    expect(getClientEnv().isProduction).toBe(true);
  });

  it("getServerEnv marca isProduction según NODE_ENV", () => {
    process.env.API_URL = "https://servidor.example.com";
    asignarNodeEnv("production");

    expect(getServerEnv().isProduction).toBe(true);
  });

  it("isProduction es false fuera de producción", () => {
    process.env.API_URL = "https://servidor.example.com";
    asignarNodeEnv("development");

    expect(getServerEnv().isProduction).toBe(false);
  });

  it("getClientEnv lanza cuando falta NEXT_PUBLIC_API_URL", () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(() => getClientEnv()).toThrow(
      "Falta la variable de entorno obligatoria: NEXT_PUBLIC_API_URL",
    );
  });

  it("getServerEnv lanza cuando falta API_URL", () => {
    delete process.env.API_URL;

    expect(() => getServerEnv()).toThrow(
      "Falta la variable de entorno obligatoria: API_URL",
    );
  });
});
