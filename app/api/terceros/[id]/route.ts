import { NextResponse } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type ActualizarTerceroDto = ApiSchemas["ActualizarTerceroDto"];
type TerceroRespuestaDto = ApiSchemas["TerceroRespuestaDto"];

/** Mensajes de creación/edición que sobrescriben la base genérica del BFF. */
const MENSAJES_TERCEROS = {
  400: "Revisa los datos del socio de participación.",
  404: "El socio de participación no existe.",
} as const;

/** Mensajes de eliminación: el `409` indica contratos activos asociados. */
const MENSAJES_ELIMINAR = {
  404: "El socio de participación no existe.",
  409: "No se puede eliminar el socio de participación porque tiene contratos activos asociados.",
} as const;

/**
 * Valida de forma defensiva el cuerpo de actualización.
 *
 * Cada campo es opcional, pero se exige al menos uno con un string no vacío; el formato
 * se valida en el feature `terceros` y en el backend.
 */
function leerDatosActualizacion(
  cuerpo: unknown,
): ActualizarTerceroDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { nombre, documento, contacto } = cuerpo as Record<string, unknown>;
  const datos: ActualizarTerceroDto = {};

  if (nombre !== undefined) {
    if (typeof nombre !== "string" || nombre.trim() === "") {
      return undefined;
    }
    datos.nombre = nombre;
  }

  if (documento !== undefined) {
    if (typeof documento !== "string" || documento.trim() === "") {
      return undefined;
    }
    datos.documento = documento;
  }

  if (contacto !== undefined) {
    if (typeof contacto !== "string" || contacto.trim() === "") {
      return undefined;
    }
    datos.contacto = contacto;
  }

  if (
    datos.nombre === undefined &&
    datos.documento === undefined &&
    datos.contacto === undefined
  ) {
    return undefined;
  }

  return datos;
}

/**
 * Route Handler del BFF para actualizar parcialmente un tercero.
 *
 * Valida el cuerpo de forma defensiva, delega en el backend y responde `200` con el
 * tercero actualizado.
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
    return respuestaError(400, MENSAJES_TERCEROS);
  }

  const datos = leerDatosActualizacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_TERCEROS);
  }

  try {
    const cliente = await createServerClient();
    const tercero = await cliente.patch<TerceroRespuestaDto>(
      `/terceros/${id}`,
      datos,
    );

    return NextResponse.json(tercero, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_TERCEROS)
      : respuestaError(500, MENSAJES_TERCEROS);
  }
}

/**
 * Route Handler del BFF para eliminar un tercero.
 *
 * Responde `204` sin cuerpo cuando el backend confirma el borrado; un `409` indica que el
 * socio tiene contratos activos asociados y no puede eliminarse.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const cliente = await createServerClient();
    await cliente.delete<void>(`/terceros/${id}`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_ELIMINAR)
      : respuestaError(500, MENSAJES_ELIMINAR);
  }
}
