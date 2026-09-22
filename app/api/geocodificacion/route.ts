import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { sesionVigente } from "@/shared/api/session";
import { SESSION_COOKIE_NAME } from "@/shared/api/session-cookie";
import { respuestaError } from "@/app/api/_lib/respuestas";
import { geocodificar } from "@/app/api/geocodificacion/_lib/nominatim";

/** Mensajes de geocodificación que sobrescriben la base genérica del BFF. */
const MENSAJES_GEOCODIFICACION = {
  400: "Indica una dirección para buscar.",
  404: "No se encontró la dirección indicada.",
} as const;

/**
 * Route Handler del BFF que geocodifica una dirección contra Nominatim.
 *
 * Exige una sesión vigente antes de consultar el servicio externo: es la misma guardia de
 * navegación que aplica el middleware. Sin coincidencias responde `404`; un fallo de
 * Nominatim se traduce a `502` a través de `respuestaError`.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sesionVigente(token)) {
    return respuestaError(401);
  }

  const consulta = request.nextUrl.searchParams.get("consulta")?.trim() ?? "";

  if (consulta === "") {
    return respuestaError(400, MENSAJES_GEOCODIFICACION);
  }

  try {
    const coincidencia = await geocodificar(consulta);

    if (coincidencia === null) {
      return respuestaError(404, MENSAJES_GEOCODIFICACION);
    }

    return NextResponse.json(coincidencia, { status: 200 });
  } catch {
    return respuestaError(502);
  }
}
