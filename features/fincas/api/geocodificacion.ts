import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import type { ResultadoGeocodificacion } from "@/features/fincas/types";

/**
 * Acceso al proxy BFF de geocodificación.
 *
 * El navegador nunca llama a Nominatim: esta función solo consulta el Route Handler del
 * BFF, que es el que se comunica con el servicio externo desde el servidor.
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
