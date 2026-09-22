import { NextResponse } from "next/server";

import { limpiarSesion } from "@/app/api/auth/_lib/sesion";

/**
 * Route Handler del BFF para el cierre de sesión.
 *
 * Elimina la cookie httpOnly y responde sin cuerpo. El backend no expone un endpoint de
 * logout, por lo que la sesión se cierra únicamente en el navegador.
 */
export function POST(): NextResponse {
  const respuesta = new NextResponse(null, { status: 204 });
  limpiarSesion(respuesta);

  return respuesta;
}
