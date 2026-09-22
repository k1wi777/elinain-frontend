# Revisión — Fix: Photon rechaza `lang=es` y rompe búsqueda, sugerencias e inversa

> Work Item: `2026-09-22_14-44__fix-photon-quitar-lang-es` (`type: task`) — Agente: `reviewer`.

## Resultado

**Aprobado (`done`).** La implementación cumple los pasos 1–4 de `plan.md` y respeta sus
restricciones, sin alcance extra. Los checkpoints `V1`–`V4` y `bash .rei/init.sh` se
reejecutaron de forma independiente y pasan. `V5` (dev server con sesión + UI) queda como
validación manual del usuario.

## Verificaciones realizadas

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | **Pasa** (`All matched files use Prettier code style!`, exit 0). |
| `V2` | `npm run lint` | **Pasa** (ESLint sin errores, exit 0). |
| `V3` | `npm run typecheck` | **Pasa** (`tsc --noEmit`, exit 0). |
| `V4` | `npm test` | **Pasa**: 24 suites / 224 tests (`photon.test.ts`: 23, +4 nuevos), exit 0. |
| — | `bash .rei/init.sh` | **Pasa** con salida `0`; `V1`–`V4` `[OK]`. |
| `V5` | Validación manual | **Pendiente** (usuario). Ver apoyo HTTP abajo. |

### Comprobación HTTP de la API pública de Photon (apoyo a `V5`)

Sin `lang`, las URLs que ahora construye el BFF responden `200`; con `lang=es` el proveedor
sigue rechazando con `400`, confirmando la causa y la corrección:

```text
HTTP 200  https://photon.komoot.io/api/?q=Bogota&limit=1&bbox=-79.0,-4.2,-66.8,12.6
HTTP 200  https://photon.komoot.io/reverse?lon=-74.1&lat=4.7&limit=1
HTTP 400  https://photon.komoot.io/api/?q=Bogota&limit=1&bbox=...&lang=es
```

La verificación autenticada vía `npm run dev` (`/api/geocodificacion`, `/sugerencias`,
`/inversa` → `200`; sin cookie → `401`) queda como `V5` del usuario, con los pasos ya
documentados en `impl.md`.

## Cumplimiento del plan

- **Paso 1 — quitar `lang=es`:** en `app/api/geocodificacion/_lib/photon.ts` no queda ningún
  `searchParams.set("lang", …)`; las únicas apariciones de `lang` son JSDoc y tests. Se
  conservan `q`, `limit` y `bbox=BBOX_COLOMBIA` en búsqueda, y `lon`, `lat` y `limit=1` en
  inversa.
- **Paso 2 — funciones puras:** `crearUrlBusqueda(consulta, limite)` pasa a `export function`
  (se usa en `geocodificarDireccion` con `limit=1` y en `sugerirDirecciones` con
  `LIMITE_SUGERENCIAS`); se extrae `crearUrlInversa(latitud, longitud)` **exportada** y
  `geocodificarInversa` la reutiliza. Ambas solo construyen `URL`, sin `fetch` ni estado.
- **Paso 3 — tests de regresión:** `photon.test.ts` añade los `describe` `crearUrlBusqueda` y
  `crearUrlInversa` (4 tests) que comprueban host `photon.komoot.io`, paths `/api/` y
  `/reverse`, presencia de `q`/`limit`/`bbox` y de `lat`/`lon`/`limit=1`, y ausencia de `lang`.
- **Paso 4 — checkpoints:** `V1`–`V4` reejecutados en verde.

## Restricciones y convenciones

- Sin dependencias nuevas; `package.json`/lockfile intactos.
- Sin `any`, `@ts-ignore` ni `@ts-expect-error` en `_lib/`; named exports; JSDoc en español.
- No se cambiaron proveedor, caché FIFO (`b:`/`s:`/`r:`), cadencia (`CADENCIA_MINIMA_MS`),
  `User-Agent` ni los mensajes de error. `Accept-Language: es` (cabecera, no parámetro de URL)
  se mantiene.
- Alcance respetado: solo `_lib/photon.ts` y `_lib/__tests__/photon.test.ts`. No se tocaron
  Route Handlers, `_lib/sesion.ts`, la UI, el OpenAPI ni otros BFF.

## Observaciones

- `V5` no es un fallo: es la validación manual que ejecuta el usuario al cierre sobre
  `npm run dev` con sesión; el comportamiento no automatizable (backend, cookies y UI) no se
  puede comprobar en esta revisión.
- No hay desviaciones respecto a la planificación.

## Acciones requeridas

Ninguna.
