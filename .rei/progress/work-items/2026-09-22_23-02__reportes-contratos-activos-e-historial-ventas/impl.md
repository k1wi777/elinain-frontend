# Implementación — Reportes: contratos activos e historial de ventas

> Work Item: `2026-09-22_23-02__reportes-contratos-activos-e-historial-ventas` (`type: feature`)
> Agente: implementer
> Estado: `review`

## Resumen

Se implementó el feature nuevo `features/reportes` con dos vistas de reportes del
comerciante, consumidas por páginas dedicadas y servidas por BFF propio:

1. **Contratos activos** (`/reportes/contratos-activos`): tabla con tercero, finca,
   cantidad actual, total de compras, total de ventas y utilidad generada por el
   comerciante, ordenada por utilidad descendente.
2. **Historial de ventas** (`/reportes/historial-ventas`): resumen agregado de siete
   campos, detalle venta por venta con las columnas de R8 y toggle "Ver todo" / "Ver
   menos" que se muestra solo cuando hay más de 50 ventas; sin expandir se ven las 50
   más recientes por fecha descendente.

Se respetaron las restricciones del diseño: feature-first autocontenido, sin imports
entre features, sin refactorizar `features/dashboard`, sin dependencias nuevas, sin
`any`, sin `useEffect` para datos, sin `fetch` en la UI y sin actualizar el OpenAPI
local. La composición y los enlaces viven en `app/`.

## Archivos creados

| Archivo | Contenido |
|---------|-----------|
| `features/reportes/types.ts` | Alias desde `ApiSchemas`: `ReporteContratosActivos`, `ContratoActivoDetalle`, `ReporteHistorialVentas`, `ResumenHistorialVentas`, `VentaHistorialItem`. |
| `features/reportes/query-keys.ts` | `clavesReportes` (`todas`, `contratosActivos()`, `historialVentas()`). |
| `features/reportes/formatos.ts` | `formatearMoneda`, `formatearConteo`, `formatearNumero`, `formatearPorcentaje` (es-CO). |
| `features/reportes/mensajes-error.ts` | `mensajeErrorContratosActivos(status)` y `mensajeErrorHistorialVentas(status)`. |
| `features/reportes/orden.ts` | `LIMITE_VENTAS_VISIBLES`, `ordenarContratosPorUtilidadDescendente`, `ordenarVentasPorFechaDescendente`, `recortarVentas`. |
| `features/reportes/api/reportes.ts` | `obtenerReporteContratosActivos()` y `obtenerReporteHistorialVentas()` sobre `createBffClient`. |
| `features/reportes/hooks/useReporteContratosActivos.ts` | `useQuery` del reporte de contratos activos. |
| `features/reportes/hooks/useReporteHistorialVentas.ts` | `useQuery` del historial de ventas. |
| `features/reportes/components/TarjetaIndicador.tsx` | Tarjeta presentacional `titulo` + `valor` con realce opcional. |
| `features/reportes/components/ContratosActivosReporte.tsx` | Vista cliente: consulta, `Skeleton`, error y tabla ordenada. |
| `features/reportes/components/HistorialVentasReporte.tsx` | Vista cliente: consulta, `Skeleton`, error, resumen de siete campos, tabla y toggle. |
| `features/reportes/index.ts` | Barrel: exporta `ContratosActivosReporte` e `HistorialVentasReporte`. |
| `features/reportes/__tests__/formatos.test.ts` | Tests puros de formato. |
| `features/reportes/__tests__/mensajes-error.test.ts` | Tests puros de mensajes de error. |
| `features/reportes/__tests__/query-keys.test.ts` | Tests puros de query keys. |
| `features/reportes/__tests__/orden.test.ts` | Tests puros de ordenación y recorte. |
| `app/api/reportes/contratos-activos/route.ts` | BFF `GET` del reporte de contratos activos. |
| `app/api/reportes/historial-ventas/route.ts` | BFF `GET` del historial de ventas. |
| `app/(dashboard)/reportes/contratos-activos/page.tsx` | Server Component delgado de la vista. |
| `app/(dashboard)/reportes/historial-ventas/page.tsx` | Server Component delgado de la vista. |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `middleware.ts` | `/reportes` añadido a `RUTAS_PROTEGIDAS` y entradas `/reportes` y `/reportes/:path*` en `config.matcher`. |
| `app/(dashboard)/dashboard/page.tsx` | Dos `next/link` (con `nav aria-label="Reportes"`) a las dos vistas; `ResumenDashboard` intacto. |

## Decisiones de implementación

- **Sin tocar features existentes.** Los formateadores y mensajes son locales del feature
  `reportes` (duplicación de presentación justificada en `design.md`); las fechas sí se
  reutilizan de `shared/lib/fechas` (`formatearFechaHora`). No se modificó
  `features/dashboard`.
- **Ordenación y recorte como lógica pura** en `orden.ts`, invocadas solo durante el
  render, sin `useEffect`. `expandido` es estado local de la UI.
- **Toggle accesible.** El `Button` de `shared/ui` incluye `aria-expanded` y su texto
  cambia entre "Ver todo" y "Ver menos"; solo se renderiza si `ventas.length > 50`.
- **BFF simétrico al de dashboard.** `createServerClient` contra el backend y
  `respuestaError` para propagar el código HTTP real; el cuerpo plano se devuelve con
  `NextResponse.json`.
- **Alineación de tablas.** En contratos, solo "Utilidad generada" va a la derecha (según
  diseño); en el historial las columnas numéricas van a la derecha para facilitar la
  lectura comparada.

## Verificación

| Checkpoint | Comando | Resultado | Observaciones |
|------------|---------|-----------|---------------|
| `V1` | `npm run format:check` | Pasa | `All matched files use Prettier code style!` |
| `V2` | `npm run lint` | Pasa | `eslint` sin salida (0 errores). |
| `V3` | `npm run typecheck` | Pasa | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Pasa | 44 suites, 366 tests. `features/reportes`: 4 suites, 26 tests. |
| `V5` | Manual | Pendiente | Guion abajo; requiere confirmación del usuario. |

`bash .rei/init.sh` ejecutado al cierre: V1–V4 en `[OK]`, exit code `0`.

### Guion de `V5` (validación manual)

1. `npm run dev` y autenticarse.
2. Abrir `/dashboard` y comprobar los dos enlaces del bloque "Reportes".
3. **Contratos activos:** abrir `/reportes/contratos-activos`, verificar el `Skeleton` de
   carga, la tabla y que las filas quedan ordenadas por utilidad descendente; comprobar
   montos en formato COP es-CO.
4. **Historial de ventas:** abrir `/reportes/historial-ventas`, verificar el resumen con
   los siete campos (utilidad del comerciante realzada), que sin expandir se ven 50
   ventas como máximo por fecha descendente, que "Ver todo" muestra el resto y "Ver
   menos" colapsa, y que el botón solo aparece con más de 50 ventas.
5. **Error:** simular un fallo (p. ej. backend caído) y comprobar el mensaje en español
   con `role="alert"` sin detalle técnico.
6. **Protección:** cerrar sesión e intentar abrir `/reportes/contratos-activos`; debe
   redirigir a `/login`.
7. **Menú lateral:** confirmar que no se añadieron entradas nuevas al menú.

## Observaciones

- No se añadieron dependencias ni se actualizó `shared/api/openapi/schema.d.ts`; los DTOs
  ya existían.
- Las rutas `/reportes` son páginas dedicadas y no tienen entrada en el menú lateral
  (R17), por decisión explícita del usuario.
- No se crearon `loading.tsx` de ruta: el estado de carga lo renderiza cada componente
  cliente con `Skeleton`, conforme al diseño.
