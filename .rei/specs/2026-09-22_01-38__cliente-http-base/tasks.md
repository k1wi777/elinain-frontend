# Tareas — Cliente HTTP base en `shared/api`

> Work Item: `2026-09-22_01-38__cliente-http-base` (`type: feature`)
>
> Tareas discretas y ordenadas. El Implementer marca cada tarea como `[x]`
> inmediatamente al terminarla. Cada tarea referencia los requisitos (`R…`) que
> implementa.

---

- [x] **T1 — Dependencias y script de generación.** Añadir `axios` a `dependencies` y
  `openapi-typescript` a `devDependencies` en `package.json`; añadir el script
  `"generate:api": "openapi-typescript shared/api/openapi/api-1.json -o shared/api/openapi/schema.d.ts"`.
  Ejecutar `npm install`. (R12)

- [x] **T2 — Alojar el OpenAPI y generar los tipos.** Copiar el spec del backend a
  `shared/api/openapi/api-1.json` y ejecutar `npm run generate:api` para producir
  `shared/api/openapi/schema.d.ts`. Versionar ambos archivos. (R12, R13)

- [x] **T3 — Excluir los generados de las herramientas.** Añadir `shared/api/openapi/` a
  `.prettierignore` y `shared/api/openapi/**` a `globalIgnores` en `eslint.config.mjs`.
  Eliminar `shared/api/.gitkeep`. (R13)

- [x] **T4 — Alias de tipos generados.** Crear `shared/api/types.ts` exportando
  `ApiSchemas = components["schemas"]` a partir de
  `@/shared/api/openapi/schema`. (R13)

- [x] **T5 — Constante del nombre de cookie.** Crear `shared/api/session-cookie.ts`
  exportando `SESSION_COOKIE_NAME = "elinain_session"`, con JSDoc que indique que la
  reutilizará la Feature de autenticación/BFF (T0.5). (R4)

- [x] **T6 — Helpers puros de petición.** Crear `shared/api/request.ts` con
  `buildDefaultHeaders()` (`Content-Type` y `Accept` JSON), `buildAuthHeader(token)`
  (`Authorization: Bearer <token>`) y `buildUrl(baseUrl, path)` (unión con una sola barra;
  deja pasar URLs absolutas). (R2, R11, R14)

- [x] **T7 — Error único y mapeo.** Crear `shared/api/errors.ts` con `ApiError`
  (`status`, `message`, `errores`, `ruta`, `marcaTiempo`), `mapErrorResponse(status, data)`
  y `toApiError(error)`, incluyendo mensajes por defecto en español y `status: 0` para
  fallos de red o desconocidos. (R7, R8, R9, R15)

- [x] **T8 — Núcleo del cliente axios.** Crear `shared/api/http-client.ts` con
  `createHttpClient({ baseUrl, getAuthToken? })`: define las cabeceras JSON por defecto,
  añade `Authorization` cuando hay token, compone la URL con `buildUrl` y convierte todo
  rechazo en `ApiError` desde el interceptor de respuesta. (R2, R3, R10)

- [x] **T9 — Cliente de servidor.** Crear `shared/api/server-client.ts` con
  `createServerClient()`: `await cookies()`, lee la cookie `SESSION_COOKIE_NAME`, obtiene
  `API_URL` con `getServerEnv()` y delega en `createHttpClient`. Sin cookie no añade
  `Authorization` y no lanza. (R1, R3, R5)

- [x] **T10 — Cliente público.** Crear `shared/api/public-client.ts` con
  `createPublicClient()`: obtiene `NEXT_PUBLIC_API_URL` con `getClientEnv()` y construye un
  cliente sin token. (R1, R6)

- [x] **T11 — Tests de lógica pura.** Crear `shared/api/__tests__/request.test.ts` y
  `shared/api/__tests__/errors.test.ts` cubriendo headers, URL y mapeo de errores, sin red
  ni render. (R14)

- [x] **T12 — Checkpoints y evidencia.** Ejecutar `npm run format`, `V1` (`format:check`),
  `V2` (`lint`), `V3` (`typecheck`) y `V4` (`test`); confirmar `bash .rei/init.sh` con
  salida `0`. Registrar evidencia en
  `.rei/progress/work-items/2026-09-22_01-38__cliente-http-base/impl.md` y marcar `V5`
  como no aplica con su justificación. (R14)

---

## Orden y dependencias

1. `T1` habilita `T2` (el script usa `openapi-typescript`).
2. `T2` habilita `T4` (los alias dependen del archivo generado) y `T3`.
3. `T5`, `T6` y `T7` no dependen entre sí; `T8` depende de `T6` y `T7`.
4. `T9` y `T10` dependen de `T8`.
5. `T11` depende de `T6` y `T7`.
6. `T12` se ejecuta al final, con todo implementado.

## Fuera de alcance

- Route Handlers de autenticación/BFF donde se escribe la cookie (T0.5).
- Hook genérico de paginación (T0.3).
- Sistema de diseño `shared/ui` (T0.4).
