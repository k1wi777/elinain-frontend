# Implementación — Autenticación: refresh token con rotación en el BFF y el middleware

> Work Item: `2026-09-23_19-36__autenticacion-refresh-token-bff` (`type: feature`)
>
> Agente: `implementer`. Tareas T1–T12 de `tasks.md` completadas.

---

## Resumen

Se incorporó el contrato OpenAPI actualizado (par de tokens + endpoints de refresco y logout),
se completó el ciclo de vida de la sesión con dos tokens en cookies httpOnly y se implementó el
refresco automático en dos frentes que comparten los mismos módulos puros:

- **Proactivo en `middleware.ts` (Edge)**: al navegar a una ruta protegida con el acceso
  ausente/vencido o a ≤ 60 s de vencer y con refresco presente, renueva con `fetch` nativo y
  deja continuar la navegación; solo redirige a `/login` si el refresco se rechaza de forma
  definitiva.
- **Reactivo en `shared/api/server-client.ts`**: ante un `401` en una operación autenticada,
  renueva con el token de refresco, actualiza ambas cookies y reintenta una única vez.

Login y registro guardan ambos tokens; logout revoca el refresco en el backend (best-effort) y
limpia ambas cookies. Sin dependencias nuevas, sin cambios de UI y sin `any`.

---

## Archivos

### Nuevos

- `shared/api/refresh-coordinator.ts` — single-flight genérico.
- `shared/api/session-renovacion.ts` — ejecutor de `/usuarios/refresh` con `fetch` (Edge-safe).
- `shared/api/session-refresh.ts` — wrapper de reintento reactivo del `HttpClient`.
- `shared/api/session-navegacion.ts` — decisión de navegación con margen de 60 s.
- `shared/api/__tests__/refresh-coordinator.test.ts`
- `shared/api/__tests__/session-renovacion.test.ts`
- `shared/api/__tests__/session-refresh.test.ts`
- `shared/api/__tests__/session-navegacion.test.ts`

### Modificados

- `shared/api/openapi/api-1.json` — copiado desde `/home/jose/Documentos/elinain/api-1.json`.
- `shared/api/openapi/schema.d.ts` — regenerado con `npm run generate:api` (no editado a mano).
- `shared/api/session-cookie.ts` — `REFRESH_COOKIE_NAME`, `TokensSesion` y opciones compartidas.
- `shared/api/server-client.ts` — renovación reactiva, coordinador y `createServerAnonClient`.
- `app/api/auth/_lib/sesion.ts` — `fijarSesion(response, tokens)` / `limpiarSesion`.
- `app/api/auth/login/route.ts` y `app/api/auth/registro/route.ts` — guardan ambos tokens.
- `app/api/auth/logout/route.ts` — revocación best-effort + limpieza.
- `middleware.ts` — renovación proactiva Edge.

### Sin cambios (respetado)

`features/auth/*`, `shared/api/http-client.ts`, `shared/api/session.ts`,
`app/api/geocodificacion/*` y el resto de `app/api/*`. `shared/` no importa de `features/` ni
de `app/`.

---

## Cambios relevantes

- **T1**: el contrato regenerado expone `AccesoRespuestaDto.tokenRefresco`, `RefrescarTokenDto`,
  `CerrarSesionDto` y las operaciones `/api/v1/usuarios/refresh` y `/api/v1/usuarios/logout`.
- **T2/T8**: las opciones de cookie se centralizan en `session-cookie.ts` (Edge-safe, sin
  `next/headers`): `httpOnly`, `sameSite: "lax"`, `secure` según producción, `path: "/"`,
  `maxAge` del acceso por `exp` del JWT, refresco como cookie de sesión y limpieza con
  `maxAge: 0`. `_lib/sesion.ts` las reutiliza para fijar/limpiar ambos tokens.
- **T3**: coordinador con `Map` a nivel de módulo, single-flight por token, eliminación ante
  rechazo y retención de 15 s con expiración perezosa.
- **T4**: `esSesionInvalida(status)` → `400`/`401`. El renovador usa `buildUrl` +
  `desenvolverRespuesta`; `400`/`401` son definitivos y red/`5xx`/200 malformado (tratado como
  `500`) son transitorios. La base URL se resuelve por llamada.
- **T5**: `crearClienteConRefresco` renueva y reintenta una sola vez ante `401` en ruta no
  excluida; rechazo definitivo → relanza el `401` original; transitorio → relanza el error
  transitorio; el resto se propaga.
- **T7**: `server-client.ts` envuelve el cliente autenticado con las rutas
  `/usuarios/acceso`, `/usuarios/registro`, `/usuarios/refresh`, `/usuarios/logout` excluidas;
  éxito de renovación actualiza `tokenAcceso` y escribe ambas cookies, fallo definitivo las
  expira, fallo transitorio no las toca.
- **T10**: el logout lee el refresco y llama `POST /usuarios/logout` con
  `createServerAnonClient()`; un fallo se ignora (comentado) y siempre responde `204` limpiando
  ambas cookies.
- **T11**: `middleware` pasa a `async`; en rutas protegidas decide con `decidirNavegacionSesion`;
  al renovar escribe cookies en `request.cookies` y `response.cookies` y devuelve
  `NextResponse.next({ request })`; rechazo definitivo limpia y redirige a `/login`; transitorio
  continúa. `/login` y `/registro` conservan su lógica y no renuevan.

---

## Verificación

Todos los checkpoints ejecutados sobre el árbol final (tras `npm run format`).

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — «All matched files use Prettier code style!». |
| `V2` | `npm run lint` | Pasa — ESLint sin errores ni warnings. |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Pasa — 56 suites, 435 tests (incluye los 31 tests nuevos: 6 + 9 + 7 + 9). |
| `V5` | Validación manual | Pendiente (guion abajo). |

`bash .rei/init.sh` también cierra con V1–V4 en verde. No se ejecutó `npm run build`.

### Guion de `V5` (validación manual)

1. **Login/registro guardan ambos tokens**: iniciar sesión y comprobar en DevTools que
   `elinain_session` y `elinain_refresh` son `HttpOnly`; la respuesta 204/201 no expone tokens.
2. **Refresco proactivo**: con el acceso vencido (o a ≤ 60 s de vencer) y refresco válido,
   navegar a una ruta protegida; debe cargar sin pasar por `/login` y actualizar ambas cookies.
3. **Refresco rechazado**: invalidar/revocar el refresco y navegar a una ruta protegida; debe
   redirigir a `/login` y limpiar las cookies.
4. **Fallo transitorio**: detener el backend (o simular 5xx) y navegar con el acceso vencido;
   debe continuar la navegación sin cerrar sesión ni redirigir.
5. **Logout**: cerrar sesión; debe llamarse `POST /usuarios/logout` con el refresco y quedar
   ambas cookies eliminadas.

---

## Observaciones

- **Interpretación en `decidirNavegacionSesion` (T6).** El diseño indica que «un token sin `exp`
  legible se considera vigente» y, a la vez, que un acceso «ausente/malformado» con refresco
  debe renovar. Para satisfacer ambos, se distingue un JWT decodificable sin `exp` (continúa,
  vía `sesionVigente`) de un token ausente/malformado (renueva o redirige). No se modificó la
  semántica de `sesionVigente`. El margen de 60 s se calcula con `obtenerExpiracionJwt`.
- **Coordinador con estado a nivel de módulo.** Se implementó el `Map` a nivel de módulo según
  el diseño; el tipo del resultado se borra a `unknown` y se recupera con una conversión segura
  al leer, por lo que cada runtime debe instanciar un único coordinador (así se hace en
  `server-client.ts` y `middleware.ts`).
- **Limitación conocida del diseño**: el single-flight es estado en memoria por proceso, por lo
  que middleware (Edge) y BFF (Node) no comparten renovaciones; se mitiga con la propagación del
  token en la petición y la retención corta.
- Los tokens nunca se incorporan al cuerpo de las respuestas del BFF.
- **Nota para el Reviewer**: la `description` de `meta.json` aún dice «se descarta el refresco
  proactivo en middleware», en desacuerdo con `requirements.md` (R12–R17), `design.md` (T11) y
  `tasks.md`, que sí lo incluyen. No se modificó `meta.json` más allá del `status`; queda a
  criterio del Reviewer/Spec Author alinearlo.
