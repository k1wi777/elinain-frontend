# Implementación — Ventas: listado global y por contrato, registro y desglose

Work Item: `2026-09-22_19-55__ventas-listado-global-y-registro-por-contrato`
Tipo: `feature` · Estado final: `review`

## Resumen

Se implementó la gestión de ventas de solo lectura sobre la infraestructura existente:
BFF de ventas, feature `features/ventas` autocontenido (tipos, api, hooks, validación,
formatos y componentes), dos superficies compuestas desde `app/` (sección embebida en el
detalle del contrato y listado global en `/ventas`) y las exportaciones necesarias en
`shared/ui` y `features/contratos`. No se implementó edición ni eliminación: las ventas son
inmutables y el BFF de detalle solo expone `GET`.

## Archivos creados

| Archivo | Contenido |
|---------|-----------|
| `app/api/ventas/route.ts` | BFF `GET` (paginado, `contrato_id` opcional) y `POST` defensivo. |
| `app/api/ventas/[id]/route.ts` | BFF solo `GET` de una venta (`params: Promise<{ id: string }>`). |
| `features/ventas/types.ts` | Aliases del OpenAPI, `FiltrosVentas` y `ContratoVenta`. |
| `features/ventas/api/ventas.ts` | `listarVentas` y `crearVenta` sobre `createBffClient`. |
| `features/ventas/query-keys.ts` | `clavesVentas` (`todas`, `listas`, `lista`). |
| `features/ventas/hooks/useVentas.ts` | Consulta paginada con `keepPreviousData`. |
| `features/ventas/hooks/useCrearVenta.ts` | Mutación que invalida `clavesVentas.listas()`. |
| `features/ventas/schemas.ts` | `esquemaVenta` y `DatosFormularioVenta`. |
| `features/ventas/mensajes-error.ts` | `mensajeErrorListarVentas` y `mensajeErrorGuardarVenta`. |
| `features/ventas/formatos.ts` | `formatearMoneda`, `formatearNumero`, `formatearPorcentaje`. |
| `features/ventas/components/VentaCard.tsx` | Tarjeta de solo lectura con jerarquía de cifras. |
| `features/ventas/components/VentasLista.tsx` | Lista con estados de carga/vacío/error y paginación. |
| `features/ventas/components/VentaForm.tsx` | Formulario de cinco campos (contrato fijo o selector). |
| `features/ventas/components/VentaFormModal.tsx` | Modal de registro; no se cierra si falla. |
| `features/ventas/components/ResultadoVentaModal.tsx` | Modal "Resultado de la venta" con el desglose. |
| `features/ventas/components/VentasSeccion.tsx` | Contenedor embebido (`contratoId`, `onCambio`). |
| `features/ventas/components/VentasListado.tsx` | Contenedor global (`contratos`, `onCambio`). |
| `features/ventas/__tests__/schemas.test.ts` | Validaciones del esquema. |
| `features/ventas/__tests__/mensajes-error.test.ts` | Mapeo de códigos a mensajes. |
| `features/ventas/__tests__/query-keys.test.ts` | Claves con y sin `contrato_id`. |
| `features/ventas/__tests__/formatos.test.ts` | Moneda, número y porcentaje. |
| `app/(dashboard)/ventas/_components/listado-con-contratos.tsx` | Composición con `useContratos` y proyección. |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `shared/ui/index.ts` | Exporta `TablePagination` y actualiza el comentario del barrel. |
| `shared/ui/TablePagination.tsx` | JSDoc deja de declararlo interno. |
| `features/contratos/index.ts` | Exporta `useContratos` y el tipo `Contrato`. |
| `features/contratos/components/ContratoDetalle.tsx` | Placeholder → "Próximamente: ciclos y costos.". |
| `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx` | Añade `<VentasSeccion />` con invalidación de contratos. |
| `app/(dashboard)/ventas/page.tsx` | Reemplaza el placeholder por el listado real. |
| `features/ventas/index.ts` | Barrel: `VentasSeccion`, `VentasListado`, `ContratoVenta`. |

## Archivos eliminados

| Archivo | Motivo |
|---------|--------|
| `features/ventas/components/VentasProximamente.tsx` | Ya no se usa; el módulo está implementado. `shared/ui/Proximamente` se conserva para `ciclos` y `costos`. |

## Decisiones y observaciones

- **Sin edición/eliminación**: la UI no ofrece acciones y el BFF de detalle solo exporta
  `GET`; no se maneja `405`/`403`, tal como define el diseño.
- **BFF defensivo**: `POST` valida tipos y rangos antes de llamar al backend; los mensajes
  `400`/`404` son los del diseño (`"Revisa los datos de la venta."`, `"El contrato no
  existe."`) y el `GET [id]` usa `404: "La venta no existe."`. Un fallo de red se traduce a
  `502` mediante `respuestaError`.
- **Formulario embebido sin selector**: el contrato viaja por `defaultValues` y la validación
  de "contrato requerido" vive solo en `esquemaVenta`, sin duplicarse en los contenedores.
- **Reinicio del formulario**: `VentaFormModal` solo monta `VentaForm` mientras el diálogo
  está abierto, de modo que cada apertura parte vacía y un error conserva los datos.
- **Filtro global**: al cambiar el contrato se llama `usePagination().reiniciar()` (R8); sin
  contrato, `FiltrosVentas` omite `contrato_id` y el BFF lista todas las ventas.
- **`features/compras/components/ComprasSeccion.tsx`** aparece modificado en el árbol de
  trabajo respecto a HEAD, pero **no fue tocado por este Work Item**: ya tenía el `onCambio`
  antes de iniciar la implementación. Se conserva tal cual.

## Verificación

Comando base: `npx next typegen` (se añadieron rutas BFF) → `Types generated successfully`.

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — "All matched files use Prettier code style!". |
| `V2` | `npm run lint` | Pasa — ESLint sin errores. |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Pasa — 31 suites, 274 tests. Incluye las 4 suites nuevas de `features/ventas`. |
| — | `bash .rei/init.sh` | Código de salida `0` (V1–V4 en verde). |

### V5 — Validación manual (pendiente de usuario)

Pasos de reproducción en `npm run dev` con sesión activa:

1. **Sección embebida** (R1, R9–R13): abrir `/contratos/{id}`; en "Ventas" debe verse la
   lista paginada de las ventas de ese contrato con las seis cifras destacadas y la fila
   secundaria (fecha, cantidad, peso, precio/kilo). Probar "Anterior"/"Siguiente".
2. **Registro embebido** (R14, R15, R20, R21, R22): pulsar "Registrar venta"; no debe
   aparecer selector de contrato. Enviar con datos inválidos (cantidad 0, peso o precio ≤ 0,
   fecha vacía) y comprobar los mensajes. Con datos válidos, el modal "Resultado de la venta"
   debe mostrar el desglose completo; al cerrarlo, el listado se refresca sin recargar y el
   detalle del contrato refleja los agregados (R23, R24).
3. **Listado global** (R2, R3, R8): abrir `/ventas`; filtrar por contrato y comprobar que el
   listado cambia y vuelve a la página 1; con "Todos los contratos" debe mostrar todas.
4. **Registro global** (R16): pulsar "Registrar venta", elegir contrato (obligatorio) y
   comprobar el modal de resultado.
5. **Inmutabilidad** (R25, R26): confirmar que ninguna tarjeta ofrece botones de editar ni
   eliminar.
6. **Errores** (R6): simular fallo de red/backend y comprobar el mensaje en español sin
   detalle técnico.
