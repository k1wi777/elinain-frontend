import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { LIMITE_POR_DEFECTO, normalizarLimite } from "@/shared/api/pagination";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type PaginaTercerosDto = ApiSchemas["PaginaTercerosDto"];
type CrearTerceroDto = ApiSchemas["CrearTerceroDto"];
type TerceroRespuestaDto = ApiSchemas["TerceroRespuestaDto"];

/** Mensajes de terceros que sobrescriben la base genérica del BFF. */
const MENSAJES_TERCEROS = {
  400: "Revisa los datos del socio de participación.",
  404: "El socio de participación no existe.",
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
 * Valida de forma defensiva el cuerpo de creación.
 *
 * La validación de formato vive en el feature `terceros` y en el backend; aquí solo se
 * comprueba que los tres campos sean strings no vacíos antes de llamar al backend.
 */
function leerDatosCreacion(cuerpo: unknown): CrearTerceroDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { nombre, documento, contacto } = cuerpo as Record<string, unknown>;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return undefined;
  }

  if (typeof documento !== "string" || documento.trim() === "") {
    return undefined;
  }

  if (typeof contacto !== "string" || contacto.trim() === "") {
    return undefined;
  }

  return { nombre, documento, contacto };
}

/**
 * Route Handler del BFF para listar los terceros del comerciante autenticado.
 *
 * Normaliza la paginación al rango aceptado por el backend y propaga el código HTTP real
 * del backend sin exponer su mensaje crudo.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const parametros = request.nextUrl.searchParams;
  const limite = normalizarLimite(
    leerNumero(parametros.get("limite"), LIMITE_POR_DEFECTO),
  );
  const offset = Math.max(0, leerNumero(parametros.get("offset"), 0));

  try {
    const cliente = await createServerClient();
    const pagina = await cliente.get<PaginaTercerosDto>("/terceros", {
      params: { limite, offset },
    });

    return NextResponse.json(pagina, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_TERCEROS)
      : respuestaError(500, MENSAJES_TERCEROS);
  }
}

/**
 * Route Handler del BFF para crear un tercero.
 *
 * Valida el cuerpo de forma defensiva, delega en el backend y responde `201` con el
 * tercero creado.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError(400, MENSAJES_TERCEROS);
  }

  const datos = leerDatosCreacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_TERCEROS);
  }

  try {
    const cliente = await createServerClient();
    const tercero = await cliente.post<TerceroRespuestaDto>("/terceros", datos);

    return NextResponse.json(tercero, { status: 201 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_TERCEROS)
      : respuestaError(500, MENSAJES_TERCEROS);
  }
}
