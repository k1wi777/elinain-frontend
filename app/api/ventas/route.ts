import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { LIMITE_POR_DEFECTO, normalizarLimite } from "@/shared/api/pagination";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type PaginaVentasDto = ApiSchemas["PaginaVentasDto"];
type CrearVentaDto = ApiSchemas["CrearVentaDto"];
type VentaRespuestaDto = ApiSchemas["VentaRespuestaDto"];

/** Mensajes de ventas que sobrescriben la base genérica del BFF. */
const MENSAJES_VENTAS = {
  400: "Revisa los datos de la venta.",
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
 * Indica si un valor es un número entero mayor que cero.
 */
function esEnteroPositivo(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isInteger(valor) && valor > 0;
}

/**
 * Valida de forma defensiva el cuerpo de creación.
 *
 * El formato se valida en el feature `ventas` y en el backend; aquí solo se comprueban
 * tipos, textos no vacíos y rangos antes de llamar al backend.
 */
function leerDatosCreacion(cuerpo: unknown): CrearVentaDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const {
    contrato_id,
    fecha,
    cantidad_vendida,
    peso_promedio_venta,
    precio_kilo_venta,
  } = cuerpo as Record<string, unknown>;

  if (typeof contrato_id !== "string" || contrato_id.trim() === "") {
    return undefined;
  }

  if (typeof fecha !== "string" || fecha.trim() === "") {
    return undefined;
  }

  if (!esEnteroPositivo(cantidad_vendida)) {
    return undefined;
  }

  if (!esNumeroPositivo(peso_promedio_venta)) {
    return undefined;
  }

  if (!esNumeroPositivo(precio_kilo_venta)) {
    return undefined;
  }

  return {
    contrato_id,
    fecha,
    cantidad_vendida,
    peso_promedio_venta,
    precio_kilo_venta,
  };
}

/**
 * Route Handler del BFF para listar las ventas del comerciante autenticado.
 *
 * Normaliza la paginación al rango aceptado por el backend y añade el filtro por contrato
 * solo cuando llega informado, de modo que sin contrato devuelve todas las ventas. Propaga
 * el código HTTP real del backend sin exponer su mensaje crudo.
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
    const pagina = await cliente.get<PaginaVentasDto>("/ventas", {
      params: filtros,
    });

    return NextResponse.json(pagina, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_VENTAS)
      : respuestaError(500, MENSAJES_VENTAS);
  }
}

/**
 * Route Handler del BFF para registrar una venta.
 *
 * Valida el cuerpo de forma defensiva, delega en el backend —que ejecuta el motor
 * financiero y congela los snapshots— y responde `201` con el desglose completo de la
 * venta creada.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError(400, MENSAJES_VENTAS);
  }

  const datos = leerDatosCreacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_VENTAS);
  }

  try {
    const cliente = await createServerClient();
    const venta = await cliente.post<VentaRespuestaDto>("/ventas", datos);

    return NextResponse.json(venta, { status: 201 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_VENTAS)
      : respuestaError(500, MENSAJES_VENTAS);
  }
}
