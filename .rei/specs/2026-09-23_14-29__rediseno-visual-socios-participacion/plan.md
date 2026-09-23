Objetivo

Refinar la pantalla de socios de participación con una composición oscura, minimalista y premium inspirada en `public/assets/ejemplo2.jpeg`, sin alterar el comportamiento actual ni presentar información que el sistema no tenga disponible.

Archivos

- `app/(dashboard)/terceros/page.tsx`
- `app/(dashboard)/terceros/loading.tsx`
- `features/terceros/components/TercerosTable.tsx`
- `shared/ui/Table.tsx` y `shared/ui/TablePagination.tsx`, únicamente si se necesitan variantes visuales opcionales para presentar esta tabla en tema oscuro sin cambiar el aspecto de otros listados.

Cambios

- Reorganizar el encabezado de la página con título, descripción breve y jerarquía visual coherente con el shell oscuro existente; conservar la ruta y el CTA `Nuevo socio de participación`.
- Añadir sobre el listado un resumen visual que muestre únicamente `total` de socios registrados y `filas.length` como socios visibles en la página actual, con estados seguros durante carga, vacío y error.
- Presentar el listado como una superficie carbón sólida y espaciosa, con encabezados, filas, acciones y paginación adaptados al tema oscuro; mantener exactamente las columnas `Nombre`, `Documento`, `Contacto` y `Acciones`.
- Mejorar la representación visual de cada fila usando solo `nombre`, `documento`, `contacto` e `id` para la clave; no añadir avatar, finca, contrato, ganado, participación, saldo, ubicación, fechas ni estados derivados.
- Ajustar el skeleton y los estados de error/vacío para que reproduzcan la nueva composición y mantengan la semántica accesible.
- Si se amplía `Table` o `TablePagination`, hacerlo mediante props visuales opcionales con los estilos actuales como valor por defecto, para no afectar otros consumidores.

Restricciones

- No modificar hooks, API, tipos de dominio, queries, mutaciones, paginación, rutas, permisos, modales, toasts ni mensajes funcionales.
- No cambiar alta, edición, eliminación, columnas, orden de datos, acciones de fila ni controles Anterior/Siguiente.
- No agregar búsqueda, filtros, exportación, pestañas ni nuevas acciones aunque aparezcan en la referencia.
- No inventar contratos, fincas, ganado, porcentajes, saldos, fechas, ubicación, estados de verificación o cualquier otra métrica ausente del DTO `TerceroRespuestaDto`.
- Usar superficies carbón sólidas; evitar degradados en tarjetas y reservar transparencias o glassmorphism para detalles puntuales del sistema visual existente.
- No añadir dependencias ni lógica de negocio. Cualquier cálculo nuevo se limita a `filas.length` para el resumen visual.

Pasos

1. [x] Ajustar la composición de `page.tsx` y el CTA/contenedor de `TercerosTable` sin mover la lógica de operaciones.
2. [x] Incorporar el resumen de `total` y filas visibles y refinar visualmente tabla, celdas, acciones y paginación con el tema oscuro.
3. [x] Sincronizar `loading.tsx`, carga, vacío y error con la estructura final y verificar responsive en móvil y escritorio.
4. [x] Si es necesario, añadir variantes visuales opcionales en los componentes compartidos sin cambiar sus valores por defecto.
5. Ejecutar V1, V2 y V3; ejecutar la suite completa V4 y documentar la evidencia indicada por el usuario si el arnés vuelve a reproducir el error de next/jest; completar validación manual V5 sobre `/terceros`.
