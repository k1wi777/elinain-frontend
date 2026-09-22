import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import { LIMITE_MAXIMO } from "@/shared/api/pagination";
import type {
  ActualizarContrato,
  Contrato,
  CrearContrato,
  FiltrosContratos,
  PaginaContratos,
} from "@/features/contratos/types";

/**
 * Acceso a las operaciones de contratos del BFF.
 *
 * Las funciones delegan en `createBffClient` (mismo origen, con la cookie httpOnly
 * adjunta por el navegador) y propagan el `ApiError` que produzca el cliente HTTP. Los
 * componentes nunca conocen las URLs ni llaman a `fetch`. No existe `eliminarContrato`:
 * un contrato se cierra cambiando su estado.
 */

/**
 * Lista los contratos del comerciante autenticado con paginación.
 *
 * @param filtros Límite y offset de la página solicitada.
 * @throws ApiError si falla la petición o la conexión.
 */
export async function listarContratos(
  filtros: FiltrosContratos,
): Promise<PaginaContratos> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<PaginaContratos>("/api/contratos", { params: filtros });
}

/**
 * Lista todos los contratos del comerciante, sin limitarse a una página.
 *
 * Recorre el listado paginado con {@link LIMITE_MAXIMO} hasta alcanzar el total reportado
 * por el backend. El filtro por estado y la paginación visible se resuelven en el cliente.
 *
 * @throws ApiError si falla alguna página o la conexión.
 */
export async function listarTodosLosContratos(): Promise<Contrato[]> {
  const acumulados: Contrato[] = [];
  let offset = 0;

  for (;;) {
    const pagina = await listarContratos({ limite: LIMITE_MAXIMO, offset });
    acumulados.push(...pagina.elementos);

    if (pagina.elementos.length === 0 || acumulados.length >= pagina.total) {
      break;
    }

    offset += LIMITE_MAXIMO;
  }

  return acumulados;
}

/**
 * Obtiene un contrato concreto.
 *
 * @param id Identificador del contrato.
 * @throws ApiError si el contrato no existe o falla la conexión.
 */
export async function obtenerContrato(id: string): Promise<Contrato> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<Contrato>(`/api/contratos/${id}`);
}

/**
 * Abre un contrato.
 *
 * @param datos Tercero, finca, fecha de apertura y porcentajes, con los opcionales.
 * @throws ApiError si los datos son inválidos o falla la conexión.
 */
export async function crearContrato(datos: CrearContrato): Promise<Contrato> {
  const cliente: HttpClient = createBffClient();

  return cliente.post<Contrato>("/api/contratos", datos);
}

/**
 * Actualiza parcialmente un contrato.
 *
 * @param id Identificador del contrato a actualizar.
 * @param datos Campos mutables a modificar; nunca incluye inmutables.
 * @throws ApiError si el contrato no existe, los datos son inválidos o falla la conexión.
 */
export async function actualizarContrato(
  id: string,
  datos: ActualizarContrato,
): Promise<Contrato> {
  const cliente: HttpClient = createBffClient();

  return cliente.patch<Contrato>(`/api/contratos/${id}`, datos);
}
