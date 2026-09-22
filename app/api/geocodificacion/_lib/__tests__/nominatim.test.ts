import { parsearRespuestaNominatim } from "@/app/api/geocodificacion/_lib/nominatim";

describe("parsearRespuestaNominatim", () => {
  it("devuelve la primera coincidencia con coordenadas numéricas", () => {
    const resultado = parsearRespuestaNominatim([
      {
        lat: "8.754321",
        lon: "-75.881234",
        display_name: "Montería, Córdoba, Colombia",
      },
      {
        lat: "9.000000",
        lon: "-76.000000",
        display_name: "Otra coincidencia",
      },
    ]);

    expect(resultado).toEqual({
      latitud: 8.754321,
      longitud: -75.881234,
      etiqueta: "Montería, Córdoba, Colombia",
    });
  });

  it("acepta coordenadas ya numéricas", () => {
    const resultado = parsearRespuestaNominatim([
      { lat: -34.6, lon: -58.4, display_name: "Buenos Aires" },
    ]);

    expect(resultado).toEqual({
      latitud: -34.6,
      longitud: -58.4,
      etiqueta: "Buenos Aires",
    });
  });

  it("devuelve null cuando la respuesta está vacía", () => {
    expect(parsearRespuestaNominatim([])).toBeNull();
  });

  it("devuelve null cuando la respuesta no es un array", () => {
    expect(parsearRespuestaNominatim(null)).toBeNull();
    expect(parsearRespuestaNominatim({ lat: "1", lon: "2" })).toBeNull();
  });

  it("devuelve null cuando falta lat o lon", () => {
    expect(
      parsearRespuestaNominatim([{ lat: "8.75", display_name: "Sin lon" }]),
    ).toBeNull();
    expect(
      parsearRespuestaNominatim([{ lon: "-75.88", display_name: "Sin lat" }]),
    ).toBeNull();
  });

  it("devuelve null cuando lat o lon no son numéricos", () => {
    expect(
      parsearRespuestaNominatim([
        { lat: "no-es-numero", lon: "-75.88", display_name: "Invalida" },
      ]),
    ).toBeNull();
    expect(
      parsearRespuestaNominatim([
        { lat: "", lon: "-75.88", display_name: "Vacía" },
      ]),
    ).toBeNull();
  });

  it("devuelve null cuando las coordenadas quedan fuera de rango", () => {
    expect(
      parsearRespuestaNominatim([
        { lat: "95", lon: "-75.88", display_name: "Latitud fuera de rango" },
      ]),
    ).toBeNull();
    expect(
      parsearRespuestaNominatim([
        { lat: "8.75", lon: "-200", display_name: "Longitud fuera de rango" },
      ]),
    ).toBeNull();
  });

  it("usa una etiqueta vacía cuando falta display_name", () => {
    expect(parsearRespuestaNominatim([{ lat: "8.75", lon: "-75.88" }])).toEqual(
      { latitud: 8.75, longitud: -75.88, etiqueta: "" },
    );
  });
});
