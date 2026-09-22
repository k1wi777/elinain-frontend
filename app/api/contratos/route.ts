import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { LIMITE_POR_DEFECTO, normalizarLimite } from "@/shared/api/pagination";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type PaginaContratosDto = ApiSchemas["PaginaContratosDto"];
type CrearContratoDto = ApiSchemas["CrearContratoDto"];
type ContratoRespuestaDto = ApiSchemas["ContratoRespuestaDto"];

/** Mensajes de contratos que sobrescriben la base genérica del BFF. */
const MENSAJES_CONTRATOS = {
  400: "Revisa los datos del contrato.",
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
 * Indica si un valor es un número finito mayor que cero.
 */
function esNumeroPositivo(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0;
}

/**
 * Valida de forma defensiva el cuerpo de creación.
 *
 * La validación de formato —incluida la suma exacta de porcentajes a 100— vive en el
 * feature `contratos` y en el backend; aquí solo se comprueban tipos y rangos antes de
 * llamar al backend, sin duplicar la regla de negocio de la suma.
 */
function leerDatosCreacion(cuerpo: unknown): CrearContratoDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const {
    tercero_id,
    finca_id,
    fecha_apertura,
    porcentaje_comerciante,
    porcentaje_tercero,
    raza,
    peso_promedio_actual,
    cantidad_actual,
    valor_kilo_referencia,
  } = cuerpo as Record<string, unknown>;

  if (typeof tercero_id !== "string" || tercero_id.trim() === "") {
    return undefined;
  }

  if (typeof finca_id !== "string" || finca_id.trim() === "") {
    return undefined;
  }

  if (typeof fecha_apertura !== "string" || fecha_apertura.trim() === "") {
    return undefined;
  }

  if (!esNumeroEnRango(porcentaje_comerciante, 0, 100)) {
    return undefined;
  }

  if (!esNumeroEnRango(porcentaje_tercero, 0, 100)) {
    return undefined;
  }

  if (raza !== undefined && (typeof raza !== "string" || raza.trim() === "")) {
    return undefined;
  }

  if (
    peso_promedio_actual !== undefined &&
    !esNumeroPositivo(peso_promedio_actual)
  ) {
    return undefined;
  }

  if (cantidad_actual !== undefined && !esNumeroPositivo(cantidad_actual)) {
    return undefined;
  }

  if (
    valor_kilo_referencia !== undefined &&
    !esNumeroPositivo(valor_kilo_referencia)
  ) {
    return undefined;
  }

  return {
    tercero_id,
    finca_id,
    fecha_apertura,
    porcentaje_comerciante,
    porcentaje_tercero,
    ...(typeof raza === "string" ? { raza } : {}),
    ...(peso_promedio_actual !== undefined ? { peso_promedio_actual } : {}),
    ...(cantidad_actual !== undefined ? { cantidad_actual } : {}),
    ...(valor_kilo_referencia !== undefined ? { valor_kilo_referencia } : {}),
  };
}

/**
 * Route Handler del BFF para listar los contratos del comerciante autenticado.
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
    const pagina = await cliente.get<PaginaContratosDto>("/contratos", {
      params: { limite, offset },
    });

    return NextResponse.json(pagina, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_CONTRATOS)
      : respuestaError(500, MENSAJES_CONTRATOS);
  }
}

/**
 * Route Handler del BFF para abrir un contrato.
 *
 * Valida el cuerpo de forma defensiva, delega en el backend y responde `201` con el
 * contrato creado.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError(400, MENSAJES_CONTRATOS);
  }

  const datos = leerDatosCreacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_CONTRATOS);
  }

  try {
    const cliente = await createServerClient();
    const contrato = await cliente.post<ContratoRespuestaDto>(
      "/contratos",
      datos,
    );

    return NextResponse.json(contrato, { status: 201 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_CONTRATOS)
      : respuestaError(500, MENSAJES_CONTRATOS);
  }
}
