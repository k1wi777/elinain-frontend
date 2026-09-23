Objetivo

Rediseñar visualmente las dos pantallas de reportes —`/reportes/contratos-activos` y `/reportes/historial-ventas`— al tema oscuro premium ya aplicado en el resto de la app, conservando intactos el comportamiento, las rutas, las queries, la ordenación, los mensajes y el control "Ver todo"/"Ver menos". Se enriquecen con encabezado oscuro, navegación superior solo con enlaces, tarjetas de resumen con agregados reales y tablas en `tema="oscuro"`, sin inventar datos ausentes de los DTO. La lógica pura nueva se cubre con tests.

Archivos

- `app/(dashboard)/reportes/contratos-activos/page.tsx`
- `app/(dashboard)/reportes/historial-ventas/page.tsx`
- `features/reportes/components/ContratosActivosReporte.tsx`
- `features/reportes/components/HistorialVentasReporte.tsx`
- `features/reportes/components/TarjetaIndicador.tsx`
- `features/reportes/components/NavegacionReportes.tsx` (nuevo, compartido)
- `features/reportes/resumen-contratos.ts` (nuevo, lógica pura)
- `features/reportes/__tests__/resumen-contratos.test.ts` (nuevo)
- `features/reportes/participacion.ts` (nuevo, lógica pura)
- `features/reportes/__tests__/participacion.test.ts` (nuevo)

`features/reportes/index.ts` no cambia: los componentes nuevos son internos al feature y solo los consumen las dos vistas ya exportadas.

Cambios

- `page.tsx` de ambas rutas: contenedor delgado `mx-auto w-full max-w-7xl` que compone solo su componente del feature; se retira el `h1` local (pasa al feature). Sin cambios de `metadata`.
- Encabezado oscuro dentro de cada componente del feature: `section aria-labelledby`, eyebrow dorado (`text-elinain-gold`), `h1` con `id` y `aria-labelledby` (texto blanco, `font-display`) y una descripción breve (`text-zinc-400`).
- `NavegacionReportes` (client, `usePathname`): pestañas superiores como únicos `next/link` a `/reportes/contratos-activos` y `/reportes/historial-ventas`, marcando el activo con `aria-current="page"` y subrayado dorado, reutilizando el patrón de `app/(dashboard)/_components/enlace-navegacion.tsx` y `ESTILOS_ENLACE_*` de `dashboard-styles.ts`. Sin pestañas ni rutas nuevas.
- Contratos activos — lógica pura `features/reportes/resumen-contratos.ts`: `calcularResumenContratos(contratos)` devuelve `contratosEnCurso` (`length`), `ganadoEnPastoreo` (suma de `cantidad_actual`), `totalCompras` (suma de `total_compras`) y `utilidadNetaGenerada` (suma de `utilidad_generada_comerciante`). Tests en `features/reportes/__tests__/resumen-contratos.test.ts`: listado vacío, sumas correctas y valores negativos/vacío.
- Contratos activos — cuatro tarjetas `glass-panel` (grid responsive) con ese resumen ("Contratos en curso", "Ganado en pastoreo", "Total compras", "Utilidad neta generada"); `—` durante carga/error y `aria-live="polite"`. Pie de conteo real bajo la tabla (p. ej. "N contratos activos") calculado con `formatearConteo(contratos.length)`; sin totales inventados.
- Contratos activos — tabla `tema="oscuro"` con las columnas reales ya existentes, enriquecidas solo en presentación: Tercero (iniciales derivadas de `tercero_nombre` + nombre), Finca (`finca_nombre`), Cantidad actual (`cantidad_actual`), peso promedio (`peso_promedio_actual`, `—` si ausente) como dato secundario, Total compras, Total ventas y Utilidad generada (`utilidad_generada_comerciante`, a la derecha); participación `porcentaje_comerciante`/`porcentaje_tercero` como dato secundario formateado (no recalculado). Se conserva `ordenarContratosPorUtilidadDescendente` y `mensajeVacio`.
- Historial de ventas — lógica pura `features/reportes/participacion.ts`: helper que deriva la participación del comerciante sobre `utilidad_total_acumulada` (`utilidad_comerciante_acumulada / utilidad_total_acumulada × 100`), devolviendo `null` sin datos o si el total es 0 (sin división por cero). Tests en `features/reportes/__tests__/participacion.test.ts`: caso normal, total 0 y valores vacíos.
- Historial de ventas — `TarjetaIndicador` al tema oscuro: nueva prop visual opcional `tema?: "oscuro"` con valor por defecto claro que conserva los estilos actuales; en oscuro mantiene la jerarquía textual de `realce`. Se usa aquí con `tema="oscuro"`.
- Historial de ventas — panel destacado "Utilidad del comerciante" con `formatearMoneda(resumen.utilidad_comerciante_acumulada)` y la participación derivada (`formatearPorcentaje`, o `—` si es `null`); se mantienen las seis tarjetas, el `Table tema="oscuro"` con las columnas actuales, `LIMITE_VENTAS_VISIBLES`, `recortarVentas` y el control "Ver todo"/"Ver menos". Texto explicativo breve y real bajo la tabla: "Utilidad = Valor bruto − Costo estimado" (sin cifras inventadas).
- Estados de carga, error y vacío de ambas vistas al tema oscuro: `Skeleton` sobre `bg-elinain-surface`/`bg-white/10`, error en panel rojo tenue (`border-red-400/20 bg-red-400/8 text-red-200`), conservando `mensajeErrorContratosActivos`/`mensajeErrorHistorialVentas` y los textos de carga/vacío actuales.

Restricciones

- No modificar hooks, `api/`, `types.ts`, `orden.ts`, `query-keys.ts`, `formatos.ts`, `mensajes-error.ts` ni `index.ts` (salvo lo imprescindible y justificado). No reordenar ni recalcular los valores que ya entrega el backend.
- No añadir buscador, filtros, rango temporal, descargas, auditoría, certificados, notificaciones, mutaciones ni acciones nuevas; no tocar `app/api/*` ni el backend.
- No inventar potreros, hectáreas, aforos, GPD, inspecciones, estados ni datos ausentes de `ContratoActivoDetalleDto`, `ResumenHistorialVentasDto` o `VentaHistorialItemDto`.
- No añadir dependencias; reutilizar `shared/ui/Table` con `tema="oscuro"`, `shared/lib/fechas` y `features/reportes/formatos.ts`.
- Toda ampliación de props en componentes compartidos (`TarjetaIndicador`) debe ser opcional y conservar el comportamiento actual por defecto para no romper otros consumidores.
- No tocar otras pantallas ya rediseñadas.

Pasos

1. [x] Crear `features/reportes/resumen-contratos.ts` con `calcularResumenContratos` y sus tests en `features/reportes/__tests__/resumen-contratos.test.ts`.
2. [x] Crear `features/reportes/participacion.ts` con el helper de participación del comerciante y sus tests en `features/reportes/__tests__/participacion.test.ts`.
3. [x] Crear `features/reportes/components/NavegacionReportes.tsx` (client, `usePathname`) con los dos enlaces y el estado activo, sin rutas nuevas.
4. [x] Rediseñar `ContratosActivosReporte.tsx`: encabezado oscuro, navegación, cuatro tarjetas de resumen, tabla `tema="oscuro"` enriquecida solo en presentación, pie de conteo real y estados de carga/error/vacío oscuros.
5. [x] Añadir la prop opcional `tema` a `TarjetaIndicador` conservando el tema claro por defecto.
6. [x] Rediseñar `HistorialVentasReporte.tsx`: encabezado oscuro, navegación, panel destacado con participación derivada, seis `TarjetaIndicador` en oscuro, tabla `tema="oscuro"`, texto de la fórmula y estados oscuros, conservando "Ver todo"/"Ver menos".
7. [x] Adelgazar ambos `page.tsx` a `mx-auto w-full max-w-7xl` sin `h1` propio.
8. [x] Ejecutar V1 (`npm run format:check`), V2 (`npm run lint`) y V3 (`npm run typecheck`); ejecutar V4 (`npm test`) y documentar el resultado en `impl.md`.
9. [x] Verificación V5 (manual, no la ejecuta el agente): validar `/reportes/contratos-activos` y `/reportes/historial-ventas` (rutas protegidas) confirmando encabezado, navegación activa, tarjetas, tablas oscuras, pie/fórmula, control "Ver todo"/"Ver menos" y responsive en móvil y escritorio. (V1–V4 en verde; V5 queda pendiente de la validación manual del usuario, con los pasos reproducibles documentados en `impl.md`.)
