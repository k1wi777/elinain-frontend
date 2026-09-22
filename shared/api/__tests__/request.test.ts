import {
  buildAuthHeader,
  buildDefaultHeaders,
  buildUrl,
} from "@/shared/api/request";

describe("buildDefaultHeaders", () => {
  it("devuelve Content-Type y Accept en JSON", () => {
    expect(buildDefaultHeaders()).toEqual({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
  });
});

describe("buildAuthHeader", () => {
  it("construye la cabecera Bearer con el token recibido", () => {
    expect(buildAuthHeader("abc.def.ghi")).toEqual({
      Authorization: "Bearer abc.def.ghi",
    });
  });
});

describe("buildUrl", () => {
  it("une la base y la ruta con una única barra", () => {
    expect(buildUrl("https://api.example.com/api/v1", "/terceros")).toBe(
      "https://api.example.com/api/v1/terceros",
    );
  });

  it("normaliza las barras sobrantes en base y ruta", () => {
    expect(buildUrl("https://api.example.com/api/v1/", "//terceros/")).toBe(
      "https://api.example.com/api/v1/terceros/",
    );
  });

  it("añade la barra cuando la ruta relativa no la incluye", () => {
    expect(buildUrl("https://api.example.com/api/v1", "terceros")).toBe(
      "https://api.example.com/api/v1/terceros",
    );
  });

  it("deja pasar las URLs absolutas con esquema", () => {
    expect(
      buildUrl("https://api.example.com/api/v1", "https://otro.example.com/x"),
    ).toBe("https://otro.example.com/x");
  });

  it("devuelve la base cuando la ruta está vacía", () => {
    expect(buildUrl("https://api.example.com/api/v1", "")).toBe(
      "https://api.example.com/api/v1",
    );
  });
});
