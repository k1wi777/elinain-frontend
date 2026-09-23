# Implementación — Rediseño visual del detalle de contrato

- **Work Item:** `2026-09-23_17-28__rediseno-visual-detalle-contrato`
- **Tipo:** task (Caso B)
- **Fecha:** 2026-09-23
- **Agente:** implementer

## Resumen

Se ejecutó el `plan.md` en sus 12 pasos. El detalle `/contratos/[id]` pasó al tema oscuro
del shell con encabezado y ficha técnica construidos solo con campos reales de
`ContratoRespuestaDto`, y las cuatro secciones (compras, ciclos, costos y ventas) se
convirtieron en pestañas accesibles con contador de registros. Se conservaron intactos
hooks, `api/`, tipos, queries, mutaciones, paginación, rutas, permisos, modales, toasts y
mensajes; solo se conservan las acciones existentes ("Editar contrato" y los botones
internos de cada sección). No se añadieron dependencias.

## Archivos

Nuevos:

- `features/compras/totales.ts` — `calcularTotalesCompras`.
- `features/compras/__tests__/totales.test.ts`.
- `features/ciclos/evolucion.ts` — `calcularEvolucionPesajes`.
- `features/ciclos/__tests__/evolucion.test.ts`.
- `features/ventas/liquidacion.ts` — `calcularDistribucionLiquidacion`.
- `features/ventas/__tests__/liquidacion.test.ts`.

Modificados:

- `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`
- `features/contratos/components/ContratoDetalle.tsx`
- `features/compras/components/ComprasSeccion.tsx`
- `features/ciclos/components/CiclosSeccion.tsx`
- `features/costos/components/CostosSeccion.tsx`
- `features/ventas/components/VentasSeccion.tsx`
- `features/ventas/components/VentasLista.tsx`
- `features/ventas/components/VentaCard.tsx`

Sin cambios: `app/(dashboard)/contratos/[id]/page.tsx`, los `index.ts`, `hooks/`, `api/`,
`types.ts`, `schemas.ts`, modales, mensajes, `ContratosListado` y `VentasListado`. No se
tocaron `shared/ui/Table.tsx` ni `shared/ui/TablePagination.tsx` (la variante `tema="oscuro"`
ya existía).

## Cambios por paso

1. **Totales de compras** — `calcularTotalesCompras(compras)` suma `cantidad` y `valor_total`
   de las filas recibidas (las visibles). JSDoc aclara que no se recalcula el valor del backend.
2. **Evolución de pesajes** — `calcularEvolucionPesajes(ciclos)` ordena de forma ascendente y
   estable por `fecha`, devuelve `deltasPorId` frente al checkpoint inmediatamente anterior
   (`null` si falta cualquiera de los dos pesos) y `ultimoDelta`; con menos de dos pesajes,
   `null`. JSDoc documenta que opera sobre la página cargada por `useCiclos`.
3. **Distribución de la venta** — `calcularDistribucionLiquidacion(venta)` deriva los
   porcentajes de `valor_comerciante`/`valor_tercero` sobre su suma y devuelve `null` si la
   suma no es mayor que cero.
4. **`ContratoDetalle`** — enlace "Volver a Contratos", encabezado oscuro (título, código
   truncado, badges de reparto y estado, subtítulo con finca/raza/vigencia), tarjeta
   `glass-panel` "Ficha técnica & balance de custodia" (socio, finca/predio, raza, apertura,
   cierre, valor base de referencia, inventario actual, biomasa promedio y barra de reparto) y
   única acción "Editar contrato". Estados de carga/error en tema oscuro conservando
   `Cargando contrato…` y `mensajeErrorDetalleContrato`.
5. **Prop `onTotal`** — añadida como opcional a las cuatro secciones y notificada mediante
   `useEffect` cuando cambia el total; `onCambio` y el resto de la lógica quedan intactos.
6. **Composición y pestañas** — contenedor `mx-auto w-full max-w-7xl`, pestaña por defecto
   "Compras", contadores alimentados por callbacks estables (`useCallback`), `role="tablist"`
   con cuatro `role="tab"` (`aria-selected`, `aria-controls`, `id`) y cuatro `role="tabpanel"`
   (`aria-labelledby`) siempre montados, ocultando los inactivos con `hidden`. Se conserva la
   invalidación de `clavesContratos.todas` y el paso de `contratoEstado` a ciclos y costos.
7. **Pestaña Compras** — `Table tema="oscuro"` con fecha y hora, cabezas, peso promedio,
   precio/kg, inversión total, nota y acciones; pie con volumen acumulado e inversión total
   (`calcularTotalesCompras`). Se conservó "Registrar compra", editar/eliminar y sus modales.
8. **Pestaña Ciclos** — `Table tema="oscuro"` con fecha de control, peso observado, evolución
   frente al pesaje previo y observaciones; aviso "Alerta de Ganancia Diaria (GMD)" con el
   delta del último checkpoint. Se conservó "Registrar ciclo" (deshabilitado con contrato
   cerrado y su mensaje), editar/eliminar y modales.
9. **Pestaña Costos** — `Table tema="oscuro"` con fecha, concepto/rubro, descripción y monto
   registrado, más la nota fiduciaria reestilizada al tema oscuro. Se conservó "Agregar
   costo", su mensaje de contrato cerrado, editar/eliminar y modales.
10. **Pestaña Ventas** — `VentaCard` como tarjeta de liquidación con `tema?: TemaTabla`
    (`"claro"` por defecto) y distribución contractual (montos reales y porcentajes derivados);
    `VentasLista` acepta `tema` y lo propaga a la tarjeta, a los estados y a la paginación;
    `VentasSeccion` usa `tema="oscuro"`. Se conservó "Registrar venta" y `ResultadoVentaModal`.

## Verificación

| ID | Comando | Resultado |
|----|---------|-----------|
| V1 | `npm run format:check` | Pasa — todos los archivos cumplen Prettier. |
| V2 | `npm run lint` | Pasa — ESLint sin errores. |
| V3 | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores. |
| V4 | `npm test` | Pasa — 48 suites, 387 tests en verde. |
| V5 | Validación manual | Pendiente — la ejecuta el usuario sobre `/contratos/[id]`. |

Durante el loop de desarrollo se ejecutaron además los tests por feature:
`npx jest features/compras` (28), `npx jest features/ciclos` (25) y `npx jest features/ventas`
(30), todos en verde. Al final se ejecutó `bash .rei/init.sh`, con V1–V4 en `[OK]` y código de
salida 0.

### V5 — qué revisar y cómo reproducir

Ruta protegida: iniciar sesión y abrir `/contratos/<id>` de un contrato con datos.

1. Encabezado: enlace "Volver a Contratos", título, código truncado, badges de reparto y
   estado, subtítulo y acción "Editar contrato".
2. Ficha técnica `glass-panel`: socio, finca/predio, raza, apertura, cierre, valor base de
   referencia, inventario actual, biomasa promedio y barra de reparto; `—` en datos ausentes.
3. Pestañas: por defecto "Compras asociadas"; al cambiar, el contador de cada pestaña refleja
   el total real y las secciones conservan su estado (no recargan al alternar).
4. Compras: columnas, totales al pie y CRUD.
5. Ciclos: columna de evolución, aviso del último delta, "Registrar ciclo" deshabilitado con
   contrato cerrado y su mensaje.
6. Costos: nota fiduciaria, tabla y CRUD.
7. Ventas: tarjeta de liquidación con distribución contractual, "Registrar venta" y modal.
8. Comprobar que el listado global `/ventas` conserva su apariencia clara (prop `tema` con
   `"claro"` por defecto).
9. Responsive y navegación por teclado en la barra de pestañas.

## Observaciones

- La evolución de ciclos se calcula sobre la página cargada (`LIMITE_POR_DEFECTO` = 20) porque
  el alcance no permite nuevas consultas; queda documentado en el JSDoc de `evolucion.ts`.
- No se inventaron datos: la ficha y las pestañas usan solo campos de los DTOs reales y los
  nombres resueltos por `app/`.
- No se añadieron dependencias ni se modificaron componentes de `shared/ui`.
