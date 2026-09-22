import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { LIMITE_POR_DEFECTO, normalizarLimite } from "@/shared/api/pagination";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type PaginaFincasDto = ApiSchemas["PaginaFincasDto"];
type CrearFincaDto = ApiSchemas["CrearFincaDto"];
type FincaRespuestaDto = ApiSchemas["FincaRespuestaDto"];

/** Mensajes de fincas que sobrescriben la base genérica del BFF. */
const MENSAJES_FINCAS = {
  400: "Revisa los datos de la finca.",
  404: "La finca no existe.",
} as const;

/** Rangos geográficos aceptados por el backend. */
const LATITUD_MINIMA = -90;
const LATITUD_MAXIMA = 90;
const LONGITUD_MINIMA = -180;
const LONGITUD_MAXIMA = 180;

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
 * Valida de forma defensiva el cuerpo de creación.
 *
 * La validación de formato vive en el feature `fincas` y en el backend; aquí solo se
 * comprueba que los tres campos de texto sean strings no vacíos y que las coordenadas
 * sean números finitos dentro de rango antes de llamar al backend.
 */
function leerDatosCreacion(cuerpo: unknown): CrearFincaDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { tercero_id, nombre, direccion, latitud, longitud } = cuerpo as Record<
    string,
    unknown
  >;

  if (typeof tercero_id !== "string" || tercero_id.trim() === "") {
    return undefined;
  }

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return undefined;
  }

  if (typeof direccion !== "string" || direccion.trim() === "") {
    return undefined;
  }

  if (!esNumeroEnRango(latitud, LATITUD_MINIMA, LATITUD_MAXIMA)) {
    return undefined;
  }

  if (!esNumeroEnRango(longitud, LONGITUD_MINIMA, LONGITUD_MAXIMA)) {
    return undefined;
  }

  return { tercero_id, nombre, direccion, latitud, longitud };
}

/**
 * Route Handler del BFF para listar las fincas del comerciante autenticado.
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
    const pagina = await cliente.get<PaginaFincasDto>("/fincas", {
      params: { limite, offset },
    });

    return NextResponse.json(pagina, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_FINCAS)
      : respuestaError(500, MENSAJES_FINCAS);
  }
}

/**
 * Route Handler del BFF para crear una finca.
 *
 * Valida el cuerpo de forma defensiva, delega en el backend y responde `201` con la finca
 * creada.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError(400, MENSAJES_FINCAS);
  }

  const datos = leerDatosCreacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_FINCAS);
  }

  try {
    const cliente = await createServerClient();
    const finca = await cliente.post<FincaRespuestaDto>("/fincas", datos);

    return NextResponse.json(finca, { status: 201 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_FINCAS)
      : respuestaError(500, MENSAJES_FINCAS);
  }
}
