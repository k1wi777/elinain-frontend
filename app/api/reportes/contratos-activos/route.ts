import { NextResponse } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type ReporteContratosActivosDto = ApiSchemas["ReporteContratosActivosDto"];

/**
 * Route Handler del BFF para el reporte de contratos activos del comerciante autenticado.
 *
 * Delega en el backend con la cookie httpOnly adjunta por `createServerClient` y
 * propaga el código HTTP real sin exponer su mensaje crudo.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const cliente = await createServerClient();
    const reporte = await cliente.get<ReporteContratosActivosDto>(
      "/reportes/contratos-activos",
    );

    return NextResponse.json(reporte, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status)
      : respuestaError(500);
  }
}
