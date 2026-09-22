# Tareas — Fincas: listado y mapa de pines, CRUD con ubicación geocodificada y eliminación con 409

> Work Item: `2026-09-22_10-07__fincas-listado-mapa-geocodificacion-y-crud` (`type: feature`)
>
> Tareas discretas y ordenadas. El Implementer marca cada tarea como `[x]` inmediatamente al
> terminarla. Cada tarea referencia los requisitos (`R…`) que implementa.

---

- [x] **T1 — BFF de listado y creación de fincas.** Crear `app/api/fincas/route.ts` con `GET`
  (paginado, normalizando `limite`/`offset` con `shared/api/pagination`) y `POST` (parseo
  defensivo de `tercero_id`, `nombre`, `direccion`, `latitud`, `longitud`; rangos de coordenadas)
  sobre `createServerClient()` y `respuestaError`, con mensajes en español. (R1, R2, R6, R7)

- [x] **T2 — BFF de consulta, edición y borrado.** Crear `app/api/fincas/[id]/route.ts` con
  `GET`, `PATCH` (campos opcionales, al menos uno, nunca `tercero_id`) y `DELETE` (`204`;
  propaga el `409` de contratos vinculados). (R3, R4, R5, R6, R7, R8, R37)

- [x] **T3 — BFF de geocodificación.** Crear `app/api/geocodificacion/_lib/nominatim.ts`
  (consulta a Nominatim con `User-Agent` propio y `Accept-Language: es`, caché en memoria,
  cadencia ~1 req/s y `parsearRespuestaNominatim` puro) y `app/api/geocodificacion/route.ts`
  (`GET`, guardia de sesión con `sesionVigente`, `400`/`404`/`502`). Añadir
  `app/api/geocodificacion/_lib/__tests__/nominatim.test.ts`. (R9, R10, R11, R12, R13, R14, R51)

- [x] **T4 — Tipos, esquemas, mensajes y utilidades del feature.** Crear
  `features/fincas/types.ts` (alias de `ApiSchemas` + `Propietario` + `ResultadoGeocodificacion`),
  `query-keys.ts`, `schemas.ts` (`esquemaFinca` con campos obligatorios y rangos de latitud/
  longitud), `mensajes-error.ts` (listar/guardar/eliminar/geocodificación, incluido el `409`) y
  `propietarios.ts` (índice y nombre con respaldo). Crear los tests puros correspondientes.
  (R21, R31, R32, R44, R50, R51)

- [x] **T5 — API del feature.** Crear `features/fincas/api/fincas.ts` (`listarFincas`,
  `listarTodasLasFincas`, `obtenerFinca`, `crearFinca`, `actualizarFinca`, `eliminarFinca`) y
  `api/geocodificacion.ts` (`buscarCoordenadas`) sobre `createBffClient()`, propagando `ApiError`.
  (R1, R2, R3, R4, R5, R9, R22)

- [x] **T6 — Hooks del feature.** Crear `useFincas`, `useTodasLasFincas`, `useFinca`,
  `useCrearFinca`, `useActualizarFinca`, `useEliminarFinca` y `useGeocodificacion` con TanStack
  Query, error tipado `ApiError` e invalidación de `listas()`, `mapa()` y `detalle(id)`.
  (R16, R22, R33, R34, R35, R38, R42)

- [x] **T7 — Formulario y selector de mapa.** Crear `features/fincas/components/SelectorMapa.tsx`
  (Leaflet client-only: centro por defecto, pin arrastrable y por clic con `useMapEvents`, CSS de
  Leaflet, `divIcon`) y `components/FincaForm.tsx` (`useForm` + `zodResolver`, `Select` de
  propietario deshabilitado en edición, `Input` de nombre/dirección, botón "Ubicar dirección" con
  `useGeocodificacion`, `SelectorMapa` con import dinámico `ssr: false`). La posición del pin es
  la fuente de verdad. (R27, R28, R29, R30, R31, R32, R33)

- [x] **T8 — Conexión de crear y editar.** Crear `components/FincaCrear.tsx` y
  `components/FincaEditar.tsx`: mutaciones, confirmación de éxito, navegación a `/fincas` con
  `router.push` + `router.refresh`, precarga de la finca en edición y estados de envío/error.
  (R34, R35, R36, R38, R39)

- [x] **T9 — Listado y borrado.** Crear `components/FincasTable.tsx` (tabla paginada con nombre,
  dirección y propietario; estados de carga, vacío y error; acciones Editar y Eliminar) y
  `components/EliminarFincaModal.tsx` (confirmación y manejo del `409` sin cerrar el diálogo).
  (R16, R17, R18, R19, R20, R40, R41, R42, R43)

- [x] **T10 — Mapa y detalle.** Crear `components/FincasMapa.tsx` (Leaflet client-only,
  `TileLayer` de OpenStreetMap con atribución, un pin por finca con `Popup` y `fitBounds`) y
  `components/FincaDetalleModal.tsx` ("Ver detalle" abre el modal con la información general).
  (R22, R23, R24, R25, R26)

- [x] **T11 — Pestañas y API pública.** Crear `components/FincasTabs.tsx` (pestañas Listado/Mapa
  con el mapa cargado con `dynamic(..., { ssr: false })`) y `features/fincas/index.ts` exportando
  `FincasTabs`, `FincaCrear`, `FincaEditar` y el tipo `Propietario`. (R15, R25, R49)

- [x] **T12 — Ampliación mínima de `features/terceros`.** Añadir `listarTodosLosTerceros()` en
  `api/terceros.ts`, el hook `useTodosLosTerceros`, la clave `clavesTerceros.todos` y exportar el
  hook y el tipo `Tercero` desde `index.ts`. (R44, R45, R51)

- [x] **T13 — Composición en `app/` y páginas.** Crear
  `app/(dashboard)/fincas/page.tsx`, `nueva/page.tsx`, `[id]/editar/page.tsx` (Server Components)
  y los wrappers client `_components/{listado,nueva,editar}-con-propietarios.tsx` que usan
  `useTodosLosTerceros` y pasan `Propietario[]` a los componentes del feature. (R15, R27, R36,
  R44, R45)

- [x] **T14 — Rutas protegidas y navegación.** Añadir `/fincas` a `RUTAS_PROTEGIDAS` y
  `"/fincas"`, `"/fincas/:path*"` al `matcher` de `middleware.ts`; añadir el enlace "Fincas" en el
  layout del área protegida. (R46, R47)

- [x] **T15 — Checkpoints y evidencia.** Ejecutar `npm run format`, `V1` (`format:check`), `V2`
  (`lint`), `V3` (`typecheck`) y `V4` (`test`); confirmar `bash .rei/init.sh` con salida `0`;
  registrar la evidencia en
  `.rei/progress/work-items/2026-09-22_10-07__fincas-listado-mapa-geocodificacion-y-crud/impl.md`
  y documentar los pasos de reproducción para `V5`. (R51)

---

## Orden y dependencias

1. `T1`, `T2`, `T3`, `T4` y `T12` son independientes entre sí.
2. `T5` depende de `T1`–`T4`.
3. `T6` depende de `T5`.
4. `T7` depende de `T4` y `T6`.
5. `T8` depende de `T6` y `T7`.
6. `T9` y `T10` dependen de `T6` (y `T4`).
7. `T11` depende de `T9` y `T10`.
8. `T13` depende de `T8`, `T11` y `T12`.
9. `T14` es independiente y puede hacerse en paralelo.
10. `T15` se ejecuta al final, con todo implementado.

## Fuera de alcance

- Edición del tercero propietario desde fincas (`PATCH` no acepta `tercero_id`).
- Contratos asociados a las fincas y su gestión.
- Cambios en el OpenAPI local, en `shared/ui` o en dependencias.
- Tests de render (no hay librería de render; la interacción se valida en `V5`).
