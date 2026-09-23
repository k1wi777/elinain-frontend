import { NextResponse } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type ActualizarCostoDto = ApiSchemas["ActualizarCostoDto"];
type CostoRespuestaDto = ApiSchemas["CostoRespuestaDto"];

/** Mensajes de consulta que sobrescriben la base genérica del BFF. */
const MENSAJES_CONSULTAR = {
  404: "El costo no existe.",
} as const;

/** Mensajes de edición: el `400` agrupa datos inválidos y contrato cerrado. */
const MENSAJES_EDITAR = {
  400: "No se pudo guardar el costo: revisa los datos o verifica que el contrato no esté cerrado.",
  404: "El costo no existe.",
} as const;

/** Mensajes de eliminación: el `400` agrupa solicitud inválida y contrato cerrado. */
const MENSAJES_ELIMINAR = {
  400: "No se pudo eliminar el costo: revisa la solicitud o verifica el estado del contrato.",
  404: "El costo no existe.",
} as const;

/**
 * Indica si un valor es un número finito mayor que cero.
 */
function esNumeroPositivo(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0;
}

/**
 * Valida de forma defensiva el cuerpo de actualización.
 *
 * Lee únicamente los campos mutables (`tipo`, `monto`, `fecha` y `descripcion`) y descarta
 * cualquier otro, en particular `contrato_id`, que es inmutable. Exige al menos un campo
 * mutable.
 */
function leerDatosActualizacion(
  cuerpo: unknown,
): ActualizarCostoDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { tipo, monto, fecha, descripcion } = cuerpo as Record<string, unknown>;
  const datos: ActualizarCostoDto = {};

  if (tipo !== undefined) {
    if (typeof tipo !== "string" || tipo.trim() === "") {
      return undefined;
    }
    datos.tipo = tipo;
  }

  if (monto !== undefined) {
    if (!esNumeroPositivo(monto)) {
      return undefined;
    }
    datos.monto = monto;
  }

  if (fecha !== undefined) {
    if (typeof fecha !== "string" || fecha.trim() === "") {
      return undefined;
    }
    datos.fecha = fecha;
  }

  if (descripcion !== undefined) {
    if (typeof descripcion !== "string" || descripcion.trim() === "") {
      return undefined;
    }
    datos.descripcion = descripcion;
  }

  if (Object.keys(datos).length === 0) {
    return undefined;
  }

  return datos;
}

/**
 * Route Handler del BFF para consultar un costo concreto.
 *
 * Responde `200` con el costo o propaga el `404` cuando no existe.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const cliente = await createServerClient();
    const costo = await cliente.get<CostoRespuestaDto>(`/costos/${id}`);

    return NextResponse.json(costo, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_CONSULTAR)
      : respuestaError(500, MENSAJES_CONSULTAR);
  }
}

/**
 * Route Handler del BFF para actualizar parcialmente un costo.
 *
 * Solo transporta campos mutables (el contrato de origen se descarta), delega en el backend
 * y responde `200` con el costo actualizado.
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
    return respuestaError(400, MENSAJES_EDITAR);
  }

  const datos = leerDatosActualizacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_EDITAR);
  }

  try {
    const cliente = await createServerClient();
    const costo = await cliente.patch<CostoRespuestaDto>(
      `/costos/${id}`,
      datos,
    );

    return NextResponse.json(costo, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_EDITAR)
      : respuestaError(500, MENSAJES_EDITAR);
  }
}

/**
 * Route Handler del BFF para eliminar un costo.
 *
 * Responde `200` sin cuerpo cuando el backend confirma el borrado; un `400` indica que el
 * contrato no está activo o que la solicitud es inválida.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const cliente = await createServerClient();
    await cliente.delete<void>(`/costos/${id}`);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_ELIMINAR)
      : respuestaError(500, MENSAJES_ELIMINAR);
  }
}
