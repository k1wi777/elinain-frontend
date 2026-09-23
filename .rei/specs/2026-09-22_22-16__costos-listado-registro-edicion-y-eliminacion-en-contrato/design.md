# Diseño — Costos embebidos en el detalle del contrato

> Work Item: `2026-09-22_22-16__costos-listado-registro-edicion-y-eliminacion-en-contrato` (`type: feature`)

## Estrategia

Se replica el patrón ya implementado en `features/ciclos` (y `features/compras`): feature
autocontenido con `types.ts`, `schemas.ts`, `mensajes-error.ts`, `query-keys.ts`, `api/`,
`hooks/` y `components/`; BFF propio con la cookie httpOnly; sección embebida compuesta en
`app/` junto a compras, ciclos y ventas. Costos añade `tipo` libre con sugerencias y `monto`
como moneda, pero no cambia el patrón.

No se añaden dependencias ni se actualiza el OpenAPI local: los DTOs de costos ya existen.

## Archivos

### Nuevos

| Archivo | Contenido |
|---------|-----------|
| `features/costos/types.ts` | Alias de `CostoRespuestaDto`, `PaginaCostosDto`, `CrearCostoDto`, `ActualizarCostoDto` y tipo propio `FiltrosCostos` (`limite`, `offset`, `contrato_id`). |
| `features/costos/schemas.ts` | `esquemaCosto` (cuatro campos requeridos) y `DatosFormularioCosto`. |
| `features/costos/mensajes-error.ts` | Mensajes de listar, crear, editar y eliminar. |
| `features/costos/query-keys.ts` | `clavesCostos` (`['costos']`, `['costos','list']`, `['costos','list',filtros]`). |
| `features/costos/api/costos.ts` | `listarCostos`, `crearCosto`, `actualizarCosto`, `eliminarCosto` sobre `createBffClient`. |
| `features/costos/hooks/useCostos.ts` | Consulta paginada con `keepPreviousData`. |
| `features/costos/hooks/useCrearCosto.ts` | Mutación de registro; invalida `clavesCostos.listas()`. |
| `features/costos/hooks/useActualizarCosto.ts` | Mutación de edición; invalida `clavesCostos.listas()`. |
| `features/costos/hooks/useEliminarCosto.ts` | Mutación de borrado; invalida `clavesCostos.listas()`. |
| `features/costos/components/CostosSeccion.tsx` | Sección: aviso informativo, listado paginado, botón deshabilitado con contrato cerrado, modales y Toast. |
| `features/costos/components/CostoForm.tsx` | Formulario reusable (crear/editar) con los cuatro campos, `datalist` de `tipo` y aviso informativo. |
| `features/costos/components/CostoFormModal.tsx` | `Modal` con `CostoForm`. |
| `features/costos/components/EliminarCostoModal.tsx` | Confirmación de borrado en `Modal`. |
| `features/costos/__tests__/schemas.test.ts` | Tests puros de `esquemaCosto`. |
| `features/costos/__tests__/mensajes-error.test.ts` | Tests puros de los mensajes. |
| `features/costos/__tests__/query-keys.test.ts` | Tests puros de las claves. |
| `app/api/costos/route.ts` | BFF: `GET` listar (con `contrato_id`) y `POST` crear. |
| `app/api/costos/[id]/route.ts` | BFF: `GET`, `PATCH` y `DELETE`. |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `features/costos/index.ts` | Pasa a exportar `CostosSeccion`. |
| `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx` | Compone `CostosSeccion` con `contratoId`, `contratoEstado` y `onCambio`. |
| `features/contratos/components/ContratoDetalle.tsx` | Retira la sección "Próximamente: ciclos y costos" y su mención en el JSDoc. |
| `app/(dashboard)/layout.tsx` | Retira el enlace "Costos". |
| `middleware.ts` | Retira `"/costos"` de `RUTAS_PROTEGIDAS` y del `matcher`. |
| `shared/ui/index.ts` | Retira el export de `Proximamente`. |

### Eliminados

| Archivo | Motivo |
|---------|--------|
| `features/costos/components/CostosProximamente.tsx` | Sustituido por la sección real. |
| `app/(dashboard)/costos/page.tsx` | La ruta global `/costos` sale del alcance. |
| `shared/ui/Proximamente.tsx` | Queda sin consumidores al retirar el último placeholder. |

## Decisiones de diseño

1. **Sobres de respuesta.** El backend envuelve las respuestas exitosas en `{ exito, datos }`, pero `shared/api/response.ts` (`desenvolverRespuesta`) ya los desenvuelve en el cliente HTTP. Por eso el feature tipa `Costo = CostoRespuestaDto` y `PaginaCostos = PaginaCostosDto`, y el BFF usa esos mismos DTOs sin desenvolver manualmente. No hay que tratar `RespuestaCostoDto`/`RespuestaPaginaCostosDto` en el código.

2. **Fecha solo-día.** Se reutilizan `fechaDiaAIso` (al enviar), `isoAFechaDia` (al precargar la edición) y `formatearFechaDia` (al mostrar), igual que en ciclos.

3. **`tipo` con sugerencias sin restringir.** El `Input` de `shared/ui` reenvía los atributos nativos, así que se usa `list="tipos-costo"` y un `<datalist id="tipos-costo">` con opciones de ayuda (flete, alimentación, medicina, veterinaria). El valor sigue siendo texto libre.

4. **`monto` como moneda.** El formulario usa un control numérico (`type="number"`, conversión con `setValueAs` a número) y el listado presenta el valor con `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })` declarado como constante local del feature, igual que `FORMATO_NUMERO` en compras y ciclos. Alternativas descartadas: reutilizar `formatearMoneda` de `features/ventas` (prohibido por el aislamiento entre features) y mover el formateador a `shared/lib` (refactor fuera del alcance que tocaría ventas y sus tests).

5. **Mensajes de error por operación.** Se definen `mensajeErrorListarCostos`, `mensajeErrorCrearCosto`, `mensajeErrorEditarCosto` y `mensajeErrorEliminarCosto`. Crear y editar se separan para que el `404` sea preciso (`El contrato no existe.` al crear; `El costo no existe.` al editar). Alternativa descartada: una sola función de guardado como en ciclos, que mezclaría ambos casos y contradiría la exigencia de mensajes claros.

6. **Estado del contrato como prop.** `CostosSeccion` recibe `contratoId`, `contratoEstado?` y `onCambio?`, igual que `CiclosSeccion`. `contratoEstado === 'cerrado'` deshabilita únicamente "Agregar costo"; editar y eliminar siguen habilitados.

7. **Invalidación.** Los hooks invalidan el listado de costos y la sección invoca `onCambio`, que en `app/` invalida `clavesContratos.todas` para refrescar los datos derivados del contrato (mismo mecanismo que compras, ciclos y ventas).

8. **BFF `GET /api/costos/{id}`.** Se implementa por paridad con `ciclos`, aunque la sección no lo consuma (la edición usa la fila ya cargada).

9. **Validación defensiva en el BFF.** La creación exige `contrato_id`, `tipo`, `monto > 0`, `fecha` y `descripcion`; la actualización acepta solo `tipo`, `monto`, `fecha` y `descripcion` (descarta `contrato_id`, que es inmutable) y exige al menos un campo.

10. **Limpieza de `Proximamente`.** Al eliminar `CostosProximamente`, `shared/ui/Proximamente.tsx` queda sin consumidores; se elimina junto con su export del barrel para no dejar código muerto, conforme a las convenciones. Alternativa descartada: conservarlo para futuros placeholders (no hay módulos pendientes previstos).

## Restricciones

- Aislamiento entre features: `features/costos` no importa de `features/contratos` ni de otros features; la composición ocurre en `app/`. `shared/` no importa de `features/`.
- Componentes server por defecto; `'use client'` en los nodos interactivos (sección, formularios, modales, hooks).
- Sin `any`, sin `fetch` en componentes, sin `useEffect` para obtener datos.
- Sin dependencias nuevas.
- Tests solo de lógica pura (`schemas`, `mensajes-error`, `query-keys`); el comportamiento de render se valida en `V5`.

## Verificación

- Checkpoints `V1`–`V4` según `.rei/docs/project/verification.md`.
- `V5` (manual): listar/registrar/editar/eliminar costos en un contrato activo y cerrado, comprobar el aviso informativo y los mensajes de error.
