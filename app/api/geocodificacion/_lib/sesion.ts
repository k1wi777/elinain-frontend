import { cookies } from "next/headers";

import { sesionVigente } from "@/shared/api/session";
import { SESSION_COOKIE_NAME } from "@/shared/api/session-cookie";

/**
 * Guardia de sesión compartida por los endpoints BFF de geocodificación.
 *
 * Lee la cookie httpOnly y evalúa su vigencia sin llamar al proveedor externo, de modo
 * que los tres Route Handlers respondan `401` de forma coherente cuando no hay sesión.
 *
 * @returns `true` si la petición trae una cookie de sesión vigente.
 */
export async function haySesionVigente(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return sesionVigente(token);
}
