# Tareas — Costos embebidos en el detalle del contrato

> Work Item: `2026-09-22_22-16__costos-listado-registro-edicion-y-eliminacion-en-contrato` (`type: feature`)

## Implementación

- [x] **T1** — Crear `features/costos/types.ts` con los alias de DTOs (`Costo`, `PaginaCostos`, `CrearCosto`, `ActualizarCosto`) y el tipo `FiltrosCostos`. (R2)
- [x] **T2** — Crear `features/costos/query-keys.ts` con `clavesCostos` (`todas`, `listas()`, `lista(filtros)`). (R2, R16)
- [x] **T3** — Crear `features/costos/schemas.ts` con `esquemaCosto` (tipo, monto > 0, fecha solo-día y descripción, todos requeridos) y `DatosFormularioCosto`. (R6, R8)
- [x] **T4** — Crear `features/costos/mensajes-error.ts` con `mensajeErrorListarCostos`, `mensajeErrorCrearCosto`, `mensajeErrorEditarCosto` y `mensajeErrorEliminarCosto` (400/404/0/resto). (R4, R14, R15)
- [x] **T5** — Crear `features/costos/api/costos.ts` con `listarCostos`, `crearCosto`, `actualizarCosto` y `eliminarCosto` sobre `createBffClient`. (R17)
- [x] **T6** — Crear los hooks `useCostos`, `useCrearCosto`, `useActualizarCosto` y `useEliminarCosto`; las mutaciones invalidan `clavesCostos.listas()`. (R2, R16)
- [x] **T7** — Crear `app/api/costos/route.ts` (BFF): `GET` listar con normalización de paginación y filtro `contrato_id`, y `POST` crear con validación defensiva de los cinco campos. (R9, R17)
- [x] **T8** — Crear `app/api/costos/[id]/route.ts` (BFF): `GET`, `PATCH` (solo campos mutables, al menos uno) y `DELETE`, propagando el código HTTP real con mensajes en español. (R14, R15, R17)
- [x] **T9** — Crear `features/costos/components/CostoForm.tsx`: los cuatro campos requeridos, `datalist` de sugerencias para `tipo`, conversión de `monto` a número, `fecha` con `type="date"`, precarga con `isoAFechaDia` y aviso informativo visible. (R5, R6, R7, R8, R9)
- [x] **T10** — Crear `features/costos/components/CostoFormModal.tsx` que componga `Modal` con `CostoForm` y títulos de crear/editar. (R6, R11)
- [x] **T11** — Crear `features/costos/components/EliminarCostoModal.tsx` con confirmación previa en `Modal` (sin `window.confirm`) y mensaje de error. (R12, R14, R15)
- [x] **T12** — Crear `features/costos/components/CostosSeccion.tsx`: aviso informativo, listado paginado con columnas fecha/tipo/monto/descripción y monto en moneda es-CO, botón "Agregar costo" deshabilitado con `contratoEstado === 'cerrado'`, edición y eliminación siempre disponibles, traducción de errores y Toast de éxito. (R1–R5, R8–R18)
- [x] **T13** — Actualizar `features/costos/index.ts` para exportar solo `CostosSeccion`. (R1)

## Integración y limpieza

- [x] **T14** — Eliminar `features/costos/components/CostosProximamente.tsx` y `app/(dashboard)/costos/page.tsx`. (R19)
- [x] **T15** — Retirar el enlace "Costos" de `app/(dashboard)/layout.tsx`. (R19)
- [x] **T16** — Retirar `"/costos"` de `RUTAS_PROTEGIDAS` y del `matcher` en `middleware.ts`. (R19)
- [x] **T17** — Retirar la sección "Próximamente: ciclos y costos" de `features/contratos/components/ContratoDetalle.tsx` y actualizar su JSDoc. (R20)
- [x] **T18** — Componer `CostosSeccion` en `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx` con `contratoId`, `contratoEstado` desde `useContrato` y `onCambio` que invalide `clavesContratos.todas`. (R1, R2, R10, R16)
- [x] **T19** — Eliminar `shared/ui/Proximamente.tsx` y su export en `shared/ui/index.ts`, que quedan sin consumidores. (limpieza)

## Pruebas y verificación

- [x] **T20** — Añadir los tests puros `features/costos/__tests__/schemas.test.ts`, `mensajes-error.test.ts` y `query-keys.test.ts`. (R8, R14, R15, R16)
- [x] **T21** — Ejecutar y documentar los checkpoints `V1` (`npm run format:check`), `V2` (`npm run lint`), `V3` (`npm run typecheck`) y `V4` (`npm test`) en `impl.md`. (verification.md)
