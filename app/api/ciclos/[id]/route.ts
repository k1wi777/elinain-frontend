import { NextResponse } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type ActualizarCicloDto = ApiSchemas["ActualizarCicloDto"];
type CicloRespuestaDto = ApiSchemas["CicloRespuestaDto"];

/** Mensajes de consulta que sobrescriben la base genérica del BFF. */
const MENSAJES_CICLOS = {
  404: "El ciclo no existe.",
} as const;

/** Mensajes de edición: el `400` agrupa datos inválidos y contrato cerrado. */
const MENSAJES_EDITAR = {
  400: "No se pudo guardar el ciclo: revisa los datos o verifica que el contrato no esté cerrado.",
  404: "El ciclo no existe.",
} as const;

/** Mensajes de eliminación: el `400` agrupa solicitud inválida y contrato cerrado. */
const MENSAJES_ELIMINAR = {
  400: "No se pudo eliminar el ciclo: revisa la solicitud o verifica el estado del contrato.",
  404: "El ciclo no existe.",
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
 * Lee únicamente los campos mutables (`fecha`, `peso_observado` y `notas`) y descarta
 * cualquier otro, en particular `contrato_id`, que es inmutable. Exige al menos un campo
 * mutable.
 */
function leerDatosActualizacion(
  cuerpo: unknown,
): ActualizarCicloDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { fecha, peso_observado, notas } = cuerpo as Record<string, unknown>;
  const datos: ActualizarCicloDto = {};

  if (fecha !== undefined) {
    if (typeof fecha !== "string" || fecha.trim() === "") {
      return undefined;
    }
    datos.fecha = fecha;
  }

  if (peso_observado !== undefined && peso_observado !== null) {
    if (!esNumeroPositivo(peso_observado)) {
      return undefined;
    }
    datos.peso_observado = peso_observado;
  }

  if (notas !== undefined) {
    if (notas !== null && typeof notas !== "string") {
      return undefined;
    }
    datos.notas = notas;
  }

  if (Object.keys(datos).length === 0) {
    return undefined;
  }

  return datos;
}

/**
 * Route Handler del BFF para consultar un ciclo concreto.
 *
 * Responde `200` con el ciclo o propaga el `404` cuando no existe.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const cliente = await createServerClient();
    const ciclo = await cliente.get<CicloRespuestaDto>(`/ciclos/${id}`);

    return NextResponse.json(ciclo, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_CICLOS)
      : respuestaError(500, MENSAJES_CICLOS);
  }
}

/**
 * Route Handler del BFF para actualizar parcialmente un ciclo.
 *
 * Solo transporta campos mutables (el contrato de origen se descarta), delega en el backend
 * y responde `200` con el ciclo actualizado.
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
    return respuestaError(400, MENSAJES_CICLOS);
  }

  const datos = leerDatosActualizacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_CICLOS);
  }

  try {
    const cliente = await createServerClient();
    const ciclo = await cliente.patch<CicloRespuestaDto>(
      `/ciclos/${id}`,
      datos,
    );

    return NextResponse.json(ciclo, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_EDITAR)
      : respuestaError(500, MENSAJES_EDITAR);
  }
}

/**
 * Route Handler del BFF para eliminar un ciclo.
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
    await cliente.delete<void>(`/ciclos/${id}`);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_ELIMINAR)
      : respuestaError(500, MENSAJES_ELIMINAR);
  }
}
