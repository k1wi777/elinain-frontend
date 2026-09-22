# Implementación — Cliente HTTP base en `shared/api`

- **Work Item:** `2026-09-22_01-38__cliente-http-base`
- **Tipo:** `feature` (Caso A)
- **Fecha:** `2026-09-22`
- **Agente:** `implementer`
- **Spec:** `.rei/specs/2026-09-22_01-38__cliente-http-base/{requirements,design,tasks}.md`

## Resumen

Se implementó exactamente el plan aprobado (T1–T12). El cliente HTTP base vive en
`shared/api`, en la raíz del repo y sin `src/`. Se apoya en **axios** y separa tres puntos
de entrada con responsabilidades aisladas:

- **Núcleo isomorfo** (`http-client.ts`): instancia de axios, cabeceras JSON por defecto,
  composición de URL con `buildUrl`, `Authorization: Bearer` cuando hay token y conversión
  de todo rechazo en `ApiError` desde el interceptor de respuesta.
- **Cliente de servidor** (`server-client.ts`): lee la cookie httpOnly con `cookies()` de
  `next/headers`, obtiene `API_URL` de `getServerEnv()` y delega en `createHttpClient`.
- **Cliente público** (`public-client.ts`): obtiene `NEXT_PUBLIC_API_URL` de
  `getClientEnv()` y construye un cliente sin token.

También se alojó el OpenAPI del backend y se generaron sus tipos con `openapi-typescript`,
se expuso el alias `ApiSchemas`, se definió la constante `SESSION_COOKIE_NAME` y se
cubrieron con tests Jest de lógica pura la construcción de URL, la construcción de
cabeceras y el mapeo de errores.

No se añadió alcance fuera del spec: no se implementaron Route Handlers de autenticación/BFF
(T0.5), ni el hook de paginación (T0.3), ni `shared/ui` (T0.4). No se realizaron commits de
git.

## Archivos modificados

| Archivo | Acción |
|---------|--------|
| `package.json` | Modificado: `axios` en `dependencies`, `openapi-typescript` en `devDependencies`, script `generate:api`. |
| `package-lock.json` | Modificado por `npm install`. |
| `shared/api/openapi/api-1.json` | Creado: spec OpenAPI del backend (copiado sin editar desde `/home/jose/Documentos/elinain/api-1.json`). |
| `shared/api/openapi/schema.d.ts` | Creado: tipos generados con `npm run generate:api`. |
| `shared/api/types.ts` | Creado: alias `ApiSchemas`. |
| `shared/api/session-cookie.ts` | Creado: `SESSION_COOKIE_NAME`. |
| `shared/api/request.ts` | Creado: `buildDefaultHeaders`, `buildAuthHeader`, `buildUrl`. |
| `shared/api/errors.ts` | Creado: `ApiError`, `mapErrorResponse`, `toApiError`. |
| `shared/api/http-client.ts` | Creado: `createHttpClient`, `HttpClient`. |
| `shared/api/server-client.ts` | Creado: `createServerClient`. |
| `shared/api/public-client.ts` | Creado: `createPublicClient`. |
| `shared/api/__tests__/request.test.ts` | Creado: tests de helpers de petición. |
| `shared/api/__tests__/errors.test.ts` | Creado: tests de mapeo de errores. |
| `.prettierignore` | Modificado: `shared/api/openapi/` ignorado. |
| `eslint.config.mjs` | Modificado: `shared/api/openapi/**` en `globalIgnores`. |
| `shared/api/.gitkeep` | Eliminado (la carpeta ya contiene archivos). |

## Cambios realizados (por tarea)

### T1 — Dependencias y script de generación

- `axios@^1.20.0` en `dependencies` y `openapi-typescript@^7.13.0` en `devDependencies`
  (justificación de axios en `design.md` D1: interceptores, cabeceras automáticas,
  serialización JSON y normalización de errores sin reimplementar una envoltura sobre
  `fetch`).
- Script `"generate:api": "openapi-typescript shared/api/openapi/api-1.json -o shared/api/openapi/schema.d.ts"`.
- `npm install` finalizó con `0 vulnerabilities`.

### T2 — OpenAPI y tipos generados

- `api-1.json` (OpenAPI 3.0.0, base `/api/v1`, seguridad `bearer` JWT) copiado tal cual a
  `shared/api/openapi/api-1.json`; no se editó.
- `npm run generate:api` produjo `shared/api/openapi/schema.d.ts` (2.259 líneas), con
  `components.schemas`. Ambos archivos quedan versionados (R12, R13).

### T3 — Exclusión de generados

- `.prettierignore` y `globalIgnores` de ESLint excluyen `shared/api/openapi/`, de modo que
  `V1` y `V2` no procesan archivos generados.
- `shared/api/.gitkeep` eliminado.

### T4 — Alias de tipos

- `shared/api/types.ts` expone `ApiSchemas = components["schemas"]` importado de
  `@/shared/api/openapi/schema`, para que los features tipen sus DTOs sin redefinirlos.

### T5 — Constante de cookie

- `shared/api/session-cookie.ts` exporta `SESSION_COOKIE_NAME = "elinain_session"` con JSDoc
  que indica su reutilización por la Feature de autenticación/BFF (T0.5) (R4).

### T6 — Helpers puros

- `buildDefaultHeaders()`: `Content-Type` y `Accept` JSON (R2).
- `buildAuthHeader(token)`: `Authorization: Bearer <token>` (R3).
- `buildUrl(baseUrl, path)`: une base y ruta con una única barra, colapsa barras dobles y
  deja pasar las URLs absolutas con esquema (`https://…`); devuelve la base si la ruta está
  vacía (R11).

### T7 — Error único y mapeo

- `ApiError` con `status`, `message`, `errores`, `ruta?`, `marcaTiempo?`.
- `mapErrorResponse(status, data)`: usa `mensaje` del cuerpo si existe, recoge `errores`
  cuando son strings y aplica un mensaje por defecto en español por estado (400, 401, 403,
  404, 409, 500 o genérico) (R7, R8, R15).
- `toApiError(error)`: devuelve el `ApiError` si ya lo es, delega en `mapErrorResponse` para
  errores de axios con respuesta y usa `status: 0` con mensaje en español para fallos de red
  o errores desconocidos (R9). No depende de la clase de axios: detecta
  `isAxiosError === true` de forma estructural, lo que mantiene el módulo puro y testeable.

### T8 — Núcleo del cliente axios

- `createHttpClient({ baseUrl, getAuthToken? })` devuelve un `HttpClient` tipado que retorna
  directamente el cuerpo JSON (`response.data`), sin el envoltorio de axios (R10).
- Cabeceras JSON por defecto, `Authorization` solo cuando `getAuthToken` devuelve token y
  composición de URL vía `buildUrl` en el interceptor de petición.
- El interceptor de respuesta convierte todo rechazo en `ApiError`.
- Isomorfo: no importa `next/headers` ni el entorno.

### T9 — Cliente de servidor

- `createServerClient()` hace `await cookies()`, obtiene la cookie `SESSION_COOKIE_NAME`,
  lee `API_URL` con `getServerEnv()` y delega en `createHttpClient`. Sin cookie, la petición
  sale sin `Authorization` y no lanza (R1, R3, R5).
- Es server-only por su import de `next/headers`; no se creó barrel `shared/api/index.ts`
  para no arrastrarlo al bundle de cliente.

### T10 — Cliente público

- `createPublicClient()` obtiene `NEXT_PUBLIC_API_URL` con `getClientEnv()` y construye un
  cliente sin `getAuthToken`, por lo que nunca adjunta el token (R1, R6).

### T11 — Tests de lógica pura

- `shared/api/__tests__/request.test.ts`: `buildDefaultHeaders`, `buildAuthHeader` y
  `buildUrl` (unión con barras, rutas relativas con/sin slash, URLs absolutas, ruta vacía).
- `shared/api/__tests__/errors.test.ts`: `mapErrorResponse` (DTO de validación, cuerpo sin
  `mensaje`, `errores` con valores no string, cuerpo no objeto, estado sin mensaje por
  defecto) y `toApiError` (`ApiError`, error de axios con respuesta, fallo de red y error
  desconocido).
- Sin red ni render; cumplen el alcance de tests de `verification.md` (R14).

## Proceso de verificación

Se ejecutó `npm run format` antes de los checkpoints y luego cada uno por separado, con
`bash .rei/init.sh` como gate final.

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | **Pasa** | `All matched files use Prettier code style!` (ningún archivo se reformateó). Los generados en `shared/api/openapi/` quedan ignorados. |
| `V2` | `npm run lint` | **Pasa** | ESLint sin errores ni warnings. `shared/api/openapi/**` excluido vía `globalIgnores`. |
| `V3` | `npm run typecheck` | **Pasa** | `tsc --noEmit` sin errores bajo `strict`, incluyendo los tipos generados y los alias. Sin `any` ni `@ts-ignore`. |
| `V4` | `npm test` | **Pasa** | 3 suites, **24 tests** en verde: 8 existentes de `env.test.ts` + 16 nuevos (`request.test.ts` 7, `errors.test.ts` 9). |
| `V5` | Validación manual | **No aplica** | Este Work Item no introduce UI, flujo interactivo, ni comportamiento dependiente de render o sujeción visual. Su salida son módulos headless de `shared/api`; la lógica pura queda cubierta por `V4` y el resto se verifica con `V3` e inspección. Ver `design.md` ("Testabilidad y verificación"). |

### `bash .rei/init.sh`

Salida final: `[OK] REI Harness listo para trabajar.` con **código de salida `0`** y los
cuatro checkpoints en `[OK]`: `Formato (V1)`, `Lint (V2)`, `Tipos (V3)`, `Tests (V4)`.

El script emite un `[WARN]` en la Sección 3 ("Existe una sesión registrada en
`.rei/progress/current.md`"), esperado al ejecutarse con el Work Item activo; no es un fallo
ni afecta al código de salida.

## Observaciones relevantes

- **Restricciones respetadas:** raíz del repo sin `src/`; `shared/` no importa de `features/`
  ni de `app/`; `shared/config/env.ts` sigue siendo el único módulo que lee `process.env`
  (verificado con `grep`); TypeScript `strict` sin `any` ni `@ts-ignore`; JSDoc y
  comentarios en español; solo se añadieron `axios` y `openapi-typescript`.
- **Versionado de tipos:** `api-1.json` y `schema.d.ts` se versionan, de modo que `V3`
  funciona sin red ni pasos previos. `npm run generate:api` es la regeneración explícita
  cuando cambie el backend.
- **Respuesta exitosa sin envoltorio:** el `HttpClient` devuelve `response.data`; el
  `AxiosResponse` nunca llega a los features (R10).
- **Manejo de URLs absolutas:** `buildUrl` solo considera absolutas a las de esquema
  (`https://…`); una ruta que empiece por `//` se normaliza como ruta relativa con una única
  barra inicial.
- **No se tocaron** `shared/config/env.ts`, `.env.local` ni `.env.example`, tal como indica
  el diseño.
- No se realizaron commits de git.
