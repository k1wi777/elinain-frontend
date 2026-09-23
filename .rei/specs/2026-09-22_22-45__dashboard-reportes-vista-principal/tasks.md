# Tareas — Dashboard: vista principal de reportes con tarjetas resumen

> Work Item: `2026-09-22_22-45__dashboard-reportes-vista-principal` (`type: feature`)
>
> El Implementer marca cada tarea `[x]` inmediatamente al terminarla.

## Fundaciones del feature

- [x] **T1** — Crear `features/dashboard/types.ts` con los alias `ResumenDashboard` (`ResumenDashboardDto`) y `ReporteDashboard` (`ReporteDashboardDto`). (R3)
- [x] **T2** — Crear `features/dashboard/query-keys.ts` con `clavesDashboard` (`todas` y `resumen()`). (R2)
- [x] **T3** — Crear `features/dashboard/formato.ts` con las constantes `Intl.NumberFormat` es-CO y `formatearMoneda` / `formatearConteo`. (R8)
- [x] **T4** — Crear `features/dashboard/mensajes-error.ts` con `mensajeErrorDashboard(status)` (conexión para `0`, genérico en español para el resto). (R10)
- [x] **T5** — Crear `features/dashboard/api/dashboard.ts` con `obtenerReporteDashboard()` sobre `createBffClient` contra `/api/reportes/dashboard`. (R11)
- [x] **T6** — Crear `features/dashboard/hooks/useReporteDashboard.ts` con `useQuery<ReporteDashboard, ApiError>` y la clave `clavesDashboard.resumen()`. (R2)

## BFF

- [x] **T7** — Crear `app/api/reportes/dashboard/route.ts` (BFF): `GET` que usa `createServerClient` para llamar a `/reportes/dashboard` y responde el `ReporteDashboardDto` con `NextResponse.json`, propagando el código HTTP real con `respuestaError` y sin exponer el detalle técnico. (R11, R10)

## UI

- [x] **T8** — Crear `features/dashboard/components/TarjetaResumen.tsx`, presentacional, con props `titulo`, `valor` y `nivel` (`protagonista` | `secundario` | `menor`) y las clases de la jerarquía tipográfica del `design.md`. (R4, R5, R6, R7)
- [x] **T9** — Crear `features/dashboard/components/ResumenDashboard.tsx` (cliente): consume `useReporteDashboard`, muestra `Skeleton` en `isPending`, mensaje con `role="alert"` en `isError` y, en éxito, las ocho tarjetas con las cifras formateadas y ordenadas por nivel (R3–R12).
- [x] **T10** — Crear `features/dashboard/index.ts` exportando únicamente `ResumenDashboard`. (R1)

## Integración

- [x] **T11** — Sustituir el contenido de bienvenida de `app/(dashboard)/dashboard/page.tsx` por la composición de `ResumenDashboard` dentro de un contenedor `mx-auto w-full max-w-4xl`, conservando `metadata`. (R1)

## Pruebas y verificación

- [x] **T12** — Añadir los tests puros `features/dashboard/__tests__/formato.test.ts`, `mensajes-error.test.ts` y `query-keys.test.ts`. (R8, R10)
- [x] **T13** — Ejecutar y documentar los checkpoints `V1` (`npm run format:check`), `V2` (`npm run lint`), `V3` (`npm run typecheck`) y `V4` (`npm test`) en `impl.md`; dejar indicado el guion de `V5`. (verification.md)
