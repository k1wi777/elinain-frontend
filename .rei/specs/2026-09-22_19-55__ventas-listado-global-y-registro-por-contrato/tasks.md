# Tareas — Ventas: listado global y por contrato, registro y desglose

- [x] **T1 — BFF de ventas: `app/api/ventas/route.ts`** (R1, R2, R3, R7, R14)
  - `GET` con `limite`/`offset`/`contrato_id` (normalizados; `contrato_id` solo si no está
    vacío) → `200 PaginaVentasDto`.
  - `POST` con validación defensiva de `CrearVentaDto` → `201 VentaRespuestaDto`.
  - Mensajes `400`/`404` y propagación del código real vía `respuestaError`.

- [x] **T2 — BFF de ventas: `app/api/ventas/[id]/route.ts`** (R25, R28)
  - Firma Next 16 `params: Promise<{ id: string }>`.
  - Solo `GET` → `200`; propaga `400`/`404`. No exportar `PATCH`/`PUT`/`DELETE` (los
    bloquea el backend con `405`; no se maneja).

- [x] **T3 — Base del feature `ventas`** (R1, R2, R3, R7, R23)
  - `types.ts` con aliases del OpenAPI, `FiltrosVentas` y `ContratoVenta`.
  - `api/ventas.ts` con `listarVentas` y `crearVenta` sobre `createBffClient`.
  - `query-keys.ts` (`clavesVentas`) y hooks `useVentas`/`useCrearVenta`, invalidando
    `clavesVentas.listas()`.

- [x] **T4 — Validación, mensajes y formatos** (R6, R12, R14, R16, R17, R18, R19, R20, R27)
  - `schemas.ts` con `esquemaVenta` (`contrato_id` requerido, fecha ISO, cantidad entera
    `> 0`, peso y precio `> 0`) usando `fechaLocalAIso`.
  - `mensajes-error.ts` con listar/guardar (`400`, `404`, `0`, genérico).
  - `formatos.ts` con `formatearMoneda`, `formatearNumero` y `formatearPorcentaje`.
  - Tests puros: `schemas.test.ts`, `mensajes-error.test.ts`, `query-keys.test.ts` y
    `formatos.test.ts`.

- [x] **T5 — Presentacionales del feature** (R4, R5, R6, R9, R10, R11, R12, R13, R26)
  - `VentaCard.tsx`: tarjeta con la jerarquía de cifras principales y los datos secundarios.
  - `VentasLista.tsx`: estados de carga/vacío/error, lista de tarjetas y paginación.

- [x] **T6 — Formulario y modales** (R14, R15, R16, R20, R21, R22)
  - `VentaForm.tsx` (cinco campos; contrato fijo en modo embebido o selector en modo global).
  - `VentaFormModal.tsx` (Modal + formulario; no se cierra si falla).
  - `ResultadoVentaModal.tsx` (desglose completo del `VentaRespuestaDto`).

- [x] **T7 — Contenedores del feature** (R1, R2, R3, R8, R15, R16, R21, R23, R24)
  - `VentasSeccion.tsx` (embebido: `contratoId` + `onCambio`).
  - `VentasListado.tsx` (global: `contratos` + `onCambio`, filtro con reinicio de paginación).
  - Ambos cierran el formulario y abren el resultado al guardar.

- [x] **T8 — Cambios en `shared/ui` y barrel de `contratos`** (R9, R29)
  - Exportar `TablePagination` desde `shared/ui/index.ts` y actualizar su JSDoc.
  - Exportar `useContratos` y el tipo `Contrato` desde `features/contratos/index.ts`.

- [x] **T9 — Barrel del feature y retiro del placeholder** (R1, R2, R25)
  - `features/ventas/index.ts` exporta `VentasSeccion`, `VentasListado` y `ContratoVenta`.
  - Eliminar `features/ventas/components/VentasProximamente.tsx` y su export.

- [x] **T10 — Composición en `app/`** (R1, R2, R24, R29)
  - `detalle-con-relaciones.tsx`: añadir `<VentasSeccion contratoId={id} onCambio={...} />`.
  - `app/(dashboard)/ventas/page.tsx`: reemplazar el placeholder por el listado real.
  - `app/(dashboard)/ventas/_components/listado-con-contratos.tsx`: `useContratos` +
    proyección `ContratoVenta` + `<VentasListado />` con invalidación de contratos.
  - `ContratoDetalle.tsx`: placeholder → "Próximamente: ciclos y costos.".

- [x] **T11 — Verificación**
  - `V1` `npm run format:check`, `V2` `npm run lint`, `V3` `npm run typecheck`,
    `V4` `npm test`.
  - Documentar `V5` (validación manual) con los pasos de reproducción de ambas superficies,
    el registro, el modal de resultado, el refresco y la ausencia de acciones de
    edición/eliminación.
