# Tareas — Compras en el detalle de contrato

- [x] **T1 — Mover la utilidad de fechas a `shared/lib`** (R21)
  - Mover `features/contratos/fechas.ts` → `shared/lib/fechas.ts` y
    `features/contratos/__tests__/fechas.test.ts` →
    `shared/lib/__tests__/fechas.test.ts` (actualizar el import del test a
    `@/shared/lib/fechas`).
  - Actualizar a `@/shared/lib/fechas` los imports de
    `features/contratos/schemas.ts` y de los componentes `ContratoForm`,
    `ContratoDetalle`, `ContratosListado`, `ContratoCrear` y `ContratoEditar`.
  - Verificar que no queden referencias a `features/contratos/fechas`.

- [x] **T2 — BFF de compras: `app/api/compras/route.ts`** (R1, R6, R7)
  - `GET` con `limite`/`offset`/`contrato_id` (normalizados) → `200 PaginaComprasDto`.
  - `POST` con validación defensiva de `CrearCompraDto` → `201 CompraRespuestaDto`.
  - Mensajes `400`/`404` y propagación del código real vía `respuestaError`.

- [x] **T3 — BFF de compras: `app/api/compras/[id]/route.ts`** (R11, R12, R15, R19)
  - Firma Next 16 `params: Promise<{ id: string }>`.
  - `GET` → `200`; `PATCH` solo mutables (descarta `contrato_id`, exige al menos uno) →
    `200`; `DELETE` → **`200`**.
  - Mensajes de `404` y `409` específicos para modificar y eliminar.

- [x] **T4 — Base del feature `compras`** (R1, R6, R10, R13, R18)
  - `types.ts` con los aliases del OpenAPI y `FiltrosCompras`.
  - `api/compras.ts` con `listarCompras`, `crearCompra`, `actualizarCompra` y
    `eliminarCompra` sobre `createBffClient`.
  - `query-keys.ts` (`clavesCompras`) y hooks `useCompras`, `useCrearCompra`,
    `useActualizarCompra`, `useEliminarCompra`, invalidando `clavesCompras.listas()`.

- [x] **T5 — Validación y mensajes del feature** (R5, R7, R8, R9, R15, R19, R20, R21)
  - `schemas.ts` con `esquemaCompra` (fecha ISO, cantidad entera `> 0`, peso y precio `> 0`,
    nota requerida) usando `fechaLocalAIso`.
  - `mensajes-error.ts` con listar/guardar/eliminar, incluidos los `409` de edición y
    eliminación.
  - Tests puros: `schemas.test.ts`, `mensajes-error.test.ts` y `query-keys.test.ts`.

- [x] **T6 — Componentes del feature** (R2, R3, R4, R10, R11, R14, R16, R17, R21)
  - `CompraForm.tsx` (cinco campos, `datetime-local`, contrato no editable).
  - `CompraFormModal.tsx` (Modal + formulario; no se cierra si falla).
  - `EliminarCompraModal.tsx` (confirmación previa).
  - `ComprasSeccion.tsx` (tabla paginada, acciones editar/eliminar, modales, `Toast`).

- [x] **T7 — Barrel del feature** (R1)
  - `index.ts` exporta solo `ComprasSeccion`.

- [x] **T8 — Composición en `app/` y placeholder** (R1)
  - `detalle-con-relaciones.tsx` renderiza `<ComprasSeccion contratoId={id} />`.
  - `ContratoDetalle.tsx`: placeholder → "Próximamente: ventas, ciclos y costos.".

- [x] **T9 — Verificación**
  - `V1` `npm run format:check`, `V2` `npm run lint`, `V3` `npm run typecheck`,
    `V4` `npm test`.
  - Documentar `V5` (validación manual) con los pasos de reproducción.
