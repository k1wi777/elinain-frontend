import { esquemaLogin, esquemaRegistro } from "@/features/auth/schemas";

describe("esquemaLogin", () => {
  it("acepta un correo y una contraseña válidos", () => {
    const resultado = esquemaLogin.safeParse({
      email: "maria@ejemplo.com",
      password: "Secreto123",
    });

    expect(resultado.success).toBe(true);
  });

  it("rechaza el correo vacío", () => {
    const resultado = esquemaLogin.safeParse({
      email: "",
      password: "Secreto123",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("Ingresa tu correo electrónico.");
    }
  });

  it("rechaza el correo con formato inválido", () => {
    const resultado = esquemaLogin.safeParse({
      email: "maria-sin-arroba",
      password: "Secreto123",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("Ingresa un correo electrónico válido.");
    }
  });

  it("rechaza la contraseña vacía", () => {
    const resultado = esquemaLogin.safeParse({
      email: "maria@ejemplo.com",
      password: "",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("Ingresa tu contraseña.");
    }
  });
});

describe("esquemaRegistro", () => {
  const datosValidos = {
    nombre: "María Quintero",
    email: "maria@ejemplo.com",
    password: "Secreto123",
  };

  it("acepta nombre, correo y contraseña válidos", () => {
    expect(esquemaRegistro.safeParse(datosValidos).success).toBe(true);
  });

  it("rechaza el nombre vacío", () => {
    const resultado = esquemaRegistro.safeParse({
      ...datosValidos,
      nombre: "   ",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("Ingresa tu nombre.");
    }
  });

  it("rechaza el correo con formato inválido", () => {
    const resultado = esquemaRegistro.safeParse({
      ...datosValidos,
      email: "maria-sin-arroba",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("Ingresa un correo electrónico válido.");
    }
  });

  it("rechaza una contraseña de 7 caracteres", () => {
    const resultado = esquemaRegistro.safeParse({
      ...datosValidos,
      password: "Secreto",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain(
        "La contraseña debe tener al menos 8 caracteres.",
      );
    }
  });

  it("acepta una contraseña de 8 caracteres", () => {
    const resultado = esquemaRegistro.safeParse({
      ...datosValidos,
      password: "Secreto1",
    });

    expect(resultado.success).toBe(true);
  });

  it("rechaza la contraseña vacía", () => {
    const resultado = esquemaRegistro.safeParse({
      ...datosValidos,
      password: "",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((issue) => issue.message);
      expect(mensajes).toContain("Ingresa tu contraseña.");
    }
  });
});
