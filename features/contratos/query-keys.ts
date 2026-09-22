/**
 * Fábrica de query keys de TanStack Query del feature `contratos`.
 *
 * El listado se cachea como un único conjunto sin filtros (el filtrado y la paginación
 * se resuelven en el cliente), por lo que las mutaciones invalidan `lista()` y, al
 * editar, también `detalle(id)`.
 */
export const clavesContratos = {
  /** Raíz de todas las consultas del feature. */
  todas: ["contratos"] as const,
  /** Clave de la colección completa de contratos, sin filtrar ni paginar. */
  lista: () => ["contratos", "list"] as const,
  /** Clave del detalle de un contrato concreto. */
  detalle: (id: string) => ["contratos", "detail", id] as const,
};
