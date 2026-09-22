import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import type { ResultadoGeocodificacion } from "@/features/fincas/types";

/**
 * Acceso al proxy BFF de geocodificación.
 *
 * El navegador nunca llama a Photon: estas funciones solo consultan los Route Handlers del
 * BFF, que son los que se comunican con el servicio externo desde el servidor.
 */

/**
 * Busca las coordenadas de una dirección.
 *
 * @param consulta Dirección o lugar a geocodificar.
 * @throws ApiError si no hay coincidencias (`404`) o falla la conexión.
 */
export async function buscarCoordenadas(
  consulta: string,
): Promise<ResultadoGeocodificacion> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<ResultadoGeocodificacion>("/api/geocodificacion", {
    params: { consulta },
  });
}

/**
 * Pide sugerencias de direcciones a partir de un texto parcial.
 *
 * @param consulta Texto escrito por el usuario.
 * @throws ApiError si la consulta no alcanza el mínimo, no hay sesión o falla la conexión.
 */
export async function buscarSugerenciasDireccion(
  consulta: string,
): Promise<ResultadoGeocodificacion[]> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<ResultadoGeocodificacion[]>(
    "/api/geocodificacion/sugerencias",
    { params: { consulta } },
  );
}

/**
 * Obtiene la dirección correspondiente a un punto.
 *
 * @param latitud Latitud del punto.
 * @param longitud Longitud del punto.
 * @throws ApiError si no se determina una dirección (`404`) o falla la conexión.
 */
export async function buscarDireccionInversa(
  latitud: number,
  longitud: number,
): Promise<ResultadoGeocodificacion> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<ResultadoGeocodificacion>("/api/geocodificacion/inversa", {
    params: { lat: latitud, lon: longitud },
  });
}
