import {
  BBOX_COLOMBIA,
  crearUrlBusqueda,
  crearUrlInversa,
  esDeColombia,
  extraerCoordenadas,
  formatearDireccion,
  mapearSugerenciasPhoton,
  parsearRespuestaInversaPhoton,
  parsearRespuestaPhoton,
} from "@/app/api/geocodificacion/_lib/photon";

/** Construye una `feature` GeoJSON de Photon para las pruebas. */
function feature(
  coordinates: unknown,
  properties: Record<string, unknown> = {},
): unknown {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties,
  };
}

describe("crearUrlBusqueda", () => {
  it("apunta al endpoint de búsqueda con q, limit y bbox", () => {
    const url = crearUrlBusqueda("Bogotá", 5);

    expect(url.host).toBe("photon.komoot.io");
    expect(url.pathname).toBe("/api/");
    expect(url.searchParams.get("q")).toBe("Bogotá");
    expect(url.searchParams.get("limit")).toBe("5");
    expect(url.searchParams.get("bbox")).toBe(BBOX_COLOMBIA);
  });

  it("no incluye el parámetro lang (Photon no soporta es)", () => {
    expect(crearUrlBusqueda("Bogotá", 5).searchParams.has("lang")).toBe(false);
  });
});

describe("crearUrlInversa", () => {
  it("apunta al endpoint inverso con lat, lon y limit", () => {
    const url = crearUrlInversa(4.7, -74.1);

    expect(url.host).toBe("photon.komoot.io");
    expect(url.pathname).toBe("/reverse");
    expect(url.searchParams.get("lat")).toBe("4.7");
    expect(url.searchParams.get("lon")).toBe("-74.1");
    expect(url.searchParams.get("limit")).toBe("1");
  });

  it("no incluye el parámetro lang (Photon no soporta es)", () => {
    expect(crearUrlInversa(4.7, -74.1).searchParams.has("lang")).toBe(false);
  });
});

describe("extraerCoordenadas", () => {
  it("lee [longitud, latitud] y devuelve latitud/longitud", () => {
    expect(extraerCoordenadas(feature([-75.881234, 8.754321]))).toEqual({
      latitud: 8.754321,
      longitud: -75.881234,
    });
  });

  it("devuelve null con una feature malformada", () => {
    expect(extraerCoordenadas(null)).toBeNull();
    expect(extraerCoordenadas({})).toBeNull();
    expect(extraerCoordenadas({ geometry: {} })).toBeNull();
    expect(extraerCoordenadas(feature([-75.88]))).toBeNull();
    expect(extraerCoordenadas(feature(["-75.88", 8.75]))).toBeNull();
    expect(extraerCoordenadas(feature([Number.NaN, 8.75]))).toBeNull();
  });

  it("devuelve null cuando las coordenadas quedan fuera de rango", () => {
    expect(extraerCoordenadas(feature([-75.88, 95]))).toBeNull();
    expect(extraerCoordenadas(feature([-200, 8.75]))).toBeNull();
  });
});

describe("formatearDireccion", () => {
  it("compone la etiqueta en el orden esperado y omite county duplicado", () => {
    expect(
      formatearDireccion({
        name: "Finca La Esperanza",
        street: "Calle 10",
        housenumber: "20-30",
        district: "El Prado",
        city: "Barranquilla",
        county: "Barranquilla",
        state: "Atlántico",
        country: "Colombia",
      }),
    ).toBe(
      "Finca La Esperanza, Calle 10 20-30, El Prado, Barranquilla, Atlántico, Colombia",
    );
  });

  it("omite las partes ausentes o vacías", () => {
    expect(formatearDireccion({ city: "Montería", state: "   " })).toBe(
      "Montería",
    );
    expect(formatearDireccion({ city: "Montería", country: "Colombia" })).toBe(
      "Montería, Colombia",
    );
  });

  it("descarta una parte igual a la anterior ya incluida", () => {
    expect(
      formatearDireccion({
        city: "Cali",
        state: "Cali",
        country: "Colombia",
      }),
    ).toBe("Cali, Colombia");
  });

  it("omite el nombre del lugar cuando coincide con la vía", () => {
    expect(
      formatearDireccion({
        name: "Calle 10",
        street: "calle 10",
        city: "Bogotá",
      }),
    ).toBe("calle 10, Bogotá");
  });

  it("devuelve cadena vacía sin partes utilizables", () => {
    expect(formatearDireccion({})).toBe("");
    expect(formatearDireccion(null)).toBe("");
  });
});

describe("esDeColombia", () => {
  it("acepta countrycode ausente o vacío", () => {
    expect(esDeColombia({})).toBe(true);
    expect(esDeColombia({ countrycode: null })).toBe(true);
    expect(esDeColombia({ countrycode: "  " })).toBe(true);
  });

  it("acepta Colombia sin distinguir mayúsculas", () => {
    expect(esDeColombia({ countrycode: "CO" })).toBe(true);
    expect(esDeColombia({ countrycode: "co" })).toBe(true);
  });

  it("rechaza otros países", () => {
    expect(esDeColombia({ countrycode: "US" })).toBe(false);
  });
});

describe("parsearRespuestaPhoton", () => {
  it("devuelve la primera coincidencia válida y de Colombia", () => {
    const respuesta = {
      type: "FeatureCollection",
      features: [
        feature([-80.2, 25.7], { countrycode: "US", city: "Miami" }),
        feature([-75.5], { countrycode: "CO" }),
        feature([200, 4], { countrycode: "CO" }),
        feature([-75.881234, 8.754321], {
          countrycode: "CO",
          city: "Montería",
          state: "Córdoba",
          country: "Colombia",
        }),
      ],
    };

    expect(parsearRespuestaPhoton(respuesta)).toEqual({
      latitud: 8.754321,
      longitud: -75.881234,
      etiqueta: "Montería, Córdoba, Colombia",
    });
  });

  it("devuelve null cuando ninguna coincidencia es válida", () => {
    expect(parsearRespuestaPhoton(null)).toBeNull();
    expect(parsearRespuestaPhoton({})).toBeNull();
    expect(
      parsearRespuestaPhoton({
        features: [feature([-75.5, 8.7], { countrycode: "US" })],
      }),
    ).toBeNull();
  });
});

describe("mapearSugerenciasPhoton", () => {
  const respuesta = {
    features: [
      feature([-74.1, 4.7], {
        countrycode: "CO",
        city: "Bogotá",
        country: "Colombia",
      }),
      feature([-80.2, 25.7], { countrycode: "US", city: "Miami" }),
      feature([-75.5], { countrycode: "CO" }),
      feature([-75.5, 8.7], {
        countrycode: "CO",
        city: "Montería",
        country: "Colombia",
      }),
      feature([-76.5, 3.4], {
        countrycode: "CO",
        city: "Cali",
        country: "Colombia",
      }),
    ],
  };

  it("mapea las válidas y omite las inválidas o de otro país", () => {
    expect(mapearSugerenciasPhoton(respuesta, 5)).toEqual([
      { latitud: 4.7, longitud: -74.1, etiqueta: "Bogotá, Colombia" },
      { latitud: 8.7, longitud: -75.5, etiqueta: "Montería, Colombia" },
      { latitud: 3.4, longitud: -76.5, etiqueta: "Cali, Colombia" },
    ]);
  });

  it("recorta el resultado al límite indicado", () => {
    expect(mapearSugerenciasPhoton(respuesta, 2)).toHaveLength(2);
    expect(mapearSugerenciasPhoton(respuesta, 0)).toEqual([]);
  });

  it("devuelve una lista vacía sin features o con cuerpo inválido", () => {
    expect(mapearSugerenciasPhoton(null, 5)).toEqual([]);
    expect(mapearSugerenciasPhoton({ features: [] }, 5)).toEqual([]);
  });
});

describe("parsearRespuestaInversaPhoton", () => {
  it("devuelve la primera feature con etiqueta formateada", () => {
    expect(
      parsearRespuestaInversaPhoton({
        features: [
          feature([-74.1, 4.7], {
            street: "Calle 10",
            housenumber: "20-30",
            city: "Bogotá",
            state: "Cundinamarca",
            country: "Colombia",
          }),
        ],
      }),
    ).toEqual({
      latitud: 4.7,
      longitud: -74.1,
      etiqueta: "Calle 10 20-30, Bogotá, Cundinamarca, Colombia",
    });
  });

  it("devuelve null sin features", () => {
    expect(parsearRespuestaInversaPhoton(null)).toBeNull();
    expect(parsearRespuestaInversaPhoton({ features: [] })).toBeNull();
  });

  it("devuelve null cuando la etiqueta formateada queda vacía", () => {
    expect(
      parsearRespuestaInversaPhoton({ features: [feature([-74.1, 4.7], {})] }),
    ).toBeNull();
  });
});
