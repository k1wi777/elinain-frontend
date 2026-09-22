import { NextResponse, type NextRequest } from "next/server";

import { sesionVigente } from "@/shared/api/session";
import { SESSION_COOKIE_NAME } from "@/shared/api/session-cookie";

/** Rutas que requieren una sesión vigente. */
const RUTAS_PROTEGIDAS = ["/dashboard", "/terceros"];

/** Rutas de acceso que no deben verse con una sesión vigente. */
const RUTAS_ACCESO = ["/login", "/registro"];

/**
 * Guardia de navegación de rutas protegidas.
 *
 * Evalúa la cookie de sesión (presencia y vigencia del `exp` del JWT) sin consultar al
 * backend: es una guardia de UX, la autorización real la ejerce el backend. Las rutas
 * protegidas sin sesión redirigen a `/login`; `/login` y `/registro` con sesión vigente
 * redirigen al dashboard.
 *
 * Las futuras rutas bajo `(dashboard)` deben añadirse a `RUTAS_PROTEGIDAS` y al matcher.
 */
export function middleware(request: NextRequest): NextResponse {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const haySesion = sesionVigente(token);
  const { pathname } = request.nextUrl;

  const esRutaProtegida = RUTAS_PROTEGIDAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );
  const esRutaAcceso = RUTAS_ACCESO.includes(pathname);

  if (esRutaProtegida && !haySesion) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (esRutaAcceso && haySesion) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/terceros",
    "/terceros/:path*",
    "/login",
    "/registro",
  ],
};
