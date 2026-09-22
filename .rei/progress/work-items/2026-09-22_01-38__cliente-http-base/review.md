# Revisión — Cliente HTTP base en `shared/api`

- **Work Item:** `2026-09-22_01-38__cliente-http-base`
- **Tipo:** `feature` (Caso A)
- **Fecha:** `2026-09-22`
- **Agente:** `reviewer`
- **Estado final:** `done`

## Alcance de la revisión

Se revisó el Work Item contra `.rei/specs/2026-09-22_01-38__cliente-http-base/`
(`requirements.md`, `design.md`, `tasks.md`), contrastando la implementación real en el
repositorio (no solo el reporte del Implementer) contra `architecture.md`,
`conventions.md` y `verification.md`.

## Verificaciones realizadas

### Requisitos `R1`–`R16`

| Requisito | Evidencia | Resultado |
|-----------|-----------|-----------|
| `R1` URL base desde `env.ts` | `server-client.ts` usa `getServerEnv()`; `public-client.ts` usa `getClientEnv()`; ningún módulo de `shared/api` lee `process.env` (grep) | Cumple |
| `R2` Cabeceras JSON por defecto | `buildDefaultHeaders()` en `request.ts`; aplicadas con `axios.create({ headers })` en `http-client.ts` | Cumple |
| `R3` Bearer automático en servidor | `server-client.ts` lee `cookies()` y pasa `getAuthToken`; `http-client.ts` añade `Authorization` cuando hay token | Cumple |
| `R4` Constante del nombre de cookie | `session-cookie.ts` exporta `SESSION_COOKIE_NAME = "elinain_session"` con JSDoc | Cumple |
| `R5` Ausencia de sesión no es error | `cookieStore.get(...)?.value` devuelve `undefined`; el header se añade solo si `token` es truthy; no se lanza error | Cumple |
| `R6` Cliente público sin token | `createPublicClient()` no define `getAuthToken` | Cumple |
| `R7` Error tipado único | `errors.ts` define `ApiError` con `status` y `message`; interceptor de respuesta normaliza todo rechazo | Cumple |
| `R8` Detalle `errores` accesible | `ApiError.errores: string[]`; `readStringArray` recoge el array del cuerpo | Cumple |
| `R9` Fallo de red/desconocido | `toApiError` devuelve `status: 0` con mensaje en español | Cumple |
| `R10` Cuerpo exitoso interpretado | `HttpClient` devuelve `response.data`, sin envoltorio de axios | Cumple |
| `R11` Uso uniforme desde features | Los métodos reciben `path`; URL y cabeceras se resuelven en `shared/api` | Cumple |
| `R12` Generación desde OpenAPI | Script `generate:api` en `package.json`; `schema.d.ts` generado por `openapi-typescript` | Cumple |
| `R13` Tipos versionados sin red | `shared/api/openapi/api-1.json` y `schema.d.ts` presentes y versionados; `V3` pasa sin generación | Cumple |
| `R14` Tests de lógica pura | `__tests__/request.test.ts` (7) y `__tests__/errors.test.ts` (9); sin red ni render | Cumple |
| `R15` Cuerpo de error no reconocido | `mapErrorResponse` aplica `DEFAULT_MESSAGES` por estado o mensaje genérico | Cumple |
| `R16` Aislamiento de capas | `shared/api` solo importa de `shared/*` (grep); sin `features/` ni `app/` | Cumple |

### Tareas `T1`–`T12`

Todas marcadas como `[x]` en `tasks.md` y verificadas contra el código: `T1` dependencias y
script, `T2` OpenAPI + tipos, `T3` exclusiones de generados, `T4` `types.ts`, `T5`
`session-cookie.ts`, `T6` `request.ts`, `T7` `errors.ts`, `T8` `http-client.ts`, `T9`
`server-client.ts`, `T10` `public-client.ts`, `T11` tests, `T12` checkpoints. **12/12
completadas.**

### Arquitectura (`architecture.md`)

- Raíz del repo sin `src/` (verificado).
- `shared/` no importa de `features/` ni de `app/` (grep): solo imports `@/shared/*`.
- `shared/config/env.ts` es el único módulo de producción que lee `process.env`; no se
  modificó. (`shared/config/__tests__/env.test.ts` manipula `process.env` para probar
  `env.ts`; es preexistente, ajeno a este Work Item y no es código de runtime.)
- Sin dependencias circulares; sin lógica de dominio en `shared/api`.
- Se añadieron únicamente `axios` (runtime) y `openapi-typescript` (desarrollo), ambos
  justificados en `design.md` D1 y en `conventions.md`; no hay dependencias extra.

### Convenciones (`conventions.md`)

- Sin `any`, `@ts-ignore` ni `@ts-expect-error` en `shared/` (grep).
- `unknown` estrechado en `errors.ts`; `class ApiError` extiende `Error`; `type` para
  opciones y aliases.
- Archivos con nombres `kebab-case`, artefacto por archivo; JSDoc en español; sin
  `console.log`; early returns en `buildUrl`.
- Sin `export default` en `shared/api`; named exports.
- Errores de `api/` lanzan `ApiError`, sin capturas vacías.

### Diseño (`design.md`)

- **Tres puntos de entrada** presentes y separados: `http-client.ts` (isomorfo),
  `server-client.ts` (server-only vía `next/headers`) y `public-client.ts`.
- **`ApiError` único** con `status`, `message`, `errores`, `ruta`, `marcaTiempo`;
  `mapErrorResponse` y `toApiError` implementados según D5.
- **Tipos generados y versionados** (`api-1.json` + `schema.d.ts`); `api-1.json` es
  idéntico a la fuente `/home/jose/Documentos/elinain/api-1.json` (`diff` = IDENTICAL).
- **Generados excluidos** de Prettier (`.prettierignore`) y ESLint (`globalIgnores`).
- **Sin barrel** `shared/api/index.ts` (verificado en el listado del directorio).
- `shared/api/.gitkeep` eliminado. No se tocaron `env.ts`, `.env.local` ni `.env.example`.

### Desviaciones y alcance

No se detectaron desviaciones ni alcance extra. `git status` muestra únicamente los
archivos previstos en `design.md` más la documentación del Work Item. No se implementaron
`app/api/*` (T0.5), hook de paginación (T0.3) ni `shared/ui` (T0.4).

## Checkpoints

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | **Pasa** | `All matched files use Prettier code style!` |
| `V2` | `npm run lint` | **Pasa** | ESLint sin errores; generados excluidos. |
| `V3` | `npm run typecheck` | **Pasa** | `tsc --noEmit` sin errores en `strict`. |
| `V4` | `npm test` | **Pasa** | 3 suites, 24 tests en verde (16 nuevos + 8 de `env.test.ts`). |
| `V5` | Validación manual | **No aplica (justificado)** | Módulos headless de `shared/api`, sin UI ni flujo interactivo. La lógica pura la cubre `V4` y el resto se verifica con `V3` e inspección. Justificación en `impl.md` y `design.md`. Se valida la justificación. |

`bash .rei/init.sh` finaliza con **código de salida `0`** y los cuatro checkpoints
(`Formato V1`, `Lint V2`, `Tipos V3`, `Tests V4`) en `[OK]`. El `[WARN]` de la Sección 3
es la sesión activa esperada y no afecta al resultado.

## Observaciones

- `package-lock.json` refleja `axios` y `openapi-typescript` con sus transitivas; coherente
  con `package.json` y `npm install` sin vulnerabilidades.
- El interceptor de petición compone la URL con `buildUrl` y adjunta el token de forma
  asíncrona, manteniendo el núcleo isomorfo y testeable.
- No se realizaron commits de git (fuera del alcance del Work Item).

## Decisión

Todos los requisitos (`R1`–`R16`) están implementados, las tareas (`T1`–`T12`) están
completadas, la implementación respeta la arquitectura, las convenciones y el diseño, y los
checkpoints `V1`–`V4` junto con `bash .rei/init.sh` finalizan en verde. Se aprueba el Work
Item.

**Estado final:** `done`.
