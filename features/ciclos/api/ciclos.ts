import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import type {
  ActualizarCiclo,
  Ciclo,
  CrearCiclo,
  FiltrosCiclos,
  PaginaCiclos,
} from "@/features/ciclos/types";

/**
 * Acceso a las operaciones de ciclos del BFF.
 *
 * Las funciones delegan en `createBffClient` (mismo origen, con la cookie httpOnly adjunta
 * por el navegador) y propagan el `ApiError` que produzca el cliente HTTP. Los componentes
 * nunca conocen las URLs ni llaman a `fetch`.
 */

/**
 * Lista los ciclos de un contrato con paginación.
 *
 * @param filtros Límite, offset y contrato del que se listan los ciclos.
 * @throws ApiError si falla la petición o la conexión.
 */
export async function listarCiclos(
  filtros: FiltrosCiclos,
): Promise<PaginaCiclos> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<PaginaCiclos>("/api/ciclos", { params: filtros });
}

/**
 * Registra un ciclo en un contrato.
 *
 * @param datos Contrato, fecha, peso observado opcional y notas opcionales.
 * @throws ApiError si los datos son inválidos, el contrato está cerrado o falla la conexión.
 */
export async function crearCiclo(datos: CrearCiclo): Promise<Ciclo> {
  const cliente: HttpClient = createBffClient();

  return cliente.post<Ciclo>("/api/ciclos", datos);
}

/**
 * Actualiza parcialmente un ciclo.
 *
 * @param id Identificador del ciclo a actualizar.
 * @param datos Campos mutables a modificar.
 * @throws ApiError si el ciclo no existe, el contrato está cerrado o falla la conexión.
 */
export async function actualizarCiclo(
  id: string,
  datos: ActualizarCiclo,
): Promise<Ciclo> {
  const cliente: HttpClient = createBffClient();

  return cliente.patch<Ciclo>(`/api/ciclos/${id}`, datos);
}

/**
 * Elimina un ciclo.
 *
 * @param id Identificador del ciclo a eliminar.
 * @throws ApiError si el ciclo no existe, el contrato está cerrado o falla la conexión.
 */
export async function eliminarCiclo(id: string): Promise<void> {
  const cliente: HttpClient = createBffClient();

  await cliente.delete<void>(`/api/ciclos/${id}`);
}
