# Revisión — Fincas: listado y mapa de pines, CRUD con ubicación geocodificada y eliminación con 409

> Work Item: `2026-09-22_10-07__fincas-listado-mapa-geocodificacion-y-crud` (`type: feature`)
> Reviewer: `reviewer`
> Estado final: **`done`**

## Resultado

Aprobado. La implementación cubre R1–R52, respeta las decisiones D1–D12 y completa T1–T15
sin alcance extra. Arquitectura, convenciones y checkpoints verificados de forma
independiente.

## Verificaciones

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | Pasa | Prettier sin cambios pendientes. |
| `V2` | `npm run lint` | Pasa | ESLint sin errores ni advertencias. |
| `V3` | `npx next typegen` + `npm run typecheck` | Pasa | Tipos de ruta generados; `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Pasa | 16 suites / 133 tests en verde. |
| `V5` | Validación manual | Pendiente de usuario | Requiere backend y sesión; pasos en `impl.md`. No bloquea el cierre de la revisión. |

`bash .rei/init.sh` finaliza con código de salida `0` (`V1`–`V4` en `[OK]`).

## Comprobaciones funcionales (R1–R52)

- **BFF de fincas (R1–R8).** `app/api/fincas/route.ts` (GET paginado con `normalizarLimite`,
  POST validado) y `app/api/fincas/[id]/route.ts` (GET/PATCH/DELETE). Propagación del código
  HTTP real vía `respuestaError`; el `409` de contratos vinculados se conserva con mensaje
  propio; los errores son controlados y en español sin exponer el `mensaje` crudo.
- **Geocodificación (R9–R14).** `app/api/geocodificacion/route.ts` con guardia `sesionVigente`
  (sin sesión → `401` sin llamar a Nominatim), `400`/`404`/`502` y `_lib/nominatim.ts` con
  `User-Agent` propio, `Accept-Language: es`, caché con límite, cadencia ~1 req/s serializada
  y `parsearRespuestaNominatim` puro. El navegador solo llama al BFF.
- **Listado y mapa (R15–R26).** `/fincas` con pestañas Listado/Mapa, `FincasTable` con
  Nombre/Dirección/Propietario y acciones Editar/Eliminar, estados de carga/vacío/error;
  mapa client-only (`dynamic(..., { ssr: false })` + `leaflet/dist/leaflet.css`), un pin por
  finca completa (`listarTodasLasFincas` pagina hasta `total`), atribución OSM, popup con
  "Ver detalle" que abre `FincaDetalleModal` sin cambiar de ruta.
- **Crear/editar (R27–R39).** `/fincas/nueva` y `/fincas/[id]/editar` con el mismo `FincaForm`;
  selector de tercero deshabilitado en edición, nombre/dirección y pin arrastrable/por clic
  donde la posición del pin es la fuente de verdad; validación zod de obligatorios y rangos
  lat/lon; `PATCH` nunca envía `tercero_id`; éxito con confirmación y vuelta al listado.
- **Eliminar (R40–R43).** Confirmación en modal; el `409` muestra el mensaje de contratos
  vinculados sin cerrar el diálogo; el éxito invalida listado y mapa sin recargar.
- **Transversal (R44–R52).** Propietario resuelto en `app/` con `Propietario[]` pasado por
  props; `features/fincas` no importa de `features/terceros` ni de `app/`; `/fincas` protegido
  en `middleware.ts` y enlace en el layout; sin dependencias nuevas; mensajes en español;
  tests de lógica pura y accesibilidad soportada por `shared/ui`.

## Comprobaciones de arquitectura y convenciones

- Reutiliza `createBffClient`, `createServerClient`, `ApiError`, `usePagination`,
  `shared/ui` y `respuestaError`; el BFF traduce red (`0`) a `502`.
- `shared/` no importa de `features/` ni de `app/`; `features/` no importa de `app/`; ningún
  feature importa de otro (composición en `app/`).
- Sin `any`, `@ts-ignore` ni `@ts-expect-error`; named exports salvo lo que Next exige;
  `'use client'` en el nodo más bajo; Leaflet solo con import dinámico `ssr: false` y su CSS.
- Sin `fetch` en componentes ni `useEffect` para datos (los `useEffect` presentes son de
  Leaflet). No se tocaron `package.json`, `shared/api/openapi/*` ni `shared/ui`.
- Tests de lógica pura presentes: esquemas, mensajes (incluido `409`), query keys,
  propietarios y `parsearRespuestaNominatim`.

## Observaciones

- `icono-pin.ts` y el tipo `PosicionFinca` son ayudas internas para no duplicar el `divIcon`
  y tipar el selector; no alteran el alcance ni cruzan capas.
- `V5` queda a cargo del usuario con los pasos documentados en `impl.md`.

## Acciones requeridas

Ninguna.
