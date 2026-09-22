import { NextResponse } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type ActualizarFincaDto = ApiSchemas["ActualizarFincaDto"];
type FincaRespuestaDto = ApiSchemas["FincaRespuestaDto"];

/** Mensajes de consulta/edición que sobrescriben la base genérica del BFF. */
const MENSAJES_FINCAS = {
  400: "Revisa los datos de la finca.",
  404: "La finca no existe.",
} as const;

/** Mensajes de eliminación: el `409` indica contratos vinculados. */
const MENSAJES_ELIMINAR = {
  404: "La finca no existe.",
  409: "No se puede eliminar la finca porque tiene contratos vinculados.",
} as const;

/** Rangos geográficos aceptados por el backend. */
const LATITUD_MINIMA = -90;
const LATITUD_MAXIMA = 90;
const LONGITUD_MINIMA = -180;
const LONGITUD_MAXIMA = 180;

/**
 * Indica si un valor es un número finito dentro de un rango inclusivo.
 */
function esNumeroEnRango(
  valor: unknown,
  minimo: number,
  maximo: number,
): valor is number {
  return (
    typeof valor === "number" &&
    Number.isFinite(valor) &&
    valor >= minimo &&
    valor <= maximo
  );
}

/**
 * Valida de forma defensiva el cuerpo de actualización.
 *
 * Cada campo es opcional, pero se exige al menos uno; `tercero_id` se ignora siempre
 * porque el propietario no se puede modificar desde fincas. El formato se valida en el
 * feature `fincas` y en el backend.
 */
function leerDatosActualizacion(
  cuerpo: unknown,
): ActualizarFincaDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { nombre, direccion, latitud, longitud } = cuerpo as Record<
    string,
    unknown
  >;
  const datos: ActualizarFincaDto = {};

  if (nombre !== undefined) {
    if (typeof nombre !== "string" || nombre.trim() === "") {
      return undefined;
    }
    datos.nombre = nombre;
  }

  if (direccion !== undefined) {
    if (typeof direccion !== "string" || direccion.trim() === "") {
      return undefined;
    }
    datos.direccion = direccion;
  }

  if (latitud !== undefined) {
    if (!esNumeroEnRango(latitud, LATITUD_MINIMA, LATITUD_MAXIMA)) {
      return undefined;
    }
    datos.latitud = latitud;
  }

  if (longitud !== undefined) {
    if (!esNumeroEnRango(longitud, LONGITUD_MINIMA, LONGITUD_MAXIMA)) {
      return undefined;
    }
    datos.longitud = longitud;
  }

  if (
    datos.nombre === undefined &&
    datos.direccion === undefined &&
    datos.latitud === undefined &&
    datos.longitud === undefined
  ) {
    return undefined;
  }

  return datos;
}

/**
 * Route Handler del BFF para consultar una finca concreta.
 *
 * Responde `200` con la finca o propaga el `404` cuando no existe.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const cliente = await createServerClient();
    const finca = await cliente.get<FincaRespuestaDto>(`/fincas/${id}`);

    return NextResponse.json(finca, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_FINCAS)
      : respuestaError(500, MENSAJES_FINCAS);
  }
}

/**
 * Route Handler del BFF para actualizar parcialmente una finca.
 *
 * Valida el cuerpo de forma defensiva (sin aceptar `tercero_id`), delega en el backend y
 * responde `200` con la finca actualizada.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError(400, MENSAJES_FINCAS);
  }

  const datos = leerDatosActualizacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_FINCAS);
  }

  try {
    const cliente = await createServerClient();
    const finca = await cliente.patch<FincaRespuestaDto>(
      `/fincas/${id}`,
      datos,
    );

    return NextResponse.json(finca, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_FINCAS)
      : respuestaError(500, MENSAJES_FINCAS);
  }
}

/**
 * Route Handler del BFF para eliminar una finca.
 *
 * Responde `204` sin cuerpo cuando el backend confirma el borrado; un `409` indica que la
 * finca tiene contratos vinculados y no puede eliminarse.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const cliente = await createServerClient();
    await cliente.delete<void>(`/fincas/${id}`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_ELIMINAR)
      : respuestaError(500, MENSAJES_ELIMINAR);
  }
}
