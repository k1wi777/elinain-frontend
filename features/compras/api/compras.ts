import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import type {
  ActualizarCompra,
  Compra,
  CrearCompra,
  FiltrosCompras,
  PaginaCompras,
} from "@/features/compras/types";

/**
 * Acceso a las operaciones de compras del BFF.
 *
 * Las funciones delegan en `createBffClient` (mismo origen, con la cookie httpOnly adjunta
 * por el navegador) y propagan el `ApiError` que produzca el cliente HTTP. Los componentes
 * nunca conocen las URLs ni llaman a `fetch`.
 */

/**
 * Lista las compras de un contrato con paginación.
 *
 * @param filtros Límite, offset y contrato del que se listan las compras.
 * @throws ApiError si falla la petición o la conexión.
 */
export async function listarCompras(
  filtros: FiltrosCompras,
): Promise<PaginaCompras> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<PaginaCompras>("/api/compras", { params: filtros });
}

/**
 * Registra una compra en un contrato.
 *
 * @param datos Contrato, fecha, cantidad, peso promedio, precio por kilo y nota.
 * @throws ApiError si los datos son inválidos, el contrato está cerrado o falla la conexión.
 */
export async function crearCompra(datos: CrearCompra): Promise<Compra> {
  const cliente: HttpClient = createBffClient();

  return cliente.post<Compra>("/api/compras", datos);
}

/**
 * Actualiza parcialmente una compra.
 *
 * @param id Identificador de la compra a actualizar.
 * @param datos Campos mutables a modificar; nunca incluye `contrato_id`.
 * @throws ApiError si la compra no existe, el contrato ya tiene ventas registradas o falla
 * la conexión.
 */
export async function actualizarCompra(
  id: string,
  datos: ActualizarCompra,
): Promise<Compra> {
  const cliente: HttpClient = createBffClient();

  return cliente.patch<Compra>(`/api/compras/${id}`, datos);
}

/**
 * Elimina una compra.
 *
 * @param id Identificador de la compra a eliminar.
 * @throws ApiError si la compra no existe, el contrato ya tiene ventas registradas o falla
 * la conexión.
 */
export async function eliminarCompra(id: string): Promise<void> {
  const cliente: HttpClient = createBffClient();

  await cliente.delete<void>(`/api/compras/${id}`);
}
