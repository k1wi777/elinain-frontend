# Implementación — Fincas: listado y mapa de pines, CRUD con ubicación geocodificada y eliminación con 409

> Work Item: `2026-09-22_10-07__fincas-listado-mapa-geocodificacion-y-crud` (`type: feature`)
> Implementer: `implementer`
> Diseño de referencia: `.rei/specs/2026-09-22_10-07__fincas-listado-mapa-geocodificacion-y-crud/`

## Resumen

Se implementó la gestión de fincas sobre la infraestructura existente, cubriendo los
requisitos R1–R52:

- BFF dedicado de fincas (`GET`/`POST /api/fincas`, `GET`/`PATCH`/`DELETE /api/fincas/{id}`)
  que propaga el código HTTP real, incluido el `409` al eliminar.
- BFF de geocodificación (`GET /api/geocodificacion`) como proxy autenticado a Nominatim,
  con `User-Agent` propio, `Accept-Language: es`, caché en memoria y cadencia ~1 req/s.
- Feature `fincas` autocontenido: tipos, esquemas zod, mensajes de error, resolución de
  propietarios, API, hooks de TanStack Query y componentes (tabla, mapa Leaflet, formulario
  con selector de mapa, modales de detalle y borrado).
- Ampliación mínima de `features/terceros` (`listarTodosLosTerceros`, `useTodosLosTerceros`,
  `clavesTerceros.todos`, export de `Tercero`).
- Composición de propietarios en `app/` mediante wrappers client, rutas dedicadas
  `/fincas`, `/fincas/nueva` y `/fincas/[id]/editar`, guardia en `middleware.ts` y enlace en
  el layout del dashboard.
- Tests Jest de lógica pura (esquemas, mensajes, query keys, propietarios y parseo de
  Nominatim).

## Archivos

### Creados

| Archivo | Contenido |
|---------|-----------|
| `app/api/fincas/route.ts` | BFF `GET` (listar paginado) y `POST` (crear). |
| `app/api/fincas/[id]/route.ts` | BFF `GET`, `PATCH` (sin `tercero_id`) y `DELETE` (propaga `409`). |
| `app/api/geocodificacion/route.ts` | BFF `GET` proxy, con guardia de sesión y `400`/`404`/`502`. |
| `app/api/geocodificacion/_lib/nominatim.ts` | Cliente Nominatim: caché, cadencia y parseo puro. |
| `app/api/geocodificacion/_lib/__tests__/nominatim.test.ts` | Tests de `parsearRespuestaNominatim`. |
| `features/fincas/types.ts` | Alias de DTOs de OpenAPI + `Propietario`, `ResultadoGeocodificacion`, `PosicionFinca`. |
| `features/fincas/query-keys.ts` | `clavesFincas` (listas, lista, mapa, detalle). |
| `features/fincas/schemas.ts` | `esquemaFinca` con obligatorios y rangos lat/lon. |
| `features/fincas/mensajes-error.ts` | Mensajes de listar/guardar/eliminar/geocodificar (incluye `409`). |
| `features/fincas/propietarios.ts` | Índice y nombre de propietario con respaldo. |
| `features/fincas/api/fincas.ts` | Seis operaciones del BFF. |
| `features/fincas/api/geocodificacion.ts` | `buscarCoordenadas` contra el BFF. |
| `features/fincas/hooks/*.ts` | `useFincas`, `useTodasLasFincas`, `useFinca`, `useCrearFinca`, `useActualizarFinca`, `useEliminarFinca`, `useGeocodificacion`. |
| `features/fincas/components/SelectorMapa.tsx` | Leaflet client-only del formulario (pin arrastrable/por clic). |
| `features/fincas/components/FincaForm.tsx` | Formulario crear/editar + botón "Ubicar dirección". |
| `features/fincas/components/FincaCrear.tsx` / `FincaEditar.tsx` | Conexión con las mutaciones y navegación. |
| `features/fincas/components/FincasTable.tsx` | Listado paginado con acciones Editar/Eliminar. |
| `features/fincas/components/EliminarFincaModal.tsx` | Confirmación y manejo del `409`. |
| `features/fincas/components/FincasMapa.tsx` | Leaflet client-only, pines, popups y detalle. |
| `features/fincas/components/FincaDetalleModal.tsx` | Detalle general y acción Editar. |
| `features/fincas/components/FincasTabs.tsx` | Pestañas Listado/Mapa con mapa diferido sin SSR. |
| `features/fincas/components/icono-pin.ts` | `crearIconoPin` (`L.divIcon` con SVG), compartido por ambos mapas. |
| `features/fincas/index.ts` | Barrel: `FincasTabs`, `FincaCrear`, `FincaEditar`, `Propietario`. |
| `features/fincas/__tests__/{schemas,mensajes-error,query-keys,propietarios}.test.ts` | Tests puros del feature. |
| `app/(dashboard)/fincas/page.tsx` | Server Component de `/fincas`. |
| `app/(dashboard)/fincas/nueva/page.tsx` | Server Component de `/fincas/nueva`. |
| `app/(dashboard)/fincas/[id]/editar/page.tsx` | Server Component de `/fincas/[id]/editar`. |
| `app/(dashboard)/fincas/_components/listado-con-propietarios.tsx` | Composición client terceros → `FincasTabs`. |
| `app/(dashboard)/fincas/_components/nueva-con-propietarios.tsx` | Composición client terceros → `FincaCrear`. |
| `app/(dashboard)/fincas/_components/editar-con-propietarios.tsx` | Composición client terceros → `FincaEditar`. |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `features/terceros/api/terceros.ts` | Añade `listarTodosLosTerceros()` (pagina con `LIMITE_MAXIMO` hasta `total`). |
| `features/terceros/hooks/useTodosLosTerceros.ts` | Nuevo hook de la colección completa. |
| `features/terceros/query-keys.ts` | Añade `todos: () => ["terceros", "todos"]`. |
| `features/terceros/index.ts` | Exporta `useTodosLosTerceros` y el tipo `Tercero`. |
| `features/terceros/__tests__/query-keys.test.ts` | Test de `clavesTerceros.todos()`. |
| `middleware.ts` | `/fincas` en `RUTAS_PROTEGIDAS` y matcher con `/fincas` y `/fincas/:path*`. |
| `app/(dashboard)/layout.tsx` | Enlace "Fincas" junto a "Socios de participación". |

No se modificaron `package.json`, `shared/api/openapi/*`, `shared/ui`, ESLint, Prettier ni
Jest. No se añadieron dependencias.

## Cambios relevantes

- **BFF de fincas:** `GET` normaliza `limite`/`offset`; `POST` y `PATCH` validan el cuerpo de
  forma defensiva (strings no vacíos, números finitos en rango). Los `catch` resuelven
  `error instanceof ApiError ? respuestaError(error.status, mensajes) : respuestaError(500)`.
  Mensajes propios: `400` "Revisa los datos de la finca.", `404` "La finca no existe.",
  `409` "No se puede eliminar la finca porque tiene contratos vinculados.". El `PATCH` nunca
  lee ni reenvía `tercero_id`.
- **Geocodificación:** `sesionVigente` + `SESSION_COOKIE_NAME` como guardia (sin sesión →
  `401` sin llamar a Nominatim). `parsearRespuestaNominatim` es pura (primera coincidencia,
  `lat`/`lon` numéricos, rango válido, `display_name` opcional). `geocodificar` cachea
  coincidencias con límite de entradas y serializa las peticiones para respetar ~1 req/s. Un
  fallo de Nominatim se traduce a `502`.
- **Feature `fincas`:** API sobre `createBffClient()` con propagación de `ApiError`; hooks con
  `keepPreviousData` e invalidación de `listas()`, `mapa()` y `detalle(id)`; `listarFincas`
  y `listarTodasLasFincas` (esta última pagina hasta `total` para el mapa).
- **Mapas:** Leaflet solo client-side (`'use client'` + `dynamic(..., { ssr: false })`),
  `leaflet/dist/leaflet.css` importado en los componentes que usan Leaflet, `TileLayer` de
  OpenStreetMap con atribución y marcadores con `L.divIcon` (SVG en línea, sin PNG por
  defecto). El mapa del listado ajusta la vista con `fitBounds`; el selector del formulario
  usa pin arrastrable y colocación por clic.
- **Propietarios:** `features/fincas` no importa de `features/terceros`; los tres wrappers
  client de `app/` usan `useTodosLosTerceros`, transforman a `Propietario[]` y los pasan por
  props. Los ids sin resolver muestran "Propietario no disponible".
- **Rutas y guardia:** `/fincas`, `/fincas/nueva` y `/fincas/[id]/editar` con páginas
  delgadas; enlace "Fincas" en el layout y `/fincas` protegido en el middleware.

## Decisiones de implementación

- **La dirección solo centra el mapa (R29).** El botón "Ubicar dirección" usa
  `useGeocodificacion` y únicamente desplaza la vista; el pin se coloca o ajusta con clic o
  arrastre. Así las coordenadas enviadas provienen siempre de la posición del pin y la
  etiqueta de Nominatim nunca se escribe en `direccion`.
- **`icono-pin.ts` como helper interno.** Para no duplicar el `divIcon` entre el mapa del
  listado y el selector del formulario se extrajo una función pura; no añade dependencias ni
  cruza capas.
- **Caché de geocodificación solo con coincidencias.** Se cachean los aciertos (con límite de
  entradas) para no repetir consultas idénticas; una dirección sin coincidencias no se
  memoriza, evitando fijar un `404` transitorio. La cadencia se serializa con una cola para
  que solicitudes concurrentes no se adelanten.
- **`useWatch`/`getValues` en `FincaForm`.** Se evita `watch()` para no disparar el aviso del
  React Compiler; `useWatch` suscribe las coordenadas y `getValues` lee la dirección bajo
  demanda.

## Verificación

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | Pasa | `npm run format` ejecutado antes; Prettier no reporta cambios pendientes. |
| `V2` | `npm run lint` | Pasa | `eslint` sin errores ni advertencias. |
| `V3` | `npm run typecheck` | Pasa | `npx next typegen` ejecutado antes para las rutas nuevas; `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Pasa | 16 suites / 133 tests en verde, incluidas las 6 suites nuevas/ampliadas de fincas, geocodificación y `clavesTerceros.todos`. |
| `V5` | Validación manual | Pendiente de usuario | Requiere backend y sesión iniciada; ver pasos abajo. |

Además, `bash .rei/init.sh` finaliza con código de salida `0` y `V1`–`V4` en `[OK]`.

### Pasos de reproducción de `V5`

1. Con sesión iniciada, entrar a `/fincas`: pestañas "Listado" y "Mapa"; el listado muestra
   "Cargando…" y luego las columnas Nombre, Dirección, Propietario y Acciones, o el estado
   vacío *"Aún no tienes fincas registradas"*. Sin sesión, `/fincas` redirige a `/login`.
2. Pestaña "Mapa": ver un pin por finca (incluidas las de otras páginas), la atribución de
   OpenStreetMap y, al hacer clic en un pin, el popup con nombre, propietario, dirección y
   "Ver detalle"; el botón abre el modal de detalle sin cambiar de ruta.
3. Crear finca (`Nueva finca`): enviar vacío y comprobar los errores en español (propietario,
   nombre, dirección y "Ubica la finca en el mapa."). Escribir una dirección y pulsar "Ubicar
   dirección": el mapa se centra; verificar que el pin se coloca con clic o arrastre y que la
   dirección escrita no cambia. Guardar: confirmación y vuelta al listado con la finca nueva
   en tabla y mapa.
4. Editar desde "Editar" o desde el detalle del mapa: el formulario aparece precargado, el
   propietario está deshabilitado y el pin en la posición actual; guardar refleja los cambios.
5. Editar una finca inexistente por URL (id inválido): mensaje "La finca no existe.".
6. Eliminar una finca sin contratos: confirmar y ver el `Toast` de éxito sin recargar la
   página. Si era la única fila de una página mayor que 1, retrocede una página.
7. Eliminar una finca con contratos vinculados: ver el mensaje del `409` y comprobar que no
   se elimina y el modal permanece abierto.
8. Navegar por teclado por pestañas y formulario, y cerrar los modales con `Escape`.

## Observaciones

- `shared/` no importa de `features/` ni de `app/`; `features/fincas` no importa de
  `features/terceros` ni de `app/`. La composición entre features ocurre en `app/`.
- Ningún componente llama a `fetch` ni conoce URLs; el acceso a datos pasa por
  `createBffClient()` en `features/fincas/api` y por TanStack Query en los hooks. No se usa
  `useEffect` para obtener datos (solo para operaciones imperativas de Leaflet).
- No se usó `any` ni `@ts-ignore`. Named exports salvo donde Next lo exige.
- El navegador nunca llama a Nominatim: toda consulta pasa por el BFF.
