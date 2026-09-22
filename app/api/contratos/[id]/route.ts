import { NextResponse } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type ActualizarContratoDto = ApiSchemas["ActualizarContratoDto"];
type ContratoRespuestaDto = ApiSchemas["ContratoRespuestaDto"];

/** Mensajes de consulta/edición que sobrescriben la base genérica del BFF. */
const MENSAJES_CONTRATOS = {
  400: "Revisa los datos del contrato.",
  404: "El contrato no existe.",
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
 * Lee únicamente los campos mutables (`estado`, `fecha_cierre`, `raza`,
 * `peso_promedio_actual`, `cantidad_actual` y `valor_kilo_referencia`) y descarta
 * cualquier otro, en particular `tercero_id`, `finca_id`, `fecha_apertura` y los
 * porcentajes, que son inmutables. Exige al menos un campo mutable.
 */
function leerDatosActualizacion(
  cuerpo: unknown,
): ActualizarContratoDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const {
    estado,
    fecha_cierre,
    raza,
    peso_promedio_actual,
    cantidad_actual,
    valor_kilo_referencia,
  } = cuerpo as Record<string, unknown>;
  const datos: ActualizarContratoDto = {};

  if (estado !== undefined) {
    if (estado !== "activo" && estado !== "cerrado") {
      return undefined;
    }
    datos.estado = estado;
  }

  if (fecha_cierre !== undefined) {
    if (typeof fecha_cierre !== "string" || fecha_cierre.trim() === "") {
      return undefined;
    }
    datos.fecha_cierre = fecha_cierre;
  }

  if (raza !== undefined) {
    if (typeof raza !== "string" || raza.trim() === "") {
      return undefined;
    }
    datos.raza = raza;
  }

  if (peso_promedio_actual !== undefined) {
    if (!esNumeroPositivo(peso_promedio_actual)) {
      return undefined;
    }
    datos.peso_promedio_actual = peso_promedio_actual;
  }

  if (cantidad_actual !== undefined) {
    if (!esNumeroPositivo(cantidad_actual)) {
      return undefined;
    }
    datos.cantidad_actual = cantidad_actual;
  }

  if (valor_kilo_referencia !== undefined) {
    if (!esNumeroPositivo(valor_kilo_referencia)) {
      return undefined;
    }
    datos.valor_kilo_referencia = valor_kilo_referencia;
  }

  if (Object.keys(datos).length === 0) {
    return undefined;
  }

  return datos;
}

/**
 * Route Handler del BFF para consultar un contrato concreto.
 *
 * Responde `200` con el contrato o propaga el `404` cuando no existe.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const cliente = await createServerClient();
    const contrato = await cliente.get<ContratoRespuestaDto>(
      `/contratos/${id}`,
    );

    return NextResponse.json(contrato, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_CONTRATOS)
      : respuestaError(500, MENSAJES_CONTRATOS);
  }
}

/**
 * Route Handler del BFF para actualizar parcialmente un contrato.
 *
 * Solo transporta campos mutables (los inmutables se descartan), delega en el backend y
 * responde `200` con el contrato actualizado. No se expone `DELETE`: un contrato se
 * cierra cambiando su estado, no se elimina.
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
    return respuestaError(400, MENSAJES_CONTRATOS);
  }

  const datos = leerDatosActualizacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_CONTRATOS);
  }

  try {
    const cliente = await createServerClient();
    const contrato = await cliente.patch<ContratoRespuestaDto>(
      `/contratos/${id}`,
      datos,
    );

    return NextResponse.json(contrato, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_CONTRATOS)
      : respuestaError(500, MENSAJES_CONTRATOS);
  }
}
