import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import { LIMITE_MAXIMO } from "@/shared/api/pagination";
import type {
  ActualizarFinca,
  CrearFinca,
  FiltrosFincas,
  Finca,
  PaginaFincas,
} from "@/features/fincas/types";

/**
 * Acceso a las operaciones de fincas del BFF.
 *
 * Las funciones delegan en `createBffClient` (mismo origen, con la cookie httpOnly
 * adjunta por el navegador) y propagan el `ApiError` que produzca el cliente HTTP. Los
 * componentes nunca conocen las URLs ni llaman a `fetch`.
 */

/**
 * Lista las fincas del comerciante autenticado con paginación.
 *
 * @param filtros Límite y offset de la página solicitada.
 * @throws ApiError si falla la petición o la conexión.
 */
export async function listarFincas(
  filtros: FiltrosFincas,
): Promise<PaginaFincas> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<PaginaFincas>("/api/fincas", { params: filtros });
}

/**
 * Lista todas las fincas del comerciante, sin limitarse a una página.
 *
 * Recorre el listado paginado con {@link LIMITE_MAXIMO} hasta alcanzar el total reportado
 * por el backend; alimenta los pines del mapa y la resolución de propietarios.
 *
 * @throws ApiError si falla alguna página o la conexión.
 */
export async function listarTodasLasFincas(): Promise<Finca[]> {
  const acumuladas: Finca[] = [];
  let offset = 0;

  for (;;) {
    const pagina = await listarFincas({ limite: LIMITE_MAXIMO, offset });
    acumuladas.push(...pagina.elementos);

    if (pagina.elementos.length === 0 || acumuladas.length >= pagina.total) {
      break;
    }

    offset += LIMITE_MAXIMO;
  }

  return acumuladas;
}

/**
 * Obtiene una finca concreta.
 *
 * @param id Identificador de la finca.
 * @throws ApiError si la finca no existe o falla la conexión.
 */
export async function obtenerFinca(id: string): Promise<Finca> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<Finca>(`/api/fincas/${id}`);
}

/**
 * Crea una finca.
 *
 * @param datos Propietario, nombre, dirección y coordenadas del pin.
 * @throws ApiError si los datos son inválidos o falla la conexión.
 */
export async function crearFinca(datos: CrearFinca): Promise<Finca> {
  const cliente: HttpClient = createBffClient();

  return cliente.post<Finca>("/api/fincas", datos);
}

/**
 * Actualiza parcialmente una finca.
 *
 * @param id Identificador de la finca a actualizar.
 * @param datos Campos a modificar; nunca incluye `tercero_id`.
 * @throws ApiError si la finca no existe, los datos son inválidos o falla la conexión.
 */
export async function actualizarFinca(
  id: string,
  datos: ActualizarFinca,
): Promise<Finca> {
  const cliente: HttpClient = createBffClient();

  return cliente.patch<Finca>(`/api/fincas/${id}`, datos);
}

/**
 * Elimina una finca.
 *
 * @param id Identificador de la finca a eliminar.
 * @throws ApiError si la finca no existe, tiene contratos vinculados o falla la conexión.
 */
export async function eliminarFinca(id: string): Promise<void> {
  const cliente: HttpClient = createBffClient();

  await cliente.delete<void>(`/api/fincas/${id}`);
}
