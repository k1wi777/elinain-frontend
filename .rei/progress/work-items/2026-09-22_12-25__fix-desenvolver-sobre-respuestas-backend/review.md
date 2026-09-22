# Revisión — Fix: desenvolver el sobre `{exito, datos}` de las respuestas del backend

> Work Item: `2026-09-22_12-25__fix-desenvolver-sobre-respuestas-backend` (`type: task`)
> Agente: Reviewer · Fecha: 2026-09-22

---

## Resultado

**`done`** — La implementación cumple todos los pasos del `plan.md`, respeta las
restricciones y convenciones, y los checkpoints `V1`–`V4` y `bash .rei/init.sh` pasan. `V5`
reproducido de forma independiente por HTTP contra el backend real: login/registro recuperan
su código correcto y los listados llegan planos, sin sobre.

## Alcance verificado

- Se crearon exactamente `shared/api/response.ts` y
  `shared/api/__tests__/response.test.ts`; se modificó únicamente
  `shared/api/http-client.ts`. No se añadió alcance.
- `git diff` confirma que **no** se tocaron `shared/api/openapi/*`, ningún `app/api/**`,
  `shared/api/errors.ts`, `shared/api/session.ts` ni `app/api/auth/_lib/sesion.ts`.
- El `TypeError` en `fijarSesion`/`obtenerExpiracionJwt` quedó fuera del alcance, como
  planificó el Spec Author.

## Comprobaciones de código

- `desenvolverRespuesta` desenvuelve solo si el cuerpo es un objeto no nulo, no array, con
  `exito === true` (booleano estricto) y propiedad propia `datos`
  (`Object.prototype.hasOwnProperty.call`); en cualquier otro caso devuelve `datos` tal cual.
- La integración vive en el interceptor de respuesta **exitoso** únicamente
  (`response.data = desenvolverRespuesta(response.data)`); el interceptor de rechazo
  (`toApiError`) y los cinco métodos (`get/post/put/patch/delete`) quedan intactos.
- Sin `any` ni `@ts-ignore`; estrechamiento con `asRecord` local (mismo patrón que
  `errors.ts`). Named exports, JSDoc y textos en español. Sin dependencias nuevas. `shared/`
  no importa de `features/` ni de `app/`.
- `response.test.ts` cubre todos los casos exigidos por el plan: sobre con objeto, string,
  número y array; `datos: null`; objeto sin sobre; `{mensaje}`; `exito: false`; `exito` no
  booleano; `{exito: true}` sin `datos`; `null`, `undefined`, array y string vacío.

## Verificaciones (ejecución independiente del Reviewer)

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — "All matched files use Prettier code style!" |
| `V2` | `npm run lint` | Pasa — sin errores |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores |
| `V4` | `npm test` | Pasa — 24 suites / 205 tests (incluye `response.test.ts`) |
| — | `bash .rei/init.sh` | Pasa — `V1`–`V4` en `[OK]`, código de salida `0` |
| `V5` | Validación manual (curl contra `npm run dev` + backend real) | Pasa a nivel HTTP (ver abajo) |

### `V5` — reproducción independiente por HTTP

Dev server local `http://localhost:3000` contra `https://elinain-production.up.railway.app/api/v1`:

1. `POST /api/auth/registro` (usuario desechable) → `201 Created` con
   `set-cookie: elinain_session=…; HttpOnly; SameSite=lax`.
2. `POST /api/auth/login` con ese usuario → `204 No Content` con `set-cookie`
   (antes del fix: `500`).
3. `POST /api/auth/login` con contraseña inválida → `401 Unauthorized` con
   `{"mensaje":"Correo o contraseña incorrectos."}` (sin sobre).
4. Con la cookie: `GET /api/terceros`, `/api/fincas` y `/api/contratos` →
   `{"elementos":[],"total":0,"limite":20,"offset":0}`, sin `exito` ni `datos`.

El dev server se detuvo al terminar; puerto 3000 libre y sin procesos `next` colgados.

## Observaciones

- La validación de los pasos de UI en navegador (login y listados/creación desde la
  interfaz) queda, como es habitual en el proyecto, a cargo del usuario; no aporta más
  información que la ya confirmada por HTTP.
- Se confirma la inconsistencia del contrato del backend que envuelve en `{exito, datos}` lo
  que el OpenAPI documenta plano; queda reportada y fuera del alcance de este Work Item.

## Acciones requeridas

Ninguna.
