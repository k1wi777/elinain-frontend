import { cn } from "@/shared/lib/cn";

describe("cn", () => {
  it("compone varias clases en una sola cadena", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("ignora valores falsy al componer clases condicionales", () => {
    const esActivo = false;

    expect(cn("base", esActivo && "activo", undefined, null)).toBe("base");
  });

  it("resuelve conflictos de Tailwind conservando la última utilidad", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("resuelve conflictos entre clases recibidas por parámetro", () => {
    expect(cn("text-sm text-gray-500", "text-lg")).toBe(
      "text-gray-500 text-lg",
    );
  });

  it("comprende objetos condicionales y arrays anidados", () => {
    expect(cn(["p-2", { "font-bold": true, hidden: false }])).toBe(
      "p-2 font-bold",
    );
  });
});
