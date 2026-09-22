import { obtenerExpiracionJwt, sesionVigente } from "@/shared/api/session";

/** Construye un JWT sintético con el payload indicado (sin firma real). */
function crearToken(payload: Record<string, unknown>): string {
  const cabecera = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const cuerpo = btoa(JSON.stringify(payload));
  return `${cabecera}.${cuerpo}.firma`;
}

const AHORA_MS = 1_700_000_000_000;
const AHORA_SEGUNDOS = AHORA_MS / 1000;

describe("obtenerExpiracionJwt", () => {
  it("devuelve el exp del payload", () => {
    const token = crearToken({ exp: AHORA_SEGUNDOS + 60 });

    expect(obtenerExpiracionJwt(token)).toBe(AHORA_SEGUNDOS + 60);
  });

  it("devuelve undefined cuando el payload no declara exp", () => {
    const token = crearToken({ sub: "usuario-1" });

    expect(obtenerExpiracionJwt(token)).toBeUndefined();
  });

  it("devuelve undefined cuando el token está malformado", () => {
    expect(obtenerExpiracionJwt("no-es-un-jwt")).toBeUndefined();
    expect(
      obtenerExpiracionJwt("cabecera.no-es-base64-valido"),
    ).toBeUndefined();
  });

  it("devuelve undefined cuando exp no es un número", () => {
    const token = crearToken({ exp: "1700000000" });

    expect(obtenerExpiracionJwt(token)).toBeUndefined();
  });
});

describe("sesionVigente", () => {
  it("devuelve false cuando no hay token", () => {
    expect(sesionVigente(undefined, AHORA_MS)).toBe(false);
  });

  it("devuelve false cuando el token está en blanco", () => {
    expect(sesionVigente("", AHORA_MS)).toBe(false);
    expect(sesionVigente("   ", AHORA_MS)).toBe(false);
  });

  it("devuelve false cuando el token está malformado", () => {
    expect(sesionVigente("no-es-un-jwt", AHORA_MS)).toBe(false);
    expect(sesionVigente("cabecera.no-es-base64-valido", AHORA_MS)).toBe(false);
  });

  it("devuelve true cuando el payload no declara exp", () => {
    const token = crearToken({ sub: "usuario-1" });

    expect(sesionVigente(token, AHORA_MS)).toBe(true);
  });

  it("devuelve true cuando el token sigue vigente", () => {
    const token = crearToken({ exp: AHORA_SEGUNDOS + 60 });

    expect(sesionVigente(token, AHORA_MS)).toBe(true);
  });

  it("devuelve false cuando el token ha vencido", () => {
    const token = crearToken({ exp: AHORA_SEGUNDOS - 1 });

    expect(sesionVigente(token, AHORA_MS)).toBe(false);
  });

  it("usa Date.now() como referencia por defecto", () => {
    const token = crearToken({ exp: Math.floor(Date.now() / 1000) + 60 });

    expect(sesionVigente(token)).toBe(true);
  });
});
