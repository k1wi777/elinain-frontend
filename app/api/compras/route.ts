import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { LIMITE_POR_DEFECTO, normalizarLimite } from "@/shared/api/pagination";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";

type PaginaComprasDto = ApiSchemas["PaginaComprasDto"];
type CrearCompraDto = ApiSchemas["CrearCompraDto"];
type CompraRespuestaDto = ApiSchemas["CompraRespuestaDto"];

/** Mensajes de compras que sobrescriben la base genérica del BFF. */
const MENSAJES_COMPRAS = {
  400: "Revisa los datos de la compra.",
  404: "La compra no existe.",
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
 * El formato se valida en el feature `compras` y en el backend; aquí solo se comprueban
 * tipos, textos no vacíos y rangos antes de llamar al backend.
 */
function leerDatosCreacion(cuerpo: unknown): CrearCompraDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { contrato_id, fecha, cantidad, peso_promedio, precio_kilo, nota } =
    cuerpo as Record<string, unknown>;

  if (typeof contrato_id !== "string" || contrato_id.trim() === "") {
    return undefined;
  }

  if (typeof fecha !== "string" || fecha.trim() === "") {
    return undefined;
  }

  if (!esEnteroPositivo(cantidad)) {
    return undefined;
  }

  if (!esNumeroPositivo(peso_promedio)) {
    return undefined;
  }

  if (!esNumeroPositivo(precio_kilo)) {
    return undefined;
  }

  if (typeof nota !== "string" || nota.trim() === "") {
    return undefined;
  }

  return {
    contrato_id,
    fecha,
    cantidad,
    peso_promedio,
    precio_kilo,
    nota,
  };
}

/**
 * Route Handler del BFF para listar las compras del comerciante autenticado.
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
    const pagina = await cliente.get<PaginaComprasDto>("/compras", {
      params: filtros,
    });

    return NextResponse.json(pagina, { status: 200 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_COMPRAS)
      : respuestaError(500, MENSAJES_COMPRAS);
  }
}

/**
 * Route Handler del BFF para registrar una compra.
 *
 * Valida el cuerpo de forma defensiva, delega en el backend y responde `201` con la compra
 * creada, incluido el `valor_total` que calcula el backend.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError(400, MENSAJES_COMPRAS);
  }

  const datos = leerDatosCreacion(cuerpo);

  if (datos === undefined) {
    return respuestaError(400, MENSAJES_COMPRAS);
  }

  try {
    const cliente = await createServerClient();
    const compra = await cliente.post<CompraRespuestaDto>("/compras", datos);

    return NextResponse.json(compra, { status: 201 });
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_COMPRAS)
      : respuestaError(500, MENSAJES_COMPRAS);
  }
}
