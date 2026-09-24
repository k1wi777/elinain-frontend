import { NextResponse } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/_lib/respuestas";
import { fijarSesion } from "@/app/api/auth/_lib/sesion";

type CredencialesAccesoDto = ApiSchemas["CredencialesAccesoDto"];
type AccesoRespuestaDto = ApiSchemas["AccesoRespuestaDto"];

/** Mensajes de acceso que sobrescriben la base genérica del BFF. */
const MENSAJES_ACCESO = {
  401: "Correo o contraseña incorrectos.",
  409: "Este correo ya está registrado.",
} as const;

/**
 * Valida de forma defensiva el cuerpo del acceso.
 *
 * La validación de formato vive en el feature `auth`; aquí solo se comprueba que existan
 * las credenciales antes de llamar al backend.
 */
function leerCredenciales(cuerpo: unknown): CredencialesAccesoDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { email, password } = cuerpo as Record<string, unknown>;

  if (typeof email !== "string" || email.trim() === "") {
    return undefined;
  }

  if (typeof password !== "string" || password === "") {
    return undefined;
  }

  return { email, password };
}

/**
 * Route Handler del BFF para el acceso: delega en el backend, guarda el token en la
 * cookie httpOnly y responde sin exponerlo.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError(400);
  }

  const credenciales = leerCredenciales(cuerpo);

  if (credenciales === undefined) {
    return respuestaError(400);
  }

  try {
    const cliente = await createServerClient();
    const acceso = await cliente.post<AccesoRespuestaDto>(
      "/usuarios/acceso",
      credenciales,
    );

    const respuesta = new NextResponse(null, { status: 204 });
    fijarSesion(respuesta, {
      tokenAcceso: acceso.tokenAcceso,
      tokenRefresco: acceso.tokenRefresco,
    });

    return respuesta;
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status, MENSAJES_ACCESO)
      : respuestaError(500, MENSAJES_ACCESO);
  }
}
