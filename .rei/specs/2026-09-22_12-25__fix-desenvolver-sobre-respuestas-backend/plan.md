# Plan — Fix: desenvolver el sobre `{exito, datos}` de las respuestas del backend

> Work Item: `2026-09-22_12-25__fix-desenvolver-sobre-respuestas-backend` (`type: task`)

## Objetivo

El backend envuelve **toda** respuesta exitosa en `{ exito: true, datos: <payload> }`, pero el
OpenAPI y los Route Handlers BFF asumen el payload plano. Como el BFF lee los campos
directamente del cuerpo:

- `login`/`registro` obtienen `acceso.tokenAcceso === undefined` → `fijarSesion` →
  `obtenerExpiracionJwt(undefined)` lanza `TypeError` → el `catch` genérico responde **500**
  aunque el backend respondió 200.
- `terceros`/`fincas`/`contratos` reenvían `{exito, datos}` al navegador en lugar de
  `{elementos, …}`, dejando tablas y creaciones rotas.

Desenvolver el sobre en un **único punto central** (el interceptor de respuesta de
`shared/api/http-client.ts`) para que todos los clientes (`server-client`, `public-client` y
`bff-client`) reciban el payload plano, **sin tocar el OpenAPI ni los BFF**. Las respuestas de
error (que no llevan sobre) y las respuestas propias del BFF (204, 201 sin cuerpo,
`{mensaje}`) quedan intactas.

## Archivos

### Crear

| Archivo | Contenido |
|---------|-----------|
| `shared/api/response.ts` | Helper puro `desenvolverRespuesta(datos: unknown): unknown`. |
| `shared/api/__tests__/response.test.ts` | Tests de lógica pura del helper. |

### Modificar

| Archivo | Cambio |
|---------|--------|
| `shared/api/http-client.ts` | Aplicar el helper en el interceptor de respuesta exitoso. |

### No modificar (fuera del alcance)

`shared/api/openapi/*`, los Route Handlers `app/api/**`, `app/api/auth/_lib/sesion.ts`,
`shared/api/errors.ts` y los tipos generados.

## Cambios

### 1. Helper puro — `shared/api/response.ts`

```ts
export function desenvolverRespuesta(datos: unknown): unknown
```

- Devuelve `datos` sin cambios **salvo** cuando `datos` es un objeto no nulo, no array, con
  `exito === true` (booleano estricto) y propiedad propia `datos`; en ese caso devuelve
  `datos.datos`.
- Cualquier otro caso (arrays, primitivos, `null`, `undefined`, cuerpos sin sobre,
  `exito: false`, objetos propios del BFF) se devuelve tal cual.
- Sin `any`: se estrecha el objeto desconocido con un helper local `asRecord` (mismo patrón
  que `errors.ts`). Sin dependencias nuevas; módulo puro y testeable.

### 2. Integración central — `shared/api/http-client.ts`

- En `client.interceptors.response.use`, el manejador de éxito pasa de `(response) => response`
  a asignar el resultado del helper antes de devolver la respuesta:
  `response.data = desenvolverRespuesta(response.data); return response;`.
- Importar el helper desde `@/shared/api/response`.
- El manejador de rechazo **no se altera** (`toApiError`): los errores del backend no llevan
  sobre.
- Los cinco métodos (`get/post/put/patch/delete`) siguen devolviendo `.data`; al desenvolverse
  `response.data` en el interceptor, ya entregan el payload plano con el tipo `TResponse`
  (que coincide con el DTO del OpenAPI). **Ningún método se modifica.**
- `204` (cuerpo vacío) y respuestas propias del BFF (sin `exito`) atraviesan sin cambios.

### 3. Tests — `shared/api/__tests__/response.test.ts`

Jest, lógica pura, estilo de `request.test.ts`/`errors.test.ts`. Casos:

- sobre con `datos` objeto → devuelve el objeto interno;
- sobre con `datos` primitivo (string/number) → devuelve el primitivo;
- sobre con `datos` array → devuelve el array;
- sobre con `datos: null` → devuelve `null`;
- objeto sin sobre (`{ elementos, total, limite, offset }`, `{ mensaje }`) → tal cual;
- `exito: false` (cuerpo de error) → tal cual;
- `exito` no booleano (p. ej. `"true"`) → no desenvuelve;
- `{ exito: true }` sin propiedad `datos` → no desenvuelve;
- `null`, `undefined`, arrays y string vacío (cuerpo de `204`) → tal cual.

### Decisión evaluada: endurecer `fijarSesion`/`obtenerExpiracionJwt` (opcional) — EXCLUIDA

El `TypeError` en `obtenerExpiracionJwt` era **síntoma** del sobre, no una causa. Con el fix
central, `acceso.tokenAcceso` vuelve a llegar como string y `fijarSesion(response, tokenAcceso:
string)` recupera su contrato. Añadir una guardia que tolere un token ausente enmascararía
futuras regresiones del contrato backend↔BFF (el login respondería `204` sin cookie en lugar
de fallar de forma visible). Se excluye para no ampliar alcance ni silenciar errores;
`shared/api/session.ts` y `app/api/auth/_lib/sesion.ts` no se tocan.

## Restricciones

- Sin dependencias nuevas.
- No tocar `shared/api/openapi/*`, los Route Handlers `app/api/**`, `shared/api/errors.ts` ni
  los tipos generados: el payload desenvuelto sigue coincidiendo con los DTO del OpenAPI.
- TypeScript `strict`, sin `any`; named exports; JSDoc y textos en español.
- Compatibilidad hacia adelante: si el backend deja de envolver, el helper no altera el cuerpo.
- El helper es transversal y sin dominio: vive en `shared/api` (nunca importa de `features/`
  ni de `app/`).

## Pasos

1. [x] Crear `shared/api/response.ts` con `desenvolverRespuesta`.
2. [x] Crear `shared/api/__tests__/response.test.ts` con los casos anteriores.
3. [x] Aplicar el helper en el interceptor de éxito de `shared/api/http-client.ts` (sin tocar
   el interceptor de rechazo).
4. [x] Ejecutar `npm run format` y los checkpoints `V1`–`V4`; confirmar `bash .rei/init.sh`
   con salida `0`.
5. [x] Documentar la evidencia de `V1`–`V4` y los pasos de reproducción de `V5` en
   `.rei/progress/work-items/2026-09-22_12-25__fix-desenvolver-sobre-respuestas-backend/impl.md`.

## Verificación

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Pasa (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | Sin errores. |
| `V3` | `npm run typecheck` | Sin errores (no se tocan rutas; no requiere `npx next typegen`). |
| `V4` | `npm test` | Suite completa en verde, incluidos los tests nuevos. |
| `V5` | Validación manual | Login `204` con cookie y listados con forma plana (requiere backend y dev server). |

Pasos de `V5` (backend operativo y `npm run dev`):

1. `curl -i -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json'
   -d '{"email":"…","password":"…"}'` → `204` y cabecera `set-cookie: elinain_session=…`
   (antes: `500`).
2. Credenciales inválidas → código real del backend (`401`) con `{ mensaje }` en español, sin
   sobre.
3. Con la cookie, `curl -i http://localhost:3000/api/terceros` (y `/fincas`, `/contratos`) →
   cuerpo `{ elementos, total, limite, offset }`, sin `exito`/`datos`.
4. En el navegador: login, y listados/creación de terceros, fincas y contratos funcionan.

## Fuera de alcance

- Corregir el OpenAPI del backend y su contrato (se reporta como inconsistencia).
- Endurecer `fijarSesion`/`obtenerExpiracionJwt` (evaluado y excluido; ver arriba).
- Tests de red o del interceptor de axios (no hay tests de `http-client` en el proyecto).
