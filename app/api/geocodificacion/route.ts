import { NextResponse, type NextRequest } from "next/server";

import { respuestaError } from "@/app/api/_lib/respuestas";
import { geocodificarDireccion } from "@/app/api/geocodificacion/_lib/photon";
import { haySesionVigente } from "@/app/api/geocodificacion/_lib/sesion";

/** Mensajes de geocodificación que sobrescriben la base genérica del BFF. */
const MENSAJES_GEOCODIFICACION = {
  400: "Indica una dirección para buscar.",
  404: "No se encontró la dirección indicada.",
} as const;

/**
 * Route Handler del BFF que geocodifica una dirección contra Photon.
 *
 * Exige una sesión vigente antes de consultar el servicio externo: es la misma guardia de
 * navegación que aplica el middleware. Sin coincidencias responde `404`; un fallo de
 * Photon se traduce a `502` a través de `respuestaError`.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await haySesionVigente())) {
    return respuestaError(401);
  }

  const consulta = request.nextUrl.searchParams.get("consulta")?.trim() ?? "";

  if (consulta === "") {
    return respuestaError(400, MENSAJES_GEOCODIFICACION);
  }

  try {
    const coincidencia = await geocodificarDireccion(consulta);

    if (coincidencia === null) {
      return respuestaError(404, MENSAJES_GEOCODIFICACION);
    }

    return NextResponse.json(coincidencia, { status: 200 });
  } catch {
    return respuestaError(502);
  }
}
