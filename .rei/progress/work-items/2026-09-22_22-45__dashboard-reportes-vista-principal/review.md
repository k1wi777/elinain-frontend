# Revisión — Dashboard: vista principal de reportes con tarjetas resumen

> Work Item: `2026-09-22_22-45__dashboard-reportes-vista-principal` (`type: feature`)
> Agente: reviewer

## Resultado

`done`.

La implementación corresponde a la planificación (`requirements.md`, `design.md`,
`tasks.md`): los 13 requisitos están cubiertos, las 13 tareas están completadas y
coinciden con el código, y la verificación `V1`–`V4` pasa. `bash .rei/init.sh` finaliza
con código de salida `0`.

## Requisitos (R1–R13)

| Requisito | Evidencia |
|-----------|-----------|
| R1 | `app/(dashboard)/dashboard/page.tsx` compone `ResumenDashboard`; la bienvenida anterior ya no existe. |
| R2 | `useReporteDashboard` (`useQuery`) se dispara al montar la vista. |
| R3 | `ResumenDashboard` muestra las 8 cifras del `ResumenDashboardDto`. |
| R4 | Todas las tarjetas llevan etiqueta en español. |
| R5 | `utilidad_real_comerciante_acumulada` es `nivel="protagonista"` (`text-4xl font-bold text-emerald-700`). |
| R6 | `utilidad_total_acumulada` y `utilidad_terceros_acumulada` son `nivel="secundario"` (`text-3xl font-semibold`). |
| R7 | Los 4 conteos y `total_costos_informativos` son `nivel="menor"` (`text-2xl font-medium`). |
| R8 | `formato.ts` usa `Intl.NumberFormat("es-CO")`: COP sin decimales y conteo con separador de miles. |
| R9 | `isPending` renderiza `Skeleton` reproduciendo la forma de las tarjetas. |
| R10 | `consulta.error` renderiza `<p role="alert">` con `mensajeErrorDashboard` en español, sin detalle técnico. |
| R11 | `app/api/reportes/dashboard/route.ts` usa `createServerClient` (cookie httpOnly) y responde `NextResponse.json(reporte)`. |
| R12 | La UI solo formatea; no deriva sumas ni restas. |
| R13 | No hay gráficas, filtros de fecha ni `contratos-activos`/`historial-ventas`. |

## Tareas (T1–T13)

T1–T13 están marcadas `[x]` en `tasks.md` y cada una tiene su artefacto real:
`types.ts`, `query-keys.ts`, `formato.ts`, `mensajes-error.ts`, `api/dashboard.ts`,
`hooks/useReporteDashboard.ts`, `app/api/reportes/dashboard/route.ts`,
`components/TarjetaResumen.tsx`, `components/ResumenDashboard.tsx`, `index.ts`,
`app/(dashboard)/dashboard/page.tsx`, los tres tests puros y la verificación documentada.

## Arquitectura y convenciones

- Feature-first y autocontenido: `features/dashboard` no importa de otros features;
  `shared/` no importa de `features/` ni de `app/`.
- Acceso a datos vía `createBffClient` → `api/` → hook `useQuery`; sin `fetch` ni
  `useEffect` en componentes.
- BFF con `createServerClient` y `respuestaError` propagando el código real sin exponer
  el cuerpo crudo.
- `process.env` solo se lee en `shared/config/env.ts` (y su test).
- Sin `any`, sin `@ts-ignore`; DTOs derivados del OpenAPI (`ResumenDashboardDto`,
  `ReporteDashboardDto`), sin redefinir tipos.
- `'use client'` solo en `ResumenDashboard` y su hook; barrel `index.ts` expone únicamente
  `ResumenDashboard`.
- Confirmado que el sobre `{ exito, datos }` lo desenvuelve `shared/api/response.ts` en el
  cliente HTTP, por lo que el tipo de datos es `ReporteDashboard` (`{ resumen }`).

## Checkpoints

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — `All matched files use Prettier code style!` |
| `V2` | `npm run lint` | Pasa — ESLint sin errores (exit 0). |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores (exit 0). |
| `V4` | `npm test` | Pasa — 40 suites / 340 tests, incluidos los 3 suites del feature. |
| `V5` | Validación manual | Pendiente del usuario (no bloquea la revisión). |

`bash .rei/init.sh`: `Formato (V1)`, `Lint (V2)`, `Tipos (V3)` y `Tests (V4)` en `OK`,
código de salida `0`.

## Observaciones

- **Desviación menor aceptada:** el estado de error usa `if (consulta.error)` en lugar de
  `consulta.isError`; el comportamiento de R10 es idéntico y sigue el patrón ya usado en
  `ContratoDetalle`/`ContratoEditar`. Documentado en `impl.md`.
- **`<h1>Panel</h1>` conservado:** el `design.md` describe el contenido del feature, no el
  encabezado de página; se mantiene por accesibilidad y coherencia con `metadata`.
- No se creó `app/(dashboard)/dashboard/loading.tsx`: el estado de carga lo renderiza
  `ResumenDashboard`, conforme a la sección "No se crean" del `design.md`.
- `V5` queda a cargo del usuario con el guion documentado en `impl.md`.
