import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import type {
  ActualizarCosto,
  Costo,
  CrearCosto,
  FiltrosCostos,
  PaginaCostos,
} from "@/features/costos/types";

/**
 * Acceso a las operaciones de costos del BFF.
 *
 * Las funciones delegan en `createBffClient` (mismo origen, con la cookie httpOnly adjunta
 * por el navegador) y propagan el `ApiError` que produzca el cliente HTTP. Los componentes
 * nunca conocen las URLs ni llaman a `fetch`.
 */

/**
 * Lista los costos de un contrato con paginación.
 *
 * @param filtros Límite, offset y contrato del que se listan los costos.
 * @throws ApiError si falla la petición o la conexión.
 */
export async function listarCostos(
  filtros: FiltrosCostos,
): Promise<PaginaCostos> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<PaginaCostos>("/api/costos", { params: filtros });
}

/**
 * Registra un costo informativo en un contrato.
 *
 * @param datos Contrato, tipo, monto, fecha y descripción.
 * @throws ApiError si los datos son inválidos, el contrato está cerrado o falla la conexión.
 */
export async function crearCosto(datos: CrearCosto): Promise<Costo> {
  const cliente: HttpClient = createBffClient();

  return cliente.post<Costo>("/api/costos", datos);
}

/**
 * Actualiza parcialmente un costo.
 *
 * @param id Identificador del costo a actualizar.
 * @param datos Campos mutables a modificar.
 * @throws ApiError si el costo no existe, el contrato está cerrado o falla la conexión.
 */
export async function actualizarCosto(
  id: string,
  datos: ActualizarCosto,
): Promise<Costo> {
  const cliente: HttpClient = createBffClient();

  return cliente.patch<Costo>(`/api/costos/${id}`, datos);
}

/**
 * Elimina un costo.
 *
 * @param id Identificador del costo a eliminar.
 * @throws ApiError si el costo no existe, el contrato está cerrado o falla la conexión.
 */
export async function eliminarCosto(id: string): Promise<void> {
  const cliente: HttpClient = createBffClient();

  await cliente.delete<void>(`/api/costos/${id}`);
}
