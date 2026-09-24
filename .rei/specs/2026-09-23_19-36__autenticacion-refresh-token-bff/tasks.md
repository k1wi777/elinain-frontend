# Tareas — Autenticación: refresh token con rotación en el BFF y el middleware

> Work Item: `2026-09-23_19-36__autenticacion-refresh-token-bff` (`type: feature`)
>
> Pasos ordenados para el Implementer. Marcar cada tarea `[x]` inmediatamente al terminarla.

---

- [x] **T1 — Incorporar el contrato actualizado.** Copiar `/home/jose/Documentos/elinain/api-1.json`
  sobre `shared/api/openapi/api-1.json` y ejecutar `npm run generate:api` para regenerar
  `shared/api/openapi/schema.d.ts` (no editarlo a mano). Verificar que los tipos incluyen
  `tokenRefresco` en `AccesoRespuestaDto`, `RefrescarTokenDto`, `CerrarSesionDto` y las rutas
  `/usuarios/refresh` y `/usuarios/logout`. (R1, R2)

- [x] **T2 — Ampliar `shared/api/session-cookie.ts` (Edge-safe).** Añadir
  `REFRESH_COOKIE_NAME = "elinain_refresh"`, el tipo `TokensSesion = { tokenAcceso;
  tokenRefresco }` y las opciones `opcionesCookieAcceso(tokenAcceso)`,
  `opcionesCookieRefresco()` y `opcionesCookieExpirada()` (httpOnly, sameSite lax, secure por
  `getServerEnv().isProduction`, path `/`; `maxAge` del acceso por `exp` del JWT, refresco sin
  `maxAge`, limpieza `maxAge: 0`). Mantener el módulo sin `next/headers`. (R3, R5, R13, R19)

- [x] **T3 — Crear `shared/api/refresh-coordinator.ts`.** `crearCoordinadorRefresco<T>(renovar,
  opciones?)` con `Map` de promesas a nivel de módulo, single-flight por token de refresco,
  eliminación ante rechazo y retención corta del éxito con expiración perezosa. Crear
  `shared/api/__tests__/refresh-coordinator.test.ts` cubriendo concurrencia, tokens distintos,
  fallo y retención. (R21, R22)

- [x] **T4 — Crear `shared/api/session-renovacion.ts`.** `esSesionInvalida(status)` (`400`/`401`)
  y `crearRenovadorConFetch(obtenerBaseUrl, fetchFn?)`: `POST` a `/usuarios/refresh` con
  `buildUrl` + `fetch` nativo, desenvuelve con `desenvolverRespuesta`, devuelve `TokensSesion`
  o lanza `ApiError` (definitivo en 400/401; transitorio en red/5xx/200 malformado). Resolver
  la base URL de forma diferida. Crear `shared/api/__tests__/session-renovacion.test.ts` con
  `fetch` falso. (R12, R13, R14, R15, R17, R22)

- [x] **T5 — Crear `shared/api/session-refresh.ts`.** `crearClienteConRefresco(cliente,
  renovarSesion, rutasSinRefresco)` que, ante `ApiError` 401 en ruta no excluida, renueva y
  reintenta una única vez; si el fallo es de sesión inválida relanza el 401 original; si es
  transitorio relanza el error transitorio; los demás errores se propagan. Crear
  `shared/api/__tests__/session-refresh.test.ts` con un `HttpClient` falso. (R6, R7, R8, R9,
  R10, R11, R22)

- [x] **T6 — Crear `shared/api/session-navegacion.ts`.** `MARGEN_RENOVACION_MS = 60_000`,
  `DecisionNavegacion` y `decidirNavegacionSesion(tokenAcceso, hayTokenRefresco, ahoraMs =
  Date.now(), margenMs = MARGEN_RENOVACION_MS)`: continúa si al acceso le quedan más de 60 s;
  renueva si está vencido, ausente o le quedan ≤ 60 s y hay refresco; redirige a login si no
  hay refresco. Calcular la holgura con `obtenerExpiracionJwt` sin alterar `sesionVigente`.
  Crear `shared/api/__tests__/session-navegacion.test.ts` con los cuatro casos (>60 s →
  continuar; ≤60 s → renovar; vencido → renovar; sin refresco → redirigir) y el margen
  configurable. (R12, R16, R22)

- [x] **T7 — Cablear `shared/api/server-client.ts` (refresco reactivo).** Leer ambas cookies,
  exponer `tokenAcceso` mutable en `getAuthToken`, crear el coordinador a nivel de módulo sobre
  `crearRenovadorConFetch(() => getServerEnv().apiUrl)`, y envolver el cliente con
  `crearClienteConRefresco(..., RUTAS_SIN_REFRESCO)` (`/usuarios/acceso`, `/usuarios/registro`,
  `/usuarios/refresh`, `/usuarios/logout`). `renovarSesion()` actualiza `tokenAcceso` y escribe
  ambas cookies con `cookies().set(...)`; en fallo definitivo las expira (en transitorio no).
  Mantener `createServerAnonClient()` para el logout. (R6, R8, R9, R10, R11, R21)

- [x] **T8 — Actualizar `app/api/auth/_lib/sesion.ts`.** `fijarSesion(response, tokens:
  TokensSesion)` escribe ambas cookies con las opciones compartidas; `limpiarSesion(response)`
  escribe ambas con `opcionesCookieExpirada()`. (R3, R4, R19)

- [x] **T9 — Actualizar login y registro.** En `login/route.ts` y `registro/route.ts`, pasar
  `{ tokenAcceso, tokenRefresco }` a `fijarSesion`; mantener 204/201 sin cuerpo y el auto-login
  del registro. (R3, R4, R5)

- [x] **T10 — Reescribir `app/api/auth/logout/route.ts`.** Leer la cookie de refresco; si
  existe, `createServerAnonClient().post("/usuarios/logout", { tokenRefresco })` en best-effort
  (un fallo no interrumpe, con comentario que lo justifique); responder 204 y `limpiarSesion`.
  (R18, R19, R20)

- [x] **T11 — Renovación proactiva en `middleware.ts`.** Mantener la guardia de rutas
  (`esRutaAcceso`/`esRutaProtegida`) y añadir: en rutas protegidas, usar
  `decidirNavegacionSesion` con el margen por defecto de 60 s; en `"renovar"`, ejecutar el
  coordinador con `crearRenovadorConFetch`; en éxito, escribir ambas cookies en `request.cookies`
  y `response.cookies` y devolver `NextResponse.next({ request })`; en rechazo definitivo
  (`esSesionInvalida`), limpiar cookies y redirigir a `/login`; en fallo transitorio, continuar
  sin limpiar ni redirigir. No renovar en `/login`/`/registro` ni en rutas no protegidas.
  (R12, R13, R14, R15, R16, R17)

- [x] **T12 — Cerrar checkpoints.** Ejecutar `npm run format` y luego `V1` `npm run
  format:check`, `V2` `npm run lint`, `V3` `npm run typecheck`, `V4` `npm test`. Documentar
  evidencia en `.rei/progress/work-items/2026-09-23_19-36__autenticacion-refresh-token-bff/impl.md`
  y dejar el guion de `V5` (login/registro, navegación con acceso vencido o a ≤60 s de vencer y
  refresco válido, refresco rechazado, fallo transitorio y logout). (R22, R26)
