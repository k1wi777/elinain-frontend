# Implementación — Rediseño visual del listado de ventas

- **Work Item:** `2026-09-23_17-53__rediseno-visual-listado-ventas`
- **Tipo:** task (Caso B)
- **Fecha:** 2026-09-23
- **Agente:** implementer

## Resumen

Se ejecutó el `plan.md` en sus 7 pasos. La ruta `/ventas` (listado global, no la sección
embebida del detalle de contrato) pasó a la estética oscura premium del shell con
encabezado (eyebrow, título y descripción), CTA dorado `Registrar venta`, cinco tarjetas de
resumen construidas solo con campos reales de las ventas de la página, barra de filtro por
contrato en oscuro y el listado en `tema="oscuro"` reutilizando la variante ya existente de
`VentasLista`/`VentaCard`.

Se conservaron intactos hooks, `api/`, tipos, queries, mutaciones, paginación de servidor,
rutas, permisos, modales (`VentaFormModal`, `ResultadoVentaModal`), toasts y mensajes. No se
añadieron dependencias ni se modificaron componentes de `shared/ui`.

## Archivos

Nuevos:

- `features/ventas/resumen.ts` — `calcularResumenVentas` (lógica pura).
- `features/ventas/__tests__/resumen.test.ts` — 4 tests.
- `app/(dashboard)/ventas/loading.tsx` — skeleton oscuro de la ruta.

Modificados:

- `app/(dashboard)/ventas/page.tsx` — contenedor `mx-auto w-full max-w-7xl`, sin `h1` propio.
- `app/(dashboard)/ventas/_components/listado-con-contratos.tsx` — estados de carga/error en
  estética oscura, sin cambiar la composición ni la lógica de datos.
- `features/ventas/components/VentasListado.tsx` — encabezado, resumen, filtro en oscuro y
  `tema="oscuro"` para `VentasLista`.
- `features/ventas/components/VentasLista.tsx` — esqueletos de carga en oscuro cuando
  `tema="oscuro"`; error y vacío ya tenían variante oscura.

Sin cambios: `features/ventas/index.ts`, `hooks/`, `api/`, `types.ts`, `schemas.ts`,
`formatos.ts`, `mensajes-error.ts`, `VentaCard.tsx`, `VentasSeccion.tsx`, los modales, el
detalle de contrato y `shared/ui/*`.

## Cambios por paso

1. **Resumen puro** — `calcularResumenVentas(ventas: Venta[])` devuelve `valorBrutoTotal`
   (suma de `valor_bruto`), `utilidadTotalLiquidada` (suma de `utilidad_total`),
   `valorComerciante` (suma de `valor_comerciante`), `valorTercero` (suma de
   `valor_tercero`) y `rentabilidad` (`utilidad_total` acumulada sobre
   `costo_estimado_compra` acumulado, en porcentaje; `null` cuando el costo acumulado no es
   mayor que cero). Ignora `null`/`undefined` con el guard `esNumero`. Tests: lista vacía
   (sumas en cero y rentabilidad `null`), sumas correctas y costo cero.
2. **Encabezado** — `page.tsx` queda como contenedor delgado `max-w-7xl`. `VentasListado`
   compone el encabezado como `ContratosListado`: eyebrow dorado "Liquidaciones & arbitraje
   de ganado", `h1` "Ventas" con `id="ventas-title"` referenciado por
   `aria-labelledby`, descripción y CTA dorado `Registrar venta` con su `onClick` intacto.
3. **Cinco tarjetas de resumen** — grid `glass-panel` responsive
   (`sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`) con `formatearMoneda` /
   `formatearPorcentaje`; muestran `—` durante carga o error (`cargandoResumen`), usan
   `aria-live="polite"` y llevan un subtítulo por tarjeta más la nota visible "Los agregados
   corresponden a las ventas de esta página, no al total global".
4. **Filtro y listado en oscuro** — se conservó el `Select` "Filtrar por contrato" con sus
   opciones y `onChange`; se estilizó en oscuro vía `className` y variantes arbitrarias del
   contenedor (`[&_label]`, `[&_option]`), sin tocar `shared/ui/Select.tsx`. `VentasLista`
   recibe `tema="oscuro"`; los esqueletos de carga pasan a `bg-white/10` en oscuro. Se
   conservan paginación, modales y mensajes.
5. **`loading.tsx` y `listado-con-contratos.tsx`** — skeleton oscuro con el mismo
   `max-w-7xl` (encabezado, CTA, cinco tarjetas, filtro y tarjetas de venta). En
   `listado-con-contratos.tsx`, la carga pasa a `text-zinc-400` y el error al panel rojo
   tenue (`border-red-400/20 bg-red-400/8 text-red-200`), conservando los textos existentes.
6. **Verificación** — V1–V4 (abajo).
7. **V5** — validación manual pendiente del usuario (abajo).

## Verificación

| ID | Comando | Resultado |
|----|---------|-----------|
| V1 | `npm run format:check` | Pasa — "All matched files use Prettier code style!". |
| V2 | `npm run lint` | Pasa — ESLint sin errores. |
| V3 | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores. |
| V4 | `npm test` | Pasa — 49 suites, 391 tests en verde (antes: 48/387; +`resumen.test.ts`: 4 tests). |
| V5 | Validación manual | Pendiente — la ejecuta el usuario sobre `/ventas`. |

Durante el loop de desarrollo se ejecutó además `npx jest
features/ventas/__tests__/resumen.test.ts` (4 tests). Al final se ejecutó
`bash .rei/init.sh`, con V1–V4 en `[OK]` y código de salida 0 (el único `[WARN]` es el
aviso esperado de sesión activa registrada en `current.md`).

### V5 — qué revisar y cómo reproducir

Ruta protegida: iniciar sesión y abrir `/ventas` con datos.

1. Encabezado: eyebrow "Liquidaciones & arbitraje de ganado", título "Ventas", descripción y
   CTA dorado `Registrar venta` alineado en la misma fila en escritorio.
2. Cinco tarjetas de resumen con valores reales de la página y la nota de que corresponden a
   los registros listados; durante la carga o ante error se ven `—`.
3. Filtro "Filtrar por contrato" en oscuro: al cambiar de contrato se reinicia a la primera
   página y se conserva el `contrato_id` en la consulta.
4. Listado en `tema="oscuro"`: tarjetas de venta, estados de carga/error/vacío y paginación
   "Mostrando X a Y de Z registros" con navegación funcionando.
5. `Registrar venta`: abre `VentaFormModal`, registra y muestra `ResultadoVentaModal`; los
   mensajes de error se conservan.
6. Abrir y recargar `/ventas` para confirmar que `loading.tsx` no produce saltos de layout.
7. Responsive: móvil (tarjetas a una columna, header apilado, CTA a ancho completo) y
   escritorio (hasta 5 columnas de resumen).
8. Comprobar que la sección de ventas del detalle de contrato (`VentasSeccion`) sigue igual
   y que `VentasListado` clásico no cambió sus mensajes.

## Observaciones

- **Ubicación del CTA:** el plan menciona el CTA en el encabezado (paso 2, "como
  `ContratosListado`") y también "en la misma fila" que el `Select` (bullet de barra de
  filtros). Para no duplicar la acción se mantuvo **un único** CTA en el encabezado, en línea
  con el paso 2 y con la descripción del `loading.tsx` del paso 5 ("encabezado … CTA, cinco
  tarjetas de resumen, barra de filtros"); la barra de filtros conserva el `Select` por
  contrato.
- **`shared/ui` intacto:** el `Select` se estilizó solo con `className` y variantes
  arbitrarias del contenedor, preservando el tema claro por defecto para sus demás
  consumidores (formularios).
- **Alcance:** no se añadieron buscador, rango temporal, PDF, auditoría, firma, notificaciones
  ni acciones/mutaciones. No se inventaron merma, GPD, curva de engorde, próximo lote,
  garantías, tasas ni estados. Las tarjetas usan únicamente campos de `VentaRespuestaDto` de
  las filas de la página.
- **Sin `VentaCard`/`VentasSeccion`:** se reutilizó la variante `tema="oscuro"` ya existente;
  el único ajuste en `VentasLista` fue el color de los esqueletos de carga.
