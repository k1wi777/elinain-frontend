# Implementación — CRUD de terceros (listado, modal y eliminación)

> Work Item: `2026-09-22_03-04__crud-terceros-listado-modal-eliminacion` (`type: task`)
> Implementer: `implementer`
> Plan de referencia: `.rei/specs/2026-09-22_03-04__crud-terceros-listado-modal-eliminacion/plan.md`

## Resumen

Se implementó el CRUD completo de terceros (socios de participación) sobre la
infraestructura existente:

- Listado paginado en `/terceros` con columnas Nombre, Documento y Contacto, estado de
  carga, estado vacío exacto y paginación.
- Alta y edición con un único `TerceroForm` dentro de un `Modal`.
- Eliminación con confirmación en `Modal` y mensaje específico para `409` (contratos
  activos).
- BFF dedicado en `app/api/terceros/*` que propaga el código HTTP real y no expone el
  mensaje crudo del backend.
- Helper transversal `respuestaError` movido a `app/api/_lib/` y reutilizado por `auth`.
- Rutas protegidas por `middleware` y enlace de navegación en el layout del dashboard.
- Tests Jest de lógica pura (esquemas zod, mensajes de error y query keys).

## Archivos

### Creados

| Archivo | Contenido |
|---------|-----------|
| `app/api/_lib/respuestas.ts` | `respuestaError(status, mensajes?)` transversal del BFF. |
| `app/api/terceros/route.ts` | BFF `GET` (listar) y `POST` (crear). |
| `app/api/terceros/[id]/route.ts` | BFF `PATCH` (actualizar) y `DELETE` (eliminar). |
| `app/(dashboard)/terceros/page.tsx` | Server Component de la ruta `/terceros`. |
| `features/terceros/types.ts` | Alias de DTOs y `FiltrosTerceros`. |
| `features/terceros/schemas.ts` | `esquemaTercero` y `DatosFormularioTercero`. |
| `features/terceros/mensajes-error.ts` | Mapeo `status` → mensaje en español. |
| `features/terceros/query-keys.ts` | Fábrica de query keys del feature. |
| `features/terceros/api/terceros.ts` | `listarTerceros`, `crearTercero`, `actualizarTercero`, `eliminarTercero`. |
| `features/terceros/hooks/useTerceros.ts` | `useQuery` del listado con `keepPreviousData`. |
| `features/terceros/hooks/useCrearTercero.ts` | Mutación de creación. |
| `features/terceros/hooks/useActualizarTercero.ts` | Mutación de edición. |
| `features/terceros/hooks/useEliminarTercero.ts` | Mutación de eliminación. |
| `features/terceros/components/TerceroForm.tsx` | Formulario reusable crear/editar. |
| `features/terceros/components/EliminarTerceroModal.tsx` | Confirmación de borrado. |
| `features/terceros/components/TercerosTable.tsx` | Contenedor cliente del listado. |
| `features/terceros/index.ts` | Barrel: exporta `TercerosTable`. |
| `features/terceros/__tests__/schemas.test.ts` | Tests de validación zod. |
| `features/terceros/__tests__/mensajes-error.test.ts` | Tests del mapeo de estados. |
| `features/terceros/__tests__/query-keys.test.ts` | Tests de la fábrica de query keys. |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `app/api/auth/login/route.ts` | Importa `respuestaError` de `app/api/_lib` y pasa `MENSAJES_ACCESO` (`401`/`409`). |
| `app/api/auth/registro/route.ts` | Importa `respuestaError` de `app/api/_lib` y pasa `MENSAJES_REGISTRO` (`409`). |
| `app/(dashboard)/layout.tsx` | Enlace `next/link` a `/terceros` ("Socios de participación"). |
| `middleware.ts` | `/terceros` en `RUTAS_PROTEGIDAS` y matcher ampliado. |

### Eliminados

| Archivo | Motivo |
|---------|--------|
| `app/api/auth/_lib/respuestas.ts` | Movido a `app/api/_lib/respuestas.ts` para no duplicar el mapeo de errores del BFF. |

## Cambios relevantes

- **BFF de terceros:** `GET` normaliza `limite`/`offset` (`normalizarLimite`,
  `Math.max(0, …)`, por defecto `LIMITE_POR_DEFECTO`/`0`). `POST`/`PATCH` validan el cuerpo
  de forma defensiva. Los `catch` resuelven
  `error instanceof ApiError ? respuestaError(error.status, mensajes) : respuestaError(500, mensajes)`.
  Mensajes propios: crear/editar `400`/`404`; eliminar `404` y `409` (contratos activos).
  Nunca se reenvía el `mensaje` crudo del backend.
- **`respuestaError` transversal:** base genérica en español (`400`, `401`, `404`, `409`,
  `500`, `502`), fallback `"Ocurrió un error inesperado."` y `status === 0` → `502`; los
  `mensajes` sobrescriben la base por código. `auth` conserva exactamente sus mensajes
  actuales (`401`/`409` en login, `409` en registro). `app/api/auth/_lib/sesion.ts` no se
  tocó.
- **Feature `terceros`:** un único `esquemaTercero` (`nombre`, `documento`, `contacto`,
  `trim` + `min(1)`), query keys `['terceros', 'list', filtros]`, api sobre
  `createBffClient()` y hooks con `invalidateQueries({ queryKey: clavesTerceros.listas() })`
  en `onSuccess`.
- **UI:** `TercerosTable` muestra "Nuevo socio de participación", columnas Nombre,
  Documento, Contacto y Acciones; estado vacío `"Aún no tienes socios de participación
  registrados"`; `Toast` de éxito con cierre manual; errores de listado/guardado/borrado en
  español con `role="alert"`.
- **Ruta, navegación y guardia:** página delgada en `app/(dashboard)/terceros/page.tsx`,
  enlace en la cabecera del dashboard y `/terceros` + `/terceros/:path*` en el matcher del
  middleware.

## Decisiones de implementación

- **Total provisional en `usePagination`:** el plan indica inicializar
  `usePagination({ total: 0 })` y recalcular los campos derivados, porque el total real
  solo llega con la respuesta. Con `total: 0` las acciones del hook
  (`irAPaginaAnterior`/`irAPaginaSiguiente`) quedan inertes, ya que dependen del total para
  habilitarse y para calcular la página destino. Para no sustituir la infraestructura
  existente, se inicializó el hook con `TOTAL_PROVISIONAL = Number.MAX_SAFE_INTEGER`
  (documentado en el componente): `limite`/`offset` y las acciones siguen siendo las del
  hook, y los campos visibles (`total`, `totalPaginas`, `paginaActual`,
  `hayPaginaAnterior`, `hayPaginaSiguiente`) se recalculan en render con las funciones
  puras de `shared/api/pagination` exactamente como pide el plan. Sin esta precisión la
  paginación "Siguiente" no funcionaría (se validó el razonamiento sobre
  `shared/api/usePagination.ts`, que no se modificó).

## Verificación

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | Pasa | `npm run format` ejecutado antes; Prettier no reporta cambios pendientes. |
| `V2` | `npm run lint` | Pasa | `eslint` sin errores. |
| `V3` | `npm run typecheck` | Pasa | `npx next typegen` ejecutado antes para las typed routes de `/terceros`; `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Pasa | 11 suites / 93 tests en verde, incluidas las 3 suites nuevas de `features/terceros`. |
| `V5` | Validación manual | Pendiente de usuario | Requiere backend y sesión iniciada. |

Además, `bash .rei/init.sh` finaliza con código de salida `0` y `V1`–`V4` en `[OK]`.

### Pasos de reproducción de `V5`

1. Con sesión iniciada, entrar a `/terceros`: ver "Cargando…" y luego el listado o el
   estado vacío *"Aún no tienes socios de participación registrados"*.
2. Sin sesión, visitar `/terceros`: redirección a `/login`.
3. Crear un socio con los tres campos vacíos (deben aparecer los errores en español) y
   luego con datos válidos: el modal se cierra, aparece el `Toast` y la tabla se refresca
   sin recargar la página.
4. Editar un socio desde "Editar": el modal aparece precargado; al guardar se reflejan los
   cambios y se refresca el listado.
5. Eliminar un socio sin contratos: confirmar en el modal y ver el `Toast` de éxito. Si era
   la única fila de una página mayor que 1, la tabla retrocede una página.
6. Eliminar un socio con contratos activos: ver el mensaje de `409` ("No se puede eliminar
   el socio de participación porque tiene contratos activos asociados.") y comprobar que no
   se elimina y el modal permanece abierto.
7. Navegar por teclado y cerrar ambos modales con `Escape`.

## Observaciones

- No se modificó `shared/api/openapi/*`, `package.json`, `tsconfig.json`, ESLint, Prettier
  ni Jest. No se añadieron dependencias.
- `shared/` no importa de `features/` ni de `app/`; `features/terceros` no importa de `app/`
  ni de otro feature.
- Los componentes no llaman a `fetch` ni conocen URLs; el acceso a datos pasa por
  `createBffClient()` en `features/terceros/api` y por TanStack Query en los hooks.
- No se usó `any`, `@ts-ignore` ni `useEffect` para obtener datos.
