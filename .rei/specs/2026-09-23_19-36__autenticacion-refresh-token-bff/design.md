# Diseño — Autenticación: refresh token con rotación en el BFF y el middleware

> Work Item: `2026-09-23_19-36__autenticacion-refresh-token-bff` (`type: feature`)
>
> Cómo se implementará. Documenta solo las decisiones necesarias para implementar el cambio;
> no es documentación de arquitectura general.

---

## Estrategia de implementación

Dos caminos de renovación que comparten los mismos módulos puros (cookies, coordinación y
ejecución del refresco):

```text
Navegación
  │
  ▼
middleware.ts (Edge) ── acceso vencido + refresco presente ──► POST /usuarios/refresh (fetch)
  │                                                             │
  │◄── cookies rotadas en request + response ──────────────────┘
  │  (continuar si renueva; /login solo si el refresco se rechaza de forma definitiva)
  ▼
Handler BFF (app/api/*) ── createServerClient() ──► operación autenticada
  │  401 ──► renovación reactiva (fetch) ──► cookies rotadas ──► reintento único
  ▼
Backend
```

- **Proactivo (middleware).** Evita que una navegación con el acceso vencido (o a punto de
  vencer, dentro del margen de 60 s) caiga en `/login` mientras el refresco siga válido. Corre
  en **Edge**, por lo que renueva con `fetch` nativo, no con axios.
- **Reactivo (BFF).** Cubre las peticiones a la API cuando el acceso venció después de la
  navegación; mantiene el reintento y el single-flight ya acordados.

Piezas:

1. **Contrato (T1).** Reemplazar `shared/api/openapi/api-1.json` y regenerar con
   `npm run generate:api`.
2. **Base compartida (T2–T5).** Opciones de cookie, coordinador single-flight, ejecutor de
   renovación con `fetch` y wrapper de reintento reactivo. Todos puros/Edge-safe.
3. **Decisión de navegación (T6).** Función pura que decide continuar, renovar o redirigir.
4. **BFF reactivo (T7).** `shared/api/server-client.ts` cablea la renovación y el reintento.
5. **Auth (T8–T10).** Login/registro guardan ambos tokens; logout revoca y limpia.
6. **Middleware (T11).** Renovación proactiva con escritura de cookies en request y response.

---

## Archivos involucrados

### Nuevos

```text
shared/api/
├── refresh-coordinator.ts                   # single-flight genérico (puro)
├── session-renovacion.ts                    # ejecutor de /usuarios/refresh con fetch (Edge-safe)
├── session-refresh.ts                       # wrapper de reintento del HttpClient (puro)
├── session-navegacion.ts                    # decisión de navegación (puro)
└── __tests__/
    ├── refresh-coordinator.test.ts          # V4
    ├── session-renovacion.test.ts           # V4
    ├── session-refresh.test.ts              # V4
    └── session-navegacion.test.ts           # V4
```

### Modificados

```text
middleware.ts                                    # + renovación proactiva (Edge)
shared/api/openapi/api-1.json                    # contrato actualizado
shared/api/openapi/schema.d.ts                   # regenerado
shared/api/session-cookie.ts                     # + REFRESH_COOKIE_NAME, TokensSesion, opciones
shared/api/server-client.ts                      # + renovación reactiva y reintento
app/api/auth/_lib/sesion.ts                      # fijar/limpiar ambos tokens
app/api/auth/login/route.ts                      # guarda ambos tokens
app/api/auth/registro/route.ts                   # guarda ambos tokens (auto-login)
app/api/auth/logout/route.ts                     # revoca + limpia ambos tokens
```

### Sin cambios (explícito)

`features/auth/*` (api, hooks, componentes, tipos), el resto de `app/api/*`,
`shared/api/http-client.ts`, `shared/api/session.ts` y `app/api/geocodificacion/*`.

---

## Contrato OpenAPI (T1)

- Fuente: `/home/jose/Documentos/elinain/api-1.json` (fuera del repo) → copiar sobre
  `shared/api/openapi/api-1.json`.
- Regenerar: `npm run generate:api`. Debe incluir `tokenRefresco` en `AccesoRespuestaDto` y
  los esquemas `RefrescarTokenDto` y `CerrarSesionDto`.
- `shared/api/response.ts` ya desenvuelve `{ exito, datos }`; el ejecutor de renovación
  reutiliza `desenvolverRespuesta` para leer `AccesoRespuestaDto` del cuerpo de
  `/usuarios/refresh`.

---

## Base compartida (T2–T5)

### `session-cookie.ts` (Edge-safe)

- `SESSION_COOKIE_NAME = "elinain_session"` (acceso) y `REFRESH_COOKIE_NAME =
  "elinain_refresh"` (nuevo).
- `type TokensSesion = { tokenAcceso: string; tokenRefresco: string }`.
- `opcionesCookieAcceso(tokenAcceso)`, `opcionesCookieRefresco()`, `opcionesCookieExpirada()`.

Atributos comunes: `httpOnly: true`, `sameSite: "lax"`, `secure: getServerEnv().isProduction`,
`path: "/"`. `maxAge` del acceso por `exp` del JWT; el refresco se emite como cookie de
sesión (sin `maxAge`) porque el contrato no expone su vigencia; la limpieza usa `maxAge: 0`.
Las opciones sirven tanto para `response.cookies.set(...)` como para `cookies().set(...)`.

### `refresh-coordinator.ts` (puro, genérico)

```ts
export function crearCoordinadorRefresco<T>(
  renovar: (tokenRefresco: string) => Promise<T>,
  opciones?: { retencionMs?: number },
): (tokenRefresco: string) => Promise<T>;
```

`Map` a nivel de módulo indexado por token de refresco: las peticiones concurrentes del mismo
proceso comparten una única promesa; ante rechazo la entrada se elimina; ante éxito se retiene
un margen corto (por defecto `15_000`) con expiración perezosa para que peticiones rezagadas
reutilicen la rotación en vez de reenviar el token ya rotado (evita la detección de
reutilización RTR). Se usa igual en BFF y middleware.

### `session-renovacion.ts` (Edge-safe, inyecta `fetch`)

```ts
export function esSesionInvalida(status: number): boolean; // 400 o 401

export function crearRenovadorConFetch(
  obtenerBaseUrl: () => string,
  fetchFn?: typeof fetch,
): (tokenRefresco: string) => Promise<TokensSesion>;
```

- Compone `buildUrl(obtenerBaseUrl(), "/usuarios/refresh")`, hace `POST` con
  `{ tokenRefresco }` mediante `fetch` nativo y desenvuelve con `desenvolverRespuesta`.
- Éxito (200 + `tokenAcceso`/`tokenRefresco` string) → `TokensSesion`.
- `400`/`401` → `throw new ApiError(status, ...)` (rechazo definitivo).
- Red o `5xx` (incluido un 200 malformado, tratado como `500`) →
  `throw new ApiError(status, ...)` (transitorio).
- `obtenerBaseUrl` se resuelve por llamada para no evaluar `getServerEnv()` al importar el
  módulo.

### `session-refresh.ts` (puro, BFF reactivo)

```ts
export function crearClienteConRefresco(
  cliente: HttpClient,
  renovarSesion: () => Promise<void>,
  rutasSinRefresco: readonly string[],
): HttpClient;
```

Ante `ApiError` 401 en ruta no excluida: llama a `renovarSesion()` y reintenta una sola vez.

- Si `renovarSesion` falla con un estado de sesión inválida (`esSesionInvalida`) → relanza el
  401 original.
- Si falla de forma transitoria → relanza el error transitorio (no lo convierte en 401, R10).
- Otros errores se propagan sin cambios.

---

## Decisión de navegación (T6)

### `session-navegacion.ts` (puro)

```ts
export const MARGEN_RENOVACION_MS = 60_000;

export type DecisionNavegacion = "continuar" | "renovar" | "redirigir-login";

export function decidirNavegacionSesion(
  tokenAcceso: string | undefined,
  hayTokenRefresco: boolean,
  ahoraMs: number = Date.now(),
  margenMs: number = MARGEN_RENOVACION_MS,
): DecisionNavegacion;
```

- Acceso vigente con **más de `margenMs`** de holgura → `"continuar"`.
- Acceso vencido, ausente o con `margenMs` o menos antes de su `exp`:
  - con refresco → `"renovar"`;
  - sin refresco → `"redirigir-login"`.

El margen es un **parámetro opcional con valor por defecto** `MARGEN_RENOVACION_MS = 60_000`:
así el middleware invoca la decisión sin argumentos extra y los tests pueden variar el margen
sin tocar la política. La holgura se calcula con `obtenerExpiracionJwt` dentro de este módulo;
no se modifica la semántica de `sesionVigente` en `shared/api/session.ts`, que sigue siendo la
misma para el resto de consumidores. Un token sin `exp` legible se considera vigente y se
continúa (la autoridad real es el backend).

El middleware solo invoca esta decisión en rutas protegidas (R16); en `/login` y `/registro`
conserva la lógica actual de redirección de usuarios autenticados.

---

## Middleware (T11)

`middleware.ts` deja de ser intocable y pasa a renovar de forma proactiva.

### Runtime y ejecución de la renovación

- Next 16.3.5 ejecuta el middleware en **Edge**; no hay runtime Node estable expuesto
  (`nodeMiddleware` es experimental y no está configurado). Por eso la renovación usa
  `fetch` nativo mediante `crearRenovadorConFetch`, **sin axios** (R17).
- `API_URL` se obtiene con `getServerEnv()` de forma diferida dentro del renovador.

### Flujo

1. Lee las cookies de acceso y de refresco.
2. `esRutaAcceso` (`/login`, `/registro`): conserva el comportamiento actual (con sesión
   vigente → `/dashboard`; sin sesión → continuar). **No** renueva aquí (R16).
3. Rutas no protegidas: `NextResponse.next()`; **no** renueva (R16).
4. Rutas protegidas: `decidirNavegacionSesion(tokenAcceso, hayRefresco)` con el margen por
   defecto de 60 s (R12):
   - `"continuar"` (acceso con más de 60 s de holgura) → `NextResponse.next()`.
   - `"redirigir-login"` → redirección a `/login` (sin sesión utilizable).
   - `"renovar"` (acceso con ≤ 60 s, vencido o ausente) → ejecuta el coordinador con el
     renovador `fetch`:
     - Éxito → escribe ambas cookies **en la petición** (`request.cookies.set`) y **en la
       respuesta** (`response.cookies.set`), y devuelve `NextResponse.next({ request })` para
       que la navegación y los Server Components usen el nuevo acceso sin una segunda
       renovación (R13).
     - `ApiError` con `esSesionInvalida(status)` → limpia ambas cookies en la respuesta y
       redirige a `/login` (R14).
     - `ApiError` transitorio → `NextResponse.next()` sin limpiar ni redirigir (R15).

### Prevención de bucles

- Solo se redirige a `/login` cuando el refresco fue rechazado de forma definitiva y se
  limpian las cookies; al llegar a `/login` ya no hay sesión, por lo que la propia guardia no
  vuelve a redirigir.
- `/login` y `/registro` no disparan renovación; por tanto no hay ping-pong
  `/login → /dashboard → /login` (R16).
- Un fallo transitorio continúa la navegación sin redirección.

### Cookies en la respuesta

Se usan las opciones compartidas: acceso con `maxAge` por `exp`, refresco como cookie de
sesión, limpieza con `maxAge: 0`.

---

## BFF reactivo (T7–T10)

### `server-client.ts`

- Lee las cookies de acceso y refresco; expone `tokenAcceso` mutable vía `getAuthToken`.
- Coordinador a nivel de módulo sobre `crearRenovadorConFetch(() => getServerEnv().apiUrl)`.
  (El ejecutor con `fetch` se reutiliza también en Node: es Edge-safe y evita duplicar la
  llamada con axios.)
- `renovarSesion()`: sin refresco → lanza; si no, `await coordinador(tokenRefresco)`. Éxito →
  actualiza `tokenAcceso` y escribe ambas cookies con `cookies().set(...)`. Fallo → si
  `esSesionInvalida(status)` limpia ambas cookies; en ambos casos relanza.
- Devuelve `crearClienteConRefresco(cliente, renovarSesion, RUTAS_SIN_REFRESCO)`, con
  `RUTAS_SIN_REFRESCO = ["/usuarios/acceso", "/usuarios/registro", "/usuarios/refresh",
  "/usuarios/logout"]` (R11).
- `createServerAnonClient(): HttpClient` (= `createHttpClient({ baseUrl:
  getServerEnv().apiUrl })`) queda para el logout (T10).

### `app/api/auth/_lib/sesion.ts`

- `fijarSesion(response, tokens: TokensSesion)` escribe acceso y refresco con las opciones
  compartidas; `limpiarSesion(response)` escribe ambas con `opcionesCookieExpirada()`.

### `login/route.ts`, `registro/route.ts`, `logout/route.ts`

- Login/registro: mismo flujo, ahora `fijarSesion` recibe ambos tokens; respuestas 204/201 sin
  cuerpo (R3, R4, R5).
- Logout: lee el refresco, intenta `createServerAnonClient().post("/usuarios/logout", {
  tokenRefresco })` en best-effort (un fallo no interrumpe; `catch` con comentario que lo
  justifica), responde 204 y `limpiarSesion` (R18–R20).

---

## Decisiones de diseño

### D1. Refresco reactivo transparente en `createServerClient`

Los ~24 puntos de `app/api/*` ya lo usan; envolverlo garantiza cobertura uniforme sin tocar
handlers.

### D2. Refresco proactivo en el middleware, con renovación Edge-safe

El middleware no puede usar axios (Edge). Se introduce `crearRenovadorConFetch` con `fetch`
nativo, reutilizado por el BFF reactivo. Así una sola pieza de ejecución de la renovación
sirve a ambos caminos, sin dependencias nuevas (R17).

### D3. El refresco es opaco: se renueva intentando

No se puede saber a priori si el refresco expiró. El middleware intenta la renovación cuando
el acceso está vencido, ausente o dentro del margen de 60 s y hay refresco; la clasificación
del resultado decide continuar, limpiar o dejar pasar.

### D4. Fallo definitivo vs. transitorio

- Definitivo (`400`/`401` del backend): el refresco ya no sirve → limpiar sesión y, en
  middleware, redirigir a `/login`; en reactivo, propagar 401 (R9, R14).
- Transitorio (red o `5xx`): la sesión **no** se cierra; en middleware se continúa la
  navegación y en reactivo se propaga el error real (R10, R15).

  Motivo: cerrar la sesión ante una caída puntual del backend obligaría a reautenticarse sin
  que el refresco haya sido rechazado. Trade-off: una navegación con acceso vencido durante
  una caída puede renderizar y fallar en sus peticiones de datos, en vez de ir a `/login`.

### D5. Escritura de cookies rotadas en el middleware

Se escriben en `response.cookies` (llegan al navegador) y en `request.cookies` (la petición
que continúa ve el nuevo acceso). Sin esto, la navegación actual seguiría con el token
vencido y forzaría una segunda renovación inmediata.

### D6. Single-flight con retención breve, por proceso

El coordinador comparte una renovación entre peticiones concurrentes y retiene el resultado
un margen corto para peticiones rezagadas. Se reutiliza en BFF y middleware.

### D7. Cookies separadas y `maxAge` honesto

Acceso con `maxAge` por `exp`; refresco como cookie de sesión (sin `maxAge`) porque su
vigencia es opaca; limpieza con `maxAge: 0`.

### D8. Lógica pura separada de Next

Coordinador, renovador (con `fetch` inyectado), wrapper de reintento y decisión de navegación
no importan Next, por lo que se prueban con Jest sin red ni render (R22).

### D9. `/login` sin renovación proactiva

Con el acceso vencido y refresco válido, visitar `/login` muestra el login en lugar de renovar
y redirigir a `/dashboard`. Es coherente con R16 (renovar solo en rutas protegidas); el
usuario ya tiene acceso funcional al navegar a una ruta protegida.

### D10. Margen de renovación proactiva de 60 segundos

Renovar solo cuando el acceso está vencido/ausente o le quedan ≤ 60 s evita que una navegación
que empieza con el token a punto de vencer continúe y reciba 401 a mitad de carga (lo que
dispararía la renovación reactiva o un redirect). El valor vive en
`MARGEN_RENOVACION_MS = 60_000`, es el valor por defecto de un parámetro opcional de
`decidirNavegacionSesion`, y se calcula dentro de `session-navegacion.ts` sin alterar la
semántica de `sesionVigente` (R12).

---

## Limitaciones conocidas (no se implementan)

- **Coordinación entre aislamientos.** El single-flight es estado en memoria del proceso. El
  middleware (Edge) y el BFF (Node) no comparten ese estado y pueden renovar a la vez para el
  mismo refresco, con riesgo de que RTR revoque la familia. Se mitiga con single-flight dentro
  de cada runtime, la propagación del token renovado en la petición (D5) y la retención corta
  (D6). Una solución completa requiere un almacén/lock distribuido (fuera de alcance, sin
  dependencias nuevas).
- **Observabilidad del fallo transitorio.** Si el backend no responde durante la navegación,
  la página continúa y el error se manifiesta en sus peticiones de datos; no se añade UI de
  aviso específica (R25).

---

## Alternativas descartadas

- **Middleware con runtime Node para reutilizar axios.** El runtime Node de middleware no está
  disponible de forma estable en Next 16.3.5 (solo experimental y sin configurar), y añade
  complejidad. Se usa `fetch` nativo (D2).
- **Usar axios en el middleware.** No es fiable en Edge. Descartado (R17).
- **No renovar en el middleware y dejar la navegación a `/login`.** Es el comportamiento que
  el usuario pidió evitar. Descartado (R12).
- **Refresco en el JavaScript del cliente.** El navegador nunca conoce los tokens (R5).
- **Exponer un Route Handler `POST /api/auth/refresh` invocado por el navegador.**
  Innecesario: la renovación es server-side.
- **Propagar los tokens handler por handler.** Repetitivo y propenso a omisiones; se prefiere
  el refresco transparente (D1).
- **Cerrar sesión ante cualquier fallo de renovación.** Provoca logouts por caídas
  transitorias; descartado a favor de D4.
- **Cerrar sesión en middleware ante un `5xx` sin propagar request cookies.** Igual que el
  anterior, descartado.

---

## Testabilidad y verificación

**Automatizable con Jest (lógica pura, sin red ni render), checkpoint `V4`:**

- `session-navegacion.test.ts`: acceso con más de 60 s de holgura → continuar; acceso con 60 s
  o menos → renovar; acceso vencido → renovar; acceso ausente/malformado con refresco →
  renovar; sin refresco → redirigir a login; el margen es configurable y su valor por defecto
  es 60 s.
- `refresh-coordinator.test.ts`: concurrencia comparte una renovación; tokens distintos no se
  comparten; un fallo libera la entrada; la retención reutiliza el resultado y expira.
- `session-renovacion.test.ts` (con `fetch` falso): 200 → tokens; `400`/`401` →
  `esSesionInvalida`; red/`5xx`/200 malformado → transitorio.
- `session-refresh.test.ts` (con `HttpClient` falso): 401 → renueva y reintenta una vez; ruta
  excluida → no renueva; rechazo definitivo → relanza 401; fallo transitorio → relanza el
  error transitorio; otros errores se propagan.

**No cubierto por Jest (validación manual `V5`):** flujo real contra el backend, escritura y
lectura de las cookies en el navegador, navegación a ruta protegida con acceso vencido y
refresco válido (no debe ir a `/login`), `/login` cuando el refresco fue rechazado, fallo
transitorio del backend, y logout con revocación.

---

## Restricciones

- Sin dependencias nuevas (R23).
- TypeScript `strict`, sin `any` ni `@ts-ignore` (R26).
- `shared/` no importa de `features/` ni de `app/` (R24).
- Sin cambios visuales ni de interfaz (R25).
- Los tokens nunca salen del servidor (R5).
- No se edita `schema.d.ts` a mano.

---

## Verificación prevista

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Prettier en verde (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | ESLint sin errores. |
| `V3` | `npm run typecheck` | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Suite en verde, incluyendo los tests nuevos de lógica pura. |
| `V5` | Validación manual | Login/registro guardan ambos tokens; navegación a ruta protegida con acceso vencido o a ≤60 s de vencer renueva sin ir a `/login`; refresco rechazado definitivamente → `/login`; backend caído (5xx/red) → no cierra sesión; logout revoca y limpia cookies. |
