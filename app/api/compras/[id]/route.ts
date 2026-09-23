import { NextResponse } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type ActualizarCompraDto = ApiSchemas["ActualizarCompraDto"];
type CompraRespuestaDto = ApiSchemas["CompraRespuestaDto"];

/** Mensajes de consulta/edición que sobrescriben la base genérica del BFF. */
const MENSAJES_COMPRAS = {
  400: "Revisa los datos de la compra.",
  404: "La compra no existe.",
} as const;

/** Mensajes de edición: el `409` indica que el contrato ya tiene ventas registradas. */
const MENSAJES_EDITAR = {
  400: "Revisa los datos de la compra.",
  404: "La compra no existe.",
  409: "No se puede modificar la compra: el contrato ya tiene ventas registradas.",
} as const;

/** Mensajes de eliminación: el `409` indica que el contrato ya tiene ventas registradas. */
const MENSAJES_ELIMINAR = {
  400: "Revisa los datos de la compra.",
  404: "La compra no existe.",
  409: "No se puede eliminar la compra: el contrato ya tiene ventas registradas.",
} as const;

/**
 * Indica si un valor es un número finito mayor que cero.
 */
function esNumeroPositivo(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0;
}

/**
 * Indica si un valor es un número entero mayor que cero.
 */
function esEnteroPositivo(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isInteger(valor) && valor > 0;
}

/**
 * Valida de forma defensiva el cuerpo de actualización.
 *
 * Lee únicamente los campos mutables (`fecha`, `cantidad`, `peso_promedio`, `precio_kilo` y
 * `nota`) y descarta cualquier otro, en particular `contrato_id`, que es inmutable. Exige
 * al menos un campo mutable.
 */
function leerDatosActualizacion(
  cuerpo: unknown,
): ActualizarCompraDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { fecha, cantidad, peso_promedio, precio_kilo, nota } =
    cuerpo as Record<string, unknown>;
  const datos: ActualizarCompraDto = {};

  if (fecha !== undefined) {
    if (typeof fecha !== "string" || fecha.trim() === "") {
      return undefined;
    }
    datos.fecha = fecha;
  }

  if (cantidad !== undefined) {
    if (!esEnteroPositivo(cantidad)) {
      return undefined;
    }
    datos.cantidad = cantidad;
  }

  if (peso_promedio !== undefined) {
    if (!esNumeroPositivo(peso_promedio)) {
      return undefined;
    }
    datos.peso_promedio = peso_promedio;
  }

  if (precio_kilo !== undefined) {
    if (!esNumeroPositivo(precio_kilo)) {
      return undefined;
    }
    datos.precio_kilo = precio_kilo;
  }

  if (nota !== undefined) {
    if (typeof nota !== "string" || nota.trim() === "") {
      return undefined;
    }
    datos.nota = nota;
  }

  if (Object.keys(datos).length === 0) {
    return undefined;
  }

  return datos;
}

/**
 * Route Handler del BFF para consultar una compra concreta.
 *
 * Responde `200` con la compra o propaga el `404` cuando no existe.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const cliente = await createServerClient();
    const compra = await cliente.get<CompraRespuestaDto>(`/compras/${id}`);

    return NextResponse.json(compra, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_COMPRAS)
      : respuestaError(500, MENSAJES_COMPRAS);
  }
}

/**
 * Route Handler del BFF para actualizar parcialmente una compra.
 *
 * Solo transporta campos mutables (el contrato de origen se descarta), delega en el backend
 * y responde `200` con la compra actualizada.
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
    return respuestaError(400, MENSAJES_COMPRAS);
  }

  const datos = leerDatosActualizacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_COMPRAS);
  }

  try {
    const cliente = await createServerClient();
    const compra = await cliente.patch<CompraRespuestaDto>(
      `/compras/${id}`,
      datos,
    );

    return NextResponse.json(compra, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_EDITAR)
      : respuestaError(500, MENSAJES_EDITAR);
  }
}

/**
 * Route Handler del BFF para eliminar una compra.
 *
 * Responde `200` sin cuerpo cuando el backend confirma el borrado; un `409` indica que el
 * contrato ya tiene ventas registradas y la compra no puede eliminarse.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const cliente = await createServerClient();
    await cliente.delete<void>(`/compras/${id}`);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_ELIMINAR)
      : respuestaError(500, MENSAJES_ELIMINAR);
  }
}
