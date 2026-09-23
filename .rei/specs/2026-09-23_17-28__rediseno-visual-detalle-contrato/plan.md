Objetivo

Rediseñar visualmente la página de detalle de un contrato (`/contratos/[id]`) al tema oscuro del shell y al estilo ya aplicado en `ContratosListado`, `TercerosTable` y `FincasTable`, conservando intactos el comportamiento, las rutas, las queries, las mutaciones, la paginación, los permisos, los modales, los toasts y los mensajes. El detalle pasa a tener un encabezado con ficha técnica y balance de custodia construido solo con campos reales de `ContratoRespuestaDto` y con las relaciones ya resueltas en `app/` (tercero y finca), más las cuatro secciones existentes (compras, ciclos, costos y ventas) convertidas en pestañas con contador de registros. Cada pestaña se rediseña con datos reales, reutilizando `Table`/`TablePagination` con `tema="oscuro"`. Solo se conservan las acciones existentes: el enlace "Editar contrato" y los botones internos de cada sección.

Archivos

Nuevos (lógica pura y sus tests):
- `features/compras/totales.ts`
- `features/compras/__tests__/totales.test.ts`
- `features/ciclos/evolucion.ts`
- `features/ciclos/__tests__/evolucion.test.ts`
- `features/ventas/liquidacion.ts`
- `features/ventas/__tests__/liquidacion.test.ts`

Modificados:
- `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`
- `features/contratos/components/ContratoDetalle.tsx`
- `features/compras/components/ComprasSeccion.tsx`
- `features/ciclos/components/CiclosSeccion.tsx`
- `features/costos/components/CostosSeccion.tsx`
- `features/ventas/components/VentasSeccion.tsx`
- `features/ventas/components/VentasLista.tsx`
- `features/ventas/components/VentaCard.tsx`
- `shared/ui/Table.tsx` y `shared/ui/TablePagination.tsx` solo si resulta imprescindible una prop visual opcional; la variante `tema="oscuro"` ya existe y debe reutilizarse (previsiblemente no se tocan).

Sin cambios: `app/(dashboard)/contratos/[id]/page.tsx`, los `index.ts` de cada feature (las secciones ya se exportan y solo reciben una prop opcional), `hooks/`, `api/`, `types.ts`, `schemas.ts`, modales, mensajes, `ContratosListado` y el listado global `VentasListado`.

Cambios

- Header y ficha técnica (`ContratoDetalle`): enlace "← Volver a Contratos" (`/contratos`) y encabezado oscuro con el título "Detalle del contrato", una etiqueta con el código (`contrato.id`, truncado por CSS), badges de participación (`formatearParticipacion`) y de estado (`Activo`/`Cerrado`), y subtítulo con finca, raza y vigencia (`fecha_apertura`–`fecha_cierre`) solo cuando existan. Acción única "Editar contrato" (`/contratos/${id}/editar`). Sustituir el `<dl>` claro por una tarjeta `glass-panel` "Ficha técnica & balance de custodia" con los campos reales: socio de participación (`nombreDeTercero`), finca/predio (`nombreDeFinca`), fechas del ciclo (`fecha_apertura`/`fecha_cierre`), raza, régimen de reparto (`formatearParticipacion` + barra proporcional), valor base de referencia (`valor_kilo_referencia`), inventario actual (`cantidad_actual`, cabezas) y biomasa promedio actual (`peso_promedio_actual`, kg), con `—` cuando falten. Adaptar los estados de carga y error al tema oscuro conservando sus mensajes (`Cargando contrato…` y `mensajeErrorDetalleContrato`).
- Contador de pestañas (`onTotal`): añadir a `ComprasSeccion`, `CiclosSeccion`, `CostosSeccion` y `VentasSeccion` la prop opcional `onTotal?: (total: number) => void` y notificar el total (ya derivado de `consulta.data?.total`) desde un efecto que solo se dispara cuando cambia. Es una notificación al contenedor, no una obtención de datos ni estado derivable en render; el contenedor entrega callbacks estables para evitar bucles. `onCambio` y toda la lógica existente se conservan.
- Composición y pestañas (`detalle-con-relaciones.tsx`): contenedor `mx-auto w-full max-w-7xl`; estado de pestaña activa con "Compras" por defecto y estado de contadores alimentado por `onTotal`. Barra `role="tablist"` con cuatro `role="tab"` (`aria-selected`, `aria-controls`, `id`) rotuladas "Compras asociadas", "Ciclos de Pesaje", "Costos Informativos" y "Ventas & Liquidación Parcial", cada una con su contador. Cuatro `role="tabpanel"` (`aria-labelledby`), con las secciones **siempre montadas** y las inactivas ocultas (`hidden`), para no perder estado ni provocar recargas. Mantener tal cual los `onCambio` y la invalidación de `clavesContratos.todas`, y pasar `contratoEstado` a ciclos y costos.
- Pestaña Compras: `Table tema="oscuro"` con las columnas reales (fecha y hora, cabezas, peso promedio, precio/kg, inversión total, nota y acciones). Pie con "Volumen acumulado: N cabezas ingresadas" e "Inversión total en biomasa: $ X" a partir de las filas visibles con `calcularTotalesCompras`. Conservar "Registrar compra", editar/eliminar y sus modales; `valor_total` se muestra tal cual lo devuelve el backend.
- Pestaña Ciclos: `Table tema="oscuro"` con fecha de control, peso observado, evolución frente al pesaje previo y observaciones; aviso "Alerta de Ganancia Diaria (GMD)" con el delta del último checkpoint mediante `calcularEvolucionPesajes`. Conservar "Registrar ciclo" (deshabilitado con contrato cerrado), su mensaje, editar/eliminar y modales.
- Pestaña Costos: `Table tema="oscuro"` con fecha, concepto/rubro (`tipo`), descripción y monto registrado, más la nota fiduciaria existente ("Los costos son informativos y no afectan el cálculo de la utilidad real.") reestilizada al tema oscuro. Conservar "Agregar costo", su mensaje de contrato cerrado, editar/eliminar y modales.
- Pestaña Ventas: rediseñar `VentaCard` como tarjeta de liquidación oscura **solo con campos reales** (`valor_bruto`, `utilidad_total`, `valor_comerciante`, `valor_tercero`, `kilos_ganados_promedio`, `porcentaje_utilidad_total`, `cantidad_vendida`, `peso_promedio_venta`, `precio_kilo_venta`) y una distribución contractual (comerciante/tercero con montos) cuyos porcentajes se derivan con `calcularDistribucionLiquidacion`. Como `VentaCard`/`VentasLista` también sirven al listado global, añadir una prop visual opcional `tema?: TemaTabla` con `"claro"` por defecto que preserve la apariencia actual del listado global; `VentasSeccion` usa la variante oscura. Conservar "Registrar venta" y `ResultadoVentaModal`.
- Lógica pura nueva (una por feature, sin importes entre features, con tests en su `__tests__/`):
  - `features/compras/totales.ts` → `calcularTotalesCompras(compras: Compra[])` devuelve `{ cabezas, inversion }` sumando `cantidad` y `valor_total` de las filas recibidas (las visibles).
  - `features/ciclos/evolucion.ts` → `calcularEvolucionPesajes(ciclos: Ciclo[])` ordena cronológicamente por `fecha` (ascendente, estable ante empates) y devuelve los deltas por id de cada checkpoint frente al **inmediatamente anterior** (solo si ambos `peso_observado` son números; si no, `null`) y `ultimoDelta` correspondiente al último checkpoint; con menos de dos pesajes, `null`. La evolución se calcula sobre los ciclos cargados por `useCiclos` (página actual, `LIMITE_POR_DEFECTO` = 20) porque el alcance no permite nuevas consultas; documentarlo en el JSDoc.
  - `features/ventas/liquidacion.ts` → `calcularDistribucionLiquidacion(venta: Venta)` deriva `porcentajeComerciante`/`porcentajeTercero` desde `valor_comerciante` y `valor_tercero` sobre su suma; devuelve `null` cuando la suma no es mayor que cero. No requiere props nuevas del contrato.
- Estados de carga, error y vacío de cada sección al tema oscuro conservando los mismos textos y el uso de `mensajeErrorListar*`.

Restricciones

- Mantener solo acciones existentes: "Editar contrato" y los botones internos de cada sección (Registrar compra / Registrar ciclo / Agregar costo / Registrar venta). NO añadir "Registrar pesaje", "Finalizar / Liquidar contrato", mutaciones ni acciones nuevas.
- No modificar hooks, `api/`, tipos de dominio, queries, mutaciones, paginación, rutas, permisos, modales, toasts ni mensajes funcionales. No tocar `ContratosListado` ni el listado global de ventas (`VentasListado`); el `tema` de `VentaCard`/`VentasLista` debe ser opcional con `"claro"` por defecto.
- No cambiar el CRUD de compras/ciclos/costos ni el registro de ventas; conservar sus acciones, modales y el `contratoEstado` que deshabilita el registro.
- No añadir buscadores, filtros, menús desplegables, nuevas pestañas ni acciones nuevas.
- No inventar datos ni métricas ausentes de los DTOs: nada de "destino", "lotes", "garantía prendaria", "hectáreas", números de documento ni estados nuevos; no añadir "rendimiento ponderado" si no corresponde a un campo real.
- La lógica pura nueva va en su feature (`features/compras`, `features/ciclos`, `features/ventas`) con tests; no duplicar lógica ni importar entre features.
- No añadir dependencias; reutilizar `Table`/`TablePagination` con `tema="oscuro"`, `shared/lib/fechas` y los formateadores existentes de cada feature. Si se amplían componentes compartidos, usar props visuales opcionales con los valores actuales por defecto.

Pasos

1. [x] Crear `features/compras/totales.ts` con `calcularTotalesCompras` y sus tests (filas vacías, suma correcta, página parcial).
2. [x] Crear `features/ciclos/evolucion.ts` con `calcularEvolucionPesajes` y sus tests: orden ascendente por `fecha` con entrada desordenada, deltas correctos frente al anterior, pesos nulos y menos de dos pesajes (`null`).
3. [x] Crear `features/ventas/liquidacion.ts` con `calcularDistribucionLiquidacion` y sus tests: reparto normal, suma cero (`null`) y valores desproporcionados.
4. [x] Rediseñar `ContratoDetalle`: enlace "Volver a Contratos", encabezado oscuro (título, código, badges, subtítulo), ficha técnica `glass-panel` con los campos reales, única acción "Editar contrato" y estados de carga/error oscuros con sus mensajes.
5. [x] Añadir la prop opcional `onTotal` a las cuatro secciones y notificar el total en un efecto al cambiar, sin alterar `onCambio` ni la lógica existente.
6. [x] Rehacer `detalle-con-relaciones.tsx`: `max-w-7xl`, pestaña por defecto Compras, contadores estables, tablist/tab/tabpanel accesibles con las secciones montadas y las inactivas ocultas, conservando la invalidación de queries.
7. [x] Rediseñar la pestaña Compras (`Table tema="oscuro"`, columnas reales y pie con volumen acumulado e inversión total) conservando "Registrar compra" y sus modales.
8. [x] Rediseñar la pestaña Ciclos (`Table tema="oscuro"`, columna de evolución y aviso del último delta) conservando "Registrar ciclo", su mensaje y sus modales.
9. [x] Rediseñar la pestaña Costos (`Table tema="oscuro"` y nota fiduciaria oscura) conservando "Agregar costo", su mensaje y sus modales.
10. [x] Rediseñar la pestaña Ventas (variante oscura de `VentaCard`/`VentasLista` con prop `tema` por defecto `"claro"` y distribución contractual derivada) conservando "Registrar venta" y `ResultadoVentaModal`.
11. [x] Ejecutar V1 (`npm run format:check`), V2 (`npm run lint`) y V3 (`npm run typecheck`); ejecutar la suite completa V4 (`npm test`) y documentar el resultado.
12. [ ] Completar la validación manual V5 sobre `/contratos/[id]` (ruta protegida, la ejecuta el usuario): encabezado y ficha técnica, pestañas y contadores, cada pestaña con sus datos, totales de compras, evolución de ciclos, nota de costos, tarjeta de liquidación de ventas, responsive y teclado.
