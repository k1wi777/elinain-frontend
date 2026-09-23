import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { LIMITE_POR_DEFECTO, normalizarLimite } from "@/shared/api/pagination";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type PaginaCostosDto = ApiSchemas["PaginaCostosDto"];
type CrearCostoDto = ApiSchemas["CrearCostoDto"];
type CostoRespuestaDto = ApiSchemas["CostoRespuestaDto"];

/** Mensajes de registro de costos que sobrescriben la base genérica del BFF. */
const MENSAJES_CREAR = {
  400: "No se pudo registrar el costo: revisa los datos o verifica que el contrato no esté cerrado.",
  404: "El contrato no existe.",
} as const;

/**
 * Convierte un parámetro de consulta en un número, aplicando un valor por defecto si no
 * viene o no es un número finito.
 */
function leerNumero(valor: string | null, porDefecto: number): number {
  if (valor === null || valor.trim() === "") {
    return porDefecto;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : porDefecto;
}

/**
 * Indica si un valor es un número finito mayor que cero.
 */
function esNumeroPositivo(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0;
}

/**
 * Valida de forma defensiva el cuerpo de creación.
 *
 * El formato se valida en el feature `costos` y en el backend; aquí solo se comprueban
 * tipos, textos no vacíos y rangos antes de llamar al backend.
 */
function leerDatosCreacion(cuerpo: unknown): CrearCostoDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { contrato_id, tipo, monto, fecha, descripcion } = cuerpo as Record<
    string,
    unknown
  >;

  if (typeof contrato_id !== "string" || contrato_id.trim() === "") {
    return undefined;
  }

  if (typeof tipo !== "string" || tipo.trim() === "") {
    return undefined;
  }

  if (!esNumeroPositivo(monto)) {
    return undefined;
  }

  if (typeof fecha !== "string" || fecha.trim() === "") {
    return undefined;
  }

  if (typeof descripcion !== "string" || descripcion.trim() === "") {
    return undefined;
  }

  return { contrato_id, tipo, monto, fecha, descripcion };
}

/**
 * Route Handler del BFF para listar los costos del comerciante autenticado.
 *
 * Normaliza la paginación al rango aceptado por el backend y añade el filtro por contrato
 * solo cuando llega informado. Propaga el código HTTP real del backend sin exponer su
 * mensaje crudo.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const parametros = request.nextUrl.searchParams;
  const limite = normalizarLimite(
    leerNumero(parametros.get("limite"), LIMITE_POR_DEFECTO),
  );
  const offset = Math.max(0, leerNumero(parametros.get("offset"), 0));
  const contratoId = parametros.get("contrato_id");

  const filtros: Record<string, string | number> = { limite, offset };

  if (contratoId !== null && contratoId.trim() !== "") {
    filtros.contrato_id = contratoId;
  }

  try {
    const cliente = await createServerClient();
    const pagina = await cliente.get<PaginaCostosDto>("/costos", {
      params: filtros,
    });

    return NextResponse.json(pagina, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status)
      : respuestaError(500);
  }
}

/**
 * Route Handler del BFF para registrar un costo informativo.
 *
 * Valida el cuerpo de forma defensiva, delega en el backend y responde `201` con el costo
 * creado.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError(400, MENSAJES_CREAR);
  }

  const datos = leerDatosCreacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_CREAR);
  }

  try {
    const cliente = await createServerClient();
    const costo = await cliente.post<CostoRespuestaDto>("/costos", datos);

    return NextResponse.json(costo, { status: 201 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_CREAR)
      : respuestaError(500, MENSAJES_CREAR);
  }
}
