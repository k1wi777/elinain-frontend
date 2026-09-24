import {
  decidirNavegacionSesion,
  MARGEN_RENOVACION_MS,
} from "@/shared/api/session-navegacion";

/** Construye un JWT sintético con el payload indicado (sin firma real). */
function crearToken(payload: Record<string, unknown>): string {
  const cabecera = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const cuerpo = btoa(JSON.stringify(payload));
  return `${cabecera}.${cuerpo}.firma`;
}

const AHORA_MS = 1_700_000_000_000;
const AHORA_SEGUNDOS = AHORA_MS / 1000;

describe("decidirNavegacionSesion", () => {
  it("continúa cuando al acceso le quedan más de 60 s", () => {
    const token = crearToken({ exp: AHORA_SEGUNDOS + 61 });

    expect(decidirNavegacionSesion(token, true, AHORA_MS)).toBe("continuar");
    expect(decidirNavegacionSesion(token, false, AHORA_MS)).toBe("continuar");
  });

  it("renueva cuando al acceso le quedan 60 s o menos", () => {
    expect(
      decidirNavegacionSesion(
        crearToken({ exp: AHORA_SEGUNDOS + 60 }),
        true,
        AHORA_MS,
      ),
    ).toBe("renovar");
    expect(
      decidirNavegacionSesion(
        crearToken({ exp: AHORA_SEGUNDOS + 30 }),
        true,
        AHORA_MS,
      ),
    ).toBe("renovar");
  });

  it("renueva cuando el acceso está vencido", () => {
    const token = crearToken({ exp: AHORA_SEGUNDOS - 1 });

    expect(decidirNavegacionSesion(token, true, AHORA_MS)).toBe("renovar");
  });

  it("renueva cuando el acceso está ausente y hay refresco", () => {
    expect(decidirNavegacionSesion(undefined, true, AHORA_MS)).toBe("renovar");
    expect(decidirNavegacionSesion("", true, AHORA_MS)).toBe("renovar");
    expect(decidirNavegacionSesion("   ", true, AHORA_MS)).toBe("renovar");
  });

  it("renueva cuando el acceso está malformado y hay refresco", () => {
    expect(decidirNavegacionSesion("no-es-un-jwt", true, AHORA_MS)).toBe(
      "renovar",
    );
    expect(
      decidirNavegacionSesion("cabecera.no-es-base64-valido", true, AHORA_MS),
    ).toBe("renovar");
  });

  it("redirige a login cuando el acceso no sirve y no hay refresco", () => {
    expect(decidirNavegacionSesion(undefined, false, AHORA_MS)).toBe(
      "redirigir-login",
    );
    expect(decidirNavegacionSesion("no-es-un-jwt", false, AHORA_MS)).toBe(
      "redirigir-login",
    );
    expect(
      decidirNavegacionSesion(
        crearToken({ exp: AHORA_SEGUNDOS - 1 }),
        false,
        AHORA_MS,
      ),
    ).toBe("redirigir-login");
  });

  it("continúa cuando el JWT no declara exp legible", () => {
    const token = crearToken({ sub: "usuario-1" });

    expect(decidirNavegacionSesion(token, false, AHORA_MS)).toBe("continuar");
  });

  it("permite configurar el margen", () => {
    const token = crearToken({ exp: AHORA_SEGUNDOS + 10 });

    expect(decidirNavegacionSesion(token, true, AHORA_MS, 5_000)).toBe(
      "continuar",
    );
    expect(decidirNavegacionSesion(token, true, AHORA_MS, 15_000)).toBe(
      "renovar",
    );
  });

  it("usa un margen por defecto de 60 s", () => {
    expect(MARGEN_RENOVACION_MS).toBe(60_000);
    expect(
      decidirNavegacionSesion(
        crearToken({ exp: AHORA_SEGUNDOS + 61 }),
        true,
        AHORA_MS,
      ),
    ).toBe("continuar");
  });
});
