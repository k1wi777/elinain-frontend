Objetivo

Refinar visualmente la ruta `/contratos` (página de listado, no el detalle de un contrato) con la composición oscura premium del shell y el rediseño ya aplicado en socios de participación y fincas, conservando intactos el comportamiento, las rutas, la paginación, las queries, los mensajes y las acciones existentes (Ver detalle y Editar). La página se enriquece con tarjetas de resumen y chips de filtro construidos únicamente con campos reales de `ContratoRespuestaDto` y de las relaciones ya compuestas en `app/` (tercero y finca).

Archivos

- `app/(dashboard)/contratos/page.tsx`
- `app/(dashboard)/contratos/loading.tsx`
- `app/(dashboard)/contratos/_components/listado-con-relaciones.tsx` (solo estados de carga/error al tema oscuro)
- `features/contratos/components/ContratosListado.tsx`
- `features/contratos/resumen.ts` (nuevo, lógica pura)
- `features/contratos/__tests__/resumen.test.ts` (nuevo)
- `shared/ui/Table.tsx` y `shared/ui/TablePagination.tsx` solo si resulta imprescindible una prop visual opcional; la variante `tema="oscuro"` ya existe y debe reutilizarse.

Cambios

- Encabezado: mover la composición al feature `ContratosListado` (como `TercerosTable`/`FincasTabs`): eyebrow dorado, `h1` "Contratos" con `aria-labelledby`, descripción sobre registro fiduciario y seguimiento de pesajes y liquidación de lotes en participación, y el CTA `Nuevo contrato` (`href="/contratos/nuevo"`) reestilizado como botón dorado. `page.tsx` queda como contenedor delgado `mx-auto w-full max-w-7xl`, sin `h1` propio.
- Resumen (lógica pura en `features/contratos/resumen.ts`): una función `calcularResumenContratos(contratos: Contrato[])` que devuelve `contratosActivos` (conteo de `estado === "activo"`), `cabezasEnPie` (suma de `cantidad_actual`, ignorando `null`/`undefined`), `pesoPromedioEnPie` (promedio de `peso_promedio_actual`, ignorando nulos; `null` sin datos) y los promedios de `porcentaje_comerciante`/`porcentaje_tercero` (mismos nombres de campo que `formatearParticipacion` para reutilizarlo; `null` sin datos). Redondear promedios a entero para su presentación. Cubrir con tests en `features/contratos/__tests__/resumen.test.ts`: contratos vacíos, valores nulos/parciales, suma y promedios correctos.
- Cuatro tarjetas `glass-panel` (grid responsive) que consumen ese resumen: "Contratos activos", "Cabezas en pie", "Peso promedio en pie" (kg) y "Split promedio" (`formatearParticipacion`). Mostrar `—` durante carga o error y usar `aria-live="polite"`. Sin métricas derivadas de multiplicaciones (nada de "capital en ganado").
- Chips de filtro con contador (Todos N / Activos N / Cerrados N) que reemplazan el `Select`: reutilizar `filtrarContratosPorEstado`, calcular los conteos desde `contratos`, resetear la paginación al cambiar de chip (`paginacion.reiniciar()`), conservar `EstadoFiltroContrato` y sus etiquetas. Sin buscador y sin opción "En liquidación".
- Tabla con `tema="oscuro"` sobre superficie carbón y la agrupación de la referencia, solo con datos reales:
  - Código/Apertura: `id` truncado con CSS y `formatearFechaHora(contrato.fecha_apertura)` debajo.
  - Tercero (depositario): avatar con iniciales derivadas de `nombreDeTercero(...)` (helper local como en fincas/terceros) + el nombre.
  - Finca/Predio: icono de ubicación + `nombreDeFinca(...)`.
  - Estatus: badge según `estado` (activo verde, cerrado neutro); si `fecha_cierre` está presente, mostrarla como dato secundario con `formatearFechaHora`.
  - Participación: `formatearParticipacion(contrato)` y, opcionalmente, una barra proporcional construida con esos mismos porcentajes.
  - Lote & Peso prom.: `cantidad_actual` (cabezas) y `peso_promedio_actual` (kg) con `—` cuando sean nulos; `raza` como dato secundario real si está presente.
  - Acciones: conservar `Ver detalle` (`/contratos/[id]`) y `Editar` (`/contratos/[id]/editar`) con `Link`, reestilizados como en fincas; sin menú desplegable.
- Paginación: mantener `usePagination`, `paginarContratos` y `PaginacionTabla` sin cambios; hereda el resumen "Mostrando X a Y de Z registros" y la píldora de página de `TablePagination`.
- Estados: adaptar carga, error y vacío al tema oscuro (error en panel rojo tenue como en fincas; conservar `mensajeErrorListarContratos` y el mensaje vacío existente). Ajustar `listado-con-relaciones.tsx` para que sus textos de carga/error usen la estética oscura, sin cambiar la lógica de composición.
- `loading.tsx`: nueva composición oscura (encabezado, CTA, cuatro tarjetas de resumen, chips y filas tipo tarjeta) con el mismo `max-w-7xl` y sin saltos de layout.

Restricciones

- No modificar hooks, `api/`, tipos de dominio, queries, mutaciones, paginación, rutas, permisos, toasts ni mensajes funcionales; no tocar el detalle del contrato ni sus secciones (compras, ciclos, costos, ventas).
- No cambiar alta ni edición; conservar `/contratos/nuevo`, `/contratos/[id]` y `/contratos/[id]/editar`.
- No añadir buscador, menú de acciones (kebab), botón "Ajustes Lotes", proyección de ganancia diaria, estado "en liquidación", hectáreas, lotes ni métricas derivadas de multiplicaciones (capital en ganado) ni de otros módulos.
- No inventar documento, teléfono, ubicación de finca ni cualquier dato ausente de `ContratoRespuestaDto` o de las proyecciones `TerceroContrato`/`FincaContrato` (solo `id`, `nombre` y, en finca, `tercero_id`).
- Reutilizar `Table`/`TablePagination` (variante `tema="oscuro"`) y los formateadores de `shared/lib/fechas` y `features/contratos/participacion`; no añadir dependencias.
- Si se amplían `Table`/`TablePagination`, usar props visuales opcionales con los valores actuales por defecto.

Pasos

1. [x] Crear `features/contratos/resumen.ts` con `calcularResumenContratos` y sus tests en `features/contratos/__tests__/resumen.test.ts` (incluida la omisión de nulos).
2. [x] Reorganizar `page.tsx` (contenedor `max-w-7xl`) y `ContratosListado` con encabezado, eyebrow, `aria-labelledby`, descripción y CTA dorado, sin mover la lógica de datos.
3. [x] Sustituir el `Select` por los chips de filtro con contador reutilizando `filtrarContratosPorEstado` y reiniciando la paginación; añadir las cuatro tarjetas de resumen con estados de carga/error.
4. [x] Refinar la tabla con `tema="oscuro"` y la agrupación de columnas acordada, resolviendo tercero y finca con las proyecciones existentes y manteniendo las acciones `Ver detalle`/`Editar`.
5. [x] Adaptar carga, error y vacío al tema oscuro en `ContratosListado` y `listado-con-relaciones.tsx`, y sincronizar `loading.tsx` con la estructura final verificando responsive en móvil y escritorio.
6. [x] Si es necesario, añadir props visuales opcionales en `Table`/`TablePagination` sin cambiar sus valores por defecto. (No fue necesario: la variante `tema="oscuro"` y `paddingFilas` ya existían en `Table`; no se tocó `shared/ui`.)
7. [x] Ejecutar V1 (`npm run format:check`), V2 (`npm run lint`) y V3 (`npm run typecheck`); ejecutar la suite completa V4 (`npm test`) y documentar el resultado; completar la validación manual V5 sobre `/contratos` (ruta protegida) verificando encabezado, tarjetas, chips, tabla, acciones y paginación. (V1–V4 en verde; V5 queda pendiente de la validación manual del usuario, con los pasos reproducibles documentados en `impl.md`.)
