# Diseño — Cliente HTTP base en `shared/api`

> Work Item: `2026-09-22_01-38__cliente-http-base` (`type: feature`)
>
> Cómo se implementará el cliente HTTP base. Documenta solo las decisiones necesarias para
> implementar el cambio; no es documentación de arquitectura general.

---

## Estrategia de implementación

Se construye un cliente HTTP centralizado en `shared/api`, raíz del repo y sin `src/`
(ver `architecture.md`). El cliente se apoya en **axios** y se organiza en tres puntos de
entrada con responsabilidades separadas para respetar el modelo server-first:

1. **Núcleo isomorfo** (`http-client.ts`): crea la instancia de axios, define los valores
   por defecto y monta los interceptores. No conoce `next/headers` ni el entorno; recibe
   `baseUrl` y un `getAuthToken` opcional. Es reutilizable en servidor y en navegador.
2. **Cliente de servidor** (`server-client.ts`): lee la cookie httpOnly con
   `cookies()` de `next/headers`, obtiene `API_URL` con `getServerEnv()` y construye el
   cliente autenticado. Es el camino de las operaciones autenticadas (BFF / Server
   Components / Server Actions).
3. **Cliente público** (`public-client.ts`): obtiene `NEXT_PUBLIC_API_URL` con
   `getClientEnv()` y construye un cliente sin token, para endpoints públicos.

Los features solo consumirán `createServerClient()` (vía BFF) o `createPublicClient()`;
nunca axios directamente, nunca `process.env`, nunca URLs ni cabeceras propias.

---

## Archivos involucrados

```text
shared/api/
├── openapi/
│   ├── api-1.json              # spec OpenAPI del backend (versionado)
│   └── schema.d.ts             # tipos generados (versionados)
├── types.ts                    # alias de los tipos generados (ApiSchemas)
├── session-cookie.ts           # SESSION_COOKIE_NAME (constante compartida)
├── request.ts                  # helpers puros: headers y URL
├── errors.ts                   # ApiError + mapeo de errores
├── http-client.ts              # createHttpClient (núcleo axios + interceptores)
├── server-client.ts            # createServerClient (server-only)
├── public-client.ts            # createPublicClient (sin token)
└── __tests__/
    ├── request.test.ts
    └── errors.test.ts
```

Archivos de configuración afectados:

| Archivo | Acción |
|---------|--------|
| `package.json` | Añadir `axios` (dependencies), `openapi-typescript` (devDependencies) y script `generate:api`. |
| `.prettierignore` | Ignorar `shared/api/openapi/` (spec y tipos generados). |
| `eslint.config.mjs` | Añadir `shared/api/openapi/**` a `globalIgnores`. |
| `shared/api/.gitkeep` | Eliminar (la carpeta ya contiene archivos). |

No se modifican `shared/config/env.ts`, `.env.local` ni `.env.example`: se reutilizan tal
como quedaron en `2026-09-22_01-17__estructura-base-y-env`.

---

## Decisiones de diseño

### D1. Dependencia `axios` (justificación exigida por `conventions.md`)

**Problema que resuelve.** El cliente necesita: (a) inyectar cabeceras comunes en todas las
peticiones, (b) añadir `Authorization: Bearer` de forma automática solo en el servidor,
(c) serializar/parsear JSON de forma consistente y (d) normalizar todos los errores del
backend en un único tipo, sin repetir esa lógica en cada función de `api/`.

**Por qué no se resuelve con lo ya instalado.** `fetch` nativo existe, pero no ofrece
interceptores ni un objeto de error tipado: habría que reimplementar a mano una envoltura
con fusión de cabeceras, serialización de query params y normalización de errores, y cada
feature podría desviarse. TanStack Query gestiona caché y server state, no transporte.
axios cubre exactamente ese transporte, es maduro, pequeño, funciona en Node y navegador y
no depende de React, por lo que es compatible con React 19 y App Router.

**Regla de "una librería por propósito".** axios es la única librería de transporte HTTP;
no se añade ninguna otra.

**Impacto.** `axios` entra en `dependencies` (lo usa código de runtime).

### D2. Convención de URL base y rutas de los features

`API_URL` y `NEXT_PUBLIC_API_URL` ya incluyen el prefijo `/api/v1`
(`2026-09-22_01-17__estructura-base-y-env`). Por tanto:

- `baseUrl` = valor de `env.ts` (incluye `/api/v1`).
- Las funciones de `api/` de los features pasan la **ruta relativa al prefijo**, por
  ejemplo `/terceros`, `/terceros/{id}`, `/fincas`.
- `buildUrl(baseUrl, path)` une ambos con una única barra y deja pasar URLs absolutas sin
  tocarlas.

Se descarta cambiar el significado de las variables de entorno: contradeciría un Work Item
ya entregado y afectaría al BFF (T0.5). Los tipos generados se usan para los DTOs
(`components["schemas"]`), no como claves de URL.

### D3. Separación de puntos de entrada (server-first, sin contaminar el bundle cliente)

`http-client.ts` no importa `next/headers` y por eso es isomorfo y testeable.
`server-client.ts` sí importa `cookies()` de `next/headers`: al ser una API server-only,
cualquier import accidental desde un componente de cliente falla en build. No se añade
`server-only` como dependencia nueva porque `next/headers` ya cumple la función de guardia
y `conventions.md` pide preferir lo existente.

No se crea un `shared/api/index.ts` que reexporte todo: un barrel que incluya
`server-client.ts` arrastraría `next/headers` al bundle de cliente. Cada punto de entrada
se importa por su módulo.

En Next 16, `cookies()` es asíncrona: `createServerClient()` es `async` y espera su
resultado antes de construir el cliente.

### D4. Constante compartida del nombre de cookie

`session-cookie.ts` exporta `SESSION_COOKIE_NAME = "elinain_session"`. Se define en una
constante y no como literal para que la Feature de autenticación/BFF (T0.5) escriba y lea
la cookie con el mismo nombre. Vive en `shared/api` por ser infraestructura de transporte
sin lógica de dominio.

### D5. Error único: `ApiError`

`errors.ts` define:

- `ApiError` (extiende `Error`) con `status: number`, `message`, `errores: string[]`,
  `ruta?: string` y `marcaTiempo?: string`.
- `mapErrorResponse(status, data)`: función pura que interpreta el cuerpo del backend. Si
  el cuerpo tiene `mensaje` (forma de los DTOs `RespuestaError*Dto`) lo usa y recoge
  `errores` cuando es un array de strings; si no, aplica un mensaje por defecto según el
  estado.
- `toApiError(error)`: normaliza cualquier fallo. Si ya es `ApiError`, lo devuelve; si es un
  error de axios con respuesta, delega en `mapErrorResponse`; si es un fallo de red o un
  error desconocido, devuelve un `ApiError` con `status: 0` y mensaje en español.

El interceptor de respuesta de `http-client.ts` convierte todo rechazo en `ApiError`, de
modo que las funciones de `api/` de los features solo ven un tipo de error
(`conventions.md`).

### D6. Generación y versionado de tipos

- El spec OpenAPI se copia a `shared/api/openapi/api-1.json` (fuente de verdad versionada).
- El script `generate:api` ejecuta
  `openapi-typescript shared/api/openapi/api-1.json -o shared/api/openapi/schema.d.ts`.
- **Se versionan** el spec y `schema.d.ts`. Motivo: el checkpoint `V3`
  (`tsc --noEmit`) debe funcionar sin red ni pasos extra, y `npm run build` no es
  checkpoint. La regeneración es un acto explícito del desarrollador cuando cambia el
  backend.
- `types.ts` expone `ApiSchemas = components["schemas"]` para que los features tipen sus
  DTOs desde los tipos generados sin redefinirlos.

### D7. Exclusión de los generados de Prettier y ESLint

`shared/api/openapi/` se añade a `.prettierignore` y a `globalIgnores` de ESLint: son
archivos generados y no deben ser reformateados ni lintados, para no ensuciar `V1` y `V2`.

---

## Alternativas descartadas

- **Envoltura propia sobre `fetch`:** obliga a reimplementar interceptores, normalización
  de errores y serialización, con riesgo de divergencia entre features. Descartada por
  duplicación y mantenimiento.
- **Usar axios en componentes/`api/` directamente:** rompe la regla de que URL, cabeceras y
  serialización viven en `shared/api` (`conventions.md`).
- **Un único cliente con detección de entorno en runtime:** complica el tipado y puede
  arrastrar `next/headers` al bundle de cliente. Descartada por claridad y seguridad.
- **`server-only` como dependencia extra:** innecesaria; `next/headers` ya actúa como
  guardia server-only.
- **Barrel `shared/api/index.ts`:** arrastraría código server-only al cliente.
- **No versionar `schema.d.ts`:** obligaría a generar en cada entorno y haría depender `V3`
  de red o de un paso previo no contemplado en los checkpoints.

---

## Testabilidad y verificación

**Automatizable con Jest (lógica pura, sin red):**

- `request.test.ts`: `buildDefaultHeaders`, `buildAuthHeader` y `buildUrl` (unión con
  barras, rutas absolutas).
- `errors.test.ts`: `mapErrorResponse` con DTOs de validación/servidor y con cuerpos no
  reconocidos; `toApiError` con `ApiError`, con error de axios con respuesta (stub
  estructural `{ isAxiosError: true, response: { status, data } }`), con fallo de red y con
  valor desconocido.

Estos tests cubren `R14` y las partes puras de `R2`, `R3`, `R7`, `R8`, `R9` y `R15`.

**No automatizable (se valida por tipos e inspección):**

- `createServerClient` lee `next/headers`, que requiere contexto de petición. No se testea
  con Jest para no inventar dependencias de render/HTTP. Su lógica es delgada: se apoya en
  `buildAuthHeader`/`buildUrl` y en `getServerEnv`, ya cubiertos.
- `createHttpClient` monta interceptores sobre axios. Se verifica con `V3` (tipos) y por
  inspección; no se hacen peticiones reales (`verification.md` prohíbe tests con red).
- `V5` (validación manual) probablemente **no aplica**: no hay UI ni flujo interactivo. Se
  justificará en `impl.md`.

---

## Restricciones

- Raíz del repo, sin `src/`; todo vive en `shared/api`.
- `shared/` no importa de `features/` ni de `app/` (`R16`).
- `shared/config/env.ts` sigue siendo el único módulo que lee `process.env`.
- TypeScript `strict`: sin `any`, sin `@ts-ignore`; los desconocidos se estrechan con
  `unknown`.
- Textos y JSDoc en español (`conventions.md`).
- No se añaden dependencias distintas de `axios` y `openapi-typescript`.
- Este Work Item no implementa Route Handlers de autenticación/BFF (T0.5), ni el hook de
  paginación (T0.3), ni `shared/ui` (T0.4).

---

## Verificación prevista

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Prettier en verde (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | ESLint sin errores; generados excluidos. |
| `V3` | `npm run typecheck` | `tsc --noEmit` sin errores, con los tipos generados. |
| `V4` | `npm test` | Suite completa en verde, incluyendo `request.test.ts` y `errors.test.ts`. |
| `V5` | Validación manual | No aplica: sin UI ni flujo interactivo. Justificar en `impl.md`. |
