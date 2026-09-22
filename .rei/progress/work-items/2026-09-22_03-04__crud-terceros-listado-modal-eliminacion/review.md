# Revisión — Terceros: listado paginado, crear/editar en modal y eliminar con confirmación

> Work Item: `2026-09-22_03-04__crud-terceros-listado-modal-eliminacion` (`type: task`)
>
> Agente: `reviewer`
> Resultado: **aprobado** (`done`). `V5` (validación manual) queda a cargo del usuario.

---

## Alcance revisado

Se aplicó el **Caso B** (`type == task`) del rol `reviewer`. Se leyó `plan.md` y el reporte
del Implementer (`impl.md`) y se inspeccionó directamente el código de `app/api/_lib/`,
`app/api/terceros/`, `app/api/auth/`, `app/(dashboard)/`, `middleware.ts` y
`features/terceros/`, sin confiar solo en el reporte.

---

## Verificaciones realizadas

### Pasos y archivos del plan

- Los 9 pasos están marcados `[x]` y cada uno tiene sus artefactos.
- Se crearon exactamente los archivos previstos: `app/api/_lib/respuestas.ts`,
  `app/api/terceros/{route.ts,[id]/route.ts}`, `app/(dashboard)/terceros/page.tsx`,
  `features/terceros/{types,schemas,mensajes-error,query-keys,index}.ts`,
  `features/terceros/api/terceros.ts`, los cuatro hooks, los tres componentes y las tres
  suites de `__tests__/`.
- Modificados conforme al plan: `app/api/auth/{login,registro}/route.ts`,
  `app/(dashboard)/layout.tsx` y `middleware.ts`. Eliminado
  `app/api/auth/_lib/respuestas.ts`.
- **Sin alcance extra:** `git status` no muestra `package.json`, `tsconfig.json`, ESLint,
  Prettier, Jest ni `shared/api/openapi/*`. No se tocó `app/api/auth/_lib/sesion.ts`.

### Arquitectura y convenciones

- **BFF de terceros** en `app/api/terceros/*`: `GET/POST` y `PATCH/DELETE` usan
  `createServerClient().get/post/patch/delete`; propagan el `status` real de `ApiError` y
  red (`0`) → `502` vía `respuestaError`; nunca reenvían el `mensaje` crudo del backend.
  Firma Next 16 con `params: Promise<{ id: string }>` y `await params`. `DELETE` responde
  `204` sin cuerpo.
- **Helper transversal** `app/api/_lib/respuestas.ts`: base en español (`400`, `401`, `404`,
  `409`, `500`, `502`), fallback `"Ocurrió un error inesperado."` y `status === 0` → `502`;
  los `mensajes` sobrescriben por código. Sin duplicar el mapeo. `auth` conserva sus
  mensajes: login `MENSAJES_ACCESO` (`401`/`409`) y registro `MENSAJES_REGISTRO` (`409`),
  idénticos a los del helper anterior.
- **Reutilización transversal:** `createServerClient`, `createBffClient`, `ApiError`,
  `HttpClient`, `LIMITE_POR_DEFECTO`/`normalizarLimite`, `usePagination` y los componentes
  `Table`/`Modal`/`Toast`/`Button`/`Input` de `shared/ui`. Sin dependencias nuevas.
- **Dependencias en un solo sentido:** `shared/` no importa de `features/` ni de `app/`;
  `features/terceros` solo importa de su propio feature y de `shared/`; sin imports desde
  `app/` (grep sin coincidencias).
- **Convenciones:** sin `any`, `@ts-ignore`/`@ts-expect-error`; named exports (sin
  `export default` en el feature); `'use client'` únicamente en hooks, componentes
  interactivos, `TercerosTable` y `page.tsx`/`route.ts`; sin `fetch` en componentes; sin
  `useEffect` para datos; DTOs derivados de `ApiSchemas` sin redefinir; textos visibles y
  JSDoc en español; query keys centralizadas en `['terceros', 'list', filtros]`.

### CRUD

- **Listado paginado:** columnas Nombre/Documento/Contacto (+ Acciones), `cargando`
  (`isPending`, resuelto en `Table`), estado vacío exacto *"Aún no tienes socios de
  participación registrados"* y `keepPreviousData` para evitar parpadeo.
- **Crear/editar con el mismo formulario:** un único `TerceroForm` con `modo` y
  `valoresIniciales`; en edición precarga por `defaultValues`. Las mutaciones
  `useCrearTercero`/`useActualizarTercero`/`useEliminarTercero` invalidan
  `clavesTerceros.listas()` en `onSuccess`, de modo que el listado se refresca sin recargar.
- **Eliminar con confirmación:** `EliminarTerceroModal` sobre `Modal` (no `window.confirm`),
  con el `409` traducido a *"No se puede eliminar el socio de participación porque tiene
  contratos activos asociados."*; el error mantiene el diálogo abierto. Al borrar la única
  fila de una página > 1 retrocede una página.
- **Guardia y navegación:** `/terceros` en `RUTAS_PROTEGIDAS` y `/terceros` +
  `/terceros/:path*` en el matcher; enlace "Socios de participación" en el layout del
  dashboard sin alterar `LogoutButton`; página delgada con `metadata` y encabezado.
- **Errores:** listado/guardado/borrado muestran mensajes en español con `role="alert"`; los
  `catch` vacíos de `handleGuardar`/`handleEliminar` no ignoran el error: lo expone el estado
  de la mutación y lo traduce la UI.

### Tests de lógica pura

- `schemas.test.ts`: válidos, cada campo requerido vacío/solo espacios con su mensaje y
  `trim` aplicado.
- `mensajes-error.test.ts`: mapeos de listar/guardar/eliminar, incluido el texto exacto del
  `409` y `0` → conexión.
- `query-keys.test.ts`: `todas`, `listas()` y `lista(filtros)`.

### Checkpoints (reejecutados de forma independiente)

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | **Pasa** | `All matched files use Prettier code style!` |
| `V2` | `npm run lint` | **Pasa** | ESLint sin errores. |
| `V3` | `npm run typecheck` | **Pasa** | `npx next typegen` ejecutado antes; `tsc --noEmit` sin errores. |
| `V4` | `npm test` | **Pasa** | 11 suites / 93 tests en verde. |
| `V5` | Validación manual | **Pendiente del usuario** | Requiere backend y sesión (listar, vacío, crear, editar, eliminar y `409`). Pasos en `impl.md`. No se marca como superada sin confirmación explícita del usuario (`verification.md`). |

`bash .rei/init.sh` finaliza con **código de salida `0`** y `V1`–`V4` en `[OK]`.

---

## Observaciones

- **Desviación interna justificada (paginación):** el plan indicaba
  `usePagination({ total: 0 })`. La implementación usa
  `TOTAL_PROVISIONAL = Number.MAX_SAFE_INTEGER` y documenta el motivo: con `total: 0` las
  acciones del hook (`irAPaginaSiguiente`) quedan inertes, porque dependen del total para
  habilitarse, y el "listado paginado" no funcionaría. Los campos visibles se recalculan en
  render con `calcularTotalPaginas`/`calcularPagina`/`normalizarPagina` exactamente como pide
  el plan, y se sigue reutilizando `usePagination` (decisión "reutilizar antes que
  duplicar"). No cambia la API pública ni el comportamiento descrito; se acepta como
  corrección necesaria de una inconsistencia del propio plan, documentada en `impl.md`.
- El layout del dashboard ya tenía el enlace "Socios de participación" en el reporte; se
  verificó en código que existe y no altera `LogoutButton`.
- `next typegen` es necesario para las typed routes de `/terceros`; `V3` pasa tras
  ejecutarlo. Dependencia preexistente, no introducida por este Work Item.

---

## Acciones requeridas

Ninguna. El Work Item cumple su objetivo, respeta las restricciones, la arquitectura y las
convenciones, y supera los checkpoints automatizados; `V5` queda a cargo del usuario.

---

## Estado final

**`done`**.
