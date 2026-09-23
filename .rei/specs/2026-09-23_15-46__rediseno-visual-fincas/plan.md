Objetivo

Refinar visualmente la ruta `/fincas` (pestañas Listado y Mapa) con la composición oscura premium del shell y el rediseño ya aplicado en socios de participación, conservando intactos el comportamiento, las rutas y la información real disponible (nombre, dirección, propietario, coordenadas, total de fincas y filas visibles).

Archivos

- `app/(dashboard)/fincas/page.tsx`
- `app/(dashboard)/fincas/loading.tsx`
- `app/(dashboard)/fincas/_components/listado-con-propietarios.tsx`
- `features/fincas/components/FincasTabs.tsx`
- `features/fincas/components/FincasTable.tsx`
- `features/fincas/components/FincasMapa.tsx`
- `features/fincas/components/FincaDetalleModal.tsx`
- `shared/ui/Table.tsx`, `shared/ui/TablePagination.tsx` y `shared/ui/Modal.tsx` solo si se necesitan props visuales opcionales; la variante `tema="oscuro"` ya existe y debe reutilizarse.
- `app/globals.css` solo si se requiere un ajuste acotado del popup de Leaflet en esta ruta.

Cambios

- Encabezado: componer en `FincasTabs` el eyebrow dorado, el `h1` "Fincas" y la descripción de fincas registradas para pastoreo, ceba y custodia bajo participación; dejar `page.tsx` como contenedor delgado `max-w-7xl`, igual que `/terceros`. Conservar un `h1` semántico con `aria-labelledby`.
- Control segmentado tipo píldora `Listado | Mapa` que reemplaza la actual `tablist` subrayada, conservando `role="tab"`, `aria-selected`, `aria-controls`, el estado local `vista` y la carga diferida del mapa (`dynamic` con `ssr: false`).
- CTA `Nueva finca`: conservar el enlace `href="/fincas/nueva"` y su comportamiento, reestilizado como botón dorado y ubicado en el encabezado junto al control segmentado, conforme a la referencia; no se altera el alta.
- Resumen: dos tarjetas `glass-panel` que muestran `total` (fincas registradas) y `filas.length` (filas visibles en la página actual), más un texto informativo construido con esos mismos valores. Mostrar `—` durante carga o error. Sin métricas, búsqueda ni filtros.
- Tabla: reutilizar `Table` con `tema="oscuro"` sobre superficie carbón sólida. Mantener exactamente las columnas `Nombre`, `Dirección`, `Propietario` y `Acciones`, enriqueciendo solo su presentación con datos reales: icono o avatar con iniciales derivadas de `nombre` (finca y propietario), dirección con icono de ubicación, y acciones `Editar` (`/fincas/[id]/editar`) y `Eliminar` reestilizadas como en socios. La clave de fila sigue siendo `finca.id`.
- Estados: adaptar carga, error y vacío al tema oscuro (error en panel rojo tenue, vacío con el mensaje real existente) y actualizar `loading.tsx` a la nueva composición de encabezado, resumen y tabla oscura sin saltos de layout.
- Mapa: conservar `MapContainer`, `TileLayer`, `AjustarVista`, `useTodasLasFincas`, los pines, el `Popup` con "Ver detalle" y `FincaDetalleModal`. Rediseñar el contenedor como superficie oscura y la presentación del detalle con estética de panel lateral oscuro, mostrando solo `nombre`, `propietario`, `direccion` y `coordenadas`, con la acción `Editar` existente.

Restricciones

- No modificar hooks, API, tipos de dominio, queries, mutaciones, paginación, rutas, permisos, modales, toasts ni mensajes funcionales.
- No cambiar alta, edición, eliminación, columnas lógicas, orden de datos ni acciones de fila; conservar las rutas `/fincas/nueva` y `/fincas/[id]/editar`.
- No agregar búsqueda, filtros, exportación, pestañas nuevas ni acciones aunque aparezcan en la referencia.
- No inventar hectáreas, carga ganadera, cabezas, sanidad/ICA, lotes, extensión, estados, contratos, aforo, ganancia diaria, imágenes ni ninguna otra métrica ausente del DTO `FincaRespuestaDto`.
- Mantener superficies carbón sólidas; glassmorphism solo como detalle puntual del sistema existente.
- No añadir dependencias ni lógica de negocio; cualquier cálculo nuevo se limita a `filas.length` y `total`.
- Si se amplían `Table`, `TablePagination` o `Modal`, usar props visuales opcionales con los estilos actuales como valor por defecto.
- Conservar la carga diferida del mapa y la composición de propietarios que resuelve `app/`.

Pasos

1. [x] Reorganizar `page.tsx` y `FincasTabs` con encabezado, descripción, control segmentado y CTA, sin mover la lógica de pestañas ni las rutas.
2. [x] Incorporar el resumen de `total` y `filas.length` y refinar visualmente tabla, celdas, acciones y paginación con `tema="oscuro"`.
3. [x] Rediseñar el contenedor del mapa y la presentación del detalle con estética de panel lateral oscuro, conservando pines, popup, `AjustarVista`, `useTodasLasFincas` y `FincaDetalleModal`.
4. [x] Sincronizar `loading.tsx`, carga, vacío y error con la estructura final y verificar responsive en móvil y escritorio.
5. [x] Si es necesario, añadir props visuales opcionales en los componentes compartidos sin cambiar sus valores por defecto.
6. [x] Ejecutar V1 (`npm run format:check`), V2 (`npm run lint`) y V3 (`npm run typecheck`); ejecutar la suite completa V4 (`npm test`) y documentar el resultado; completar la validación manual V5 sobre `/fincas` en ambas pestañas.
