import { createBffClient } from "@/shared/api/bff-client";
import type { CredencialesAcceso, DatosRegistro } from "@/features/auth/types";

/**
 * Acceso a las operaciones de autenticación del BFF.
 *
 * Las tres funciones delegan en `createBffClient` (mismo origen) y propagan el `ApiError`
 * que produzca el cliente HTTP. El token resultante nunca pasa por aquí: el BFF lo guarda
 * en la cookie httpOnly.
 */

/**
 * Inicia sesión con correo y contraseña.
 *
 * @param credenciales Credenciales del comerciante.
 * @throws ApiError si el backend rechaza el acceso o falla la conexión.
 */
export async function iniciarSesion(
  credenciales: CredencialesAcceso,
): Promise<void> {
  await createBffClient().post<void>("/api/auth/login", credenciales);
}

/**
 * Registra a un comerciante y deja la sesión iniciada (auto-login del BFF).
 *
 * @param datos Nombre, correo y contraseña del comerciante.
 * @throws ApiError si el correo ya existe, si los datos son inválidos o si falla la
 * conexión.
 */
export async function registrarUsuario(datos: DatosRegistro): Promise<void> {
  await createBffClient().post<void>("/api/auth/registro", datos);
}

/**
 * Cierra la sesión eliminando la cookie httpOnly.
 *
 * @throws ApiError si falla la conexión con el BFF.
 */
export async function cerrarSesion(): Promise<void> {
  await createBffClient().post<void>("/api/auth/logout");
}
