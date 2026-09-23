# Implementación — Dashboard: vista principal de reportes con tarjetas resumen

> Work Item: `2026-09-22_22-45__dashboard-reportes-vista-principal` (`type: feature`)
> Agente: implementer

## Resumen

Se implementó la vista principal de `/dashboard` como un feature `dashboard` autocontenido que
consume `GET /api/v1/reportes/dashboard` a través de un Route Handler BFF y muestra las ocho
cifras del `ResumenDashboardDto` en tarjetas con la jerarquía tipográfica definida en `design.md`.
Se completaron las 13 tareas (`T1`–`T13`) sin modificar la planificación.

- La cifra protagonista es `utilidad_real_comerciante_acumulada` (utilidad real acumulada del
  comerciante).
- Nivel secundario: `utilidad_total_acumulada` y `utilidad_terceros_acumulada`.
- Nivel menor: los cuatro conteos y `total_costos_informativos`.
- Los valores se muestran tal como los entrega el backend, sin recálculo (R12); solo se aplica
  formato es-CO (R8).
- La obtención de datos usa TanStack Query (`useQuery`), sin `useEffect` ni `fetch` en componentes.
- No se añadieron dependencias ni se modificó el OpenAPI local.

## Archivos

### Nuevos

| Archivo | Contenido |
|---------|-----------|
| `features/dashboard/types.ts` | Alias `ResumenDashboard` y `ReporteDashboard` desde `ApiSchemas`. |
| `features/dashboard/query-keys.ts` | `clavesDashboard` (`todas`, `resumen()`). |
| `features/dashboard/formato.ts` | Formateadores locales `formatearMoneda` / `formatearConteo` (es-CO). |
| `features/dashboard/mensajes-error.ts` | `mensajeErrorDashboard(status)` (conexión para `0`, genérico para el resto). |
| `features/dashboard/api/dashboard.ts` | `obtenerReporteDashboard()` sobre `createBffClient`. |
| `features/dashboard/hooks/useReporteDashboard.ts` | `useQuery<ReporteDashboard, ApiError>` con `clavesDashboard.resumen()`. |
| `features/dashboard/components/TarjetaResumen.tsx` | Tarjeta presentacional (`titulo`, `valor`, `nivel`). |
| `features/dashboard/components/ResumenDashboard.tsx` | Componente cliente: consulta, estados y composición de tarjetas. |
| `features/dashboard/index.ts` | Barrel: exporta únicamente `ResumenDashboard`. |
| `features/dashboard/__tests__/formato.test.ts` | Tests puros de `formato.ts`. |
| `features/dashboard/__tests__/mensajes-error.test.ts` | Tests puros de `mensajes-error.ts`. |
| `features/dashboard/__tests__/query-keys.test.ts` | Tests puros de `query-keys.ts`. |
| `app/api/reportes/dashboard/route.ts` | BFF: `GET` que delega en `/reportes/dashboard` con la cookie de sesión. |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `app/(dashboard)/dashboard/page.tsx` | Sustituye la bienvenida por la composición de `ResumenDashboard` dentro de `mx-auto w-full max-w-4xl`, conservando `metadata`. |

## Cambios realizados

- **Tipos (T1).** Alias derivados del OpenAPI; el código trabaja con `ReporteDashboard` porque
  `shared/api/response.ts` ya desenvuelve el sobre `{ exito, datos }`. No se usa
  `RespuestaDashboardDto`.
- **Query keys (T2).** `['dashboard']` y `['dashboard', 'resumen']`.
- **Formato (T3).** `Intl.NumberFormat` es-CO: moneda COP sin decimales y conteo con separador de
  miles. Declarados en el feature, sin reutilizar `features/costos` ni mover a `shared/lib`.
- **Mensajes de error (T4).** `status === 0` → conexión; el resto → mensaje genérico en español.
- **API (T5) y hook (T6).** `createBffClient` contra `/api/reportes/dashboard`; consulta de solo
  lectura sin invalidaciones.
- **BFF (T7).** `createServerClient` adjunta la cookie httpOnly; responde
  `NextResponse.json(reporte)` con el `ReporteDashboardDto` y propaga el código HTTP real vía
  `respuestaError`, sin exponer el detalle técnico.
- **UI (T8–T10).** `TarjetaResumen` presentacional con las clases exactas de la tabla de jerarquía
  de `design.md`; `ResumenDashboard` renderiza `Skeleton` en `isPending`, un `<p role="alert">` en
  error y las ocho tarjetas en éxito; el barrel expone solo `ResumenDashboard`.
- **Integración (T11).** La página es un Server Component delgado que compone la vista. Se conservó
  un `<h1>Panel</h1>` (coherente con `metadata.title` y con el resto de páginas del área protegida)
  para no perder el encabezado de documento; no forma parte de las cifras del resumen.
- **Tests (T12).** 10 tests puros nuevos para `formato`, `mensajes-error` y `query-keys`.

## Verificación

| ID | Comando | Resultado | Evidencia |
|----|---------|-----------|-----------|
| `V1` | `npm run format:check` | Pasa | `All matched files use Prettier code style!` |
| `V2` | `npm run lint` | Pasa | ESLint sin errores (salida vacía, exit 0). |
| `V3` | `npm run typecheck` | Pasa | `tsc --noEmit` sin errores (exit 0). |
| `V4` | `npm test` | Pasa | `Test Suites: 40 passed, 40 total` · `Tests: 340 passed, 340 total`. Los 3 suites del feature (`features/dashboard`) suman 10 tests y pasan. |
| `V5` | Validación manual | Pendiente del usuario | Guion más abajo. |

`bash .rei/init.sh` ejecutado al cierre: `Formato (V1)`, `Lint (V2)`, `Tipos (V3)` y `Tests (V4)`
en `OK`.

### Guion de V5 (validación manual)

1. Iniciar sesión y abrir `/dashboard` (`npm run dev`).
2. **Éxito:** comprobar que aparecen las ocho cifras con etiquetas en español:
   - protagonista (tarjeta verde destacada): «Utilidad real acumulada»;
   - secundarias: «Utilidad bruta acumulada» y «Utilidad de terceros acumulada»;
   - menores: «Contratos activos», «Contratos cerrados», «Animales en inventario»,
     «Ventas registradas» y «Costos informativos acumulados».
3. **Jerarquía:** verificar que la utilidad real del comerciante se lee primero (mayor tamaño,
   peso y color verde) y que las cifras de utilidad superan visualmente a los conteos y costos.
4. **Formato es-CO:** las cifras monetarias como `$ 12.500.000` (COP, sin decimales) y los conteos
   con separador de miles; comparar con los valores que devuelve el backend sin diferencias (no se
   recalculan).
5. **Carga:** recargar `/dashboard` y observar el `Skeleton` (una tarjeta grande, dos medianas y
   cinco pequeñas) mientras llega la respuesta.
6. **Error:** con el backend caído o la sesión inválida, comprobar el mensaje en español
   («No se pudo cargar el resumen del panel…» o el de conexión) sin detalle técnico.
7. **Responsive:** revisar en móvil (una columna) y escritorio (rejillas de 2 y 3 columnas).

## Observaciones

- **Desviación menor en el estado de error:** `ResumenDashboard` usa `if (consulta.error)` en lugar
  de `consulta.isError` para acceder a `error.status`; es el patrón ya usado en
  `ContratoDetalle`/`ContratoEditar` y evita el estrechamiento de tipos de TanStack Query. El
  comportamiento (R10) es el mismo.
- **`<h1>Panel</h1>` conservado** en la página por accesibilidad y coherencia con el resto de rutas
  del área protegida; el `design.md` describe el contenido del feature, no el encabezado de página.
- No se creó `app/(dashboard)/dashboard/loading.tsx`: el estado de carga lo renderiza
  `ResumenDashboard` y el `app/(dashboard)/loading.tsx` existente cubre las transiciones de ruta.
- No hay comportamiento no automatizable adicional al guion de `V5`.
