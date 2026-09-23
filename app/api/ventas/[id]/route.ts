import { NextResponse } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type VentaRespuestaDto = ApiSchemas["VentaRespuestaDto"];

/** Mensajes de consulta que sobrescriben la base genérica del BFF. */
const MENSAJES_VENTAS = {
  400: "Revisa los datos de la venta.",
  404: "La venta no existe.",
} as const;

/**
 * Route Handler del BFF para consultar una venta concreta.
 *
 * Responde `200` con la venta o propaga el `404` cuando no existe. Las ventas son
 * inmutables: no se exportan `PATCH`, `PUT` ni `DELETE`, de modo que Next responde `405`
 * de forma automática y la interfaz nunca ofrece esas acciones.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const cliente = await createServerClient();
    const venta = await cliente.get<VentaRespuestaDto>(`/ventas/${id}`);

    return NextResponse.json(venta, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_VENTAS)
      : respuestaError(500, MENSAJES_VENTAS);
  }
}
