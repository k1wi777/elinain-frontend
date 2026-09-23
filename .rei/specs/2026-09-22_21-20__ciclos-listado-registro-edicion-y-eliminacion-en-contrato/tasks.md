# Tasks — Ciclos embebidos en el detalle del contrato

Orden de ejecución. Marcar cada tarea con `[x]` al terminarla.

- [x] **T1** — Añadir `fechaDiaAIso`, `isoAFechaDia` y `formatearFechaDia` a
  `shared/lib/fechas.ts` (solo día, zona del negocio) y sus tests en
  `shared/lib/__tests__/fechas.test.ts`. (R10, R11, R2, R17)
- [x] **T2** — Crear `features/ciclos/types.ts` con `Ciclo`, `PaginaCiclos`, `CrearCiclo`,
  `ActualizarCiclo` y `FiltrosCiclos` derivados de `ApiSchemas`. (R1, R12, R13)
- [x] **T3** — Crear `features/ciclos/query-keys.ts` con `clavesCiclos`
  (`todas`, `listas()`, `lista(filtros)`) y su test. (R15, R18, R21)
- [x] **T4** — Crear `features/ciclos/api/ciclos.ts` con `listarCiclos`, `crearCiclo`,
  `actualizarCiclo` y `eliminarCiclo` sobre `createBffClient`. (R1, R15, R18, R21)
- [x] **T5** — Crear los hooks `useCiclos`, `useCrearCiclo`, `useActualizarCiclo` y
  `useEliminarCiclo`; las mutaciones invalidan `clavesCiclos.listas()`. (R1, R4, R15, R18,
  R21)
- [x] **T6** — Crear `features/ciclos/schemas.ts` con `esquemaCiclo` (fecha de día requerida
  y real; peso observado opcional positivo; notas opcionales) y sus tests. (R9, R10, R12,
  R13, R14)
- [x] **T7** — Crear `features/ciclos/mensajes-error.ts` con los mensajes de listar, guardar
  y eliminar, y sus tests. (R6, R22, R23, R24, R25)
- [x] **T8** — Crear `features/ciclos/components/CicloForm.tsx` (fecha `type="date"`, peso y
  notas; precarga en edición; conversión de fecha; payload con notas `null` si está vacío).
  (R9, R10, R11, R12, R13, R14, R17)
- [x] **T9** — Crear `features/ciclos/components/CicloFormModal.tsx` con `Modal` +
  `CicloForm`. (R9, R17)
- [x] **T10** — Crear `features/ciclos/components/EliminarCicloModal.tsx` con confirmación
  en `Modal` y sin `window.confirm`. (R19)
- [x] **T11** — Crear `features/ciclos/components/CiclosSeccion.tsx`: listado paginado,
  columnas fecha/peso/notas con `—`, alta, edición, eliminación, toasts, errores y `onCambio`.
  El botón de registrar se deshabilita con `contratoEstado === "cerrado"`; editar y eliminar
  siempre disponibles. (R1, R2, R3, R4, R5, R6, R7, R8, R15, R16, R18, R20, R21)
- [x] **T12** — Actualizar `features/ciclos/index.ts` para exportar `CiclosSeccion` y retirar
  `CiclosProximamente`. (R1)
- [x] **T13** — Crear `app/api/ciclos/route.ts` (GET listar con `limite`, `offset` y
  `contrato_id`; POST crear con validación defensiva y mensajes controlados). (R1, R6, R12,
  R13, R22)
- [x] **T14** — Crear `app/api/ciclos/[id]/route.ts` (GET, PATCH con validación defensiva y
  DELETE; mensajes controlados por estado). (R15, R18, R21, R22, R23)
- [x] **T15** — Exportar `useContrato` desde `features/contratos/index.ts`. (R7, R8)
- [x] **T16** — Componer `CiclosSeccion` en
  `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`, obteniendo el estado con
  `useContrato` y pasando `contratoId`, `contratoEstado` y `onCambio` (invalida
  `clavesContratos.todas`). (R1, R7, R8, R15, R18, R21)
- [x] **T17** — Eliminar `app/(dashboard)/ciclos/page.tsx`, el enlace `/ciclos` de
  `app/(dashboard)/layout.tsx` y `features/ciclos/components/CiclosProximamente.tsx`. (R26)
- [x] **T18** — Ejecutar `V1` (`npm run format:check`), `V2` (`npm run lint`), `V3`
  (`npm run typecheck`) y `V4` (`npm test`); dejar indicado en `impl.md` qué revisar en `V5`.
  (todas)
