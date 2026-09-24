# Revisión — Autenticación: refresh token con rotación en el BFF y el middleware

> Work Item: `2026-09-23_19-36__autenticacion-refresh-token-bff` (`type: feature`)
> Agente: reviewer

## Resultado

`done`.

La implementación corresponde a la planificación (`requirements.md`, `design.md`, `tasks.md`):
los 26 requisitos están cubiertos, las 12 tareas están completadas y coinciden con el código, y
la verificación `V1`–`V4` pasa ejecutada por el Reviewer. `bash .rei/init.sh` finaliza con código
de salida `0`.

## Requisitos (R1–R26)

| Requisito | Evidencia |
|-----------|-----------|
| R1 | `shared/api/openapi/api-1.json` es idéntico a la fuente `/home/jose/Documentos/elinain/api-1.json`; `schema.d.ts` se reproduce byte a byte con `npx openapi-typescript … -o` (verificado con `diff`), no fue editado a mano. |
| R2 | `schema.d.ts`: `AccesoRespuestaDto.tokenRefresco`, `RefrescarTokenDto`, `CerrarSesionDto` y las rutas `/api/v1/usuarios/refresh` y `/api/v1/usuarios/logout`. |
| R3 | `login/route.ts` llama `fijarSesion(respuesta, { tokenAcceso, tokenRefresco })` y responde `204` sin cuerpo. |
| R4 | `registro/route.ts` repite el acceso en servidor y fija ambos tokens (`201` sin cuerpo). |
| R5 | `atributosCookie()` fija `httpOnly: true`; los cuerpos de login/registro/logout son `null`; los tokens no viajan al cliente. |
| R6 | `session-refresh.ts` ante `ApiError` 401 en ruta no excluida llama a `renovarSesion()`. |
| R7 | En éxito reintenta `operacion()` una sola vez (test «renueva y reintenta una única vez»). |
| R8 | Devuelve el resultado del reintento y el `ApiError` conserva el estado real. |
| R9 | `renovarSesion` falla con `esSesionInvalida` (400/401) → `server-client.ts` expira ambas cookies y el wrapper relanza el `401` original. |
| R10 | Fallo transitorio (red/5xx) → no se expiran cookies y se relanza el error transitorio, no un 401. |
| R11 | `RUTAS_SIN_REFRESCO = ["/usuarios/acceso", "/usuarios/registro", "/usuarios/refresh", "/usuarios/logout"]`. |
| R12 | `MARGEN_RENOVACION_MS = 60_000` y `decidirNavegacionSesion` (continúa con >60 s; renueva con ≤60 s, vencido o ausente); el middleware la invoca en rutas protegidas. |
| R13 | En éxito el middleware escribe ambas cookies en `request.cookies` (verificado que `RequestCookies.set` actualiza el header `cookie`) y en `response.cookies`, y devuelve `NextResponse.next({ request })`. |
| R14 | `esSesionInvalida` → limpia ambas cookies en la respuesta y redirige a `/login`. |
| R15 | `ApiError` transitorio → `NextResponse.next()` sin limpiar ni redirigir. |
| R16 | Solo renueva en `RUTAS_PROTEGIDAS`; `/login` y `/registro` conservan su lógica; el rechazo definitivo limpia cookies, por lo que no hay bucle. |
| R17 | El middleware usa `crearRenovadorConFetch` con `fetch` nativo; no importa axios ni APIs de Node (imports de `@/shared/api/*` puros + `next/server`). |
| R18 | `logout/route.ts` hace `createServerAnonClient().post("/usuarios/logout", { tokenRefresco })`. |
| R19 | `limpiarSesion` expira `elinain_session` y `elinain_refresh` (`maxAge: 0`). |
| R20 | La revocación va en `try/catch` comentado (best-effort); siempre responde `204` y limpia, sin exponer detalle técnico. |
| R21 | `refresh-coordinator.ts` (single-flight por token con retención corta) se usa en `server-client.ts` y `middleware.ts`. |
| R22 | Cuatro suites puras: `refresh-coordinator` (6), `session-renovacion` (9), `session-refresh` (7) y `session-navegacion` (9) = 31 tests, sin red ni render. |
| R23 | `package.json` y `package-lock.json` sin cambios; no hay dependencias nuevas. |
| R24 | `shared/` solo importa de `shared/`; `middleware.ts` y `app/api/auth/*` respetan las capas; `features/` y `app/(dashboard)` intactos. |
| R25 | Sin cambios en `features/auth/*`, componentes, páginas ni estilos; el diff se limita a contrato, `shared/api`, `app/api/auth` y `middleware.ts`. |
| R26 | `tsc --noEmit` en verde; `grep` de `: any`, `as any`, `@ts-ignore` y `@ts-expect-error` sin coincidencias en los archivos del Work Item. |

## Tareas (T1–T12)

T1–T12 están marcadas `[x]` y cada una tiene su artefacto real: contrato copiado y tipos
regenerados; `session-cookie.ts` ampliado con `REFRESH_COOKIE_NAME`, `TokensSesion` y las tres
opciones; `refresh-coordinator.ts`, `session-renovacion.ts`, `session-refresh.ts` y
`session-navegacion.ts` con sus tests; `server-client.ts` con renovación reactiva y coordinador;
`_lib/sesion.ts`, login, registro y logout; `middleware.ts` con renovación proactiva; y la
evidencia de checkpoints en `impl.md`.

## Arquitectura y convenciones

- `shared/api/*` nuevos son puros/Edge-safe y no importan `next/headers` ni `node:*`;
  `session-refresh.ts` importa `AxiosRequestConfig` como `import type`, por lo que no arrastra
  axios a Edge (el middleware no importa `session-refresh` ni `http-client`).
- `shared/` no importa de `features/` ni de `app/`; el middleware solo importa `shared/` y
  `next/server`.
- Sin `export default` fuera de lo exigido por Next; named exports; DTOs derivados del OpenAPI
  (`ApiSchemas`), sin redefinir tipos.
- Sin `console.log`, `TODO`, `FIXME`, código muerto ni `any`/`@ts-ignore`.
- Errores tipados con `ApiError`; el BFF propaga el código HTTP real y los mensajes en español.

## Checkpoints

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — `All matched files use Prettier code style!` |
| `V2` | `npm run lint` | Pasa — ESLint sin errores (exit 0). |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores (exit 0). |
| `V4` | `npm test` | Pasa — 56 suites / 435 tests (incluye los 31 nuevos). |
| `V5` | Validación manual | Pendiente del usuario (no bloquea la revisión). |

`bash .rei/init.sh`: `Formato (V1)`, `Lint (V2)`, `Tipos (V3)` y `Tests (V4)` en `OK`, código
de salida `0`. No se ejecutó `npm run build` (no es checkpoint de Work Item).

## Observaciones

- **Nota del Implementer sobre `meta.json`:** `impl.md` afirma que la `description` decía «se
  descarta el refresco proactivo en middleware». Verificado: la `description` vigente ya incluye
  el refresco proactivo y no contiene «descarta». La nota quedó desactualizada; no hay
  incoherencia real entre `meta.json`, `requirements.md`, `design.md` y `tasks.md`.
- **Interpretación de tokens sin `exp` (T6):** `decidirNavegacionSesion` distingue un JWT
  decodificable sin `exp` (continúa, vía `sesionVigente`) de un token ausente/malformado
  (renueva o redirige). Coincide con `design.md` y no altera `sesionVigente`.
- **Limitación conocida del diseño:** el single-flight es estado en memoria por proceso; el
  middleware (Edge) y el BFF (Node) no lo comparten. Está documentada en `design.md` y mitigada
  con la propagación del token en la petición y la retención corta.
- `V5` queda a cargo del usuario con el guion de cinco pasos documentado en `impl.md`.

## Acciones requeridas

Ninguna.
