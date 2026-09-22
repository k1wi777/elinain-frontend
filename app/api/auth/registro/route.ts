import { NextResponse } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { createServerClient } from "@/shared/api/server-client";
import type { ApiSchemas } from "@/shared/api/types";
import { respuestaError } from "@/app/api/auth/_lib/respuestas";
import { fijarSesion } from "@/app/api/auth/_lib/sesion";

type CrearUsuarioDto = ApiSchemas["CrearUsuarioDto"];
type UsuarioRegistradoDto = ApiSchemas["UsuarioRegistradoDto"];
type AccesoRespuestaDto = ApiSchemas["AccesoRespuestaDto"];

/**
 * Valida de forma defensiva el cuerpo del registro.
 *
 * El formato y la longitud mínima de la contraseña se validan en el feature `auth` y en
 * el backend; aquí solo se comprueba que existan los campos.
 */
function leerDatosRegistro(cuerpo: unknown): CrearUsuarioDto | undefined {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return undefined;
  }

  const { nombre, email, password } = cuerpo as Record<string, unknown>;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return undefined;
  }

  if (typeof email !== "string" || email.trim() === "") {
    return undefined;
  }

  if (typeof password !== "string" || password === "") {
    return undefined;
  }

  return { nombre, email, password };
}

/**
 * Route Handler del BFF para el registro.
 *
 * Registra al comerciante y, como el endpoint de registro no emite token, repite el
 * acceso en el servidor para dejar la cookie httpOnly fijada. Responde `201` sin exponer
 * el token; un `409` del backend se propaga sin crear sesión.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError(400);
  }

  const datos = leerDatosRegistro(cuerpo);

  if (datos === undefined) {
    return respuestaError(400);
  }

  try {
    const cliente = await createServerClient();
    await cliente.post<UsuarioRegistradoDto>("/usuarios/registro", datos);
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status)
      : respuestaError(500);
  }

  try {
    const cliente = await createServerClient();
    const acceso = await cliente.post<AccesoRespuestaDto>("/usuarios/acceso", {
      email: datos.email,
      password: datos.password,
    });

    const respuesta = new NextResponse(null, { status: 201 });
    fijarSesion(respuesta, acceso.tokenAcceso);

    return respuesta;
  } catch (error) {
    return error instanceof ApiError
      ? respuestaError(error.status)
      : respuestaError(500);
  }
}
