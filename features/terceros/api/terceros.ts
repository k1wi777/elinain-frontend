import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import { LIMITE_MAXIMO } from "@/shared/api/pagination";
import type {
  ActualizarTercero,
  CrearTercero,
  FiltrosTerceros,
  PaginaTerceros,
  Tercero,
} from "@/features/terceros/types";

/**
 * Acceso a las operaciones de terceros del BFF.
 *
 * Las funciones delegan en `createBffClient` (mismo origen, con la cookie httpOnly
 * adjunta por el navegador) y propagan el `ApiError` que produzca el cliente HTTP. Los
 * componentes nunca conocen las URLs ni llaman a `fetch`.
 */

/**
 * Lista los terceros del comerciante autenticado con paginación.
 *
 * @param filtros Límite y offset de la página solicitada.
 * @throws ApiError si falla la petición o la conexión.
 */
export async function listarTerceros(
  filtros: FiltrosTerceros,
): Promise<PaginaTerceros> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<PaginaTerceros>("/api/terceros", { params: filtros });
}

/**
 * Lista todos los terceros del comerciante, sin limitarse a una página.
 *
 * Recorre el listado paginado con {@link LIMITE_MAXIMO} hasta alcanzar el total reportado
 * por el backend; lo usa `app/` para resolver los nombres de los propietarios de fincas.
 *
 * @throws ApiError si falla alguna página o la conexión.
 */
export async function listarTodosLosTerceros(): Promise<Tercero[]> {
  const acumulados: Tercero[] = [];
  let offset = 0;

  for (;;) {
    const pagina = await listarTerceros({ limite: LIMITE_MAXIMO, offset });
    acumulados.push(...pagina.elementos);

    if (pagina.elementos.length === 0 || acumulados.length >= pagina.total) {
      break;
    }

    offset += LIMITE_MAXIMO;
  }

  return acumulados;
}

/**
 * Crea un tercero.
 *
 * @param datos Nombre, documento y contacto del tercero.
 * @throws ApiError si los datos son inválidos o falla la conexión.
 */
export async function crearTercero(datos: CrearTercero): Promise<Tercero> {
  const cliente: HttpClient = createBffClient();

  return cliente.post<Tercero>("/api/terceros", datos);
}

/**
 * Actualiza parcialmente un tercero.
 *
 * @param id Identificador del tercero a actualizar.
 * @param datos Campos a modificar.
 * @throws ApiError si el tercero no existe, los datos son inválidos o falla la conexión.
 */
export async function actualizarTercero(
  id: string,
  datos: ActualizarTercero,
): Promise<Tercero> {
  const cliente: HttpClient = createBffClient();

  return cliente.patch<Tercero>(`/api/terceros/${id}`, datos);
}

/**
 * Elimina un tercero.
 *
 * @param id Identificador del tercero a eliminar.
 * @throws ApiError si el tercero no existe, tiene contratos activos o falla la conexión.
 */
export async function eliminarTercero(id: string): Promise<void> {
  const cliente: HttpClient = createBffClient();

  await cliente.delete<void>(`/api/terceros/${id}`);
}
