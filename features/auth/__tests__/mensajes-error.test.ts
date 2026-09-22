import {
  mensajeErrorAcceso,
  mensajeErrorRegistro,
} from "@/features/auth/mensajes-error";

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

describe("mensajeErrorAcceso", () => {
  it("mapea 401 a credenciales incorrectas", () => {
    expect(mensajeErrorAcceso(401)).toBe("Correo o contraseña incorrectos.");
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorAcceso(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorAcceso(500)).toBe(
      "No se pudo iniciar sesión. Inténtalo de nuevo.",
    );
    expect(mensajeErrorAcceso(400)).toBe(
      "No se pudo iniciar sesión. Inténtalo de nuevo.",
    );
  });
});

describe("mensajeErrorRegistro", () => {
  it("mapea 409 a correo ya registrado", () => {
    expect(mensajeErrorRegistro(409)).toBe("Este correo ya está registrado.");
  });

  it("mapea 400 a datos inválidos", () => {
    expect(mensajeErrorRegistro(400)).toBe(
      "Revisa los datos del formulario e inténtalo de nuevo.",
    );
  });

  it("mapea 0 a un error de conexión", () => {
    expect(mensajeErrorRegistro(0)).toBe(MENSAJE_CONEXION);
  });

  it("usa un mensaje genérico para el resto de estados", () => {
    expect(mensajeErrorRegistro(500)).toBe(
      "No se pudo completar el registro. Inténtalo de nuevo.",
    );
  });
});
