# Revisión — Fincas: mapa acotado a Colombia, sugerencias con Photon y relleno inverso

> Work Item: `2026-09-22_13-39__fincas-mapa-colombia-sugerencias-photon-y-direccion-inversa`
> (`type: feature`) — Agente: `reviewer`.

## Resultado

**Aprobado (`done`).** La implementación cubre R1–R40, respeta D1–D10 y completa T1–T10 sin
alcance extra. Los checkpoints `V1`–`V4` y `bash .rei/init.sh` se reejecutaron de forma
independiente y pasan. `V5` queda pendiente de validación manual del usuario.

## Verificaciones realizadas

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | **Pasa** (`All matched files use Prettier code style!`, exit 0). |
| `V2` | `npm run lint` | **Pasa** (sin errores ni warnings, exit 0). |
| `V3` | `npx next typegen` + `npm run typecheck` | **Pasa** (tipos generados; `tsc --noEmit` exit 0). |
| `V4` | `npm test` | **Pasa**: 24 suites / 220 tests (`photon.test.ts`: 19), exit 0. |
| — | `bash .rei/init.sh` | **Pasa** con salida `0`; `V1`–`V4` `[OK]`. |
| `V5` | Validación manual | **Pendiente** (usuario). Se comprobó por HTTP que las tres rutas existen y aplican la guardia de sesión. |

### Comprobación HTTP del BFF (apoyo a `V5`)

Contra el servidor de desarrollo ya activo en `http://localhost:3000`, sin sesión:

```text
GET /api/geocodificacion?consulta=medellin              -> 401 {"mensaje":"Tu sesión no es válida o ha expirado."}
GET /api/geocodificacion/sugerencias?consulta=medellin  -> 401 {"mensaje":"Tu sesión no es válida o ha expirado."}
GET /api/geocodificacion/inversa?lat=4.7&lon=-74.1      -> 401 {"mensaje":"Tu sesión no es válida o ha expirado."}
```

Confirma R9/R10/R37. La respuesta `200` con datos reales de Photon depende de un servicio
externo y de una sesión autenticada; no se pudo verificar por esa vía, por lo que `V5` queda
para el usuario con los pasos ya documentados en `impl.md`.

## Cobertura de requisitos y diseño

- **R1–R5:** `features/fincas/mapa.ts` centraliza `CENTRO_COLOMBIA`, `LIMITES_COLOMBIA`,
  `ZOOM_POR_DEFECTO` y `ZOOM_MINIMO`; `SelectorMapa` y `FincasMapa` aplican `maxBounds`,
  `maxBoundsViscosity={1}` y `minZoom`, conservando `setView` (`SincronizarCentro`) y
  `fitBounds` (`AjustarVista`).
- **R6–R19:** tres endpoints BFF (`route.ts`, `sugerencias/route.ts`, `inversa/route.ts`)
  comparten `_lib/sesion.ts` (guardia `401` antes de tocar Photon) y `_lib/photon.ts`
  (URL `photon.komoot.io`, `User-Agent` propio, cadencia ~1 req/s, caché FIFO con claves
  `b:`/`s:`/`r:`, `bbox` de Colombia y `lang=es`). Búsqueda `404` sin coincidencia; sugerencias
  `200` con lista vacía y `400` por debajo del mínimo; inversa valida numérico, rango y caja de
  Colombia (`400`) y responde `404` sin dirección; fallo del proveedor → `502`. Mensajes en
  español vía `respuestaError`.
- **R20–R26:** combobox `AutocompletarDireccion` con `useValorDebounced(valor, 350)` y
  `useSugerenciasDireccion` (`useQuery` con `enabled` a 3 caracteres, `staleTime`, `retry:false`);
  `role="combobox"`, `listbox`/`option`, `aria-expanded`, `aria-controls`,
  `aria-autocomplete="list"`, `aria-activedescendant`, flechas/`Enter`/`Escape`, estados de
  carga/vacío/error; la selección escribe la etiqueta, centra el mapa y fija el pin.
- **R27–R32:** clic y `dragend` disparan `useGeocodificacionInversa`; `cambiarPosicion` escribe
  `direccion` sobrescribiendo, con contador en `useRef` para descartar respuestas obsoletas, sin
  borrar la dirección previa ante error y sin bloquear el guardado; `latitud`/`longitud` siguen
  viniendo del pin y la nota visible explica ambas cosas.
- **R33–R34:** `nominatim.ts` y su test eliminados; `grep -riE "nominatim"` solo devuelve
  menciones históricas en `.rei/` (specs y bitácora), sin referencias en código.
- **R35–R40:** sin dependencias nuevas; `shared/` no importa de `features/` ni de `app/`;
  `features/` no importa de `app/`; sin `any` real (los `step="any"` son atributos HTML) ni
  `@ts-ignore`; named exports; `'use client'` en el nodo más bajo; Leaflet con `dynamic(..., {
  ssr: false })`; sin `fetch` en componentes ni `useEffect` para datos (el debounce es un
  temporizador); textos en español; validación zod del formulario (dirección y pin
  obligatorios); tests puros de `photon.test.ts`, `mensajes-error.test.ts` y `query-keys.test.ts`.

## Observaciones

- **Desviación aprobada:** el hook genérico se implementó como
  `shared/lib/useValorDebounced.ts` (camelCase, conforme a la convención de hooks) en lugar de
  `use-valor-debounced.ts`; está documentada en `impl.md` y en `current.md`. No se considera
  incumplimiento.
- No se tocaron `package.json`, `package-lock.json`, `shared/api/openapi/*`, `shared/ui`, ESLint,
  Prettier ni Jest (verificado con `git status`).
- La desviación `app/ → features/` (`photon.ts` importa solo el tipo `ResultadoGeocodificacion`)
  es la dirección permitida por la arquitectura y evita duplicar el contrato.
- `V5` no es un fallo: es la validación manual que ejecuta el usuario al cierre, con pasos ya
  documentados. No hay acciones requeridas.

## Acciones requeridas

Ninguna.
