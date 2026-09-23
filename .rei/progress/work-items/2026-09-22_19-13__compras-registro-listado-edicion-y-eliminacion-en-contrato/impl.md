# Implementación — Compras en el detalle de contrato

> Work Item: `2026-09-22_19-13__compras-registro-listado-edicion-y-eliminacion-en-contrato`
> (`type: feature`) · Agente: Implementer · Fecha: 2026-09-22

---

## Resumen

Se implementó el alcance completo de la especificación (R1–R21, T1–T9): movimiento de la
utilidad de fechas a `shared/lib`, BFF de compras, feature `features/compras` autocontenido
(tipos, API, hooks, esquema, mensajes y componentes), composición en `app/` y tests Jest de
lógica pura. No se añadieron dependencias ni se tocó `package.json`, `shared/api/openapi/*`,
`shared/ui`, ESLint, Prettier ni Jest.

## Archivos

### Nuevos

- `app/api/compras/route.ts` — `GET` (paginado, filtrado por `contrato_id`) y `POST`.
- `app/api/compras/[id]/route.ts` — `GET`, `PATCH` (solo mutables) y `DELETE` (`200`).
- `features/compras/types.ts`
- `features/compras/query-keys.ts`
- `features/compras/mensajes-error.ts`
- `features/compras/schemas.ts`
- `features/compras/api/compras.ts`
- `features/compras/hooks/{useCompras,useCrearCompra,useActualizarCompra,useEliminarCompra}.ts`
- `features/compras/components/{CompraForm,CompraFormModal,EliminarCompraModal,ComprasSeccion}.tsx`
- `features/compras/index.ts`
- `features/compras/__tests__/{schemas,mensajes-error,query-keys}.test.ts`

### Movidos (T1)

- `features/contratos/fechas.ts` → `shared/lib/fechas.ts` (comportamiento intacto).
- `features/contratos/__tests__/fechas.test.ts` → `shared/lib/__tests__/fechas.test.ts`
  (import actualizado a `@/shared/lib/fechas`).

### Modificados

- `features/contratos/schemas.ts` y `features/contratos/components/{ContratoForm,
  ContratoDetalle,ContratosListado,ContratoCrear,ContratoEditar}.tsx` — imports a
  `@/shared/lib/fechas`.
- `features/contratos/components/ContratoDetalle.tsx` — placeholder → "Próximamente: ventas,
  ciclos y costos.".
- `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx` — compone
  `<ComprasSeccion contratoId={id} />` junto a `ContratoDetalle`.
- `.rei/progress/current.md` y `.rei/specs/.../tasks.md` — seguimiento del Work Item.

## Decisiones relevantes

- **Filtro y paginación en servidor.** `ComprasSeccion` usa `usePagination` con
  `TOTAL_PROVISIONAL` (patrón de `FincasTable`), recalculando página y total en render con
  el `total` real del backend; `useCompras` usa `keepPreviousData` para evitar parpadeos.
- **`valor_total` sin recalcular.** Se muestra tal como lo devuelve el backend con
  `Intl.NumberFormat("es-CO")`; nunca se calcula en el cliente. `cantidad` y `peso_promedio`
  se presentan con su unidad (`cabezas`, `kg`).
- **409 explícito y reactivo.** El formulario y el modal de eliminación no se cierran al
  fallar; `mensajeErrorGuardarCompra(409)` y `mensajeErrorEliminarCompra(409)` devuelven los
  mensajes exactos de R15 y R19. Editar y eliminar están siempre visibles (R14).
- **Contrato inmutable.** `CompraForm` no renderiza un campo de contrato; en edición solo
  muestra una nota. El BFF `PATCH` descarta `contrato_id` y exige al menos un campo mutable.
- **Mensajes del BFF.** `400: "Revisa los datos de la compra."`, `404: "La compra no
  existe."`, y el `409` propio de modificar/eliminar; los mensajes base del BFF se usan para
  el resto de estados (p. ej. `401`).
- **Aislamiento.** `features/compras` no importa de `features/contratos` ni al revés
  (verificado con `grep`); `shared/` sigue sin importar de `features/`. El débito
  `DELETE` responde `200` (no `204`) según la especificación.

## Desviaciones

- Ninguna respecto de la planificación.

## Verificación

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format` + `npm run format:check` | Pasa — "All matched files use Prettier code style!" |
| `V2` | `npm run lint` | Pasa — ESLint sin errores |
| `V3` | `npx next typegen` + `npm run typecheck` | Pasa — `tsc --noEmit` sin errores |
| `V4` | `npm test` | Pasa — 27 suites, 248 tests (3 suites / 24 tests nuevos de `compras`) |
| `V5` | Validación manual | Pendiente del usuario; pasos abajo |

Además, `bash .rei/init.sh` termina con código de salida `0` y los cuatro checkpoints en
`[OK]`.

### Comprobación HTTP opcional del BFF

Con el dev server activo en `http://localhost:3000` y una sesión temporal creada vía
`POST /api/auth/registro`:

- `GET /api/compras?contrato_id=<uuid>&limite=20&offset=0` sin sesión → `401`
  `{"mensaje":"Tu sesión no es válida o ha expirado."}` (ruta reconocida).
- Mismo `GET` con sesión y UUID válido → `200`
  `{"elementos":[],"total":0,"limite":20,"offset":0}` (forma de `PaginaComprasDto`).
- `GET /api/compras?contrato_id=00000000-0000-0000-0000-000000000000` con sesión → `400`
  `{"mensaje":"Revisa los datos de la compra."}` (el backend rechaza el UUID nulo; el BFF
  propaga el código real y el mensaje del feature).

Nota: la comprobación creó una cuenta temporal en el backend
(`impl-compras-<timestamp>@example.com`); no afecta al entorno del usuario.

### V5 — Pasos de reproducción (validación manual)

1. Levantar el backend Elinain y `npm run dev`; iniciar sesión en `/login`.
2. Abrir el detalle de un contrato (`/contratos/<id>`): debe aparecer la sección "Compras"
   debajo del detalle, con estado vacío si no hay compras y el placeholder "Próximamente:
   ventas, ciclos y costos." en el detalle.
3. **Registrar**: pulsar "Registrar compra"; probar validaciones (cantidad `0`, no entera,
   peso o precio `0`, nota vacía, fecha vacía); completar los cinco campos y guardar. Debe
   mostrar el `Toast` de éxito, cerrar el diálogo y refrescar el listado sin recargar.
4. **Listado**: comprobar fecha en zona Colombia, cantidad, peso promedio, precio por kilo,
   `valor_total` devuelto por el backend y nota; verificar la paginación.
5. **Editar**: cambiar campos y guardar; el contrato no debe ser editable y el valor total
   debe reflejar el recálculo del backend.
6. **Eliminar**: comprobar el diálogo de confirmación previa y que el listado se refresca.
7. **409**: en un contrato con ventas registradas, editar y eliminar una compra deben
   mostrar "No se puede modificar/eliminar la compra: el contrato ya tiene ventas
   registradas." manteniendo abierto el formulario/diálogo.
8. **Accesibilidad**: navegar con teclado, foco visible y errores anunciados.

## Observaciones

- `V5` queda pendiente de confirmación del usuario: depende de un backend operativo.
- No se modificaron `package.json`, `shared/api/openapi/*`, `shared/ui`, ESLint, Prettier ni
  la configuración de Jest; sin dependencias nuevas.
