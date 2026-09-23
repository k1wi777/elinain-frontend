# Diseño — Dashboard: vista principal de reportes con tarjetas resumen

> Work Item: `2026-09-22_22-45__dashboard-reportes-vista-principal` (`type: feature`)

## Estrategia

Feature autocontenido `features/dashboard/` (mismo patrón que `features/costos` y
`features/ciclos`: `types.ts`, `query-keys.ts`, `mensajes-error.ts`, `api/`, `hooks/`,
`components/`, `index.ts`), consumido por `app/(dashboard)/dashboard/page.tsx` como Server
Component delgado. La única mutación de datos es una consulta de lectura (TanStack Query) y el
acceso pasa por un Route Handler BFF propio que adjunta la cookie httpOnly.

No se actualiza el OpenAPI local ni se añaden dependencias: `ResumenDashboardDto`,
`ReporteDashboardDto` y `RespuestaDashboardDto` ya existen en `shared/api/openapi/schema.d.ts`.

## Endpoint y sobres de respuesta

- Backend: `GET /api/v1/reportes/dashboard` → `RespuestaDashboardDto` (`{ exito, datos }`).
- `shared/api/response.ts` (`desenvolverRespuesta`) ya desenvuelve el sobre en ambos clientes
  HTTP, por lo que **el código nunca trata `RespuestaDashboardDto`**: el tipo de datos es
  `ReporteDashboardDto` (`{ resumen: ResumenDashboardDto }`).
- El BFF llama a `createServerClient().get<ReporteDashboardDto>("/reportes/dashboard")` (la
  `baseUrl` ya incluye `/api/v1`) y responde `NextResponse.json(reporte)`. El navegador recibe
  ese cuerpo plano y `createBffClient` lo deja igual (no hay sobre).

## Archivos

### Nuevos

| Archivo | Contenido |
|---------|-----------|
| `features/dashboard/types.ts` | Alias `ResumenDashboard = ApiSchemas["ResumenDashboardDto"]` y `ReporteDashboard = ApiSchemas["ReporteDashboardDto"]`. |
| `features/dashboard/query-keys.ts` | `clavesDashboard` (`todas`, `resumen()`). |
| `features/dashboard/formato.ts` | Constantes locales `Intl.NumberFormat` y funciones puras `formatearMoneda` / `formatearConteo`. |
| `features/dashboard/mensajes-error.ts` | `mensajeErrorDashboard(status)` (conexión `0` / genérico). |
| `features/dashboard/api/dashboard.ts` | `obtenerReporteDashboard()` sobre `createBffClient`. |
| `features/dashboard/hooks/useReporteDashboard.ts` | Consulta TanStack Query del resumen. |
| `features/dashboard/components/TarjetaResumen.tsx` | Tarjeta presentacional (`titulo`, `valor`, `nivel`). |
| `features/dashboard/components/ResumenDashboard.tsx` | Componente cliente: consulta, estados y composición de tarjetas. |
| `features/dashboard/index.ts` | Barrel: exporta solo `ResumenDashboard`. |
| `features/dashboard/__tests__/formato.test.ts` | Tests puros de `formato.ts`. |
| `features/dashboard/__tests__/mensajes-error.test.ts` | Tests puros de `mensajes-error.ts`. |
| `features/dashboard/__tests__/query-keys.test.ts` | Tests puros de `query-keys.ts`. |
| `app/api/reportes/dashboard/route.ts` | BFF: `GET` que delega en el backend con la cookie de sesión. |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `app/(dashboard)/dashboard/page.tsx` | Sustituye la bienvenida por la composición de `ResumenDashboard`. |

### No se crean

- `app/(dashboard)/dashboard/loading.tsx`: el estado de carga real lo renderiza
  `ResumenDashboard` (`isPending`) en SSR e hidratación; un `loading.tsx` de ruta duplicaría el
  markup del skeleton. El `app/(dashboard)/loading.tsx` existente sigue cubriendo transiciones.
- Ningún componente nuevo en `shared/ui`: `TarjetaResumen` conoce el dominio y no es genérico.

## Jerarquía tipográfica (decidida por el usuario)

No existe guía de estilo en el repo; se fijan estos valores concretos de Tailwind para que las
cifras de utilidad capten la vista de inmediato.

| Nivel | Indicadores | Tarjeta | Etiqueta | Valor |
|-------|-------------|---------|----------|-------|
| Protagonista | `utilidad_real_comerciante_acumulada` | `rounded-xl border border-emerald-200 bg-emerald-50 p-6` | `text-sm font-medium tracking-wide text-emerald-800 uppercase` | `mt-2 text-4xl font-bold tabular-nums text-emerald-700` |
| Secundario | `utilidad_total_acumulada`, `utilidad_terceros_acumulada` | `rounded-lg border border-zinc-200 bg-white p-4` | `text-sm font-medium text-zinc-600` | `mt-1 text-3xl font-semibold tabular-nums text-zinc-900` |
| Menor | `contratos_activos`, `contratos_cerrados`, `total_animales_actual`, `total_ventas_registradas`, `total_costos_informativos` | `rounded-lg border border-zinc-200 bg-white p-4` | `text-sm text-zinc-500` | `mt-1 text-2xl font-medium tabular-nums text-zinc-600` |

Distribución:

```text
<section class="flex flex-col gap-6" aria-label="Resumen de reportes">
  <TarjetaResumen nivel="protagonista" />          ← fila completa
  <div class="grid gap-4 sm:grid-cols-2">          ← secundarios (2)
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">  ← menores (5)
```

La jerarquía no depende solo del color: cada tarjeta mantiene su etiqueta textual en español y
el tamaño/peso del valor varía por nivel (R4, R5, R6, R7).

## Formato de cifras

`features/dashboard/formato.ts` declara las constantes locales al feature (no se mueve a
`shared/lib` ni se reutiliza el formateador de otro feature):

- `formatearMoneda(valor)` → `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })`.
- `formatearConteo(valor)` → `Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 })`.

Se aplican a: moneda → las tres utilidades y `total_costos_informativos`; conteo → los cuatro
conteos. Los valores se presentan tal como llegan del backend, sin recálculo (R8, R12).

## Estados

- **Carga:** `ResumenDashboard` recibe `isPending` de la consulta y renderiza varias `Skeleton`
  de `shared/ui` reproduciendo la forma de las tarjetas.
- **Error:** si `isError`, muestra un `<p role="alert">` con `mensajeErrorDashboard(error.status)`
  en español, sin detalle técnico.
- **Éxito:** `ReporteDashboard.resumen` se mapea a las ocho tarjetas.

## Decisiones de diseño

1. **Query de lectura con `useQuery`.** La vista no muta datos; no hay invalidación. Alternativa descartada: obtener los datos en un Server Component y pasarlos como props, que rompería el patrón TanStack Query del proyecto y no aportaría caché.
2. **Feature `dashboard` autocontenido.** La composición ocurre en `app/`, como el resto. Alternativa descartada: reutilizar un feature existente (ninguno cubre reportes y rompería el aislamiento).
3. **Formateadores locales.** Se declaran en el feature conforme a la decisión del usuario. Alternativas descartadas: reutilizar `FORMATO_MONEDA` de `features/costos` (prohibido por aislamiento entre features) y mover el formateador a `shared/lib` (no hay segundo consumidor real y ampliaría el alcance).
4. **`TarjetaResumen` presentacional.** Recibe textos ya formateados (`titulo`, `valor`) y el `nivel`; no conoce el DTO ni TanStack Query. Vive en el feature y no en `shared/ui` porque no es genérico.
5. **Un solo mensaje de error.** Solo hay una operación (cargar); `mensajeErrorDashboard` traduce `status === 0` a conexión y el resto a un mensaje genérico en español. Alternativa descartada: reutilizar `mensajeErrorListarCostos` (pertenece a otro feature).
6. **`loading.tsx` de ruta omitido.** Ver sección "No se crean".
7. **Sin cálculos en el cliente.** La utilidad bruta y la de terceros se muestran como llegan; no se derivan sumas ni restas en la UI (R12).

## Restricciones

- Aislamiento entre features: `features/dashboard` no importa de otros features; `shared/` no importa de `features/`.
- Componentes server por defecto; `'use client'` solo en `ResumenDashboard` y en el hook.
- Sin `any`, sin `fetch` en componentes, sin `useEffect` para obtener datos.
- Sin dependencias nuevas y sin actualizar el OpenAPI local.
- Tests solo de lógica pura (`formato`, `mensajes-error`, `query-keys`); el render se valida en `V5`.

## Verificación

- Checkpoints `V1` (`npm run format:check`), `V2` (`npm run lint`), `V3` (`npm run typecheck`) y `V4` (`npm test`).
- `V5` (manual): abrir `/dashboard` y comprobar las ocho cifras, la jerarquía visual, el formato es-CO, el skeleton de carga y el mensaje de error.
