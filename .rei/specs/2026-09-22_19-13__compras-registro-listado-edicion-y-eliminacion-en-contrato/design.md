# Diseño — Compras en el detalle de contrato

## Estrategia

Un único feature `features/compras` autocontenido que cubre listado, registro, edición y
eliminación, compuesto desde `app/` dentro del detalle de contrato (no hay ruta global
`/compras`). El listado es paginado en el servidor y filtrado por `contrato_id`, la fecha se
captura con `datetime-local` y se convierte a ISO 8601 con la utilidad de fechas, y el `409`
del backend se traduce a un mensaje específico que mantiene abierto el diálogo.

Toda operación pasa por Route Handlers BFF (`app/api/compras/*`), siguiendo el patrón de
`app/api/contratos/*`: `createServerClient()`, validación defensiva del cuerpo y
`respuestaError(status, mensajes)` propagando el código real (red → `502`).

## Componentes y archivos

### Utilidad de fechas (refactor)

- Mover `features/contratos/fechas.ts` → `shared/lib/fechas.ts` y
  `features/contratos/__tests__/fechas.test.ts` → `shared/lib/__tests__/fechas.test.ts`.
- Actualizar imports a `@/shared/lib/fechas` en `features/contratos/schemas.ts` y en
  `components/ContratoForm.tsx`, `ContratoDetalle.tsx`, `ContratosListado.tsx`,
  `ContratoCrear.tsx` y `ContratoEditar.tsx`.
- Justificación: aparece un segundo consumidor real (`compras`) y la convención prohíbe
  duplicar lógica de negocio; si algo se usa en dos features se resuelve en `shared/` (es
  genérico: no conoce dominio). Comportamiento intacto.
- Nota: se conserva el nombre `fechas.ts` por decisión acordada con el usuario.

### BFF

- **`app/api/compras/route.ts`**
  - `GET`: lee `limite`, `offset` y `contrato_id`; normaliza `limite` con
    `normalizarLimite`/`LIMITE_POR_DEFECTO` y `offset` a `≥ 0`; solo incluye `contrato_id`
    cuando viene no vacío. Devuelve `200` con `PaginaComprasDto`.
  - `POST`: valida de forma defensiva `CrearCompraDto` (`contrato_id` string no vacío,
    `fecha` string no vacía, `cantidad` entero `> 0`, `peso_promedio > 0`, `precio_kilo > 0`,
    `nota` string no vacía) y responde `201` con `CompraRespuestaDto`. `400` si el cuerpo no
    cumple.
  - Mensajes: `400: "Revisa los datos de la compra."`, `404: "La compra no existe."`.
- **`app/api/compras/[id]/route.ts`** (firma Next 16 `params: Promise<{ id: string }>`)
  - `GET`: `200` con la compra; propaga `404`.
  - `PATCH`: transporta solo campos mutables (`fecha`, `cantidad`, `peso_promedio`,
    `precio_kilo`, `nota`), descarta `contrato_id` y exige al menos uno; `200` con la compra
    actualizada. Mensaje `409: "No se puede modificar la compra: el contrato ya tiene ventas
    registradas."`.
  - `DELETE`: responde **`200`** (no `204`) tras confirmar el backend. Mensaje
    `409: "No se puede eliminar la compra: el contrato ya tiene ventas registradas."`.

### Feature `features/compras/`

- `types.ts`: aliases del OpenAPI (`Compra = CompraRespuestaDto`,
  `PaginaCompras = PaginaComprasDto`, `CrearCompra = CrearCompraDto`,
  `ActualizarCompra = ActualizarCompraDto`) y `FiltrosCompras = { limite; offset;
  contrato_id }`.
- `api/compras.ts`: `listarCompras(filtros)` (`GET /api/compras`), `crearCompra(datos)`
  (`POST`), `actualizarCompra(id, datos)` (`PATCH`), `eliminarCompra(id)` (`DELETE`). Usa
  `createBffClient`. No se añade `obtenerCompra`: la fila del listado ya contiene todos los
  datos de la compra y la edición no requiere una petición extra, por lo que exponerla sería
  código muerto (el `GET` del BFF se implementa igual para paridad con el contrato del
  backend).
- `query-keys.ts`: `clavesCompras` con `todas: ['compras']`, `listas: () =>
  ['compras','list']`, `lista: (filtros) => ['compras','list', filtros]`.
- `hooks/`: `useCompras(filtros)`, `useCrearCompra()`, `useActualizarCompra()`,
  `useEliminarCompra()`. Las mutaciones invalidan `clavesCompras.listas()` para refrescar el
  listado sin recargar (R10, R13, R18).
- `schemas.ts`: `esquemaCompra` único para crear y editar con los cinco campos; `fecha` con
  `refine` sobre `fechaLocalAIso`, `cantidad` entero positivo (`z.number().int().positive()`),
  `peso_promedio` y `precio_kilo` positivos, `nota` no vacía. Mensajes en español.
- `mensajes-error.ts`: `mensajeErrorListarCompras`, `mensajeErrorGuardarCompra` (incluye el
  `409` de edición y el `0` de conexión) y `mensajeErrorEliminarCompra` (incluye el `409` de
  eliminación y el `0` de conexión).
- `components/`:
  - `CompraForm.tsx`: formulario reusable de los cinco campos con react-hook-form + zod.
    `fecha` con `datetime-local`; en edición precarga con `isoAFechaLocal` y el contrato no
    se renderiza como campo editable.
  - `CompraFormModal.tsx`: `Modal` + `CompraForm` para crear y editar; recibe `enviando` y
    `mensajeError` y no se cierra si la mutación falla.
  - `EliminarCompraModal.tsx`: confirmación de borrado siguiendo `EliminarFincaModal`.
  - `ComprasSeccion.tsx`: orquestador. Recibe `contratoId`; pagina con `usePagination` y
    `TOTAL_PROVISIONAL` (mismo patrón que `FincasTable`); renderiza la tabla de columnas
    fecha, cantidad, peso promedio, precio/kilo, valor total, nota y acciones; gestiona los
    modales, `Toast` y el estado de fila a editar/eliminar.
- `index.ts`: expone únicamente `ComprasSeccion`.

### Composición en `app/`

- `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`: importar
  `ComprasSeccion` de `@/features/compras` y renderizarla junto a `ContratoDetalle`
  (`<ComprasSeccion contratoId={id} />`), sin que `features/compras` importe de
  `features/contratos` ni al revés.
- `features/contratos/components/ContratoDetalle.tsx`: cambiar el placeholder a
  "Próximamente: ventas, ciclos y costos." (retirar "compras").

## Decisiones

- **Listado paginado en el servidor**: el backend admite `contrato_id` + `limite`/`offset`;
  se usa `usePagination` con el total real (patrón de `FincasTable`) en lugar de filtrar en
  cliente como hace `ContratosListado`.
- **Fecha**: `datetime-local` → `fechaLocalAIso` al enviar; `isoAFechaLocal` al precargar;
  `formatearFechaHora` al mostrar (R21).
- **Formato de valores**: `valor_total` se muestra tal como lo devuelve el backend (no se
  recalcula en el cliente); `cantidad` y `peso_promedio` con su unidad.
- **409 explícito**: el formulario y el modal de eliminación traducen `ApiError.status ===
  409` a un mensaje específico y solo se cierran tras éxito (R15, R16, R19, R20).
- **Editar/eliminar siempre visibles**: no se consulta si el contrato tiene ventas; el
  backend es la autoridad y responde `409` (R14).

## Alternativas descartadas

- **Ruta global `/compras` o feature separado por operación**: descartado por decisión del
  usuario (gestión embebida y un único feature).
- **Duplicar la utilidad de fechas en `features/compras`**: descartado por la regla de no
  duplicar lógica; el segundo consumidor real justifica moverla a `shared/lib`.
- **Chequeo previo de ventas del contrato en la UI**: descartado por decisión del usuario; el
  `409` se maneja de forma reactiva.
- **Filtrar y paginar en el cliente** (como contratos): descartado porque el backend ya
  ofrece filtro por contrato y paginación, que es la fuente de verdad del total.

## Pruebas (lógica pura)

- `shared/lib/__tests__/fechas.test.ts` (movido, mismo contenido).
- `features/compras/__tests__/schemas.test.ts`, `mensajes-error.test.ts` y
  `query-keys.test.ts`.
- Sin tests de render (no hay React Testing Library): el comportamiento se valida en `V5`.

## Restricciones

- `shared/` no importa de `features/`; `features/compras` no importa de `features/contratos`.
- Los DTOs se derivan del OpenAPI; no se redefinen a mano.
- No se añaden dependencias nuevas.
