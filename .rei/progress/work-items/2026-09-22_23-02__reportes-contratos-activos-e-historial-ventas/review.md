# Revisión — Reportes: contratos activos con métricas e historial de ventas

> Work Item: `2026-09-22_23-02__reportes-contratos-activos-e-historial-ventas` (`type: feature`)
> Agente: reviewer

## Resultado

`done`.

La implementación corresponde a la planificación (`requirements.md`, `design.md`, `tasks.md`):
los 19 requisitos están cubiertos, las 20 tareas están completadas y coinciden con el código,
y la verificación `V1`–`V4` pasa ejecutada por el Reviewer. `bash .rei/init.sh` finaliza con
código de salida `0`.

## Requisitos (R1–R19)

| Requisito | Evidencia |
|-----------|-----------|
| R1 | `app/(dashboard)/reportes/contratos-activos/page.tsx` compone `ContratosActivosReporte`. |
| R2 | `app/(dashboard)/reportes/historial-ventas/page.tsx` compone `HistorialVentasReporte`. |
| R3 | `useReporteContratosActivos` (`useQuery`) consulta vía `obtenerReporteContratosActivos`. |
| R4 | `COLUMNAS` de `ContratosActivosReporte`: tercero, finca, cantidad actual, total compras, total ventas y utilidad generada. |
| R5 | `ordenarContratosPorUtilidadDescendente` ordena por `utilidad_generada_comerciante` desc. |
| R6 | `useReporteHistorialVentas` (`useQuery`) consulta vía `obtenerReporteHistorialVentas`. |
| R7 | 7 `TarjetaIndicador`: utilidad del comerciante, ventas, animales, valor bruto, costo estimado, utilidad total y utilidad de terceros. |
| R8 | `COLUMNAS` del historial cubren fecha, cantidad, peso promedio, precio por kilo, valor bruto, costo estimado, utilidad total, comerciante, tercero, kilos ganados y porcentaje. |
| R9 | `recortarVentas` sobre `ordenarVentasPorFechaDescendente` limita a `LIMITE_VENTAS_VISIBLES = 50`. |
| R10 | El `Button` "Ver todo"/"Ver menos" solo se renderiza si `ventas.length > LIMITE_VENTAS_VISIBLES`. |
| R11 | `formatos.ts` usa `Intl.NumberFormat("es-CO")` (COP, conteo, número y porcentaje). |
| R12 | Solo se formatea, ordena y recorta; no hay sumas ni derivaciones de cifras. |
| R13 | `isPending` renderiza `Skeleton` en ambas vistas. |
| R14 | `consulta.error` renderiza `<p role="alert">` con `mensajes-error` en español, sin detalle técnico. |
| R15 | `app/api/reportes/{contratos-activos,historial-ventas}/route.ts` usan `createServerClient` (cookie httpOnly). |
| R16 | `app/(dashboard)/dashboard/page.tsx` añade dos `next/link` a ambas vistas. |
| R17 | `app/(dashboard)/layout.tsx` no contiene entradas nuevas. |
| R18 | `middleware.ts` incluye `/reportes` en `RUTAS_PROTEGIDAS` y `/reportes`, `/reportes/:path*` en el matcher. |
| R19 | No hay gráficas, filtros de fecha, exportación ni cálculos nuevos. |

## Tareas (T1–T20)

T1–T20 están marcadas `[x]` y cada una tiene su artefacto real: los cinco módulos base
(`types.ts`, `query-keys.ts`, `formatos.ts`, `mensajes-error.ts`, `orden.ts`), `api/reportes.ts`,
los dos hooks, los dos Route Handlers BFF, los tres componentes, el barrel, las dos páginas,
los enlaces del dashboard, la protección de `middleware.ts`, los cuatro tests puros y la
verificación documentada.

## Arquitectura y convenciones

- Feature nuevo `features/reportes` autocontenido; no importa de otros features.
- `shared/` no importa de `features/` ni de `app/` (grep sin coincidencias).
- Acceso a datos vía `createBffClient` → `api/` → `useQuery`; sin `fetch` ni `useEffect` en
  componentes (grep sin coincidencias).
- BFF simétrico al de dashboard: `createServerClient` y `respuestaError` propagan el código
  HTTP real sin exponer el cuerpo crudo.
- `process.env` solo se lee en `shared/config/env.ts` (y su test).
- Sin `any`, `@ts-ignore` ni `@ts-expect-error`; DTOs derivados del OpenAPI
  (`ContratoActivoDetalleDto`, `ReporteContratosActivosDto`, `ResumenHistorialVentasDto`,
  `VentaHistorialItemDto`, `ReporteHistorialVentasDto`), sin redefinir tipos.
- Confirmado que `shared/api/response.ts` desenvuelve el sobre `{ exito, datos }` en el
  interceptor del cliente HTTP, de modo que el BFF y el cliente tratan directamente
  `ReporteContratosActivosDto` (`{ contratos }`) y `ReporteHistorialVentasDto`
  (`{ resumen, ventas }`).
- `'use client'` solo en las dos vistas y sus hooks; el barrel expone únicamente las dos
  vistas. Sin `console.log`, `TODO` ni código muerto.

## Checkpoints

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — `All matched files use Prettier code style!` |
| `V2` | `npm run lint` | Pasa — ESLint sin errores (exit 0). |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores (exit 0). |
| `V4` | `npm test` | Pasa — 44 suites / 366 tests; `features/reportes` 4 suites / 26 tests. |
| `V5` | Validación manual | Pendiente del usuario (no bloquea la revisión). |

`bash .rei/init.sh`: `Formato (V1)`, `Lint (V2)`, `Tipos (V3)` y `Tests (V4)` en `OK`,
código de salida `0`.

## Observaciones

- **Duplicación de formateadores** en `features/reportes/formatos.ts`, justificada en
  `design.md` por el aislamiento entre features; las fechas se reutilizan de
  `shared/lib/fechas`. No hay lógica de negocio duplicada.
- **Desviación menor aceptada:** el estado de error usa `if (consulta.error)` en lugar de
  `consulta.isError`; el comportamiento de R14 es idéntico y sigue el patrón ya usado en el
  feature `dashboard`.
- No se crearon `loading.tsx` de ruta: el estado de carga lo renderiza cada componente cliente
  con `Skeleton`, conforme a la sección "No se crean" del `design.md`.
- `V5` queda a cargo del usuario con el guion documentado en `impl.md`.
