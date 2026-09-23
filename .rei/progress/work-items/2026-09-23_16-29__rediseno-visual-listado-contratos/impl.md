# Implementación — Rediseño visual del listado de contratos

- **Work Item:** `2026-09-23_16-29__rediseno-visual-listado-contratos`
- **Tipo:** task (Caso B)
- **Agente:** implementer
- **Estado:** listo para revisión

## Resumen

Refinamiento visual de la ruta de **listado** `/contratos` con la estética oscura premium
del shell, alineada con `FincasTable`/`TercerosTable`, sin tocar el detalle del contrato ni
sus secciones. Se incorporaron encabezado con eyebrow y CTA dorado, cuatro tarjetas de
resumen construidas con datos reales de `ContratoRespuestaDto`, chips de filtro por estado
con contador y una tabla oscura con la agrupación de columnas acordada. Se conservaron
intactos hooks, `api/`, tipos, queries, mutaciones, rutas, toasts, mensajes, la paginación
(`usePagination`, `paginarContratos`, `PaginacionTabla`) y las acciones `Ver detalle`/
`Editar`.

## Archivos

### Nuevos

- `features/contratos/resumen.ts` — lógica pura `calcularResumenContratos`.
- `features/contratos/__tests__/resumen.test.ts` — 8 tests de la lógica pura.

### Modificados

- `app/(dashboard)/contratos/page.tsx` — contenedor `mx-auto w-full max-w-7xl`, sin `h1`.
- `app/(dashboard)/contratos/loading.tsx` — skeleton oscuro de la estructura final.
- `app/(dashboard)/contratos/_components/listado-con-relaciones.tsx` — estados de carga y
  error al tema oscuro; sin cambios en la composición.
- `features/contratos/components/ContratosListado.tsx` — encabezado, tarjetas, chips y tabla.

`shared/ui` no se modificó: la variante `tema="oscuro"` y la prop opcional `paddingFilas`
de `Table` ya existían.

## Cambios realizados

1. **Lógica pura (`resumen.ts`).** `calcularResumenContratos(contratos)` devuelve
   `contratosActivos` (conteo de `estado === "activo"`), `cabezasEnPie` (suma de
   `cantidad_actual` ignorando `null`/`undefined`), `pesoPromedioEnPie` (promedio entero de
   `peso_promedio_actual`, `null` sin datos) y los promedios de
   `porcentaje_comerciante`/`porcentaje_tercero` (mismos nombres que
   `formatearParticipacion`, `null` sin datos). Los promedios se redondean a entero.
2. **Encabezado.** `ContratosListado` compone eyebrow dorado, `h1` "Contratos" con
   `aria-labelledby`, descripción sobre registro fiduciario/pesajes/liquidación y el CTA
   `Nuevo contrato` (`/contratos/nuevo`) como botón dorado. `page.tsx` queda como contenedor
   delgado.
3. **Tarjetas de resumen.** Grid responsive (`sm:grid-cols-2 lg:grid-cols-4`) de cuatro
   tarjetas `glass-panel` que consumen `calcularResumenContratos`: "Contratos activos",
   "Cabezas en pie", "Peso promedio en pie" (kg) y "Split promedio"
   (`formatearParticipacion`). Muestran `—` durante carga o error, con `aria-live="polite"`.
   Sin métricas derivadas de multiplicaciones.
4. **Chips de filtro.** Sustituyen al `Select`: `Todos`/`Activos`/`Cerrados` con contador
   calculado con `filtrarContratosPorEstado`; al cambiar de chip se
   ejecuta `paginacion.reiniciar()`. Se conserva `EstadoFiltroContrato` y sus etiquetas; sin
   buscador ni estado "en liquidación".
5. **Tabla.** `tema="oscuro"` + `paddingFilas="py-6"` con columnas:
   - *Código / Apertura*: `id` truncado y `formatearFechaHora(fecha_apertura)`.
   - *Tercero*: avatar con iniciales derivadas del nombre + nombre.
   - *Finca / Predio*: icono de ubicación + nombre.
   - *Estatus*: badge (activo verde / cerrado neutro) y `fecha_cierre` como dato
     secundario.
   - *Participación*: `formatearParticipacion` + barra proporcional con los mismos
     porcentajes.
   - *Lote & Peso prom.*: `cantidad_actual` (cabezas), `peso_promedio_actual` (kg) y
     `raza` como dato secundario, con `—` cuando faltan.
   - *Acciones*: `Ver detalle` (`/contratos/[id]`) y `Editar` (`/contratos/[id]/editar`)
     reestilizadas, sin menú desplegable.
6. **Estados.** Error del listado en panel rojo tenue oscuro conservando
   `mensajeErrorListarContratos`; vacío hereda la superficie oscura de `Table` con el
   `mensajeVacio` existente. `loading.tsx` reproduce encabezado, CTA, cuatro tarjetas, chips
   y filas tipo tarjeta.

## Verificación

- **V1 — `npm run format:check`:** pasa. «All matched files use Prettier code style!».
- **V2 — `npm run lint`:** pasa, sin errores.
- **V3 — `npm run typecheck`:** pasa, `tsc --noEmit` sin errores.
- **V4 — `npm test`:** pasa. 45 suites / 374 tests en verde, incluidos los 8 tests nuevos de
  `features/contratos/__tests__/resumen.test.ts`.
- **`bash .rei/init.sh`:** finaliza con código 0 y V1–V4 en `[OK]`.
- **V5 — Validación manual (pendiente del usuario):** no automatizable (no hay librería de
  render). Ruta protegida `/contratos` en desarrollo (`npm run dev`, sesión iniciada):
  1. Encabezado con eyebrow, título "Contratos" y CTA "Nuevo contrato" funcional.
  2. Cuatro tarjetas con datos reales; `—` si el backend no responde; sin saltos de layout
     durante la carga.
  3. Chips `Todos`/`Activos`/`Cerrados` con contador correcto; al cambiar reinician la
     página a la primera.
  4. Tabla oscura con las siete columnas y `—` en lote/peso/raza cuando falten.
  5. `Ver detalle` y `Editar` navegan a las rutas existentes.
  6. Paginación "Mostrando X a Y de Z registros" y navegación anterior/siguiente.
  7. Revisión responsive en móvil (sin desbordes horizontales salvo el scroll interno de la
     tabla) y escritorio.

## Observaciones

- La barra proporcional de *Participación* usa `style={{ width }}` con los porcentajes
  reales; es el único punto donde un valor dinámico no se puede expresar con clases
  estáticas de Tailwind.
- No se añadieron dependencias ni se modificaron hooks, `api/`, tipos, queries, mutaciones,
  rutas, toasts ni el detalle del contrato.
- El paso 6 del plan era condicional; no fue necesario ampliar `Table`/`TablePagination`.
