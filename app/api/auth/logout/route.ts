import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createServerAnonClient } from "@/shared/api/server-client";
import { REFRESH_COOKIE_NAME } from "@/shared/api/session-cookie";
import type { ApiSchemas } from "@/shared/api/types";
import { limpiarSesion } from "@/app/api/auth/_lib/sesion";

type CerrarSesionDto = ApiSchemas["CerrarSesionDto"];

/**
 * Route Handler del BFF para el cierre de sesión.
 *
 * Revoca el token de refresco en el backend (best-effort) y, en cualquier caso, elimina
 * las cookies httpOnly de acceso y refresco. La revocación es best-effort porque la
 * sesión local debe cerrarse aunque el backend no responda: no se expone el detalle
 * técnico y el usuario siempre puede volver a autenticarse.
 */
export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const tokenRefresco = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (tokenRefresco !== undefined && tokenRefresco !== "") {
    const cuerpo: CerrarSesionDto = { tokenRefresco };

    try {
      await createServerAnonClient().post<unknown>("/usuarios/logout", cuerpo);
    } catch {
      // Best-effort: si la revocación falla, la sesión local se cierra igualmente.
    }
  }

  const respuesta = new NextResponse(null, { status: 204 });
  limpiarSesion(respuesta);

  return respuesta;
}
