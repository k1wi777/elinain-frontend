Objetivo

Enriquecer visualmente la tabla del listado de `/fincas` con filas tipo tarjeta rica, usando exclusivamente datos reales del DTO `FincaRespuestaDto` (`id`, `nombre`, `direccion`, `latitud`, `longitud` y el propietario resuelto por `tercero_id`). Se conservan las columnas lógicas `Nombre`/`Dirección`/`Propietario`/`Acciones`, la paginación y todo el comportamiento; el cambio es solo de presentación.

Archivos

- `features/fincas/components/FincasTable.tsx` (componente principal a refinar).
- `app/(dashboard)/fincas/loading.tsx` si el esqueleto debe reflejar la nueva densidad de filas.
- `shared/ui/Table.tsx` y `shared/ui/TablePagination.tsx` solo si se requieren props visuales opcionales (la variante `tema="oscuro"` ya existe).

Cambios

- Nombre: reemplazar el avatar de iniciales de la finca por un icono de predio (`svg` inline, sin dependencias) con acento dorado sobre `bg-white/[0.08]`; mostrar `finca.nombre` en blanco y debajo, en texto pequeño tenue, el ID real con el formato de la referencia (`ID: {finca.id}`), truncado con CSS (`truncate`/`max-w`). `obtenerIniciales` se mantiene solo para el avatar del propietario.
- Dirección: conservar el icono de pin existente; primera línea con `finca.direccion` y segunda línea con las coordenadas reales (`latitud`, `longitud`) en texto pequeño tenue. Sin extensión, área ni datos inventados.
- Propietario: conservar el avatar de iniciales y el nombre resuelto con `nombreDePropietario(propietariosPorId, finca.tercero_id)`.
- Filas tipo tarjeta: aumentar el aire vertical de las celdas oscuras mediante `className` por columna (o, si no basta, una prop visual opcional en `Table` con los estilos actuales por defecto), manteniendo `border-t`, hover y la estructura de `Table`.
- Acciones: conservar el enlace `Editar` (`/fincas/[id]/editar`) y el botón `Eliminar`, puliendo solo estilos coherentes con la estética oscura de `TercerosTable`.
- Esqueleto (`loading.tsx`): si cambia la densidad de fila, ajustar el padding vertical de las filas del esqueleto para mantener el mismo alto; sin tocar el resto de su estructura.

Restricciones

- No modificar hooks, API, tipos de dominio, queries, mutaciones, paginación, rutas (`/fincas/nueva`, `/fincas/[id]/editar`), modales, toasts ni mensajes funcionales.
- No cambiar las columnas lógicas, el orden de datos ni las acciones de fila; no añadir búsqueda, filtros, exportación ni acciones nuevas.
- No inventar badges de estado, extensión/área, ocupación, lotes, cabezas, hectáreas, sanidad ni ninguna métrica ausente del DTO.
- El ID mostrado es el real de la finca (`finca.id`); no formatearlo como código ficticio tipo `FIN-COL-0016`; como máximo, truncarlo visualmente con CSS.
- Usar exclusivamente el sistema visual existente (`elinain-*`, `glass-panel`, `font-display`) y la estética oscura de `TercerosTable`; no añadir dependencias ni lógica de negocio.
- Si se amplían componentes compartidos, usar props visuales opcionales con los estilos actuales como valor por defecto.

Pasos

1. [x] Rediseñar la columna `Nombre` con icono de predio, nombre e ID real pequeño/truncado.
2. [x] Enriquecer la columna `Dirección` con el pin existente y las coordenadas reales en una segunda línea.
3. [x] Ajustar la densidad y el espaciado de filas tipo tarjeta, conservando columnas, acciones y paginación.
4. [x] Pulir los estilos de las acciones de fila y, si aplica, sincronizar el esqueleto de `loading.tsx`.
5. [x] Ejecutar V1 (`npm run format:check`), V2 (`npm run lint`), V3 (`npm run typecheck`) y la suite completa V4 (`npm test`), documentando el resultado.
6. [x] Dejar indicada la validación manual V5 sobre `/fincas` (pestaña Listado) para que la ejecute el usuario con sesión; no la ejecuta el agente.
