# Diseño — Ventas: listado global y por contrato, registro y desglose

## Estrategia

Un único feature `features/ventas` autocontenido que cubre el listado (tarjetas + paginación
servidor), el registro y el modal de resultado. Se expone en dos superficies compuestas desde
`app/`:

1. **Embebida** en el detalle del contrato (`VentasSeccion`), con el contrato fijo y sin
   selector.
2. **Global** en `/ventas` (`VentasListado`), con un selector de contrato opcional.

El backend ya ofrece `contrato_id` + `limite`/`offset` en `GET /ventas`, por lo que el
listado se pagina y filtra en el servidor con `usePagination`, igual que `ComprasSeccion` y a
diferencia del filtrado en cliente de `ContratosListado`. Las ventas son inmutables
(`PATCH`/`PUT`/`DELETE` → `405`), así que no se implementan acciones de edición ni
eliminación ni manejo del `405`.

Toda operación pasa por Route Handlers BFF (`app/api/ventas/*`) siguiendo el patrón de
`app/api/compras/*`: `createServerClient()`, validación defensiva del cuerpo y
`respuestaError(status, mensajes)` propagando el código real (red → `502`).

## BFF

- **`app/api/ventas/route.ts`**
  - `GET`: lee `limite`, `offset` y `contrato_id`; normaliza `limite` con
    `normalizarLimite`/`LIMITE_POR_DEFECTO` y `offset` a `≥ 0`; incluye `contrato_id` solo
    cuando llega no vacío. Devuelve `200` con `PaginaVentasDto`; propaga `401`/`500`.
  - `POST`: valida de forma defensiva `CrearVentaDto` (`contrato_id` string no vacío, `fecha`
    string no vacía, `cantidad_vendida` entero `> 0`, `peso_promedio_venta > 0`,
    `precio_kilo_venta > 0`) y responde `201` con `VentaRespuestaDto`. `400` si el cuerpo no
    cumple. Mensajes: `400: "Revisa los datos de la venta."`, `404: "El contrato no existe."`.
- **`app/api/ventas/[id]/route.ts`** (firma Next 16 `params: Promise<{ id: string }>`)
  - Solo `GET` → `200` con la venta; propaga `400`/`404`. Mensajes:
    `400: "Revisa los datos de la venta."`, `404: "La venta no existe."`.
  - No se exportan `PATCH`, `PUT` ni `DELETE`: las ventas son inmutables y Next responde
    `405` de forma automática; no se implementa manejo explícito de ese código.

## Feature `features/ventas/`

- `types.ts`: aliases del OpenAPI (`Venta = VentaRespuestaDto`,
  `PaginaVentas = PaginaVentasDto`, `CrearVenta = CrearVentaDto`), el tipo propio
  `FiltrosVentas = { limite; offset; contrato_id?: string }` y la proyección
  `ContratoVenta = { id; etiqueta }` que `app/` construye para el selector (el feature no
  importa de `features/contratos`).
- `api/ventas.ts`: `listarVentas(filtros)` (`GET /api/ventas`) y `crearVenta(datos)`
  (`POST /api/ventas`) sobre `createBffClient`. No se expone `obtenerVenta`: la venta creada
  y las tarjetas ya contienen todos los campos; el `GET` del BFF se implementa por paridad
  con el contrato del backend.
- `query-keys.ts`: `clavesVentas` con `todas: ['ventas']`, `listas: () => ['ventas','list']`
  y `lista: (filtros) => ['ventas','list', filtros]`.
- `hooks/`: `useVentas(filtros)` (`keepPreviousData`) y `useCrearVenta()`, que invalida
  `clavesVentas.listas()` para refrescar el listado sin recargar.
- `schemas.ts`: `esquemaVenta` con `contrato_id` requerido, `fecha` validada con `refine`
  sobre `fechaLocalAIso`, `cantidad_vendida` entero positivo, `peso_promedio_venta` y
  `precio_kilo_venta` positivos. Mensajes en español; tipo `DatosFormularioVenta`.
- `formatos.ts` (utilidad pura, testeable): `formatearMoneda` (`Intl.NumberFormat('es-CO')`
  con moneda COP y sin decimales), `formatearNumero` (kilos, hasta 1 decimal) y
  `formatearPorcentaje` (hasta 2 decimales + `%`).
- `mensajes-error.ts`: `mensajeErrorListarVentas` y `mensajeErrorGuardarVenta` (`400`,
  `404`, `0` de conexión, genérico).
- `components/`:
  - `VentaCard.tsx`: tarjeta de solo lectura con la jerarquía de cifras (R9–R13). Cifras
    principales en primer plano (`valor_bruto`, `utilidad_total`, `valor_comerciante`,
    `valor_tercero`, `porcentaje_utilidad_total`, `kilos_ganados_promedio`); fecha, cantidad,
    peso y precio por kilo en una fila secundaria discreta.
  - `VentasLista.tsx`: presentacional; recibe `ventas`, `cargando`, `mensajeError`,
    `mensajeVacio` y `paginacion`. Renderiza el error, el estado de carga, el estado vacío y
    una `VentaCard` por venta, con los controles de paginación.
  - `VentaForm.tsx`: formulario de los cinco campos con react-hook-form + zod. `fecha` con
    `datetime-local`; en modo embebido recibe `contratoFijo: string` y no renderiza el
    selector (el valor viaja por `defaultValues`); en modo global recibe
    `contratos: ContratoVenta[]` y renderiza un `Select` registrado como `contrato_id`.
  - `VentaFormModal.tsx`: `Modal` + `VentaForm`; no se cierra si la mutación falla.
  - `ResultadoVentaModal.tsx`: `Modal` "Resultado de la venta" con el desglose completo
    devuelto por el backend (R21, R22), agrupado en datos de la venta y desglose financiero.
  - `VentasSeccion.tsx`: contenedor embebido; recibe `contratoId` y `onCambio`. Orquesta
    consulta, paginación, formulario, resultado y `onCambio`.
  - `VentasListado.tsx`: contenedor global; recibe `contratos: ContratoVenta[]` y `onCambio`.
    Mantiene el filtro por contrato en estado local, reinicia la paginación al cambiarlo
    (R8) y permite registrar eligiendo contrato.
- `index.ts`: expone `VentasSeccion`, `VentasListado` y el tipo `ContratoVenta`.

## Cambios en otros módulos

- `shared/ui/index.ts`: exportar `TablePagination` (además del tipo `PaginacionTabla`) y
  actualizar el comentario del barrel y el JSDoc del componente, que hoy lo declaran interno.
  Justificación: el listado de tarjetas no usa `Table` y necesita los mismos controles de
  paginación; es el segundo consumidor real y evita duplicarlos.
- `features/contratos/index.ts`: exportar `useContratos` y el tipo `Contrato`, siguiendo el
  patrón ya usado con `useTodosLosTerceros`/`useTodasLasFincas`, para que `app/` construya el
  selector del listado global sin que `features/ventas` importe de `features/contratos`.

## Composición en `app/`

- `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`: añadir
  `<VentasSeccion contratoId={id} onCambio={...} />` junto a `ComprasSeccion`; el `onCambio`
  invalida `clavesContratos.todas` con `useQueryClient`. `features/ventas` no importa de
  `features/contratos` ni al revés.
- `app/(dashboard)/ventas/page.tsx`: deja de ser placeholder; Server Component delgado con
  `metadata` y el encabezado, que compone el nuevo cliente.
- `app/(dashboard)/ventas/_components/listado-con-contratos.tsx` (nuevo): `"use client"`;
  usa `useContratos()` para cargar los contratos, los proyecta a `ContratoVenta[]` con
  `etiqueta = "Contrato del <fecha de apertura> · <estado>"` (usando `formatearFechaHora` de
  `shared/lib/fechas`), maneja carga/error y renderiza `<VentasListado contratos={...}
  onCambio={...} />`; `onCambio` invalida `clavesContratos.todas`.
- `features/contratos/components/ContratoDetalle.tsx`: cambiar el placeholder a
  "Próximamente: ciclos y costos.".
- `features/ventas/components/VentasProximamente.tsx`: eliminar (ya no se usa) y quitar su
  export del barrel. `shared/ui/Proximamente` se conserva (lo usan `ciclos` y `costos`).

## Decisiones

- **Dos contenedores, presentacionales compartidos**: `VentasSeccion` y `VentasListado`
  reutilizan `VentasLista`, `VentaCard`, `VentaFormModal` y `ResultadoVentaModal`, en lugar de
  un único componente con props opacas por modo. El contrato fijo viaja como prop explícita
  `contratoFijo`.
- **Un solo esquema**: `esquemaVenta` exige `contrato_id`; en modo embebido el valor se
  precarga con `defaultValues`, de modo que la validación de "contrato requerido" (R16) se
  prueba sobre el esquema y no se duplica en el contenedor.
- **Modal de resultado como confirmación**: tras un registro exitoso se cierra el formulario
  y se abre `ResultadoVentaModal`; no se añade `Toast` de éxito porque el modal es la
  confirmación.
- **Refresco**: `useCrearVenta` invalida `clavesVentas.listas()` (R23) y el contenedor invoca
  `onCambio` para que `app/` invalide `clavesContratos.todas` (R24).
- **Paginación de tarjetas**: se reutiliza `TablePagination` en `VentasLista` con el total
  real recalculado en render (patrón `TOTAL_PROVISIONAL` de `ComprasSeccion`).
- **Formato de cifras** (R12): helper `formatos.ts` con `Intl.NumberFormat('es-CO')`:
  moneda COP sin decimales para valores monetarios, hasta 1 decimal para kilos y hasta 2 para
  porcentajes.
- **Filtro por contrato**: `Select` con opción "Todos los contratos"; al cambiar, se
  reinicia la paginación con `usePagination().reiniciar()` (R8).
- **Fechas** (R27): `datetime-local` → `fechaLocalAIso` al enviar; `formatearFechaHora` al
  mostrar.

## Alternativas descartadas

- **Un único componente con `contratoId` opcional y selector embebido**: descartado por props
  opacas y modos mezclados; dos contenedores delgados son más explícitos.
- **Tarjetas sin paginación o paginación manual propia**: descartado; se reutiliza
  `TablePagination` en lugar de duplicar botones.
- **Filtrar y paginar en cliente**: descartado porque el backend ya filtra por `contrato_id`
  y pagina; el total reportado es la fuente de verdad.
- **Manejar `405`/`403` de edición/eliminación**: descartado por decisión del usuario; la UI
  no ofrece esas acciones ni invoca el BFF para ellas.
- **Exponer `obtenerVenta` en `api/`**: descartado para no dejar código muerto; las tarjetas
  y la respuesta de creación ya contienen todos los campos.
- **Selector con nombres de tercero/finca**: descartado para no acoplar la página global a
  más consultas; la etiqueta usa fecha de apertura y estado, datos ya presentes en `Contrato`.

## Pruebas (lógica pura)

- `features/ventas/__tests__/schemas.test.ts` (validaciones y `contrato_id` requerido).
- `features/ventas/__tests__/mensajes-error.test.ts`.
- `features/ventas/__tests__/query-keys.test.ts` (con y sin `contrato_id`).
- `features/ventas/__tests__/formatos.test.ts` (moneda, kilos y porcentaje).
- Sin tests de render (no hay React Testing Library): el comportamiento se valida en `V5`.

## Restricciones

- `shared/` no importa de `features/`; `features/ventas` no importa de `features/contratos` ni
  al revés.
- Los DTOs se derivan del OpenAPI; no se redefinen a mano.
- No se añaden dependencias nuevas.
