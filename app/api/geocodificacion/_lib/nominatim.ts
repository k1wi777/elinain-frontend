/**
 * Cliente interno del BFF para Nominatim (OpenStreetMap).
 *
 * Solo se ejecuta en el servidor: el navegador nunca llama a Nominatim directamente. La
 * política de uso de Nominatim exige identificar la aplicación con un `User-Agent` propio
 * y limitar la cadencia, por lo que aquí se aplican ambas reglas y se cachean los
 * resultados para no repetir consultas idénticas.
 */

/** Coordenadas y etiqueta devueltas por la geocodificación. */
export type CoincidenciaGeocodificacion = {
  /** Latitud de la primera coincidencia. */
  latitud: number;
  /** Longitud de la primera coincidencia. */
  longitud: number;
  /** Descripción legible de la ubicación ("display_name"). */
  etiqueta: string;
};

/** Endpoint de búsqueda de Nominatim. */
const URL_NOMINATIM = "https://nominatim.openstreetmap.org/search";

/** Identificación de la aplicación ante Nominatim (política de uso). */
const USER_AGENT = "Elinain/1.0 (plataforma de gestión ganadera)";

/** Cadencia mínima entre peticiones a Nominatim, en milisegundos. */
const CADENCIA_MINIMA_MS = 1000;

/** Máximo de consultas recordadas en la caché en memoria. */
const MAX_ENTRADAS_CACHE = 100;

/** Caché en memoria de coincidencias indexada por consulta normalizada. */
const cache = new Map<string, CoincidenciaGeocodificacion>();

/** Marca temporal de la última petición efectiva a Nominatim. */
let ultimaPeticionMs = 0;

/** Cola que serializa las peticiones para respetar la cadencia. */
let colaCadencia: Promise<void> = Promise.resolve();

/**
 * Normaliza una consulta para usarla como clave de caché.
 *
 * @param consulta Texto de búsqueda tal como lo envía el navegador.
 */
function normalizarConsulta(consulta: string): string {
  return consulta.trim().toLowerCase();
}

/**
 * Convierte un valor desconocido en un número finito.
 *
 * Nominatim devuelve `lat`/`lon` como cadenas; el parseo exige que el valor esté presente
 * y no sea una cadena vacía para no confundir `null` o `""` con `0`.
 */
function aNumero(valor: unknown): number | undefined {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return valor;
  }

  if (typeof valor === "string" && valor.trim() !== "") {
    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : undefined;
  }

  return undefined;
}

/**
 * Guarda una coincidencia en la caché respetando el límite de entradas.
 */
function guardarEnCache(
  clave: string,
  coincidencia: CoincidenciaGeocodificacion,
): void {
  if (cache.size >= MAX_ENTRADAS_CACHE) {
    const claveMasAntigua = cache.keys().next().value;

    if (claveMasAntigua !== undefined) {
      cache.delete(claveMasAntigua);
    }
  }

  cache.set(clave, coincidencia);
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
 * Interpreta la respuesta cruda de Nominatim y devuelve la primera coincidencia.
 *
 * Función pura y sin red, por lo que es la unidad que se prueba con Jest. Devuelve `null`
 * cuando la respuesta no es un array con al menos un elemento, cuando el primer elemento
 * no expone `lat`/`lon` numéricos o cuando las coordenadas quedan fuera de rango.
 *
 * @param datos Cuerpo de la respuesta de Nominatim, aún sin interpretar.
 */
export function parsearRespuestaNominatim(
  datos: unknown,
): CoincidenciaGeocodificacion | null {
  if (!Array.isArray(datos) || datos.length === 0) {
    return null;
  }

  const primero: unknown = datos[0];

  if (typeof primero !== "object" || primero === null) {
    return null;
  }

  const {
    lat,
    lon,
    display_name: etiqueta,
  } = primero as Record<string, unknown>;
  const latitud = aNumero(lat);
  const longitud = aNumero(lon);

  if (latitud === undefined || longitud === undefined) {
    return null;
  }

  if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
    return null;
  }

  return {
    latitud,
    longitud,
    etiqueta: typeof etiqueta === "string" ? etiqueta : "",
  };
}

/**
 * Geocodifica una consulta contra Nominatim.
 *
 * Devuelve `null` cuando no hay coincidencias y lanza si el servicio externo falla, de
 * modo que el Route Handler pueda distinguir un `404` de un `502`. Reutiliza la caché para
 * consultas idénticas y respeta la cadencia de la política de uso.
 *
 * @param consulta Dirección o lugar a geocodificar.
 * @throws Error si Nominatim responde con un estado de error.
 */
export async function geocodificar(
  consulta: string,
): Promise<CoincidenciaGeocodificacion | null> {
  const clave = normalizarConsulta(consulta);
  const cacheada = cache.get(clave);

  if (cacheada !== undefined) {
    return cacheada;
  }

  await respetarCadencia();

  const url = new URL(URL_NOMINATIM);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", consulta);

  const respuesta = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "es",
      Accept: "application/json",
    },
  });

  if (!respuesta.ok) {
    throw new Error(`Nominatim respondió con el estado ${respuesta.status}.`);
  }

  const coincidencia = parsearRespuestaNominatim(await respuesta.json());

  if (coincidencia !== null) {
    guardarEnCache(clave, coincidencia);
  }

  return coincidencia;
}
