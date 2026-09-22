import { NextResponse, type NextRequest } from "next/server";

import { respuestaError } from "@/app/api/_lib/respuestas";
import {
  BBOX_COLOMBIA,
  geocodificarInversa,
} from "@/app/api/geocodificacion/_lib/photon";
import { haySesionVigente } from "@/app/api/geocodificacion/_lib/sesion";

/** Mensajes de geocodificación inversa que sobrescriben la base genérica del BFF. */
const MENSAJES_INVERSA = {
  400: "Indica una latitud y una longitud válidas dentro de Colombia.",
  404: "No se pudo determinar una dirección para ese punto.",
} as const;

/**
 * Límites de Colombia derivados de la caja envolvente de Photon, en el orden
 * `minLon, minLat, maxLon, maxLat`.
 */
const [
  LONGITUD_MINIMA_COLOMBIA,
  LATITUD_MINIMA_COLOMBIA,
  LONGITUD_MAXIMA_COLOMBIA,
  LATITUD_MAXIMA_COLOMBIA,
] = BBOX_COLOMBIA.split(",").map(Number);

/**
 * Convierte un parámetro de consulta en un número finito.
 *
 * Devuelve `undefined` cuando el parámetro falta, está en blanco o no es numérico.
 */
function leerNumero(valor: string | null): number | undefined {
  if (valor === null || valor.trim() === "") {
    return undefined;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : undefined;
}

/** Indica si un punto cae dentro del área de Colombia. */
function estaDentroDeColombia(latitud: number, longitud: number): boolean {
  return (
    latitud >= LATITUD_MINIMA_COLOMBIA &&
    latitud <= LATITUD_MAXIMA_COLOMBIA &&
    longitud >= LONGITUD_MINIMA_COLOMBIA &&
    longitud <= LONGITUD_MAXIMA_COLOMBIA
  );
}

/**
 * Route Handler del BFF que geocodifica inversamente un punto contra Photon.
 *
 * Exige sesión vigente y valida `lat`/`lon` (numéricos, en rango y dentro de Colombia),
 * respondiendo `400` si no son válidos. Sin dirección responde `404`; un fallo de Photon
 * se traduce a `502`.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await haySesionVigente())) {
    return respuestaError(401);
  }

  const latitud = leerNumero(request.nextUrl.searchParams.get("lat"));
  const longitud = leerNumero(request.nextUrl.searchParams.get("lon"));

  if (
    latitud === undefined ||
    longitud === undefined ||
    latitud < -90 ||
    latitud > 90 ||
    longitud < -180 ||
    longitud > 180 ||
    !estaDentroDeColombia(latitud, longitud)
  ) {
    return respuestaError(400, MENSAJES_INVERSA);
  }

  try {
    const direccion = await geocodificarInversa(latitud, longitud);

    if (direccion === null) {
      return respuestaError(404, MENSAJES_INVERSA);
    }

    return NextResponse.json(direccion, { status: 200 });
  } catch {
    return respuestaError(502);
  }
}
