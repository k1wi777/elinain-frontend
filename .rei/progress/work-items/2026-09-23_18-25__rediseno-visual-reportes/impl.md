# Implementación — Rediseño visual de reportes: contratos activos e historial de ventas

- **Work Item:** `2026-09-23_18-25__rediseno-visual-reportes`
- **Tipo:** task (Caso B)
- **Fecha:** 2026-09-23
- **Agente:** implementer

## Resumen

Se ejecutó `plan.md` en sus 9 pasos. Las dos rutas de reportes —
`/reportes/contratos-activos` y `/reportes/historial-ventas`— pasaron a la estética oscura
premium del shell con encabezado propio (eyebrow dorado, título `font-display` y descripción),
navegación superior entre ambos reportes solo con enlaces, tarjetas de resumen construidas con
agregados reales de los DTO, tablas en `tema="oscuro"` y estados de carga/error/vacío oscuros.
Historial de ventas conserva el panel destacado de utilidad del comerciante, ahora con la
participación derivada sobre la utilidad total.

Se conservaron intactos hooks, `api/`, `types.ts`, `orden.ts`, `query-keys.ts`, `formatos.ts`,
`mensajes-error.ts` e `index.ts`. No se tocaron `app/api/*` ni el backend, no se añadieron
dependencias y no se añadieron buscador, filtros, rango temporal, descargas, auditoría,
certificados, notificaciones, mutaciones ni acciones nuevas. No se inventaron datos ausentes de
`ContratoActivoDetalleDto`, `ResumenHistorialVentasDto` o `VentaHistorialItemDto`.

## Archivos

Nuevos:

- `features/reportes/resumen-contratos.ts` — `calcularResumenContratos` (lógica pura).
- `features/reportes/__tests__/resumen-contratos.test.ts` — 4 tests.
- `features/reportes/participacion.ts` — `calcularParticipacionComerciante` (lógica pura).
- `features/reportes/__tests__/participacion.test.ts` — 3 tests.
- `features/reportes/components/NavegacionReportes.tsx` — navegación superior compartida.

Modificados:

- `features/reportes/components/ContratosActivosReporte.tsx` — encabezado, navegación, cuatro
  tarjetas de resumen, tabla oscura enriquecida, pie de conteo y estados oscuros.
- `features/reportes/components/HistorialVentasReporte.tsx` — encabezado, navegación, panel
  destacado con participación derivada, seis tarjetas oscuras, tabla oscura, fórmula y estados.
- `features/reportes/components/TarjetaIndicador.tsx` — prop visual opcional `tema`.
- `app/(dashboard)/reportes/contratos-activos/page.tsx` — contenedor `max-w-7xl`, sin `h1`.
- `app/(dashboard)/reportes/historial-ventas/page.tsx` — contenedor `max-w-7xl`, sin `h1`.

Sin cambios: `features/reportes/index.ts`, `hooks/`, `api/`, `types.ts`, `orden.ts`,
`query-keys.ts`, `formatos.ts`, `mensajes-error.ts`, `shared/ui/*` y `app/(dashboard)/layout.tsx`.

## Cambios por paso

1. **Resumen de contratos (puro)** — `calcularResumenContratos(contratos)` devuelve
   `contratosEnCurso` (`length`), `ganadoEnPastoreo` (suma de `cantidad_actual`), `totalCompras`
   (suma de `total_compras`) y `utilidadNetaGenerada` (suma de
   `utilidad_generada_comerciante`, conservando el signo). Tests: listado vacío, sumas
   correctas, utilidad negativa y conteo con sumas en cero.
2. **Participación del comerciante (pura)** — `calcularParticipacionComerciante(resumen)`
   deriva `utilidad_comerciante_acumulada / utilidad_total_acumulada × 100` y devuelve `null`
   cuando el total es cero o no finito (sin división por cero). Tests: caso normal, total cero
   y resumen vacío.
3. **Navegación** — `NavegacionReportes` (client, `usePathname`) con dos `next/link` a las rutas
   existentes; el activo expone `aria-current="page"` y subrayado dorado, replicando el patrón
   de `app/(dashboard)/_components/enlace-navegacion.tsx`. Sin pestañas ni rutas nuevas.
4. **Contratos activos** — encabezado oscuro (`section aria-labelledby`, eyebrow "Participación
   y engorde", `h1` "Contratos activos"), navegación, cuatro tarjetas `glass-panel` (grid
   `sm:grid-cols-2 lg:grid-cols-4`) con `—` durante carga/error y `aria-live="polite"`, tabla
   `tema="oscuro"` con Tercero (iniciales + nombre), Finca, Cantidad actual (+ peso promedio
   como dato secundario, `—` si ausente), Total compras, Total ventas, Utilidad generada
   (derecha) y el reparto `comerciante% / tercero%` como dato secundario formateado. Pie de
   conteo real (`formatearConteo(contratos.length)` + "contratos activos"). Se conservan
   `ordenarContratosPorUtilidadDescendente` y `mensajeVacio`.
5. **`TarjetaIndicador`** — prop opcional `tema?: "claro" | "oscuro"` con `"claro"` por defecto;
   el tema oscuro usa `bg-elinain-surface` / `bg-elinain-gold/10` y conserva la jerarquía
   textual de `realce`. Los consumidores existentes no cambian.
6. **Historial de ventas** — encabezado oscuro (eyebrow "Comercialización", `h1` "Historial de
   ventas"), navegación, panel destacado `glass-panel` con `formatearMoneda` de
   `utilidad_comerciante_acumulada` y la participación derivada (`formatearPorcentaje` o `—`),
   seis `TarjetaIndicador tema="oscuro"`, `Table tema="oscuro"` con las columnas actuales,
   fórmula visible "Utilidad = Valor bruto − Costo estimado" y el control "Ver todo" / "Ver
   menos". Se conservan `LIMITE_VENTAS_VISIBLES`, `recortarVentas`, `ordenarVentasPorFechaDescendente`
   y `mensajeVacio`.
7. **Páginas** — ambos `page.tsx` quedan como contenedor delgado
   `<section className="mx-auto w-full max-w-7xl">`, sin `h1` propio; `metadata` intacta.
8. **Verificación** — V1–V4 (abajo).
9. **V5** — validación manual pendiente del usuario (abajo).

## Verificación

| ID | Comando | Resultado |
|----|---------|-----------|
| V1 | `npm run format:check` | Pasa — "All matched files use Prettier code style!". |
| V2 | `npm run lint` | Pasa — ESLint sin errores. |
| V3 | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores. |
| V4 | `npm test` | Pasa — 52 suites, 404 tests en verde (el Work Item añade 2 suites y 7 tests: 4 de `resumen-contratos` + 3 de `participacion`). |
| V5 | Validación manual | Pendiente — la ejecuta el usuario sobre ambas rutas. |

Durante el loop de desarrollo se ejecutaron además
`npx jest --findRelatedTests features/reportes/__tests__/resumen-contratos.test.ts` (4) y
`features/reportes/__tests__/participacion.test.ts` (3), ambos en verde. Al final se ejecutó
`bash .rei/init.sh`, con V1–V4 en `[OK]` y código de salida 0 (el único `[WARN]` es el aviso
esperado de sesión activa registrada en `current.md`).

### V5 — qué revisar y cómo reproducir

Rutas protegidas: iniciar sesión y abrir `/reportes/contratos-activos` y
`/reportes/historial-ventas` con datos.

1. Encabezado en ambas: eyebrow dorado, título `font-display` y descripción; la navegación
   superior marca la ruta activa con subrayado dorado y `aria-current="page"`, y el enlace
   alterno navega al otro reporte.
2. Contratos activos: cuatro tarjetas (`Contratos en curso`, `Ganado en pastoreo`,
   `Total compras`, `Utilidad neta generada`) con agregados reales; durante carga/error se ven
   `—`. El pie muestra "N contratos activos" con el conteo real.
3. Contratos activos: tabla oscura ordenada por utilidad generada descendente; verificar
   Tercero (iniciales + nombre), peso promedio secundario (`—` si el DTO no lo trae) y el
   reparto comerciante/tercero como dato secundario de la utilidad.
4. Historial de ventas: panel "Utilidad del comerciante" con la participación derivada sobre la
   utilidad total (o `—` si el total es 0); seis tarjetas oscuras; tabla oscura con las columnas
   actuales y la fórmula "Utilidad = Valor bruto − Costo estimado".
5. Historial de ventas: con más de 50 ventas aparece "Ver todo" y expande/colapsa conservando el
   orden por fecha descendente; con 50 o menos no aparece el control.
6. Estados: recargar cada ruta para ver el skeleton oscuro y, ante error de red, el panel rojo
   tenue con el mensaje en español (sin detalle técnico); el vacío de la tabla es oscuro.
7. Responsive: móvil (encabezado apilado, tarjetas a una columna, navegación desplazable) y
   escritorio (hasta 4 columnas de tarjetas, tablas con scroll horizontal).

## Observaciones

- **Navegación y capas:** el plan mencionaba reutilizar `ESTILOS_ENLACE_*` de
  `app/(dashboard)/dashboard-styles.ts`. La arquitectura prohíbe que `features/` importe de
  `app/`, así que `NavegacionReportes` replica el patrón y las cadenas de estilo localmente, sin
  mover ni exportar nada desde `app/`. No se añadió dependencia alguna.
- **Contrato del plan respetado:** `index.ts` no cambió (los componentes nuevos son internos al
  feature); no se modificó la signatura pública de `TarjetaIndicador` salvo la nueva prop
  opcional, de modo que el tema claro por defecto queda idéntico.
- **Datos reales:** las tarjetas y columnas solo muestran campos de los DTO; la participación se
  formatea con los porcentajes que ya entrega el backend (contratos) o se deriva de dos cifras
  del resumen (historial), sin recalcular la utilidad. No se inventaron hectáreas, potreros,
  aforos, GPD, inspecciones ni estados.
- **Alcance:** no se añadieron buscador, filtros, rango temporal, descargas, auditoría,
  notificaciones, mutaciones ni acciones; no se tocaron `app/api/*` ni el backend.
