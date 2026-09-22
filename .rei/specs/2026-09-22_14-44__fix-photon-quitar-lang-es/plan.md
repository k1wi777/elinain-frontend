# Plan — Fix: Photon rechaza `lang=es` y rompe búsqueda, sugerencias e inversa

## Objetivo

Eliminar el parámetro `lang=es` de las URLs que el BFF construye para Photon, de modo que búsqueda, sugerencias e inversa vuelvan a responder correctamente (antes Photon responde 400 y el BFF traduce a 502). Añadir tests puros que impidan la regresión.

## Archivos

- `app/api/geocodificacion/_lib/photon.ts` — cliente del BFF (URLs y funciones puras).
- `app/api/geocodificacion/_lib/__tests__/photon.test.ts` — tests puros existentes; se amplían.

Sin cambios en los Route Handlers (`route.ts`, `sugerencias/route.ts`, `inversa/route.ts`), en `_lib/sesion.ts`, en la UI, en el OpenAPI ni en otros BFF.

## Cambios

1. **Quitar `lang=es`.**
   - En `crearUrlBusqueda`: eliminar `url.searchParams.set("lang", "es")`. Se mantienen `q`, `limit` y `bbox` (`BBOX_COLOMBIA`).
   - En `geocodificarInversa`: eliminar `url.searchParams.set("lang", "es")` de la URL inversa. Se mantienen `lon`, `lat` y `limit=1`.
   - El idioma por defecto de Photon ya devuelve nombres locales en español (OpenStreetMap). No cambia el proveedor ni el resto del comportamiento (caché, cadencia, `User-Agent`, parseo).

2. **Extraer funciones puras de construcción de URL (testeables sin red).**
   - `crearUrlBusqueda(consulta: string, limite: number): URL` pasa a exportarse (hoy es privada).
   - Extraer la construcción inline de la URL inversa a `crearUrlInversa(latitud: number, longitud: number): URL` y exportarla. `geocodificarInversa` la reutiliza en lugar de armar la `URL` a mano.
   - Ambas se mantienen puras, sin `fetch` ni estado.

3. **Tests de regresión** en `photon.test.ts`:
   - `crearUrlBusqueda("Bogotá", 5)`: no incluye `lang` (`searchParams.has("lang") === false`); incluye `q=Bogotá`, `limit=5` y `bbox=BBOX_COLOMBIA`; apunta a `https://photon.komoot.io/api/`.
   - `crearUrlInversa(4.7, -74.1)`: no incluye `lang`; incluye `lat=4.7`, `lon=-74.1` y `limit=1`; apunta a `https://photon.komoot.io/reverse`.

## Restricciones

- Sin dependencias nuevas.
- Sin `any`; todo lo nuevo tipado en `strict`.
- No tocar los Route Handlers, `_lib/sesion.ts`, la UI, el OpenAPI ni otros BFF.
- No cambiar el proveedor, la caché, la cadencia ni los mensajes de error existentes.
- Tests puros: sin red ni llamadas a Photon; mantener el estilo del suite actual.
- Fuera de alcance: mejoras de rendimiento (Work Item aparte).

## Pasos

- [x] 1. Editar `photon.ts`: eliminar `lang=es` en `crearUrlBusqueda` y extraer/exportar `crearUrlBusqueda` y `crearUrlInversa`; usarla en `geocodificarInversa`.
- [x] 2. Ampliar `photon.test.ts` con los casos de regresión descritos.
- [x] 3. Ejecutar `npm run test:related -- app/api/geocodificacion/_lib/photon.ts` durante el loop.
- [x] 4. Pasar checkpoints `V1` `npm run format:check`, `V2` `npm run lint`, `V3` `npm run typecheck`, `V4` `npm test`.
- [x] 5. Registrar evidencia en `.rei/progress/work-items/2026-09-22_14-44__fix-photon-quitar-lang-es/impl.md`, incluidos los pasos de `V5`:
   - Con sesión iniciada, en desarrollo (`npm run dev`):
     - `GET /api/geocodificacion?consulta=Carrera 83, Bogotá` → 200 con `{ latitud, longitud, etiqueta }` en español (antes 502).
     - `GET /api/geocodificacion/sugerencias?consulta=Bogota` → 200 con lista de sugerencias en español (antes 502).
     - `GET /api/geocodificacion/inversa?lat=4.7&lon=-74.1` → 200 con dirección en español y `countrycode`/etiqueta local (antes 502).
   - Sin sesión (cookie ausente): los tres endpoints → 401.
   - Verificación funcional en la UI del mapa de fincas: buscar, autocompletar y seleccionar un punto rellenan la dirección sin el mensaje genérico de error.
