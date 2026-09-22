# Plan — Terceros: listado paginado, crear/editar en modal y eliminar con confirmación

> Work Item: `2026-09-22_03-04__crud-terceros-listado-modal-eliminacion` (`type: task`)
>
> La interfaz llama a la entidad **"Socio de participación"**; el feature y el backend
> siguen llamándose `tercero`.

## Objetivo

Implementar el CRUD de terceros sobre la infraestructura ya existente (feature-first, BFF
con cookie httpOnly y sistema de diseño):

1. Listado paginado en `/terceros` con columnas Nombre, Documento y Contacto, estado de
   carga y estado vacío exacto *"Aún no tienes socios de participación registrados"*.
2. Crear socio en un modal (`nombre`, `documento`, `contacto` requeridos); al guardar
   refresca el listado sin recargar la página.
3. Editar socio reutilizando el **mismo** formulario/modal, precargado con los datos
   actuales.
4. Eliminar socio con confirmación previa y mensaje claro ante `409` (tiene contratos
   activos asociados).

Las cuatro operaciones autenticadas pasan por Route Handlers BFF en `app/api/terceros/*`.

## Archivos

### Crear

| Archivo | Contenido |
|---------|-----------|
| `app/api/_lib/respuestas.ts` | Helper transversal `respuestaError(status, mensajes?)`. |
| `app/api/terceros/route.ts` | BFF `GET` (listar) y `POST` (crear). |
| `app/api/terceros/[id]/route.ts` | BFF `PATCH` (actualizar) y `DELETE` (eliminar). |
| `app/(dashboard)/terceros/page.tsx` | Server Component de la ruta `/terceros`. |
| `features/terceros/types.ts` | Alias de DTOs y filtros de paginación. |
| `features/terceros/schemas.ts` | `esquemaTercero` (zod) y `DatosFormularioTercero`. |
| `features/terceros/mensajes-error.ts` | Mapeo `status` → mensaje en español. |
| `features/terceros/query-keys.ts` | Fábrica de query keys `['terceros', 'list', filtros]`. |
| `features/terceros/api/terceros.ts` | `listarTerceros`, `crearTercero`, `actualizarTercero`, `eliminarTercero`. |
| `features/terceros/hooks/useTerceros.ts` | `useQuery` del listado. |
| `features/terceros/hooks/useCrearTercero.ts` | Mutación de creación. |
| `features/terceros/hooks/useActualizarTercero.ts` | Mutación de edición. |
| `features/terceros/hooks/useEliminarTercero.ts` | Mutación de eliminación. |
| `features/terceros/components/TerceroForm.tsx` | Formulario reusable crear/editar. |
| `features/terceros/components/EliminarTerceroModal.tsx` | Modal de confirmación de borrado. |
| `features/terceros/components/TercerosTable.tsx` | Contenedor `'use client'` del listado. |
| `features/terceros/index.ts` | Barrel: exporta `TercerosTable`. |
| `features/terceros/__tests__/schemas.test.ts` | Tests de validación zod. |
| `features/terceros/__tests__/mensajes-error.test.ts` | Tests del mapeo de estados. |
| `features/terceros/__tests__/query-keys.test.ts` | Tests de la fábrica de query keys. |

### Modificar

| Archivo | Cambio |
|---------|--------|
| `app/api/auth/login/route.ts` | Importar `respuestaError` desde `app/api/_lib` y pasar sus mensajes de `401`/`409`. |
| `app/api/auth/registro/route.ts` | Importar `respuestaError` desde `app/api/_lib` y pasar su mensaje de `409`. |
| `app/(dashboard)/layout.tsx` | Enlace de navegación a `/terceros` ("Socios de participación"). |
| `middleware.ts` | Proteger `/terceros` y `/terceros/:path*`. |

### Eliminar

| Archivo | Motivo |
|---------|--------|
| `app/api/auth/_lib/respuestas.ts` | Se mueve a `app/api/_lib/respuestas.ts` para no duplicar el mapeo de errores del BFF. |

## Cambios

### 1. BFF: helper transversal de errores

- Crear `app/api/_lib/respuestas.ts` con:
  ```ts
  export function respuestaError(
    status: number,
    mensajes?: Partial<Record<number, string>>,
  ): NextResponse;
  ```
  Base genérica en español (`400`, `401`, `404`, `409`, `500`, `502`), fallback
  `"Ocurrió un error inesperado."`, y `status === 0` (red) → `502`. Los `mensajes`
  sobrescriben la base por código.
- Eliminar `app/api/auth/_lib/respuestas.ts` y actualizar los dos imports de
  `app/api/auth/login/route.ts` y `app/api/auth/registro/route.ts`.
- **Preservar el comportamiento de auth:** login pasa `{ 401: "Correo o contraseña
  incorrectos.", 409: "Este correo ya está registrado." }`; registro pasa
  `{ 409: "Este correo ya está registrado." }`. El resto usa los mensajes genéricos.
- `app/api/auth/_lib/sesion.ts` no se toca (es específico de auth).

### 2. BFF: Route Handlers de terceros

- `app/api/terceros/route.ts`
  - `GET`: lee `limite`/`offset` de `request.nextUrl.searchParams` y los normaliza con
    `normalizarLimite` y `Math.max(0, …)` de `shared/api/pagination` (default
    `LIMITE_POR_DEFECTO`, `offset` 0). Llama a
    `createServerClient().get<PaginaTercerosDto>("/terceros", { params: { limite, offset } })`
    y responde `200` con el JSON de la página.
  - `POST`: lee el cuerpo con parseo defensivo (los tres campos string no vacíos; si no,
    `400`), llama a `createServerClient().post<TerceroRespuestaDto>("/terceros", datos)` y
    responde `201` con el tercero creado.
- `app/api/terceros/[id]/route.ts`
  - Firma Next 16: `{ params }: { params: Promise<{ id: string }> }` → `await params`.
  - `PATCH`: parseo defensivo del cuerpo (al menos un campo de
    `ActualizarTerceroDto`), llama a
    `createServerClient().patch<TerceroRespuestaDto>(`/terceros/${id}`, datos)` y responde
    `200`.
  - `DELETE`: llama a `createServerClient().delete<void>(`/terceros/${id}`)` y responde
    `204` sin cuerpo.
- **Manejo de errores** (en ambos archivos): `catch` que resuelve
  `error instanceof ApiError ? respuestaError(error.status, mensajes) : respuestaError(500, mensajes)`.
  Mensajes propios de terceros:
  - Crear/editar: `{ 400: "Revisa los datos del socio de participación.",
    404: "El socio de participación no existe." }`.
  - Eliminar: `{ 409: "No se puede eliminar el socio de participación porque tiene
    contratos activos asociados.", 404: "El socio de participación no existe." }`.
  No se reenvía al navegador el `mensaje` crudo del backend.

### 3. Feature `terceros`

- `types.ts`: alias desde `ApiSchemas` (`Tercero`, `PaginaTerceros`, `CrearTercero`,
  `ActualizarTercero`) y `FiltrosTerceros = { limite: number; offset: number }`. No se
  redefine ningún DTO.
- `schemas.ts`: `esquemaTercero = z.object({ nombre, documento, contacto })`, cada uno
  `z.string().trim().min(1, <mensaje en español>)`; `DatosFormularioTercero =
  z.infer<typeof esquemaTercero>`. Es el único esquema, usado por crear y editar.
- `mensajes-error.ts` (funciones puras):
  - `mensajeErrorListarTerceros(status)`.
  - `mensajeErrorGuardarTercero(status)` (`400` datos, `404` no existe, `0` conexión,
    genérico).
  - `mensajeErrorEliminarTercero(status)` con `409` → *"No se puede eliminar el socio de
    participación porque tiene contratos activos asociados."*; `404`, `0` y genérico.
- `query-keys.ts`: `clavesTerceros.todas`, `clavesTerceros.listas()` y
  `clavesTerceros.lista(filtros)` siguiendo `['terceros', 'list', filtros]`.
- `api/terceros.ts`: usa `createBffClient()` y `HttpClient`:
  `listarTerceros({ limite, offset })` → `GET /api/terceros` con `params`;
  `crearTercero(datos)` → `POST`; `actualizarTercero(id, datos)` → `PATCH /api/terceros/${id}`;
  `eliminarTercero(id)` → `DELETE`. Todas propagan el `ApiError`.
- `hooks/`:
  - `useTerceros(filtros)`: `useQuery<PaginaTerceros, ApiError>` con
    `queryKey: clavesTerceros.lista(filtros)`, `queryFn: () => listarTerceros(filtros)` y
    `placeholderData: keepPreviousData` (evita el parpadeo al cambiar de página).
  - `useCrearTercero`, `useActualizarTercero`, `useEliminarTercero`: `useMutation` con
    error tipado `ApiError`; en `onSuccess` invalidan `clavesTerceros.listas()`.

### 4. Componentes

- `TerceroForm.tsx` (`'use client'`): `useForm<DatosFormularioTercero>` + `zodResolver`.
  Props: `{ modo: "crear" | "editar"; valoresIniciales?: Tercero; enviando: boolean;
  mensajeError: string | null; onGuardar: (datos) => void; onCancelar: () => void }`.
  En modo edición precarga con `defaultValues` desde `valoresIniciales`. Tres `Input`
  (`Input` de `shared/ui`) con label; mensaje de error general con `role="alert"`;
  botones "Cancelar" (secundario) y "Guardar"/"Guardando…" (primario, `type="submit"`,
  `disabled={enviando}`). Renderiza sus propias acciones al final del `<form>` (no usa el
  `pie` del `Modal`, para que el submit siga dentro del formulario).
- `EliminarTerceroModal.tsx` (`'use client'`): envuelve `Modal` con título "Eliminar socio
  de participación", texto que nombra al socio y advierte que la acción no se puede
  deshacer, mensaje de error inline (`role="alert"`) y `pie` con "Cancelar" (secundario) y
  "Eliminar" (variante `peligro`, `disabled={enviando}`).
- `TercerosTable.tsx` (`'use client'`), contenedor del listado:
  - Paginación: `usePagination({ total: 0 })` aporta `limite`/`offset` y las acciones;
    `useTerceros({ limite, offset })` consulta con ellos. Como `total` llega de la
    respuesta y el hook se invoca antes, los campos derivados de `total` se recalculan con
    `calcularTotalPaginas`, `calcularPagina` y `normalizarPagina` de
    `shared/api/pagination` y se combinan con el estado/acciones del hook para construir el
    `PaginacionTabla` que recibe `Table`.
  - `Table<Tercero>` con columnas Nombre, Documento, Contacto y Acciones (botones
    "Editar" y "Eliminar" con `aria-label` que incluye el nombre),
    `respaldo de clave = tercero.id`, `cargando={isPending}`,
    `mensajeVacio="Aún no tienes socios de participación registrados"`.
  - Estado local: `terceroEnEdicion: Tercero | null`, `formularioAbierto: boolean`,
    `terceroAEliminar: Tercero | null`, y el `Toast`.
  - Botón "Nuevo socio de participación" que abre el formulario en modo crear.
  - `handleGuardar`: elige crear o editar; en éxito cierra el modal y muestra `Toast`
    ("Socio de participación creado/actualizado."); en error mantiene el modal y muestra
    `mensajeErrorGuardarTercero(error.status)`.
  - `handleEliminar`: en éxito cierra, muestra `Toast` ("Socio de participación
    eliminado.") y, si se borró la única fila de una página `> 1`, retrocede una página; en
    error mantiene el modal abierto y muestra `mensajeErrorEliminarTercero(error.status)`
    (incluido el `409`).
  - Si la consulta falla, muestra `mensajeErrorListarTerceros(error.status)` con
    `role="alert"` sobre la tabla.
  - `Toast` de `shared/ui` con cierre manual.
- `index.ts`: `export { TercerosTable } from "@/features/terceros/components/TercerosTable";`
  (lo interno no se exporta).

### 5. Ruta, navegación y guardia

- `app/(dashboard)/terceros/page.tsx`: Server Component con
  `metadata = { title: "Socios de participación | Elinain" }`, encabezado "Socios de
  participación" y `<TercerosTable />`. No contiene lógica de negocio.
- `app/(dashboard)/layout.tsx`: añadir en la cabecera un `next/link` a `/terceros`
  ("Socios de participación"), sin alterar el `LogoutButton`.
- `middleware.ts`: añadir `/terceros` a `RUTAS_PROTEGIDAS` y `"/terceros"` +
  `"/terceros/:path*"` al `config.matcher`.

### 6. Tests (Jest, lógica pura)

- `schemas.test.ts`: datos válidos; cada campo requerido vacío o solo espacios produce su
  mensaje; `trim` aplicado.
- `mensajes-error.test.ts`: mapeos de listar/guardar/eliminar, incluyendo el texto exacto
  del `409` y `0` → conexión.
- `query-keys.test.ts`: `clavesTerceros.listas()` y `clavesTerceros.lista(filtros)`
  devuelven `['terceros', 'list', …]`.

### Decisiones

- **Helper de errores transversal:** se mueve `respuestaError` a `app/api/_lib/` en lugar
  de duplicarlo por feature; los mensajes específicos se pasan por parámetro. No se ubica
  en `shared/` porque construye `NextResponse` (dependencia de `next/server`, competencia
  del BFF).
- **Un solo formulario:** `TerceroForm` sirve para crear y editar cambiando `modo` y
  `valoresIniciales`, como pide el alcance.
- **Confirmación de borrado con `Modal`** (no `window.confirm`): reutiliza el sistema de
  diseño y es accesible.
- **No se actualiza el OpenAPI** (`shared/api/openapi/*`): los DTOs de terceros ya existen
  y son correctos.
- **Sin dependencias nuevas.**

## Restricciones

- No modificar `shared/api/openapi/*` ni `package.json`.
- `shared/` no importa de `features/` ni de `app/`; `features/terceros` no importa de
  `app/` ni de otro feature.
- Los componentes no llaman a `fetch` ni conocen URLs: usan hooks del feature.
- TypeScript `strict`, sin `any`; named exports; `export default` solo en `page.tsx`/
  `route.ts`.
- Textos visibles y JSDoc en español.
- Sin `useEffect` para obtener datos; sin store global.
- No tocar `app/api/auth/_lib/sesion.ts` ni el resto del feature `auth` más allá de los
  imports de `respuestaError`.

## Pasos

1. [x] Crear `app/api/_lib/respuestas.ts`; eliminar `app/api/auth/_lib/respuestas.ts` y
   actualizar los imports y mensajes de `app/api/auth/login/route.ts` y
   `app/api/auth/registro/route.ts`.
2. [x] Crear `features/terceros/types.ts`, `schemas.ts`, `mensajes-error.ts` y
   `query-keys.ts`.
3. [x] Crear `features/terceros/api/terceros.ts` y los hooks
   `useTerceros`, `useCrearTercero`, `useActualizarTercero`, `useEliminarTercero`.
4. [x] Crear `features/terceros/components/TerceroForm.tsx`,
   `EliminarTerceroModal.tsx`, `TercerosTable.tsx` y `features/terceros/index.ts`.
5. [x] Crear `app/api/terceros/route.ts` y `app/api/terceros/[id]/route.ts`.
6. [x] Crear `app/(dashboard)/terceros/page.tsx`; añadir el enlace en
   `app/(dashboard)/layout.tsx` y proteger `/terceros` en `middleware.ts`.
7. [x] Crear los tres tests en `features/terceros/__tests__/`.
8. [x] Ejecutar `npx next typegen`, `npm run format` y los checkpoints `V1`–`V4`;
   confirmar `bash .rei/init.sh` con salida `0`.
9. [x] Documentar la evidencia de `V1`–`V4` y los pasos de reproducción de `V5` en
   `.rei/progress/work-items/2026-09-22_03-04__crud-terceros-listado-modal-eliminacion/impl.md`.

## Verificación

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Pasa (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | Sin errores. |
| `V3` | `npm run typecheck` | Sin errores (requiere `npx next typegen` por las typed routes de `/terceros`). |
| `V4` | `npm test` | Suite completa en verde, incluidos los tests nuevos del feature. |
| `V5` | Validación manual | Listar/cargar, estado vacío, crear, editar, eliminar y `409` de contratos activos. |

Pasos de `V5` (requieren backend y sesión iniciada):

1. Entrar a `/terceros` con sesión: ver "Cargando…" y luego el listado o el estado vacío
   *"Aún no tienes socios de participación registrados"*.
2. Sin sesión, visitar `/terceros`: redirección a `/login`.
3. Crear un socio con los tres campos vacíos (errores en español) y luego válido:
   el modal se cierra y la tabla se refresca sin recargar.
4. Editar un socio: el modal aparece precargado; al guardar se reflejan los cambios.
5. Eliminar un socio sin contratos: confirmar y ver el `Toast` de éxito.
6. Eliminar un socio con contratos activos: ver el mensaje de `409` y que no se elimina.
7. Navegar por teclado y con `Escape` en ambos modales.

## Fuera de alcance

- Detalle de tercero en página propia y contratos asociados.
- Actualización del OpenAPI local (`shared/api/openapi/api-1.json` / `schema.d.ts`).
- Tests de componentes o hooks con estado (no hay librería de render; se validan en `V5`).
- Cambios en el sistema de diseño `shared/ui` más allá de su uso.
