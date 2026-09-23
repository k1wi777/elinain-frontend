# Tareas — Reportes: contratos activos con métricas e historial de ventas

> Work Item: `2026-09-22_23-02__reportes-contratos-activos-e-historial-ventas` (`type: feature`)
>
> El Implementer marca cada tarea `[x]` inmediatamente al terminarla.

## Fundaciones del feature

- [x] **T1** — Crear `features/reportes/types.ts` con los alias `ReporteContratosActivos`, `ContratoActivoDetalle`, `ReporteHistorialVentas`, `ResumenHistorialVentas` y `VentaHistorialItem` desde `ApiSchemas`. (R3, R4, R6, R7, R8)
- [x] **T2** — Crear `features/reportes/query-keys.ts` con `clavesReportes` (`todas`, `contratosActivos()`, `historialVentas()`). (R3, R6)
- [x] **T3** — Crear `features/reportes/formatos.ts` con `formatearMoneda`, `formatearConteo`, `formatearNumero` y `formatearPorcentaje` (es-CO). (R11)
- [x] **T4** — Crear `features/reportes/mensajes-error.ts` con `mensajeErrorContratosActivos(status)` y `mensajeErrorHistorialVentas(status)` (conexión para `0`, genérico en español para el resto). (R14)
- [x] **T5** — Crear `features/reportes/orden.ts` con `LIMITE_VENTAS_VISIBLES`, `ordenarContratosPorUtilidadDescendente`, `ordenarVentasPorFechaDescendente` y `recortarVentas`. (R5, R9, R10)
- [x] **T6** — Crear `features/reportes/api/reportes.ts` con `obtenerReporteContratosActivos()` y `obtenerReporteHistorialVentas()` sobre `createBffClient`. (R15)
- [x] **T7** — Crear `features/reportes/hooks/useReporteContratosActivos.ts` con `useQuery<ReporteContratosActivos, ApiError>`. (R3)
- [x] **T8** — Crear `features/reportes/hooks/useReporteHistorialVentas.ts` con `useQuery<ReporteHistorialVentas, ApiError>`. (R6)

## BFF

- [x] **T9** — Crear `app/api/reportes/contratos-activos/route.ts`: `GET` con `createServerClient` contra `/reportes/contratos-activos`, responde `ReporteContratosActivosDto` con `NextResponse.json` y propaga el código real con `respuestaError`. (R15, R14)
- [x] **T10** — Crear `app/api/reportes/historial-ventas/route.ts`: `GET` con `createServerClient` contra `/reportes/historial-ventas`, responde `ReporteHistorialVentasDto` con `NextResponse.json` y propaga el código real con `respuestaError`. (R15, R14)

## UI

- [x] **T11** — Crear `features/reportes/components/TarjetaIndicador.tsx`, presentacional, con props `titulo`, `valor` y realce opcional. (R7)
- [x] **T12** — Crear `features/reportes/components/ContratosActivosReporte.tsx` (cliente): consulta, `Skeleton` en `isPending`, error con `role="alert"` y `Table` con las columnas de R4 ordenada por utilidad descendente. (R3, R4, R5, R11, R12, R13, R14)
- [x] **T13** — Crear `features/reportes/components/HistorialVentasReporte.tsx` (cliente): consulta, `Skeleton`, error, resumen con los siete campos de R7, tabla de detalle de R8 y toggle "Ver todo"/"Ver menos" con estado local `expandido`. (R6, R7, R8, R9, R10, R11, R12, R13, R14)
- [x] **T14** — Crear `features/reportes/index.ts` exportando solo `ContratosActivosReporte` e `HistorialVentasReporte`. (R1, R2)

## Integración

- [x] **T15** — Crear `app/(dashboard)/reportes/contratos-activos/page.tsx` (Server Component delgado con `metadata`, `h1` y la vista). (R1)
- [x] **T16** — Crear `app/(dashboard)/reportes/historial-ventas/page.tsx` (Server Component delgado con `metadata`, `h1` y la vista). (R2)
- [x] **T17** — Añadir a `app/(dashboard)/dashboard/page.tsx` dos `next/link` a `/reportes/contratos-activos` y `/reportes/historial-ventas`, sin modificar `ResumenDashboard`. (R16)
- [x] **T18** — Añadir `/reportes` a `RUTAS_PROTEGIDAS` y `/reportes` + `/reportes/:path*` a `config.matcher` en `middleware.ts`. (R18)

## Pruebas y verificación

- [x] **T19** — Añadir los tests puros `features/reportes/__tests__/formatos.test.ts`, `mensajes-error.test.ts`, `query-keys.test.ts` y `orden.test.ts` (orden descendente de contratos, orden por fecha descendente y recorte a 50 ventas). (R5, R9, R10, R11, R14)
- [x] **T20** — Ejecutar y documentar los checkpoints `V1` (`npm run format:check`), `V2` (`npm run lint`), `V3` (`npm run typecheck`) y `V4` (`npm test`) en `impl.md`; dejar indicado el guion de `V5`. (verification.md)
