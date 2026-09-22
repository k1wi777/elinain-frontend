import type { components } from "@/shared/api/openapi/schema";

/**
 * Alias de los esquemas generados desde el OpenAPI del backend.
 *
 * Los features deben tipar sus DTOs a partir de este alias en lugar de redefinir
 * manualmente los contratos del backend.
 */
export type ApiSchemas = components["schemas"];
