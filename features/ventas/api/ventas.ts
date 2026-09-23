import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import type {
  CrearVenta,
  FiltrosVentas,
  PaginaVentas,
  Venta,
} from "@/features/ventas/types";

/**
 * Acceso a las operaciones de ventas del BFF.
 *
 * Las funciones delegan en `createBffClient` (mismo origen, con la cookie httpOnly adjunta
 * por el navegador) y propagan el `ApiError` que produzca el cliente HTTP. Los componentes
 * nunca conocen las URLs ni llaman a `fetch`. No se expone `obtenerVenta`: la venta creada
 * y las tarjetas ya contienen todos los campos, y el `GET` del BFF se implementa por
 * paridad con el contrato del backend.
 */

/**
 * Lista las ventas con paginación, opcionalmente filtradas por contrato.
 *
 * @param filtros Límite, offset y, si se informa, el contrato del que se listan las ventas.
 * @throws ApiError si falla la petición o la conexión.
 */
export async function listarVentas(
  filtros: FiltrosVentas,
): Promise<PaginaVentas> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<PaginaVentas>("/api/ventas", { params: filtros });
}

/**
 * Registra una venta en un contrato.
 *
 * @param datos Contrato, fecha, cantidad vendida, peso promedio de venta y precio por kilo.
 * @throws ApiError si los datos son inválidos, el contrato no existe o falla la conexión.
 */
export async function crearVenta(datos: CrearVenta): Promise<Venta> {
  const cliente: HttpClient = createBffClient();

  return cliente.post<Venta>("/api/ventas", datos);
}
