Objetivo

Rediseñar visualmente la ruta `/ventas` (listado global de ventas, no la sección de ventas embebida en el detalle de contrato) con la estética oscura premium ya aplicada en dashboard, fincas y contratos, conservando intactos el comportamiento, las rutas, el filtro por contrato, la paginación de servidor, los modales, los toasts, los mensajes funcionales y las acciones existentes. La página se enriquece con cinco tarjetas de resumen construidas únicamente con campos reales de `VentaRespuestaDto` de los registros que la página está mostrando, con una nota honesta de que los agregados corresponden a esos registros.

Archivos

- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/ventas/loading.tsx` (nuevo)
- `app/(dashboard)/ventas/_components/listado-con-contratos.tsx` (solo estados de carga/error al tema oscuro)
- `features/ventas/components/VentasListado.tsx`
- `features/ventas/resumen.ts` (nuevo, lógica pura)
- `features/ventas/__tests__/resumen.test.ts` (nuevo)
- `features/ventas/components/VentasLista.tsx` y `features/ventas/components/VentaCard.tsx` solo si resulta imprescindible una prop visual opcional; la variante `tema="oscuro"` ya existe y debe reutilizarse.

Cambios

- Encabezado: mover la composición a `VentasListado` (como `ContratosListado`): eyebrow dorado "Liquidaciones & arbitraje de ganado", `h1` "Ventas" con `aria-labelledby`, descripción sobre registro auditable de liquidaciones, pesaje y distribución proporcional de utilidades por lote, y el CTA `Registrar venta` reestilizado como botón dorado (conservando su `onClick` y comportamiento). `page.tsx` queda como contenedor delgado `mx-auto w-full max-w-7xl`, sin `h1` propio.
- Resumen (lógica pura en `features/ventas/resumen.ts`): una función `calcularResumenVentas(ventas: Venta[])` que devuelve `valorBrutoTotal` (suma de `valor_bruto`), `utilidadTotalLiquidada` (suma de `utilidad_total`), `valorComerciante` (suma de `valor_comerciante`), `valorTercero` (suma de `valor_tercero`) y `rentabilidad` (`utilidad_total` sumada sobre `costo_estimado_compra` sumado, en porcentaje; `null` cuando el costo sumado no sea mayor que cero). Ignorar `null`/`undefined` en las sumas usando un guard como `esNumero`. Cubrir con tests en `features/ventas/__tests__/resumen.test.ts`: lista vacía (sumas en cero y rentabilidad `null`), sumas correctas con valores reales y costo cero para rentabilidad `null`.
- Cinco tarjetas `glass-panel` (grid responsive) que consumen ese resumen, con estados de carga/error mostrando `—` y `aria-live="polite"`, y un subtítulo breve y honesto (p. ej. "según los registros de esta página") que aclare que los agregados corresponden a los registros listados y no a un total global:
  - Valor bruto total (`formatearMoneda`).
  - Utilidad bruta liquidada (`formatearMoneda`).
  - A favor del comerciante (`formatearMoneda`; su proporción derivada es opcional).
  - A favor del tercero (`formatearMoneda`).
  - Rentabilidad / margen (`formatearPorcentaje`; `—` cuando sea `null`).
- Barra de filtros en `VentasListado` adaptada al tema oscuro: conservar el `Select` "Filtrar por contrato" con sus opciones y `onChange` actuales (solo estilizado oscuro) y el CTA `Registrar venta` en dorado, en la misma fila. Sin buscador ni rango temporal.
- Listado en tema oscuro: `VentasListado` pasa `tema="oscuro"` a `VentasLista` (no rediseñar de nuevo `VentaCard`/`VentasLista`); adaptar carga, error y vacío al tema oscuro (error en panel rojo tenue como en fincas/contratos). Conservar el filtro por contrato, la paginación de servidor, `VentaFormModal` y `ResultadoVentaModal` tal cual.
- `loading.tsx`: nueva composición oscura acorde (encabezado con eyebrow, título y descripción, CTA, cinco tarjetas de resumen, barra de filtros y tarjetas de venta) con el mismo `max-w-7xl` y sin saltos de layout.
- Ajustar `listado-con-contratos.tsx` para que sus estados de carga/error usen la estética oscura, sin cambiar la composición ni la lógica de datos.

Restricciones

- No modificar hooks, `api/`, tipos de dominio, queries, mutaciones, paginación, rutas, permisos, modales, toasts ni mensajes funcionales.
- No tocar la sección de ventas del detalle de contrato (`VentasSeccion`) ni `VentaCard`/`VentasLista` más allá de lo imprescindible; si se amplían, usar props visuales opcionales con `"claro"` por defecto.
- No añadir buscador, rango temporal, descarga de PDF, auditoría, firma, notificaciones ni acciones o mutaciones nuevas.
- No inventar merma, GPD, curva de engorde, próximo lote, garantías, tasas, estados ni datos ausentes de `VentaRespuestaDto`.
- No añadir dependencias; reutilizar `features/ventas/formatos.ts` (`formatearMoneda`, `formatearNumero`, `formatearPorcentaje`) y `shared/lib/fechas`.
- Presentar los agregados de las tarjetas explícitamente como correspondientes a los registros listados, nunca como totales globales.

Pasos

1. [x] Crear `features/ventas/resumen.ts` con `calcularResumenVentas` y sus tests en `features/ventas/__tests__/resumen.test.ts` (lista vacía, sumas y costo cero para rentabilidad `null`).
2. [x] Reorganizar `page.tsx` (contenedor `max-w-7xl`) y `VentasListado` con encabezado, eyebrow, `aria-labelledby`, descripción y CTA dorado, sin mover la lógica de datos.
3. [x] Añadir las cinco tarjetas de resumen con estados de carga/error y `aria-live`, con la nota honesta de "según los registros de esta página".
4. [x] Adaptar el `Select` de filtro, el CTA, la carga, el error y el vacío al tema oscuro y pasar `tema="oscuro"` a `VentasLista`, conservando paginación, modales y mensajes.
5. [x] Crear `app/(dashboard)/ventas/loading.tsx` con el esqueleto oscuro acorde (`max-w-7xl`) y ajustar `listado-con-contratos.tsx` a la estética oscura sin cambiar su composición; verificar responsive en móvil y escritorio.
6. [x] Ejecutar V1 (`npm run format:check`), V2 (`npm run lint`), V3 (`npm run typecheck`) y V4 (`npm test`, incluido `resumen.test.ts`), documentando el resultado.
7. [x] Completar la validación manual V5 sobre `/ventas` (ruta protegida, no la ejecuta el agente): encabezado, tarjetas de resumen, filtro por contrato, CTA, listado en oscuro, paginación, registro de venta y ausencia de cambios en el detalle de contrato. (V1–V4 en verde; V5 queda pendiente de la validación manual del usuario, con los pasos reproducibles documentados en `impl.md`.)
