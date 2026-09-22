import type { ApiSchemas } from "@/shared/api/types";

/**
 * Alias de los DTOs del backend usados por el feature de autenticación.
 *
 * Se derivan del OpenAPI en lugar de redefinirse a mano, conforme a las convenciones del
 * proyecto.
 */

/** Credenciales del formulario de acceso (`POST /usuarios/acceso`). */
export type CredencialesAcceso = ApiSchemas["CredencialesAccesoDto"];

/** Datos del formulario de registro (`POST /usuarios/registro`). */
export type DatosRegistro = ApiSchemas["CrearUsuarioDto"];
