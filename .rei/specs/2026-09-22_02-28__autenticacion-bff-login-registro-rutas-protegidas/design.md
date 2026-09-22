# Diseño — Autenticación: BFF, login, registro y rutas protegidas

> Work Item: `2026-09-22_02-28__autenticacion-bff-login-registro-rutas-protegidas`
> (`type: feature`)
>
> Cómo se implementará. Documenta solo las decisiones necesarias para implementar el
> cambio; no es documentación de arquitectura general.

---

## Estrategia de implementación

Cuatro piezas coordinadas alrededor de la cookie httpOnly `elinain_session`:

```text
Navegador
  │  POST /api/auth/login | /api/auth/registro | /api/auth/logout   (mismo origen)
  ▼
BFF  app/api/auth/*  ── createServerClient() ──►  backend /usuarios/acceso | /usuarios/registro
  │  escribe/limpia la cookie httpOnly
  ▼
Middleware (raíz)  ── sesionVigente(cookie) ──►  redirige (sin llamar al backend)
```

1. **BFF** (`app/api/auth/*`): Route Handlers que reciben credenciales, llaman al backend y
   escriben/limpian la cookie. El token nunca entra al cuerpo de la respuesta.
2. **Feature `auth`**: formularios (login y registro), mutaciones con TanStack Query, schemas
   zod, mensajes de error y redirección al dashboard.
3. **Rutas**: grupos `(auth)` (`/login`, `/registro`) y `(dashboard)` (`/dashboard`).
4. **Middleware**: guardia de UX basada solo en la cookie; el backend sigue siendo la
   autoridad real de autorización.

---

## Archivos involucrados

```text
middleware.ts                                  # nuevo (raíz; Next lo exige fuera de app/)

app/
├── layout.tsx                                 # modificar: Providers, lang="es", metadata
├── providers.tsx                              # nuevo: QueryClientProvider ('use client')
├── (auth)/
│   ├── layout.tsx                             # nuevo: layout centrado de acceso
│   ├── login/page.tsx                         # nuevo
│   └── registro/page.tsx                      # nuevo
├── (dashboard)/
│   ├── layout.tsx                             # nuevo: cabecera + LogoutButton
│   └── dashboard/page.tsx                     # nuevo: landing protegida mínima
└── api/auth/
    ├── login/route.ts                         # nuevo
    ├── registro/route.ts                      # nuevo
    ├── logout/route.ts                        # nuevo
    └── _lib/sesion.ts                         # nuevo (interno): fijar/limpiar cookie

features/auth/
├── api/auth.ts                                # iniciarSesion, registrarUsuario, cerrarSesion
├── components/LoginForm.tsx                   # nuevo ('use client')
├── components/RegistroForm.tsx                # nuevo ('use client')
├── components/LogoutButton.tsx                # nuevo ('use client')
├── hooks/useLogin.ts                          # nuevo (mutación → redirección)
├── hooks/useRegistro.ts                       # nuevo (mutación → redirección)
├── hooks/useLogout.ts                         # nuevo (mutación → limpieza y redirección)
├── schemas.ts                                 # esquemas zod + tipos inferidos
├── mensajes-error.ts                          # mapeo puro status → mensaje español
├── types.ts                                   # alias de DTOs del OpenAPI
├── index.ts                                   # API pública: LoginForm, RegistroForm, LogoutButton
└── __tests__/
    ├── schemas.test.ts                        # V4
    └── mensajes-error.test.ts                 # V4

shared/
├── api/
│   ├── bff-client.ts                          # nuevo: cliente para el BFF mismo-origen
│   ├── session.ts                             # nuevo: vigencia/expiración del JWT (puro)
│   └── __tests__/session.test.ts              # V4
└── config/
    ├── env.ts                                 # modificar: exponer isProduction
    └── __tests__/env.test.ts                  # modificar: cubrir isProduction
```

Limpieza: eliminar `features/.gitkeep` (la carpeta ya contiene `features/auth/`).

No se modifica `app/page.tsx` (placeholder de create-next-app, fuera de alcance), ni
`package.json`, `tsconfig.json`, Jest, ESLint o Prettier: no se añaden dependencias ni
alias.

---

## BFF (`app/api/auth/*`)

Todos los handlers son `POST` y delegan el acceso al backend en `createServerClient()`
(usa `API_URL`); el token solo se usa para la cookie.

### `login/route.ts`

1. `request.json()` en `try/catch`; cuerpo malformado → 400 con `{ mensaje }` en español.
2. `createServerClient().post<AccesoRespuestaDto>("/usuarios/acceso", { email, password })`.
3. Éxito → crear respuesta 204 vacía, `fijarSesion(respuesta, acceso.tokenAcceso)` y
   devolverla. El token no viaja en el cuerpo (R2, R10).
4. `ApiError` → `NextResponse.json({ mensaje: error.message }, { status })`; si
   `error.status === 0` (red) se responde **502** con mensaje controlado (R3, R4, R9).

### `registro/route.ts`

1. Igual validación defensiva del cuerpo.
2. `POST /usuarios/registro` → 201. Un 409 se propaga tal cual, sin cookie (R5, R6).
3. Con el registro exitoso, auto-login en el **servidor**: se reutiliza el flujo de acceso
   llamando a `POST /usuarios/acceso` con las mismas credenciales y se fija la cookie con
   el `tokenAcceso` obtenido. Se responde 201 sin exponer el token (R7, R10).
4. Si el acceso posterior fallara, se propaga el error del backend (el comerciante queda
   registrado; se informa el fallo de sesión).

### `logout/route.ts`

Responder 204 y `limpiarSesion(respuesta)` (borra la cookie) (R8).

### `_lib/sesion.ts` (interno)

- `fijarSesion(response, tokenAcceso)`: `response.cookies.set(SESSION_COOKIE_NAME, token,
  atributosCookie)`.
- `limpiarSesion(response)`: `response.cookies.set(SESSION_COOKIE_NAME, "", { maxAge: 0 })`.
- Atributos de la cookie (R2, R10):

  | Atributo | Valor | Motivo |
  |----------|-------|--------|
  | `httpOnly` | `true` | El token nunca es legible por JavaScript. |
  | `sameSite` | `"lax"` | Permite la navegación normal y mitiga CSRF en peticiones cross-site. |
  | `secure` | `getServerEnv().isProduction` | Solo en HTTPS de producción; no rompe `http://localhost`. |
  | `path` | `"/"` | Disponible en todo el sitio (BFF y Server Components). |
  | `maxAge` | `exp` del JWT menos la hora actual; si el token no declara `exp`, se omite | La cookie dura lo mismo que el token; sin `exp` queda como cookie de sesión. |

  `maxAge` se calcula con `obtenerExpiracionJwt` (abajo). Nunca se inventa una duración.

---

## Verificación de sesión (`shared/api/session.ts`)

Módulo puro y seguro para Edge (sin `node:*`, sin `next/headers`), usado por el middleware
y por `_lib/sesion.ts`.

```ts
export function obtenerExpiracionJwt(token: string): number | undefined; // epoch segundos
export function sesionVigente(token: string | undefined, ahoraMs?: number): boolean;
```

- `obtenerExpiracionJwt`: decodifica el payload del JWT (base64url → JSON con `atob`) y
  devuelve `exp` solo si es un número. Si el token está malformado o no tiene `exp`,
  devuelve `undefined`.
- `sesionVigente`: `false` si no hay token o está en blanco; `true` si el payload no declara
  `exp` (la autoridad es el backend); en caso contrario compara `exp * 1000` con `ahoraMs`
  (por defecto `Date.now()`). Un token malformado se trata como no vigente (R30).

> No se verifica la firma: el frontend no posee el secreto del backend. Esta comprobación es
> una guardia de navegación, **no** un control de seguridad; el backend valida el token en
> cada petición autenticada.

---

## Middleware (`middleware.ts`, raíz)

- Archivo en la raíz porque Next lo exige fuera de `app/` y no contiene lógica de negocio.
- Matcher: `["/dashboard", "/dashboard/:path*", "/login", "/registro"]`.
- Lógica:
  1. Lee la cookie con `request.cookies.get(SESSION_COOKIE_NAME)?.value` y evalúa
     `sesionVigente(token)` (R26, R30).
  2. Ruta protegida sin sesión → `NextResponse.redirect(new URL("/login", request.url))`
     (R25).
  3. Ruta de acceso (`/login`, `/registro`) con sesión vigente →
     `redirect("/dashboard")` (R27).
- No llama al backend. Las futuras rutas protegidas bajo `(dashboard)` deben añadirse al
  matcher.

---

## Feature `auth`

### `api/auth.ts`

Tres funciones que llaman al BFF con `createBffClient()` y propagan `ApiError`:

```ts
export function iniciarSesion(credenciales: CredencialesAcceso): Promise<void>;
export function registrarUsuario(datos: DatosRegistro): Promise<void>;
export function cerrarSesion(): Promise<void>;
```

- `iniciarSesion` → `POST /api/auth/login`; `registrarUsuario` → `POST /api/auth/registro`
  (el auto-login ocurre en el BFF, no en el cliente); `cerrarSesion` → `POST /api/auth/logout`.

### `shared/api/bff-client.ts`

`createBffClient(): HttpClient` = `createHttpClient({ baseUrl: "" })`. Con la base vacía,
`buildUrl` produce rutas relativas (`/api/auth/login`) que el navegador resuelve contra el
mismo origen y envían la cookie httpOnly automáticamente. No adjunta token (no lo conoce).

### `schemas.ts`

Esquemas zod (zod v4) de los formularios; única fuente de las reglas de validación (R31):

- `esquemaLogin`: `email` obligatorio y con formato válido; `password` obligatorio.
- `esquemaRegistro`: `nombre` obligatorio; `email` obligatorio y con formato válido;
  `password` obligatorio y `min(8)` (R20).
- Tipos inferidos con `z.infer`; mensajes en español.

### `mensajes-error.ts`

Funciones puras que traducen el estado HTTP a un mensaje controlado (R14, R17, R21, R23,
R35), evitando mostrar el `mensaje` crudo del backend:

```ts
export function mensajeErrorAcceso(status: number): string;
export function mensajeErrorRegistro(status: number): string;
```

- Acceso: `401` → "Correo o contraseña incorrectos."; `0` → error de conexión; resto →
  "No se pudo iniciar sesión. Inténtalo de nuevo."
- Registro: `409` → "Este correo ya está registrado."; `400` → datos inválidos; `0` → error
  de conexión; resto → "No se pudo completar el registro. Inténtalo de nuevo."

### `hooks/`

`useLogin`, `useRegistro` y `useLogout` envuelven las funciones de `api/` en `useMutation`
de TanStack Query, tipando el error como `ApiError`:

- `useLogin`/`useRegistro`: `onSuccess` → `router.replace("/dashboard")` + `router.refresh()`
  (para que los Server Components y el middleware vean la cookie nueva) (R15, R22).
- `useLogout`: `onSuccess` → `router.replace("/login")` + `router.refresh()` (R29).
- Sin `useQuery` ni query keys: este Work Item no lee datos del backend.

### `components/`

- `LoginForm` / `RegistroForm` (`'use client'`): `useForm` + `zodResolver`; campos `Input` de
  `shared/ui` (`type` correcto y `autoComplete`), `Button type="submit"` con
  `disabled={isPending}` (R16); errores de campo desde `formState.errors`; mensaje general
  derivado en render del error de la mutación (sin `useEffect`), anunciado con `role="alert"`.
  En `RegistroForm`, un `409` se muestra como error del campo de correo (R21). Enlaces entre
  `/login` y `/registro` con `next/link` (R24).
- `LogoutButton` (`'use client'`): botón que dispara `useLogout` y se deshabilita mientras la
  petición está en curso.

### `types.ts` e `index.ts`

- `types.ts`: alias `CredencialesAcceso = ApiSchemas["CredencialesAccesoDto"]` y
  `DatosRegistro = ApiSchemas["CrearUsuarioDto"]`; no se redefinen DTOs a mano.
- `index.ts`: exporta `LoginForm`, `RegistroForm` y `LogoutButton`. `api/`, `hooks/`,
  `schemas.ts` y `mensajes-error.ts` son internos.

---

## Páginas y composición

- `app/providers.tsx` (`'use client'`): `QueryClientProvider` con un `QueryClient` creado
  una sola vez con `useState`. Se monta en `app/layout.tsx` envolviendo `children`. Es
  infraestructura necesaria para las mutaciones de TanStack Query.
- `app/layout.tsx`: `lang="es"`, metadata del producto y `<Providers>`.
- `app/(auth)/layout.tsx`: contenedor centrado para las pantallas de acceso.
- `app/(auth)/login/page.tsx` y `...(auth)/registro/page.tsx`: Server Components que solo
  renderizan el formulario correspondiente y definen `metadata`.
- `app/(dashboard)/layout.tsx`: cabecera mínima con `LogoutButton` y `children`.
- `app/(dashboard)/dashboard/page.tsx`: landing protegida mínima (título y texto de
  bienvenida). No muestra datos del usuario porque el backend no expone endpoint de perfil
  ni el login persiste el perfil.

---

## Decisiones de diseño

### D1. El token solo vive en la cookie httpOnly

El BFF escribe el token únicamente en la cookie y responde sin él; el JavaScript del cliente
nunca lo ve (R10). Mantiene la decisión ya tomada en `architecture.md`.

### D2. Auto-login en el servidor

Tras registrar, el propio handler del BFF repite el acceso y fija la cookie, reutilizando el
mismo camino que el login en una sola petición del navegador (R7, R22).

### D3. Verificación de sesión por vigencia del JWT, sin firma ni backend

El middleware decodifica `exp` y compara con la hora actual; no verifica firma (no tiene el
secreto) ni consulta al backend (no hay endpoint de perfil) (R26). Es una guardia de UX; la
autorización real la ejerce el backend.

### D4. `maxAge` derivado del `exp` del token

Evita inventar una duración y mantiene la cookie alineada con el token; si no hay `exp`, la
cookie es de sesión.

### D5. `secure` condicionado por `isProduction` desde `shared/config/env.ts`

Es el único punto autorizado para leer `process.env` (`architecture.md`), por lo que se
amplía `getClientEnv()`/`getServerEnv()` con `isProduction: process.env.NODE_ENV ===
"production"`. Así la cookie es `secure` en producción y funcional en `localhost`.

### D6. Cliente dedicado para el BFF (`createBffClient`)

`createServerClient`/`createPublicClient` apuntan al backend; las llamadas al BFF son del
mismo origen. Un tercer cliente con `baseUrl: ""` centraliza URL y serialización en
`shared/api` sin que el feature use `fetch` directamente.

### D7. Middleware en la raíz

Next exige `middleware.ts` en la raíz del proyecto (no dentro de `app/`). No viola la regla
de capas: no contiene lógica de negocio, solo la guardia de navegación.

### D8. Mensajes de error mapeados por estado

La UI usa funciones puras de `mensajes-error.ts` sobre `error.status` en lugar de mostrar el
`mensaje` del backend, cumpliendo "no mostrar mensajes crudos" (R35) y permitiendo tests.

### D9. `QueryClientProvider` creado en este Work Item

No existía infraestructura de TanStack Query; las mutaciones la requieren. Se crea
`app/providers.tsx` y se monta en el layout raíz, sin store global.

### D10. `/dashboard` como única ruta protegida

Solo existe esa página bajo `(dashboard)`; el matcher del middleware la lista explícitamente
y deberá ampliarse al añadir rutas de negocio.

---

## Alternativas descartadas

- **Devolver el token al cliente y guardarlo en memoria/localStorage:** expone el token a
  JavaScript y contradice `architecture.md`. Descartado.
- **Cliente que llama a `/registro` y luego a `/login` en dos peticiones:** doble viaje,
  estado intermedio (usuario registrado sin sesión) y más lógica en el cliente. El BFF lo
  resuelve en una sola petición.
- **Llamar al backend desde el middleware para validar la sesión:** añade latencia a cada
  navegación y no existe endpoint de perfil; además el middleware corre en cada request.
  Descartado.
- **Verificar la firma del JWT con `jose`/`jsonwebtoken`:** requiere el secreto del backend
  (no disponible en el frontend) y una dependencia nueva (R33). Descartado.
- **Guardar `usuario` en localStorage o en una segunda cookie legible** para mostrarlo en el
  dashboard: estado duplicado y fuente de verdad paralela. La landing es mínima y no muestra
  datos de usuario.
- **Store global de autenticación (Context/Zustand):** prohibido por `architecture.md`; el
  estado remoto lo cubre TanStack Query y la sesión vive en la cookie.
- **`fetch` directo en los componentes o en `features/auth/api`:** concentra URL y
  serialización fuera de `shared/api`. Se usa `createBffClient`.
- **Componentes de formulario que leen la cookie del JWT para redirigir:** el redirect tras
  login lo hace el middleware y `router.replace`, no el formulario.
- **Reutilizar `createPublicClient` para el BFF:** apunta al backend (`NEXT_PUBLIC_API_URL`),
  no al mismo origen.

---

## Testabilidad y verificación

**Automatizable con Jest (lógica pura, sin red ni render), checkpoint `V4`:**

- `features/auth/__tests__/schemas.test.ts`: campos vacíos, formato de correo y contraseña de
  7 vs 8 caracteres.
- `features/auth/__tests__/mensajes-error.test.ts`: mapeo de 401/409/0 y estados genéricos.
- `shared/api/__tests__/session.test.ts`: token ausente, malformado, sin `exp`, vigente y
  vencido; `obtenerExpiracionJwt` con y sin `exp`.
- `shared/config/__tests__/env.test.ts`: `isProduction` en los entornos devuelto por
  `getClientEnv`/`getServerEnv` (ajustar las aserciones existentes).

**No cubierto por Jest (validación manual `V5`), por falta de librería de render y de entorno
real:** comportamiento de los formularios, flujo completo contra el backend, escritura y
lectura real de la cookie, redirecciones del middleware, logout y accesibilidad percibida.

---

## Restricciones

- Raíz del repo, sin `src/`; `middleware.ts` en la raíz.
- TypeScript `strict`: sin `any` ni `@ts-ignore`.
- Named exports; `export default` solo donde Next lo exige (`page`, `layout`, `route`).
- `'use client'` solo en `providers.tsx`, formularios, `LogoutButton` y hooks.
- No se llama a `fetch` desde componentes ni se obtienen datos con `useEffect`.
- El BFF propaga el código HTTP real; no convierte errores en 200.
- Sin dependencias nuevas (R33).
- Fuera de alcance: el resto de features de negocio, recuperación de contraseña,
  endpoint de perfil/refresh, y `app/page.tsx`.

---

## Verificación prevista

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Prettier en verde (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | ESLint sin errores. |
| `V3` | `npm run typecheck` | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Suite en verde, incluyendo los tests de lógica pura nuevos. |
| `V5` | Validación manual | Login, registro (incluido 409), rutas protegidas, redirección de autenticados y logout. |
