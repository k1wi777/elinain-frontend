import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/shared/api/errors";
import { crearCoordinadorRefresco } from "@/shared/api/refresh-coordinator";
import { sesionVigente } from "@/shared/api/session";
import {
  opcionesCookieAcceso,
  opcionesCookieExpirada,
  opcionesCookieRefresco,
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/shared/api/session-cookie";
import { decidirNavegacionSesion } from "@/shared/api/session-navegacion";
import {
  crearRenovadorConFetch,
  esSesionInvalida,
} from "@/shared/api/session-renovacion";
import { getServerEnv } from "@/shared/config/env";

/** Rutas que requieren una sesión vigente. */
const RUTAS_PROTEGIDAS = [
  "/dashboard",
  "/terceros",
  "/fincas",
  "/contratos",
  "/ventas",
  "/reportes",
];

/** Rutas de acceso que no deben verse con una sesión vigente. */
const RUTAS_ACCESO = ["/login", "/registro"];

/**
 * Coordinador single-flight de la renovación proactiva en el runtime del middleware.
 *
 * Renueva con `fetch` nativo (Edge, sin axios) y resuelve `API_URL` de forma diferida. El
 * estado del coordinador vive en el proceso del middleware.
 */
const coordinarRefresco = crearCoordinadorRefresco(
  crearRenovadorConFetch(() => getServerEnv().apiUrl),
);

/**
 * Guardia de navegación de rutas protegidas.
 *
 * Evalúa las cookies de acceso y de refresco sin consultar al backend: es una guardia de
 * UX, la autorización real la ejerce el backend. En rutas protegidas, si al acceso le
 * quedan 60 s o menos (o está vencido/ausente) y hay refresco, renueva de forma
 * transparente y deja continuar la navegación; solo redirige a `/login` cuando el refresco
 * se rechaza de forma definitiva. `/login` y `/registro` conservan la lógica de
 * redirección de usuarios autenticados y no disparan renovación.
 *
 * Las futuras rutas bajo `(dashboard)` deben añadirse a `RUTAS_PROTEGIDAS` y al matcher.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const tokenAcceso = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const tokenRefresco = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const hayRefresco = tokenRefresco !== undefined && tokenRefresco !== "";
  const { pathname } = request.nextUrl;

  const esRutaProtegida = RUTAS_PROTEGIDAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );
  const esRutaAcceso = RUTAS_ACCESO.includes(pathname);

  if (esRutaAcceso) {
    return sesionVigente(tokenAcceso)
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();
  }

  if (!esRutaProtegida) {
    return NextResponse.next();
  }

  const decision = decidirNavegacionSesion(tokenAcceso, hayRefresco);

  if (decision === "continuar") {
    return NextResponse.next();
  }

  if (decision === "redirigir-login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (tokenRefresco === undefined || tokenRefresco === "") {
    return NextResponse.next();
  }

  try {
    const tokens = await coordinarRefresco(tokenRefresco);

    request.cookies.set(SESSION_COOKIE_NAME, tokens.tokenAcceso);
    request.cookies.set(REFRESH_COOKIE_NAME, tokens.tokenRefresco);

    const response = NextResponse.next({ request });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      tokens.tokenAcceso,
      opcionesCookieAcceso(tokens.tokenAcceso),
    );
    response.cookies.set(
      REFRESH_COOKIE_NAME,
      tokens.tokenRefresco,
      opcionesCookieRefresco(),
    );

    return response;
  } catch (error) {
    if (error instanceof ApiError && esSesionInvalida(error.status)) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set(SESSION_COOKIE_NAME, "", opcionesCookieExpirada());
      response.cookies.set(REFRESH_COOKIE_NAME, "", opcionesCookieExpirada());

      return response;
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/terceros",
    "/terceros/:path*",
    "/fincas",
    "/fincas/:path*",
    "/contratos",
    "/contratos/:path*",
    "/ventas",
    "/ventas/:path*",
    "/reportes",
    "/reportes/:path*",
    "/login",
    "/registro",
  ],
};
