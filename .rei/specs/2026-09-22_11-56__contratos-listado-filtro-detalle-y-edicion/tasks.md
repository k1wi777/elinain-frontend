# Tareas — Contratos: listado filtrable, apertura, detalle y edición de campos mutables

> Work Item: `2026-09-22_11-56__contratos-listado-filtro-detalle-y-edicion` (`type: feature`)
>
> Tareas discretas y ordenadas. El Implementer marca cada tarea como `[x]` inmediatamente al
> terminarla. Cada tarea referencia los requisitos (`R…`) que implementa.

---

- [x] **T1 — BFF de listado y creación de contratos.** Crear `app/api/contratos/route.ts` con
  `GET` (paginado, normalizando `limite`/`offset` con `shared/api/pagination`) y `POST` (parseo
  defensivo de `CrearContratoDto`: ids y fecha no vacíos, porcentajes en `[0, 100]`, opcionales
  `> 0`) sobre `createServerClient()` y `respuestaError`, con mensajes en español. (R1, R2, R5,
  R6)

- [x] **T2 — BFF de detalle y actualización.** Crear `app/api/contratos/[id]/route.ts` con `GET`
  y `PATCH` que lea solo campos mutables (descarta `tercero_id`, `finca_id`, `fecha_apertura` y
  porcentajes) y exija al menos uno. No exportar `DELETE`. (R3, R4, R5, R6, R7, R8)

- [x] **T3 — Tipos, query keys y mensajes.** Crear `features/contratos/types.ts` (alias de
  `ApiSchemas`, `EstadoContrato`, `EstadoFiltroContrato`, `TerceroContrato`, `FincaContrato`,
  `FiltrosContratos`), `query-keys.ts` (`todas`, `lista()`, `detalle(id)`) y `mensajes-error.ts`
  (listar/guardar/detalle, incluida la conexión `0`). Crear sus tests puros. (R15, R17, R28, R33,
  R40, R48, R49)

- [x] **T4 — Utilidades puras.** Crear `fechas.ts` (`fechaLocalAIso`, `isoAFechaLocal`,
  `formatearFechaHora`), `participacion.ts` (`formatearParticipacion`), `filtros.ts`
  (`filtrarContratosPorEstado`, `paginarContratos` con offset acotado) y `relaciones.ts`
  (`indexarNombres`, `nombreDeTercero`, `nombreDeFinca`, `fincasDeTercero`). Crear los tests
  puros de filtros, fechas, participación y relaciones (sin depender de la zona horaria del
  sistema). (R10, R11, R12, R18, R21, R24, R30, R49)

- [x] **T5 — Esquemas de validación.** Crear `features/contratos/schemas.ts` con
  `esquemaCrearContrato` (obligatorios, porcentajes en rango, suma exactamente 100, opcionales
  `> 0`), `esquemaEditarContrato` (estado, `fecha_cierre` exigida si `cerrado`, mutables) y los
  tipos inferidos. Crear `__tests__/schemas.test.ts`. (R23, R25, R35, R37, R49)

- [x] **T6 — API del feature.** Crear `features/contratos/api/contratos.ts` con `listarContratos`,
  `listarTodosLosContratos` (bucle con `LIMITE_MAXIMO`), `obtenerContrato`, `crearContrato` y
  `actualizarContrato` sobre `createBffClient()`, propagando `ApiError`. Sin `eliminarContrato`.
  (R1, R2, R3, R4, R7, R11)

- [x] **T7 — Hooks del feature.** Crear `useContratos` (todos, clave `lista()`), `useContrato(id)`
  (habilitada con id), `useCrearContrato` (invalida `lista()`) y `useActualizarContrato`
  (invalida `lista()` y `detalle(id)`) con TanStack Query y error tipado `ApiError`. (R11, R27,
  R29, R39)

- [x] **T8 — Listado con filtro y paginación en cliente.** Crear
  `features/contratos/components/ContratosListado.tsx` (props `terceros` y `fincas`): filtro por
  estado con `reiniciar()` al cambiar, `usePagination` sobre el conjunto filtrado,
  `paginarContratos` para la página visible, columnas Fecha de apertura / Tercero / Finca /
  Estado / Participación, estados de carga, vacío y error, y acciones "Ver detalle" y "Editar".
  (R9, R10, R11, R12, R13, R14, R15, R16, R18)

- [x] **T9 — Formulario de crear y editar.** Crear `features/contratos/components/ContratoForm.tsx`
  con `useForm` + `zodResolver`: en crear, `Select` de tercero, `Select` de finca filtrado con
  `fincasDeTercero`, fecha `datetime-local` convertida con `fechaLocalAIso`, porcentajes con
  autocompletado del complemento y campos opcionales; en editar, inmutables deshabilitados,
  mutables editables y acoplamiento estado/`fecha_cierre`. (R20, R21, R22, R23, R24, R25, R35,
  R36, R37)

- [x] **T10 — Conexión de crear, editar y detalle.** Crear `components/ContratoCrear.tsx`
  (mutación, confirmación y navegación a `/contratos/[id]`), `components/ContratoEditar.tsx`
  (precarga con `useContrato`, envía solo mutables y vuelve al detalle) y
  `components/ContratoDetalle.tsx` (todos los datos, respaldos "—", placeholder "Próximamente:
  compras, ventas, ciclos y costos" y acción Editar). (R26, R27, R28, R29, R30, R31, R32, R33,
  R34, R38, R39, R40)

- [x] **T11 — API pública del feature.** Crear `features/contratos/index.ts` exportando
  `ContratosListado`, `ContratoCrear`, `ContratoEditar`, `ContratoDetalle` y los tipos
  `TerceroContrato` y `FincaContrato`. (R43)

- [x] **T12 — Ampliación mínima de `features/fincas`.** Exportar `useTodasLasFincas` y el tipo
  `Finca` desde `features/fincas/index.ts` (ya existen internamente). (R45)

- [x] **T13 — Composición en `app/` y páginas.** Crear `app/(dashboard)/contratos/page.tsx`,
  `nuevo/page.tsx`, `[id]/page.tsx`, `[id]/editar/page.tsx` (Server Components que resuelven
  `params`) y los wrappers client
  `_components/{listado,nuevo,detalle,editar}-con-relaciones.tsx` que usan
  `useTodosLosTerceros` y `useTodasLasFincas`, mapean a `TerceroContrato[]`/`FincaContrato[]` y
  los pasan por props. (R9, R17, R19, R29, R34, R43, R44)

- [x] **T14 — Rutas protegidas y navegación.** Añadir `/contratos` a `RUTAS_PROTEGIDAS` y
  `"/contratos"`, `"/contratos/:path*"` al `matcher` de `middleware.ts`; añadir el enlace
  "Contratos" en el layout del área protegida. (R41, R42)

- [x] **T15 — Checkpoints y evidencia.** Ejecutar `npm run format`, `V1` (`format:check`), `V2`
  (`lint`), `V3` (`typecheck`) y `V4` (`test`); confirmar `bash .rei/init.sh` con salida `0`;
  registrar la evidencia en
  `.rei/progress/work-items/2026-09-22_11-56__contratos-listado-filtro-detalle-y-edicion/impl.md`
  y documentar los pasos de reproducción para `V5`. (R49)

---

## Orden y dependencias

1. `T1` y `T2` son independientes entre sí.
2. `T3`, `T4`, `T5` y `T12` son independientes y pueden hacerse en paralelo.
3. `T6` depende de `T3` y `T5`.
4. `T7` depende de `T4` (query keys) y `T6`.
5. `T8` depende de `T4`, `T5` y `T7`.
6. `T9` depende de `T4`, `T5` y `T7`.
7. `T10` depende de `T9` y `T7`.
8. `T11` depende de `T8` y `T10`.
9. `T13` depende de `T11` y `T12`.
10. `T14` es independiente y puede hacerse en paralelo.
11. `T15` se ejecuta al final, con todo implementado.

## Fuera de alcance

- Eliminación de contratos (el backend no la ofrece; se cierran, no se borran).
- Compras, ventas, ciclos y costos (placeholder informativo en el detalle).
- Edición de porcentajes, tercero, finca o fecha de apertura.
- Cambios en el OpenAPI local, en `shared/ui` o en dependencias.
- Tests de render (no hay librería de render; la interacción se valida en `V5`).
