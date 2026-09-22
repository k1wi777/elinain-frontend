/**
 * Nombre de la cookie httpOnly que almacena el token de sesión.
 *
 * Se expone como constante para que la Feature de autenticación/BFF (T0.5) y el cliente
 * HTTP base escriban y lean la cookie con el mismo nombre, sin cadenas literales
 * duplicadas.
 */
export const SESSION_COOKIE_NAME = "elinain_session";
