# Diseño — Reportes: contratos activos con métricas e historial de ventas

> Work Item: `2026-09-22_23-02__reportes-contratos-activos-e-historial-ventas` (`type: feature`)

## Estrategia

Un único feature nuevo `features/reportes/` que contiene las dos vistas de reportes, consumido
por páginas delgadas en `app/(dashboard)/reportes/{contratos-activos,historial-ventas}/page.tsx`.
Cada vista es una consulta de solo lectura vía TanStack Query y accede al backend por su propio
Route Handler BFF (cookie httpOnly). Se conservan los criterios del feature `dashboard` ya
implementado: `Intl.NumberFormat` es-CO, `Skeleton`, mensaje de error en español con
`role="alert"`, valores sin recálculo y `Table`/`Button` de `shared/ui`.

No se actualiza el OpenAPI local ni se añaden dependencias: `ReporteContratosActivosDto`,
`ContratoActivoDetalleDto`, `ReporteHistorialVentasDto`, `ResumenHistorialVentasDto` y
`VentaHistorialItemDto` ya existen en `shared/api/openapi/schema.d.ts`.

## Ubicación del código: feature nuevo `features/reportes` (decisión)

Se crea un feature nuevo en lugar de extender `features/dashboard`:

- **Cohesión semántica.** `dashboard` corresponde a la ruta `/dashboard`; los nuevos reportes son
  dos rutas propias bajo `/reportes` con endpoints distintos. Meterlos en `dashboard` convertiría
  a ese feature en un cajón de sastre de todos los reportes y mezclaría tres rutas en un barrel
  pensado para una.
- **Aislamiento y no regresión.** No se toca el código de `features/dashboard`; `app/` compone
  cada feature por separado. Evita re-abrir y refactorizar una feature ya cerrada.
- **Evolución independiente.** Los reportes tienen su propio `types.ts`, `query-keys.ts` y
  `mensajes-error.ts` sin ensanchar los del dashboard.

**Duplicación de formateadores (justificada).** `features/reportes/formatos.ts` repite las
constantes `Intl.NumberFormat` es-CO que ya existen en `dashboard`/`ventas`. Es la opción forzada
por las reglas vigentes: un feature no puede importar de otro, `shared/lib` no debe ampliarse sin
un consumidor genérico real y el usuario pidió no refactorizar features existentes. El costo son
~15 líneas de constantes de presentación; no hay lógica de negocio duplicada. Las fechas sí se
reutilizan de `shared/lib/fechas` (`formatearFechaHora`), que ya es transversal.

## Endpoint y sobres de respuesta

- `GET /api/v1/reportes/contratos-activos` → `RespuestaContratosActivosReporteDto` (`{ exito, datos }`).
- `GET /api/v1/reportes/historial-ventas` → `RespuestaHistorialVentasReporteDto` (`{ exito, datos }`).
- `shared/api/response.ts` desenvuelve el sobre en ambos clientes HTTP, por lo que el código nunca
  trata los `Respuesta*Dto`: los tipos de datos son `ReporteContratosActivosDto` (`{ contratos }`)
  y `ReporteHistorialVentasDto` (`{ resumen, ventas }`).
- El BFF usa `createServerClient().get<...>("/reportes/contratos-activos" | "/reportes/historial-ventas")`
  (la `baseUrl` ya incluye `/api/v1`) y responde `NextResponse.json(datos)`; `createBffClient` del
  navegador recibe el cuerpo plano sin sobre.

## Archivos

### Nuevos

| Archivo | Contenido |
|---------|-----------|
| `features/reportes/types.ts` | Alias desde `ApiSchemas`: `ReporteContratosActivos`, `ContratoActivoDetalle`, `ReporteHistorialVentas`, `ResumenHistorialVentas`, `VentaHistorialItem`. |
| `features/reportes/query-keys.ts` | `clavesReportes` (`todas`, `contratosActivos()`, `historialVentas()`). |
| `features/reportes/formatos.ts` | `formatearMoneda`, `formatearConteo`, `formatearNumero`, `formatearPorcentaje` (es-CO). |
| `features/reportes/mensajes-error.ts` | `mensajeErrorContratosActivos(status)` y `mensajeErrorHistorialVentas(status)`. |
| `features/reportes/orden.ts` | Lógica pura: `ordenarContratosPorUtilidadDescendente`, `ordenarVentasPorFechaDescendente`, `recortarVentas` y `LIMITE_VENTAS_VISIBLES = 50`. |
| `features/reportes/api/reportes.ts` | `obtenerReporteContratosActivos()` y `obtenerReporteHistorialVentas()` sobre `createBffClient`. |
| `features/reportes/hooks/useReporteContratosActivos.ts` | `useQuery` del reporte de contratos activos. |
| `features/reportes/hooks/useReporteHistorialVentas.ts` | `useQuery` del historial de ventas. |
| `features/reportes/components/ContratosActivosReporte.tsx` | Cliente: consulta, `Skeleton`, error y `Table` ordenada por utilidad desc. |
| `features/reportes/components/TarjetaIndicador.tsx` | Presentacional: tarjeta `titulo` + `valor` ya formateado, con realce opcional. |
| `features/reportes/components/HistorialVentasReporte.tsx` | Cliente: consulta, `Skeleton`, error, resumen con `TarjetaIndicador`, tabla de detalle y toggle "Ver todo"/"Ver menos". |
| `features/reportes/index.ts` | Barrel: exporta `ContratosActivosReporte` e `HistorialVentasReporte`. |
| `app/api/reportes/contratos-activos/route.ts` | BFF `GET` del reporte de contratos activos. |
| `app/api/reportes/historial-ventas/route.ts` | BFF `GET` del historial de ventas. |
| `app/(dashboard)/reportes/contratos-activos/page.tsx` | Server Component delgado: `metadata`, `h1` y composición de la vista. |
| `app/(dashboard)/reportes/historial-ventas/page.tsx` | Server Component delgado: `metadata`, `h1` y composición de la vista. |
| `features/reportes/__tests__/formatos.test.ts` | Tests puros. |
| `features/reportes/__tests__/mensajes-error.test.ts` | Tests puros. |
| `features/reportes/__tests__/query-keys.test.ts` | Tests puros. |
| `features/reportes/__tests__/orden.test.ts` | Tests puros de ordenación y recorte. |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `middleware.ts` | Añadir `/reportes` a `RUTAS_PROTEGIDAS` y las entradas `/reportes` y `/reportes/:path*` al `config.matcher`. |
| `app/(dashboard)/dashboard/page.tsx` | Añadir dos `next/link` a `/reportes/contratos-activos` y `/reportes/historial-ventas`, sin alterar `ResumenDashboard`. |

### No se crean

- No se añaden entradas al menú lateral (`app/(dashboard)/layout.tsx`): decisión explícita del usuario (R17).
- No se añaden componentes genéricos a `shared/ui`: `TarjetaIndicador` es específico de estos reportes.
- No se crean `loading.tsx` de ruta: el estado de carga lo renderiza cada componente cliente con `Skeleton`.

## Vistas

### Contratos activos

- Tabla con `Table` de `shared/ui` y columnas: Tercero (`tercero_nombre`), Finca (`finca_nombre`),
  Cantidad actual (`cantidad_actual`, conteo), Total compras (`total_compras`, conteo),
  Total ventas (`total_ventas`, conteo) y Utilidad generada (`utilidad_generada_comerciante`,
  moneda). `obtenerClave` = `contrato_id`.
- Orden: `ordenarContratosPorUtilidadDescendente` sobre `reporte.contratos` (R5). La utilidad se
  alinea a la derecha para facilitar la comparación; el resto a la izquierda.
- La tabla no pagina; `mensajeVacio` = "Aún no hay contratos activos".

### Historial de ventas

- Resumen: siete `TarjetaIndicador` con todos los campos de `ResumenHistorialVentasDto`.
  La utilidad del comerciante se marca como cifra protagonista; las demás como secundarias o
  menores, manteniendo siempre la etiqueta textual en español.
- Detalle: `Table` con las columnas de `VentaHistorialItemDto` listadas en R8. Fecha con
  `formatearFechaHora` de `shared/lib/fechas`; pesos con `formatearNumero` (kg); precio por kilo y
  cifras monetarias con `formatearMoneda`; porcentaje con `formatearPorcentaje`.
- Recorte: estado local `expandido`. Las filas visibles se calculan en render con
  `recortarVentas(ordenarVentasPorFechaDescendente(reporte.ventas), expandido)`. El `Button`
  "Ver todo" / "Ver menos" solo se renderiza si `reporte.ventas.length > LIMITE_VENTAS_VISIBLES`
  (R9, R10).

## Estados

- **Carga:** cada componente recibe `isPending` y renderiza `Skeleton` reproduciendo la forma de
  la tabla o de las tarjetas (R13).
- **Error:** `<p role="alert" className="text-sm text-red-600">` con el mensaje del feature según
  `error.status` (`0` = conexión, resto = genérico en español), sin detalle técnico (R14).
- **Éxito:** se mapean los DTOs a las tablas y tarjetas con los valores ya formateados (R12).

## Decisiones de diseño

1. **Feature nuevo `features/reportes`.** Justificado arriba; alternativa descartada: extender
   `features/dashboard` (mezcla rutas y reabre una feature cerrada).
2. **Formateadores locales duplicados.** Justificado arriba; alternativa descartada: mover el
   formateador a `shared/lib` (fuera del alcance acordado) o importar entre features (prohibido).
3. **BFF por reporte.** Un Route Handler por endpoint, idéntico al de dashboard, con
   `createServerClient` y `respuestaError` para propagar el código HTTP real (R15).
4. **Ordenación y recorte como lógica pura.** Se extraen a `orden.ts` para poder probarlas con
   Jest sin render; la UI solo las invoca en render (sin `useEffect`).
5. **Toggle con estado local.** `expandido` es estado de UI local; no se introduce store global ni
   se modifica la query. Alternativa descartada: paginación en cliente con `usePagination`, que
   simula un paginado que el endpoint no ofrece.
6. **Sin cálculos en el cliente.** El resumen y las utilidades se muestran tal como llegan (R12);
   solo se ordena y se recorta, que es presentación.
7. **Enlaces en la página del dashboard.** Los `next/link` viven en `app/(dashboard)/dashboard/page.tsx`
   (capa de composición), no dentro de `ResumenDashboard`, para no tocar la feature existente.

## Restricciones

- Aislamiento entre features: `features/reportes` no importa de otros features; `shared/` no importa de `features/`.
- Componentes server por defecto; `'use client'` solo en las dos vistas cliente y en los hooks.
- Sin `any`, sin `fetch` en componentes y sin `useEffect` para obtener datos.
- Sin dependencias nuevas y sin actualizar el OpenAPI local.
- Tests solo de lógica pura (`formatos`, `mensajes-error`, `query-keys`, `orden`); el render se valida en `V5`.

## Verificación

- Checkpoints `V1` (`npm run format:check`), `V2` (`npm run lint`), `V3` (`npm run typecheck`) y `V4` (`npm test`).
- `V5` (manual): abrir `/reportes/contratos-activos` y `/reportes/historial-ventas` desde los enlaces del dashboard; comprobar orden descendente, formato es-CO, resumen completo, el toggle "Ver todo"/"Ver menos", el skeleton de carga y el mensaje de error.
