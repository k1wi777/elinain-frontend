# Revisión — Ventas: listado global y por contrato, registro y desglose

Work Item: `2026-09-22_19-55__ventas-listado-global-y-registro-por-contrato`
Tipo: `feature` · Estado final: `done`

## Resultado

Aprobado. La implementación cubre los requisitos R1–R29 y completa las tareas T1–T11 sin
desviaciones materiales respecto a `requirements.md`, `design.md` y `tasks.md`. Se respetan
la arquitectura feature-first, las convenciones y los checkpoints `V1`–`V4`.

## Verificación de requisitos (R1–R29)

- **Listado (R1–R8):** `VentasSeccion` embebida en el detalle del contrato (R1) y
  `VentasListado` en `/ventas` (R2) con filtro por contrato y opción "Todos los contratos"
  (R3). `VentasLista` cubre carga (R4), vacío (R5, mensajes diferenciados) y error (R6,
  mensaje en español). Paginación con `limite`/`offset` y total del backend (R7). El filtro
  llama a `paginacion.reiniciar()` para volver a la página 1 (R8).
- **Tarjetas (R9–R13):** `VentaCard` por venta (R9) con las seis cifras destacadas —valor
  bruto, utilidad total, valor comerciante, valor tercero, % utilidad y kilos ganados— (R10),
  fila secundaria con fecha, cantidad, peso promedio y precio/kilo (R11), formato `es-CO`
  vía `formatos.ts` (R12) y jerarquía visual (`prominente` en valor bruto y utilidad total,
  fila secundaria discreta) (R13).
- **Registro (R14–R20):** `VentaForm` solicita los cinco campos (R14). Modo embebido con
  `contratoFijo` sin selector (R15); modo global con `Select` y `esquemaVenta` que exige
  `contrato_id` (R16). Validaciones zod de cantidad entera `> 0` (R17), peso/precio `> 0`
  (R18) y fecha con `fechaLocalAIso` (R19). El error mantiene abierto el formulario con los
  datos (R20): `VentaFormModal` solo se cierra en éxito y muestra `mensajeErrorGuardarVenta`.
- **Resultado (R21–R24):** `ResultadoVentaModal` "Resultado de la venta" (R21) con los diez
  campos del `VentaRespuestaDto` (R22). `useCrearVenta` invalida `clavesVentas.listas()`
  (R23) y los contenedores invocan `onCambio`, que en `app/` invalida
  `clavesContratos.todas` (R24).
- **Inmutabilidad (R25–R26):** ninguna tarjeta ni contenedor ofrece editar/eliminar; no hay
  manejo de `405`/`403` ni `PATCH`/`PUT`/`DELETE` en el BFF. `ResultadoVentaModal` y
  `VentaCard` son de solo lectura.
- **Transversal (R27–R29):** `fechaLocalAIso` (UTC−5) al enviar y `formatearFechaHora` al
  mostrar (R27). Todas las operaciones pasan por `app/api/ventas/*` (R28). Aislamiento
  verificado por búsqueda: `features/ventas` no importa de `features/contratos` ni al revés;
  la composición ocurre en `app/` (R29).

## Verificación de tareas (T1–T11)

T1–T11 completadas y marcadas en `tasks.md`. BFF `GET`/`POST` en `app/api/ventas/route.ts`;
`app/api/ventas/[id]/route.ts` solo exporta `GET` con firma Next 16 `params: Promise<...>`;
feature `ventas` completo (tipos, `api/`, `query-keys.ts`, hooks, `schemas.ts`,
`mensajes-error.ts`, `formatos.ts`, componentes); barrel que expone `VentasSeccion`,
`VentasListado` y `ContratoVenta`; `TablePagination` exportado desde `shared/ui` con JSDoc
actualizado; `useContratos` y `Contrato` exportados desde `features/contratos`;
`VentasProximamente.tsx` eliminado y sin referencias; `Proximamente` conservado para
`ciclos`/`costos`; placeholder de `ContratoDetalle` = "Próximamente: ciclos y costos.";
composición en `app/` (`detalle-con-relaciones.tsx` y `ventas/page.tsx` +
`_components/listado-con-contratos.tsx`).

## Verificación (independiente)

| ID | Comando | Resultado |
|----|---------|-----------|
| — | `npx next typegen` | Pasa — "Types generated successfully". |
| `V1` | `npm run format:check` | Pasa — "All matched files use Prettier code style!". |
| `V2` | `npm run lint` | Pasa — ESLint sin errores. |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Pasa — 31 suites, 274 tests. |
| — | `bash .rei/init.sh` | Código de salida `0` (V1–V4 en verde). |
| `V5` | Validación manual | Pendiente del usuario (registro y desglose en ambas superficies), con los pasos documentados en `impl.md`. No aplica automatización por falta de React Testing Library. |

Tests puros revisados: `schemas.test.ts` (contrato requerido, fecha válida/ inválida,
cantidad entera/positiva, peso/precio positivos, trim), `mensajes-error.test.ts` (`0`,
`400`, `404`, genérico), `query-keys.test.ts` (con y sin `contrato_id`) y `formatos.test.ts`
(moneda, número, porcentaje). No llaman a la red.

## Convenciones y arquitectura

- `strict` sin `any`, `@ts-ignore` ni `@ts-expect-error`; sin `export default` fuera de
  `page.tsx`; `'use client'` en el nodo más bajo que lo necesita (hooks y contenedores;
  presentacionales sin directiva).
- Sin `fetch` en componentes ni `useEffect` para datos; acceso vía `api/` → hooks →
  TanStack Query. Mutaciones invalidan las claves afectadas.
- `shared/` no importa de `features/` ni de `app/`; sin acoplamiento entre `ventas` y
  `contratos`.
- BFF: validación defensiva, propagación del código real (red → `502` vía
  `respuestaError(0)`), mensajes en español sin exponer el mensaje crudo del backend.
- Sin dependencias nuevas ni cambios en `package.json`/`package-lock.json`,
  `shared/api/openapi/*`, ESLint, Prettier ni Jest.

## Observaciones (no bloqueantes)

- `features/compras/components/ComprasSeccion.tsx` aparece modificado en el árbol de trabajo
  (añade el prop opcional `onCambio`), pero su fecha de modificación (19:44) es anterior a la
  creación de este Work Item (19:55), por lo que se trata de un cambio preexistente no
  introducido aquí, tal como declara `impl.md`. La composición de `detalle-con-relaciones`
  pasa `onCambio` a `ComprasSeccion`; es inocuo y consistente con el refresco de agregados.
- `VentaCard` y `VentasLista` no llevan `'use client'`, correcto al no usar hooks ni API del
  navegador.

## Estado final

`done`. Se mueve el resumen de `current.md` a `history.md` y se restablece `current.md`.
