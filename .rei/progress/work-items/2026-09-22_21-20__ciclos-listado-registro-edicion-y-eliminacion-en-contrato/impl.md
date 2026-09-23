# Implementación — Ciclos: listado, registro, edición y eliminación embebidos en el detalle del contrato

- **Work Item:** `2026-09-22_21-20__ciclos-listado-registro-edicion-y-eliminacion-en-contrato`
- **Tipo:** feature
- **Agente:** implementer
- **Estado:** review

## Resumen

Se implementó el CRUD de ciclos (checkpoints de engorde) embebido en el detalle del
contrato, replicando la estructura y los patrones del feature `compras`: feature-first
autocontenido, BFF con cookie httpOnly, TanStack Query con invalidación, `shared/ui` y
mensajes de error en español. Las tareas `T1`–`T18` de `tasks.md` se completaron en el orden
planificado.

Se retiró la ruta global `/ciclos`, su entrada del menú y el placeholder
`CiclosProximamente`, de modo que los ciclos solo se gestionan desde el detalle del contrato
(R26).

## Archivos nuevos

| Archivo | Contenido |
|---------|-----------|
| `features/ciclos/types.ts` | Alias `Ciclo`, `PaginaCiclos`, `CrearCiclo`, `ActualizarCiclo` y `FiltrosCiclos` derivados de `ApiSchemas`. |
| `features/ciclos/api/ciclos.ts` | `listarCiclos`, `crearCiclo`, `actualizarCiclo` y `eliminarCiclo` sobre `createBffClient`. |
| `features/ciclos/query-keys.ts` | `clavesCiclos` (`todas`, `listas()`, `lista(filtros)`). |
| `features/ciclos/hooks/useCiclos.ts` | Consulta paginada con `keepPreviousData`. |
| `features/ciclos/hooks/useCrearCiclo.ts` | Mutación de registro; invalida `clavesCiclos.listas()`. |
| `features/ciclos/hooks/useActualizarCiclo.ts` | Mutación de edición con `{ id, datos }`. |
| `features/ciclos/hooks/useEliminarCiclo.ts` | Mutación de eliminación por `id`. |
| `features/ciclos/schemas.ts` | `esquemaCiclo` y `DatosFormularioCiclo`. |
| `features/ciclos/mensajes-error.ts` | Mensajes de listar, guardar y eliminar por estado HTTP. |
| `features/ciclos/components/CiclosSeccion.tsx` | Sección embebida: listado paginado, modales, toasts y `onCambio`. |
| `features/ciclos/components/CicloForm.tsx` | Formulario reusable de registro/edición. |
| `features/ciclos/components/CicloFormModal.tsx` | `Modal` + `CicloForm`. |
| `features/ciclos/components/EliminarCicloModal.tsx` | Confirmación de borrado con `Modal`. |
| `app/api/ciclos/route.ts` | BFF: `GET` (listar) y `POST` (crear). |
| `app/api/ciclos/[id]/route.ts` | BFF: `GET`, `PATCH` y `DELETE`. |
| `features/ciclos/__tests__/schemas.test.ts` | Tests de `esquemaCiclo`. |
| `features/ciclos/__tests__/mensajes-error.test.ts` | Tests de los mensajes por estado. |
| `features/ciclos/__tests__/query-keys.test.ts` | Tests de `clavesCiclos`. |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `shared/lib/fechas.ts` | Helpers solo-día `fechaDiaAIso`, `isoAFechaDia` y `formatearFechaDia` en zona del negocio (UTC−5), con manejo de fechas irreales. |
| `shared/lib/__tests__/fechas.test.ts` | Tests de los tres helpers nuevos. |
| `features/ciclos/index.ts` | Exporta `CiclosSeccion`; se retiró `CiclosProximamente`. |
| `features/contratos/index.ts` | Exporta `useContrato` para que `app/` obtenga el estado del contrato. |
| `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx` | Compone `CiclosSeccion` con `contratoId`, `contratoEstado` y `onCambio` (invalida `clavesContratos.todas`). |
| `app/(dashboard)/layout.tsx` | Se eliminó el enlace `/ciclos` del menú. |

## Archivos eliminados

- `app/(dashboard)/ciclos/page.tsx` (y su carpeta).
- `features/ciclos/components/CiclosProximamente.tsx`.

## Decisiones de implementación

- **Fecha solo-día.** El formulario usa `type="date"`; al enviar, `fechaDiaAIso` convierte
  `YYYY-MM-DD` al inicio del día en Colombia (`T05:00:00.000Z`); al precargar en edición,
  `isoAFechaDia` hace la vuelta. El listado presenta con `formatearFechaDia` (`DD/MM/AAAA`).
- **Payload.** `peso_observado` se omite si queda vacío; `notas` vacío se envía como `null`
  y con texto se envía recortado por el `trim` de zod.
- **Registro deshabilitado.** El botón de registrar se deshabilita solo con
  `contratoEstado === "cerrado"` y se acompaña de un aviso. Editar y eliminar permanecen
  siempre disponibles (R16, R20).
- **Invalidación.** Las mutaciones de ciclos invalidan `clavesCiclos.listas()`; tras el éxito
  la sección invoca `onCambio?.()`, que en `app/` invalida `clavesContratos.todas` para
  refrescar derivados como `peso_promedio_actual`.
- **Errores.** La UI traduce el estado HTTP con `mensajes-error.ts` (nunca el cuerpo del
  backend); el BFF devuelve mensajes controlados vía `respuestaError` y conserva el código
  real del backend.
- **Robustez del listado.** El peso observado se presenta con una comprobación
  `typeof === "number"`, así que cualquier valor ausente cae en `—` sin dejar la celda vacía.

## Verificación

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| V1 | `npm run format:check` | pasa | Se ejecutó `npm run format` antes; sin cambios pendientes. |
| V2 | `npm run lint` | pasa | ESLint sin errores. |
| V3 | `npm run typecheck` | pasa | `tsc --noEmit` limpio tras regenerar `.next/types` con `npx next typegen`. |
| V4 | `npm test` | pasa | 34 suites, 304 tests en verde (incluye los 3 suites nuevos de `ciclos` y los de `fechas`). |
| V5 | Validación manual | pendiente | Ver abajo. |

`bash .rei/init.sh` finaliza con `V1`–`V4` en `[OK]`; se reejecutó tras la corrección de
`middleware.ts` y volvió a pasar Formato (V1), Lint (V2), Tipos (V3) y Tests (V4).

Nota V3: al eliminar `app/(dashboard)/ciclos/page.tsx`, la caché de build `.next` (ignorada
por git) conservaba un `validator.ts` que referenciaba la ruta borrada y hacía fallar
`tsc`. Se regeneraron los tipos con `npx next typegen`; no fue un problema de código fuente.

### V5 — Qué revisar manualmente

1. **Listado.** Abrir el detalle de un contrato (`/contratos/[id]`) y comprobar que la
   sección "Ciclos" aparece entre Compras y Ventas, con columnas Fecha, Peso observado,
   Notas y Acciones; un ciclo sin peso o sin notas muestra `—`.
2. **Registro con contrato activo.** Pulsar "Registrar ciclo", elegir una fecha y enviar:
   el modal se cierra, aparece el toast "Ciclo registrado." y el listado se refresca. Con el
   peso vacío debe aceptarse; con peso `0` o negativo debe mostrar el mensaje de validación.
   Comprobar que el peso promedio del contrato se actualiza si el backend lo recalcula.
3. **Registro con contrato cerrado.** En un contrato cerrado, "Registrar ciclo" debe estar
   deshabilitado con el aviso correspondiente, pero "Editar" y "Eliminar" siguen activos.
4. **Edición.** Editar un ciclo: el formulario precarga fecha, peso y notas; al guardar se
   cierra, muestra el toast y refresca el listado.
5. **Eliminación.** Pulsar "Eliminar": se abre el modal de confirmación (no `window.confirm`);
   al confirmar se cierra, muestra el toast y refresca el listado. Al eliminar la única fila
   de una página mayor que 1, debe retroceder a la página anterior.
6. **Errores.** Forzar un contrato cerrado durante el registro/edición/eliminación y
   comprobar el mensaje de revisión/cercanía al contrato; forzar `404` (ciclo inexistente) y
   caída de conexión; en ningún caso debe verse el mensaje crudo del backend.
7. **Navegación.** Confirmar que ya no existe el enlace "Ciclos" en el menú ni una ruta
   global `/ciclos`.

## Observaciones

- Corrección posterior a la revisión: se eliminó la configuración residual de `/ciclos` en
  `middleware.ts` para completar R26. Se quitó `"/ciclos"` de `RUTAS_PROTEGIDAS` y los
  patrones `"/ciclos"` y `"/ciclos/:path*"` de `config.matcher`, conservando `/ventas`,
  `"/ventas/:path*"`, `/costos` y `"/costos/:path*"`.
- No se actualizó `shared/api/openapi/schema.d.ts`: los DTO de ciclos ya estaban generados,
  conforme al diseño.
- No se añadieron dependencias.
