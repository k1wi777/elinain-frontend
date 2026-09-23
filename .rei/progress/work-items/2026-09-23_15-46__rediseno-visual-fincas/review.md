# Revisión — Rediseño visual de fincas

- **Estado final:** `done`

## Verificaciones

- **V1:** Pasa — `npm run format:check` → "All matched files use Prettier code style!".
- **V2:** Pasa — `npm run lint` sin errores.
- **V3:** Pasa — `npm run typecheck` (`tsc --noEmit`) sin errores.
- **V4:** Pasa — `npm test`: 44 suites y 366 tests en verde (ejecutado por el Reviewer).
- **V5:** Pendiente de validación manual del usuario sobre `/fincas` en ambas pestañas; la ruta
  está protegida por `middleware.ts` y no es ejecutable por el agente. Pasos documentados en
  `impl.md`. No se marca como superada.
- **`bash .rei/init.sh`:** sale con código de salida `0`, con `V1`–`V4` en verde.

## Resultado

El rediseño cumple el objetivo de `plan.md`: encabezado oscuro (eyebrow, `h1` con
`aria-labelledby`, descripción y CTA `Nueva finca` a `/fincas/nueva`), control segmentado tipo
píldora `Listado | Mapa` conservando `role="tab"`/`aria-selected`/`aria-controls`, el estado
local `vista` y la carga diferida del mapa (`dynamic` con `ssr: false`), resumen con `total` y
`filas.length` (únicos valores nuevos, ambos derivados de la consulta actual, mostrados como
`—` en carga/error), tabla con `tema="oscuro"` y columnas intactas
`Nombre`/`Dirección`/`Propietario`/`Acciones`, `loading.tsx` sincronizado y mapa con popup y
detalle en estética oscura.

Se respetan las restricciones: no se modificaron hooks, `api/`, tipos de dominio, queries,
mutaciones, paginación, rutas, permisos, borrado, toasts ni mensajes funcionales; se conservan
`/fincas/nueva` y `/fincas/[id]/editar`, las columnas lógicas, el orden de datos y las acciones
de fila; no se añadieron búsqueda, filtros, exportación, pestañas nuevas, dependencias ni
métricas ausentes del DTO `FincaRespuestaDto` (las iniciales de los avatares son solo
presentación derivada de `nombre`, autorizada por el plan). La información mostrada se limita a
`total`, `filas.length`, `nombre`, `direccion`, propietario resuelto y coordenadas.

Arquitectura y convenciones: `app/` queda como contenedor delgado (sin lógica de negocio) y la
composición de propietarios sigue en `app/`, sin imports entre features; el único cambio en
`shared/ui` es la prop visual opcional `tema` de `Modal`, con valor por defecto `"claro"` que
conserva el comportamiento de los consumidores actuales. `Table`/`TablePagination` ya exponían
`tema="oscuro"` y se reutilizaron sin cambios. La clase `.mapa-fincas` en `app/globals.css`
acota el popup oscuro a esta ruta.

## Observaciones

- El resumen vive dentro de `FincasTable` porque `total` y `filas.length` solo son conocidos
  por `useFincas`; por eso aparece en la pestaña Listado y no en la Mapa. No se movió la
  consulta ni la paginación.
- El detalle del mapa se mantiene como `Modal` oscuro centrado (`<dialog>` nativo: foco,
  `Escape`, `aria-modal`) en lugar de reposicionarlo, para no alterar el comportamiento de los
  modales. `EliminarFincaModal` conserva su tema claro por estar fuera del alcance visual
  autorizado.
- Clases de opacidad no estándar (`bg-red-400/8`, `border-white/6`, `border-white/8`) ya se
  usan en el sistema existente (`TercerosTable`, `TarjetaResumen`), por lo que son consistentes
  con el proyecto.
