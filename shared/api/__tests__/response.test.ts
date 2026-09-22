import { desenvolverRespuesta } from "@/shared/api/response";

describe("desenvolverRespuesta", () => {
  it("devuelve el objeto interno cuando el sobre trae un objeto en datos", () => {
    const payload = { elementos: [], total: 0, limite: 10, offset: 0 };

    expect(desenvolverRespuesta({ exito: true, datos: payload })).toBe(payload);
  });

  it("devuelve el primitivo interno cuando datos es un string", () => {
    expect(desenvolverRespuesta({ exito: true, datos: "ok" })).toBe("ok");
  });

  it("devuelve el primitivo interno cuando datos es un número", () => {
    expect(desenvolverRespuesta({ exito: true, datos: 42 })).toBe(42);
  });

  it("devuelve el array interno cuando datos es un array", () => {
    const elementos = [{ id: 1 }, { id: 2 }];

    expect(desenvolverRespuesta({ exito: true, datos: elementos })).toBe(
      elementos,
    );
  });

  it("devuelve null cuando datos es null", () => {
    expect(desenvolverRespuesta({ exito: true, datos: null })).toBeNull();
  });

  it("devuelve tal cual un objeto sin sobre", () => {
    const cuerpo = { elementos: [], total: 0, limite: 10, offset: 0 };

    expect(desenvolverRespuesta(cuerpo)).toBe(cuerpo);
  });

  it("devuelve tal cual un cuerpo propio del BFF con mensaje", () => {
    const cuerpo = { mensaje: "Operación realizada" };

    expect(desenvolverRespuesta(cuerpo)).toBe(cuerpo);
  });

  it("devuelve tal cual un cuerpo de error con exito false", () => {
    const cuerpo = { exito: false, mensaje: "Error de validación" };

    expect(desenvolverRespuesta(cuerpo)).toBe(cuerpo);
  });

  it("no desenvuelve cuando exito no es un booleano estricto", () => {
    const cuerpo = { exito: "true", datos: { id: 1 } };

    expect(desenvolverRespuesta(cuerpo)).toBe(cuerpo);
  });

  it("no desenvuelve cuando el sobre no tiene propiedad datos", () => {
    const cuerpo = { exito: true };

    expect(desenvolverRespuesta(cuerpo)).toBe(cuerpo);
  });

  it("devuelve tal cual null y undefined", () => {
    expect(desenvolverRespuesta(null)).toBeNull();
    expect(desenvolverRespuesta(undefined)).toBeUndefined();
  });

  it("devuelve tal cual un array sin sobre", () => {
    const cuerpo = [{ id: 1 }];

    expect(desenvolverRespuesta(cuerpo)).toBe(cuerpo);
  });

  it("devuelve tal cual un string vacío (cuerpo de 204)", () => {
    expect(desenvolverRespuesta("")).toBe("");
  });
});
