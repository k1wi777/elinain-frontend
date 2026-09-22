import { NextResponse, type NextRequest } from "next/server";

import { respuestaError } from "@/app/api/_lib/respuestas";
import {
  MIN_CARACTERES_CONSULTA,
  sugerirDirecciones,
} from "@/app/api/geocodificacion/_lib/photon";
import { haySesionVigente } from "@/app/api/geocodificacion/_lib/sesion";

/** Mensajes de sugerencias que sobrescriben la base genérica del BFF. */
const MENSAJES_SUGERENCIAS = {
  400: `Escribe al menos ${MIN_CARACTERES_CONSULTA} caracteres para ver sugerencias.`,
} as const;

/**
 * Route Handler del BFF que devuelve sugerencias de direcciones desde Photon.
 *
 * Exige sesión vigente y un mínimo de caracteres (responde `400` si no se alcanza). A
 * diferencia de la búsqueda, una consulta sin coincidencias es un `200` con lista vacía;
 * un fallo de Photon se traduce a `502`.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await haySesionVigente())) {
    return respuestaError(401);
  }

  const consulta = request.nextUrl.searchParams.get("consulta")?.trim() ?? "";

  if (consulta.length < MIN_CARACTERES_CONSULTA) {
    return respuestaError(400, MENSAJES_SUGERENCIAS);
  }

  try {
    const sugerencias = await sugerirDirecciones(consulta);

    return NextResponse.json(sugerencias, { status: 200 });
  } catch {
    return respuestaError(502);
  }
}
