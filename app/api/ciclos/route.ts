import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { LIMITE_POR_DEFECTO, normalizarLimite } from "@/shared/api/pagination";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type PaginaCiclosDto = ApiSchemas["PaginaCiclosDto"];
type CrearCicloDto = ApiSchemas["CrearCicloDto"];
type CicloRespuestaDto = ApiSchemas["CicloRespuestaDto"];

/** Mensajes de ciclos que sobrescriben la base genérica del BFF. */
const MENSAJES_CICLOS = {
  400: "No se pudo guardar el ciclo: revisa los datos o verifica que el contrato no esté cerrado.",
  404: "El ciclo no existe.",
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
 * El formato se valida en el feature `ciclos` y en el backend; aquí solo se comprueban
 * tipos, textos no vacíos y rangos antes de llamar al backend. El peso observado y las
 * notas son opcionales.
 */
function leerDatosCreacion(cuerpo: unknown): CrearCicloDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { contrato_id, fecha, peso_observado, notas } = cuerpo as Record<
    string,
    unknown
  >;

  if (typeof contrato_id !== "string" || contrato_id.trim() === "") {
    return undefined;
  }

  if (typeof fecha !== "string" || fecha.trim() === "") {
    return undefined;
  }

  const datos: CrearCicloDto = { contrato_id, fecha };

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

  return datos;
}

/**
 * Route Handler del BFF para listar los ciclos del comerciante autenticado.
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
    const pagina = await cliente.get<PaginaCiclosDto>("/ciclos", {
      params: filtros,
    });

    return NextResponse.json(pagina, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_CICLOS)
      : respuestaError(500, MENSAJES_CICLOS);
  }
}

/**
 * Route Handler del BFF para registrar un ciclo.
 *
 * Valida el cuerpo de forma defensiva, delega en el backend y responde `201` con el ciclo
 * creado.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError(400, MENSAJES_CICLOS);
  }

  const datos = leerDatosCreacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_CICLOS);
  }

  try {
    const cliente = await createServerClient();
    const ciclo = await cliente.post<CicloRespuestaDto>("/ciclos", datos);

    return NextResponse.json(ciclo, { status: 201 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_CICLOS)
      : respuestaError(500, MENSAJES_CICLOS);
  }
}
