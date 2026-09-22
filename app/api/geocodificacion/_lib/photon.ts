import type { ResultadoGeocodificacion } from "@/features/fincas/types";

/**
 * Cliente interno del BFF para Photon (OpenStreetMap).
 *
 * Solo se ejecuta en el servidor: el navegador nunca llama a Photon. La política de uso
 * exige identificar la aplicación con un `User-Agent` propio, limitar la cadencia y no
 * repetir consultas idénticas, por lo que aquí se aplican las tres reglas. Las funciones
 * puras de parseo y formato se prueban con Jest; las de red quedan fuera de la suite.
 */

/** Endpoint base de Photon. */
const URL_PHOTON = "https://photon.komoot.io";

/** Identificación de la aplicación ante Photon. */
const USER_AGENT = "Elinain/1.0 (plataforma de gestión ganadera)";

/** Cadencia mínima entre peticiones a Photon, en milisegundos (~1 req/s). */
const CADENCIA_MINIMA_MS = 1000;

/** Máximo de consultas recordadas en la caché en memoria. */
const MAX_ENTRADAS_CACHE = 100;

/** Código ISO de Colombia usado para descartar coincidencias de otros países. */
const CODIGO_PAIS_COLOMBIA = "CO";

/** Número máximo de sugerencias devueltas al autocompletado. */
export const LIMITE_SUGERENCIAS = 5;

/** Caja envolvente de Colombia en el orden `minLon,minLat,maxLon,maxLat` que espera Photon. */
export const BBOX_COLOMBIA = "-79.0,-4.2,-66.8,12.6";

/** Mínimo de caracteres para pedir sugerencias. */
export const MIN_CARACTERES_CONSULTA = 3;

/** Caché en memoria de resultados indexada por clave normalizada. */
const cache = new Map<string, unknown>();

/** Marca temporal de la última petición efectiva a Photon. */
let ultimaPeticionMs = 0;

/** Cola que serializa las peticiones para respetar la cadencia. */
let colaCadencia: Promise<void> = Promise.resolve();

/**
 * Normaliza un texto para usarlo como clave de caché.
 */
function normalizarConsulta(consulta: string): string {
  return consulta.trim().toLowerCase();
}

/**
 * Convierte un valor desconocido en un texto recortado.
 *
 * Devuelve cadena vacía para cualquier valor que no sea un string.
 */
function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/**
 * Lee la propiedad `properties` de una `feature` de Photon, si existe.
 */
function propiedadesDe(feature: unknown): unknown {
  if (typeof feature !== "object" || feature === null) {
    return undefined;
  }

  return (feature as Record<string, unknown>).properties;
}

/**
 * Devuelve el array `features` de una respuesta GeoJSON de Photon.
 *
 * Cualquier cuerpo que no sea un objeto con `features` de tipo array se trata como una
 * respuesta sin coincidencias.
 */
function obtenerFeatures(datos: unknown): unknown[] {
  if (typeof datos !== "object" || datos === null) {
    return [];
  }

  const features = (datos as Record<string, unknown>).features;

  return Array.isArray(features) ? features : [];
}

/**
 * Extrae las coordenadas de una `feature` de Photon.
 *
 * Photon entrega `geometry.coordinates = [longitud, latitud]`. La función exige ambos
 * valores numéricos finitos y dentro de rango, y los devuelve en el orden
 * `{ latitud, longitud }`. Es pura y sin red.
 *
 * @param feature Elemento crudo de `features`.
 */
export function extraerCoordenadas(
  feature: unknown,
): { latitud: number; longitud: number } | null {
  if (typeof feature !== "object" || feature === null) {
    return null;
  }

  const geometry = (feature as Record<string, unknown>).geometry;

  if (typeof geometry !== "object" || geometry === null) {
    return null;
  }

  const coordenadas = (geometry as Record<string, unknown>).coordinates;

  if (!Array.isArray(coordenadas) || coordenadas.length < 2) {
    return null;
  }

  const longitud: unknown = coordenadas[0];
  const latitud: unknown = coordenadas[1];

  if (
    typeof latitud !== "number" ||
    !Number.isFinite(latitud) ||
    latitud < -90 ||
    latitud > 90
  ) {
    return null;
  }

  if (
    typeof longitud !== "number" ||
    !Number.isFinite(longitud) ||
    longitud < -180 ||
    longitud > 180
  ) {
    return null;
  }

  return { latitud, longitud };
}

/**
 * Construye una etiqueta de dirección legible a partir de `properties`.
 *
 * Orden: nombre del lugar (`name`, salvo que duplique la vía) → vía (`street` +
 * `housenumber`) → `district` → `city` → `county` (solo si difiere de `city`) → `state` →
 * `country`. Omite las partes vacías, descarta una parte igual (sin distinguir mayúsculas)
 * a la anterior ya incluida y une con `", "`. Sin partes devuelve `""`. Es pura.
 *
 * @param propiedades Objeto `properties` de una `feature` de Photon.
 */
export function formatearDireccion(propiedades: unknown): string {
  if (typeof propiedades !== "object" || propiedades === null) {
    return "";
  }

  const datos = propiedades as Record<string, unknown>;

  const nombre = texto(datos.name);
  const calle = texto(datos.street);
  const numero = texto(datos.housenumber);
  const distrito = texto(datos.district);
  const ciudad = texto(datos.city);
  const condado = texto(datos.county);
  const departamento = texto(datos.state);
  const pais = texto(datos.country);

  const via = [calle, numero].filter((parte) => parte !== "").join(" ");

  const candidatas: string[] = [];

  if (nombre !== "" && nombre.toLowerCase() !== calle.toLowerCase()) {
    candidatas.push(nombre);
  }

  if (via !== "") {
    candidatas.push(via);
  }

  if (distrito !== "") {
    candidatas.push(distrito);
  }

  if (ciudad !== "") {
    candidatas.push(ciudad);
  }

  if (condado !== "" && condado.toLowerCase() !== ciudad.toLowerCase()) {
    candidatas.push(condado);
  }

  if (departamento !== "") {
    candidatas.push(departamento);
  }

  if (pais !== "") {
    candidatas.push(pais);
  }

  const partes: string[] = [];

  for (const candidata of candidatas) {
    const anterior = partes[partes.length - 1];

    if (
      anterior !== undefined &&
      anterior.toLowerCase() === candidata.toLowerCase()
    ) {
      continue;
    }

    partes.push(candidata);
  }

  return partes.join(", ");
}

/**
 * Indica si una coincidencia corresponde a Colombia.
 *
 * Se considera de Colombia cuando `countrycode` falta o es `"CO"`, de modo que no se
 * descartan ubicaciones válidas sin país declarado. Es pura.
 *
 * @param propiedades Objeto `properties` de una `feature` de Photon.
 */
export function esDeColombia(propiedades: unknown): boolean {
  if (typeof propiedades !== "object" || propiedades === null) {
    return true;
  }

  const codigo = (propiedades as Record<string, unknown>).countrycode;

  if (typeof codigo !== "string" || codigo.trim() === "") {
    return true;
  }

  return codigo.trim().toUpperCase() === CODIGO_PAIS_COLOMBIA;
}

/**
 * Interpreta la respuesta de una búsqueda y devuelve la primera coincidencia válida.
 *
 * Se salta las `features` sin coordenadas válidas y las de país distinto de Colombia.
 * Devuelve `null` cuando no hay ninguna coincidencia utilizable. Es pura.
 *
 * @param datos Cuerpo de la respuesta de Photon, aún sin interpretar.
 */
export function parsearRespuestaPhoton(
  datos: unknown,
): ResultadoGeocodificacion | null {
  for (const feature of obtenerFeatures(datos)) {
    const coordenadas = extraerCoordenadas(feature);

    if (coordenadas === null) {
      continue;
    }

    const propiedades = propiedadesDe(feature);

    if (!esDeColombia(propiedades)) {
      continue;
    }

    return { ...coordenadas, etiqueta: formatearDireccion(propiedades) };
  }

  return null;
}

/**
 * Mapea la respuesta de sugerencias a resultados utilizables.
 *
 * Omite las `features` sin coordenadas válidas y las de país distinto de Colombia, y
 * recorta el resultado a `limite` elementos. Es pura.
 *
 * @param datos Cuerpo de la respuesta de Photon, aún sin interpretar.
 * @param limite Número máximo de sugerencias a devolver.
 */
export function mapearSugerenciasPhoton(
  datos: unknown,
  limite: number,
): ResultadoGeocodificacion[] {
  const sugerencias: ResultadoGeocodificacion[] = [];

  for (const feature of obtenerFeatures(datos)) {
    if (sugerencias.length >= limite) {
      break;
    }

    const coordenadas = extraerCoordenadas(feature);

    if (coordenadas === null) {
      continue;
    }

    const propiedades = propiedadesDe(feature);

    if (!esDeColombia(propiedades)) {
      continue;
    }

    sugerencias.push({
      ...coordenadas,
      etiqueta: formatearDireccion(propiedades),
    });
  }

  return sugerencias;
}

/**
 * Interpreta la respuesta de una geocodificación inversa.
 *
 * Devuelve la primera `feature` con coordenadas válidas; `null` si no hay ninguna o si su
 * etiqueta formateada queda vacía. Es pura.
 *
 * @param datos Cuerpo de la respuesta de Photon, aún sin interpretar.
 */
export function parsearRespuestaInversaPhoton(
  datos: unknown,
): ResultadoGeocodificacion | null {
  for (const feature of obtenerFeatures(datos)) {
    const coordenadas = extraerCoordenadas(feature);

    if (coordenadas === null) {
      continue;
    }

    const etiqueta = formatearDireccion(propiedadesDe(feature));

    if (etiqueta === "") {
      return null;
    }

    return { ...coordenadas, etiqueta };
  }

  return null;
}

/**
 * Guarda un resultado en la caché respetando el límite de entradas (descarte FIFO).
 */
function guardarEnCache(clave: string, valor: unknown): void {
  if (cache.size >= MAX_ENTRADAS_CACHE) {
    const claveMasAntigua = cache.keys().next().value;

    if (claveMasAntigua !== undefined) {
      cache.delete(claveMasAntigua);
    }
  }

  cache.set(clave, valor);
}

/**
 * Espera lo necesario para respetar la cadencia máxima de una petición por segundo.
 *
 * Encadena las solicitudes concurrentes para que ninguna se adelante a la anterior.
 */
async function respetarCadencia(): Promise<void> {
  const espera = colaCadencia.then(async () => {
    const transcurrido = Date.now() - ultimaPeticionMs;
    const restante = CADENCIA_MINIMA_MS - transcurrido;

    if (restante > 0) {
      await new Promise((resolver) => setTimeout(resolver, restante));
    }

    ultimaPeticionMs = Date.now();
  });

  colaCadencia = espera.catch(() => undefined);

  return espera;
}

/**
 * Ejecuta una petición a Photon aplicando la cadencia y traduciendo fallos a `Error`.
 *
 * @param url URL absoluta del endpoint de Photon.
 * @throws Error si Photon responde con un estado de error.
 */
async function consultarPhoton(url: URL): Promise<unknown> {
  await respetarCadencia();

  const respuesta = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "es",
      Accept: "application/json",
    },
  });

  if (!respuesta.ok) {
    throw new Error(`Photon respondió con el estado ${respuesta.status}.`);
  }

  return respuesta.json();
}

/**
 * Devuelve el resultado cacheado de una clave o lo calcula y lo guarda si es válido.
 *
 * Los miss (`null`) no se cachean, de modo que una búsqueda posterior pueda encontrar un
 * resultado nuevo; las listas vacías sí se recuerdan.
 */
async function conCache<T>(
  clave: string,
  obtener: () => Promise<T | null>,
): Promise<T | null> {
  if (cache.has(clave)) {
    return cache.get(clave) as T;
  }

  const resultado = await obtener();

  if (resultado !== null) {
    guardarEnCache(clave, resultado);
  }

  return resultado;
}

/**
 * Construye la URL de búsqueda de Photon acotada a Colombia.
 *
 * No envía `lang`: Photon no soporta `es` (responde `400`) y los nombres locales ya
 * llegan en español desde OpenStreetMap con su idioma por defecto. Es pura, sin red.
 *
 * @param consulta Dirección o lugar a buscar.
 * @param limite Número máximo de coincidencias solicitadas.
 */
export function crearUrlBusqueda(consulta: string, limite: number): URL {
  const url = new URL("/api/", URL_PHOTON);

  url.searchParams.set("q", consulta);
  url.searchParams.set("limit", String(limite));
  url.searchParams.set("bbox", BBOX_COLOMBIA);

  return url;
}

/**
 * Construye la URL de geocodificación inversa de Photon para un punto.
 *
 * No envía `lang`: Photon no soporta `es` (responde `400`) y los nombres locales ya
 * llegan en español desde OpenStreetMap con su idioma por defecto. Es pura, sin red.
 *
 * @param latitud Latitud del punto.
 * @param longitud Longitud del punto.
 */
export function crearUrlInversa(latitud: number, longitud: number): URL {
  const url = new URL("/reverse", URL_PHOTON);

  url.searchParams.set("lon", String(longitud));
  url.searchParams.set("lat", String(latitud));
  url.searchParams.set("limit", "1");

  return url;
}

/**
 * Busca la primera coincidencia de una dirección o lugar en Photon.
 *
 * Devuelve `null` cuando no hay coincidencias y lanza si el proveedor falla, para que el
 * Route Handler distinga un `404` de un `502`. Usa caché y respeta la cadencia.
 *
 * @param consulta Dirección o lugar a geocodificar.
 */
export async function geocodificarDireccion(
  consulta: string,
): Promise<ResultadoGeocodificacion | null> {
  return conCache(`b:${normalizarConsulta(consulta)}`, async () =>
    parsearRespuestaPhoton(
      await consultarPhoton(crearUrlBusqueda(consulta, 1)),
    ),
  );
}

/**
 * Pide a Photon las sugerencias de una consulta, acotadas a Colombia.
 *
 * Devuelve una lista (posiblemente vacía) y respeta caché y cadencia.
 *
 * @param consulta Texto parcial escrito por el usuario.
 */
export async function sugerirDirecciones(
  consulta: string,
): Promise<ResultadoGeocodificacion[]> {
  const sugerencias = await conCache(
    `s:${normalizarConsulta(consulta)}`,
    async () =>
      mapearSugerenciasPhoton(
        await consultarPhoton(crearUrlBusqueda(consulta, LIMITE_SUGERENCIAS)),
        LIMITE_SUGERENCIAS,
      ),
  );

  return sugerencias ?? [];
}

/**
 * Geocodifica inversamente un punto de Colombia.
 *
 * Devuelve `null` cuando no se puede determinar una dirección y lanza si el proveedor
 * falla, para que el Route Handler distinga un `404` de un `502`.
 *
 * @param latitud Latitud del punto.
 * @param longitud Longitud del punto.
 */
export async function geocodificarInversa(
  latitud: number,
  longitud: number,
): Promise<ResultadoGeocodificacion | null> {
  const clave = `r:${latitud.toFixed(5)},${longitud.toFixed(5)}`;

  return conCache(clave, async () =>
    parsearRespuestaInversaPhoton(
      await consultarPhoton(crearUrlInversa(latitud, longitud)),
    ),
  );
}
