# Diseño — Fincas: listado y mapa de pines, CRUD con ubicación geocodificada y eliminación con 409

> Work Item: `2026-09-22_10-07__fincas-listado-mapa-geocodificacion-y-crud` (`type: feature`)
>
> Cómo se implementará. Documenta solo las decisiones necesarias para implementar el cambio;
> no es documentación de arquitectura general.

---

## Estrategia de implementación

Cinco piezas coordinadas, reutilizando la infraestructura existente (`createBffClient`,
`createServerClient`, `ApiError`, `usePagination`/`pagination`, `respuestaError`, sistema de
diseño y aislamiento feature-first):

```text
Navegador (/fincas, /fincas/nueva, /fincas/[id]/editar)
  │  hooks de features/fincas  ──►  createBffClient()  ──►  BFF app/api/fincas/* y app/api/geocodificacion
  ▼
BFF  ── createServerClient() ──►  backend /api/v1/fincas          (cookie httpOnly)
     └─ nominatim.ts         ──►  nominatim.openstreetmap.org      (solo servidor, User-Agent + caché)
```

1. **BFF de fincas** (`app/api/fincas/*`): listado, creación, consulta, actualización y borrado.
2. **BFF de geocodificación** (`app/api/geocodificacion/route.ts`): proxy autenticado a Nominatim.
3. **Feature `fincas`**: API, hooks, esquemas, mensajes, componentes (tabla, mapa, formulario,
   modales) y utilidades puras.
4. **Feature `terceros`** (ampliación mínima): hook para cargar todos los terceros y `Tercero`
   exportados; la composición de nombres ocurre en `app/`.
5. **Rutas y guardia**: páginas bajo `(dashboard)/fincas`, enlace en el layout y `/fincas` en el
   middleware.

---

## Archivos involucrados

```text
middleware.ts                                      # modificar: añadir /fincas y /fincas/:path*

app/
├── (dashboard)/
│   ├── layout.tsx                                 # modificar: enlace "Fincas"
│   └── fincas/
│       ├── page.tsx                               # nuevo (server): renderiza el listado
│       ├── nueva/page.tsx                         # nuevo (server): renderiza la creación
│       ├── [id]/editar/page.tsx                   # nuevo (server): renderiza la edición
│       └── _components/                           # composición client (app/)
│           ├── listado-con-propietarios.tsx       # 'use client': terceros → FincasTabs
│           ├── nueva-con-propietarios.tsx         # 'use client': terceros → FincaCrear
│           └── editar-con-propietarios.tsx        # 'use client': terceros → FincaEditar
└── api/
    ├── fincas/
    │   ├── route.ts                               # nuevo: GET (lista), POST (crear)
    │   └── [id]/route.ts                          # nuevo: GET, PATCH, DELETE
    └── geocodificacion/
        ├── route.ts                               # nuevo: GET proxy autenticado
        └── _lib/
            ├── nominatim.ts                       # nuevo (interno): caché, throttle, parseo
            └── __tests__/nominatim.test.ts        # V4

features/fincas/
├── api/fincas.ts                                  # nuevo: 6 operaciones del BFF
├── api/geocodificacion.ts                         # nuevo: buscarCoordenadas
├── hooks/useFincas.ts                             # nuevo: consulta paginada
├── hooks/useTodasLasFincas.ts                     # nuevo: todos los pines del mapa
├── hooks/useFinca.ts                              # nuevo: detalle por id
├── hooks/useCrearFinca.ts                         # nuevo
├── hooks/useActualizarFinca.ts                    # nuevo
├── hooks/useEliminarFinca.ts                      # nuevo
├── hooks/useGeocodificacion.ts                    # nuevo: mutación de búsqueda
├── components/FincasTabs.tsx                      # nuevo ('use client'): pestañas Listado/Mapa
├── components/FincasTable.tsx                     # nuevo ('use client'): tabla + acciones + borrado
├── components/FincasMapa.tsx                      # nuevo ('use client'): Leaflet + popups + detalle
├── components/FincaForm.tsx                       # nuevo ('use client'): formulario crear/editar
├── components/SelectorMapa.tsx                    # nuevo ('use client'): Leaflet del formulario
├── components/FincaDetalleModal.tsx               # nuevo ('use client')
├── components/EliminarFincaModal.tsx              # nuevo ('use client')
├── components/FincaCrear.tsx                      # nuevo ('use client'): conexión crear
├── components/FincaEditar.tsx                     # nuevo ('use client'): conexión editar
├── propietarios.ts                                # nuevo: índice y nombre de propietario (puro)
├── query-keys.ts                                  # nuevo
├── schemas.ts                                     # nuevo: esquema zod del formulario
├── mensajes-error.ts                              # nuevo: estado HTTP → mensaje español (puro)
├── types.ts                                       # nuevo: alias de DTOs + Propietario
├── index.ts                                       # nuevo: API pública (FincasTabs, FincaCrear, FincaEditar, Propietario)
└── __tests__/{schemas,mensajes-error,query-keys,propietarios}.test.ts   # V4

features/terceros/
├── api/terceros.ts                                # modificar: listarTodosLosTerceros()
├── hooks/useTodosLosTerceros.ts                   # nuevo
├── query-keys.ts                                  # modificar: clavesTerceros.todos
└── index.ts                                       # modificar: exporta useTodosLosTerceros y type Tercero
```

No se modifican `package.json`, `shared/api/openapi/*`, Jest, ESLint, Prettier ni
`shared/ui`. `leaflet` y `react-leaflet` ya están instalados (R48).

---

## BFF de fincas (`app/api/fincas/*`)

Sigue el patrón ya establecido en `app/api/terceros/*`: parseo defensivo, `createServerClient()`
y `respuestaError(status, mensajes)` (R6, R7).

### `route.ts`

- `GET`: normaliza `limite`/`offset` con `normalizarLimite` y `LIMITE_POR_DEFECTO`
  (`shared/api/pagination`), llama a `GET /fincas` y responde `200` con `PaginaFincasDto` (R1).
- `POST`: valida `{tercero_id, nombre, direccion, latitud, longitud}` (los cinco presentes,
  strings no vacíos, números finitos en rango) y llama a `POST /fincas`; responde `201` con
  `FincaRespuestaDto` (R2). Cuerpo inválido → `400`.

### `[id]/route.ts`

- `GET`: `GET /fincas/{id}` → `200`; `404` si no existe (R3, R39).
- `PATCH`: valida `{nombre?, direccion?, latitud?, longitud?}` (al menos uno, tipos y rangos) y
  llama a `PATCH /fincas/{id}` → `200` (R4). Nunca envía `tercero_id` (R37).
- `DELETE`: `DELETE /fincas/{id}` → `204`; propaga `409` con mensaje propio (R5, R8).

### Mensajes por estado

| Estado | Mensaje |
|--------|---------|
| `400` | "Revisa los datos de la finca." |
| `404` | "La finca no existe." |
| `409` | "No se puede eliminar la finca porque tiene contratos vinculados." |

---

## BFF de geocodificación (`app/api/geocodificacion/*`)

### `route.ts`

- `GET /api/geocodificacion?consulta=<texto>`.
- Sesión: lee la cookie con `cookies()` + `SESSION_COOKIE_NAME` y evalúa `sesionVigente`; sin
  sesión vigente responde `401` sin llamar a Nominatim (R11). Es una guardia coherente con el
  middleware; la autorización fuerte sigue en el backend.
- `consulta` vacía o ausente → `400` (R14).
- Delega en `geocodificar(consulta)` y responde `200 { latitud, longitud, etiqueta }` (R13) o
  `404` si no hay coincidencia (R14); un fallo del servicio externo se traduce a `502`
  (`respuestaError` ya mapea `status === 0` a `502`).

### `_lib/nominatim.ts` (interno)

- Consulta `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=<consulta>` con
  `User-Agent` propio de la aplicación y `Accept-Language: es` (R12). El navegador nunca llama a
  Nominatim (R10).
- **Caché** en memoria (`Map`) indexada por consulta normalizada (recortada y en minúsculas) con
  límite de entradas, para no repetir consultas idénticas (R12).
- **Cadencia**: marca temporal de la última petición; si han pasado menos de ~1 s, espera lo
  restante antes de consultar (R12). La UI además deshabilita el botón mientras hay una búsqueda
  en curso, evitando ráfagas.
- `parsearRespuestaNominatim(datos): CoincidenciaGeocodificacion | null`: función **pura** que
  toma el primer elemento, exige `lat`/`lon` numéricos y devuelve
  `{ latitud, longitud, etiqueta }`; se prueba con Jest (`V4`).
- El contrato de respuesta del proxy (`{ latitud, longitud, etiqueta }`) coincide con el tipo
  `ResultadoGeocodificacion` del feature (`features/fincas/types.ts`).

---

## Feature `fincas`

### `types.ts`

Alias de los DTOs generados (R49): `Finca = ApiSchemas["FincaRespuestaDto"]`,
`PaginaFincas`, `CrearFinca = ApiSchemas["CrearFincaDto"]`,
`ActualizarFinca = ApiSchemas["ActualizarFincaDto"]`, `FiltrosFincas = { limite; offset }`.
Tipos propios: `Propietario = { id: string; nombre: string }` y
`ResultadoGeocodificacion = { latitud: number; longitud: number; etiqueta: string }`.

### `api/fincas.ts` y `api/geocodificacion.ts`

Funciones sobre `createBffClient()` que propagan `ApiError`:

```ts
listarFincas(filtros: FiltrosFincas): Promise<PaginaFincas>
listarTodasLasFincas(): Promise<Finca[]>          // pagina con LIMITE_MAXIMO hasta total
obtenerFinca(id: string): Promise<Finca>
crearFinca(datos: CrearFinca): Promise<Finca>
actualizarFinca(id: string, datos: ActualizarFinca): Promise<Finca>
eliminarFinca(id: string): Promise<void>
buscarCoordenadas(consulta: string): Promise<ResultadoGeocodificacion>
```

`listarTodasLasFincas` recorre `GET /api/fincas` con `limite = LIMITE_MAXIMO` (100) desde
`offset = 0`, acumulando páginas hasta alcanzar `total` (R22). Reutiliza `listarFincas`.

### `query-keys.ts`

```ts
clavesFincas = {
  todas: ["fincas"],
  listas: () => ["fincas", "list"],
  lista: (filtros) => ["fincas", "list", filtros],
  mapa: () => ["fincas", "mapa"],
  detalle: (id) => ["fincas", "detail", id],
}
```

Las mutaciones de crear/editar/eliminar invalidan `listas()`, `mapa()` y `detalle(id)` (R38,
R42).

### `schemas.ts` y `mensajes-error.ts`

- `esquemaFinca` (zod): `tercero_id` y `nombre` y `direccion` como strings recortados no vacíos;
  `latitud` como número finito entre -90 y 90; `longitud` como número finito entre -180 y 180.
  Mensajes en español; "Ubica la finca en el mapa." cuando falta la posición (R31, R32, R50).
- `mensajes-error.ts`: funciones puras `mensajeErrorListarFincas(status)`,
  `mensajeErrorGuardarFinca(status)`, `mensajeErrorEliminarFinca(status)` —el `409` explica los
  contratos vinculados— y `mensajeErrorGeocodificacion(status)` —el `404` indica que no se
  encontró la dirección— (R19, R35, R41, R43, R50).
- `propietarios.ts`: `indexarPropietarios(propietarios): Map<string, string>` y
  `nombreDePropietario(propietariosPorId, terceroId): string` con texto de respaldo
  ("Propietario no disponible") para ids sin resolver (R21, R44).

### `hooks/`

Consultas y mutaciones de TanStack Query con error tipado `ApiError`:
`useFincas(filtros)` (con `keepPreviousData`), `useTodasLasFincas()` (clave `mapa()`),
`useFinca(id)` (habilitada solo con id), `useCrearFinca`, `useActualizarFinca`,
`useEliminarFinca` y `useGeocodificacion` (mutación de `buscarCoordenadas`, sin query key).
Nunca se obtienen datos con `useEffect` ni se llama a `fetch` desde componentes.

### Componentes

- **`FincasTabs`** (`'use client'`): estado local para la pestaña activa ("Listado"/"Mapa",
  accesible con `role="tablist"`); renderiza `FincasTable` y, para el mapa,
  `dynamic(() => import("./FincasMapa"), { ssr: false, loading: … })` (R15, R25).
- **`FincasTable`**: `usePagination` + `useFincas`; columnas Nombre, Dirección, Propietario
  (resuelto con `propietarios`) y Acciones (Editar → `next/link` a `/fincas/[id]/editar`,
  Eliminar → modal). Usa `Table` de `shared/ui` con `cargando` y `mensajeVacio` (R16–R21).
- **`FincasMapa`** (`'use client'`, Leaflet): `MapContainer` + `TileLayer` de OpenStreetMap con
  atribución obligatoria; `useTodasLasFincas`; un `Marker` por finca con `Popup` (nombre,
  propietario, dirección y botón "Ver detalle" → `FincaDetalleModal`); ajusta la vista con
  `fitBounds` cuando hay fincas (R22–R26). Los marcadores usan `L.divIcon` con SVG en línea para
  no depender de los assets de Leaflet con el bundler. Importa `leaflet/dist/leaflet.css`.
- **`FincaForm`** (`'use client'`): `useForm` + `zodResolver`; `Select` de propietario (deshabilitado
  en edición, R37), `Input` de nombre y dirección; `SelectorMapa` cargado con `dynamic(..., { ssr:
  false })`; botón "Ubicar dirección" que ejecuta `useGeocodificacion` y centra el mapa. Envía
  con `handleSubmit`; errores de campo en español y error general con `role="alert"` (R28–R33).
- **`SelectorMapa`** (`'use client'`, Leaflet): mapa con centro por defecto (Colombia), pin
  arrastrable y colocación por clic mediante `useMapEvents`; comunica la posición al formulario
  (`latitud`/`longitud` por `setValue`). La posición del pin es la fuente de verdad; la etiqueta
  que devuelve Nominatim **no** se escribe en `direccion` (R29, R30).
- **`FincaCrear`** / **`FincaEditar`** (`'use client'`): conectan el formulario con las
  mutaciones; `FincaEditar` obtiene la finca con `useFinca(id)` y precarga el formulario. En
  éxito muestran confirmación (el `Toast`/estado del contenedor) y navegan a `/fincas` con
  `router.push` + `router.refresh` (R34, R38).
- **`EliminarFincaModal`**: confirmación con el `Modal` accesible; muestra el error de la
  operación —incluido el `409`— sin cerrar el diálogo (R40, R41, R43).
- **`FincaDetalleModal`**: información general de la finca (nombre, propietario, dirección y
  coordenadas) y acción "Editar" (R24).

### `index.ts`

API pública mínima: `FincasTabs`, `FincaCrear`, `FincaEditar` y el tipo `Propietario`.

---

## Ampliación de `features/terceros`

Con lo mínimo necesario para que `app/` componga los propietarios sin romper el aislamiento
(R45):

- `api/terceros.ts`: `listarTodosLosTerceros(): Promise<Tercero[]>` recorre `GET /api/terceros`
  con `LIMITE_MAXIMO` hasta `total` (mismo patrón que `listarTodasLasFincas`).
- `hooks/useTodosLosTerceros.ts`: `useQuery` con clave `clavesTerceros.todos()`.
- `query-keys.ts`: añade `todos: () => ["terceros", "todos"]`.
- `index.ts`: exporta `useTodosLosTerceros` y el tipo `Tercero`.

No se modifican los hooks de mutación existentes: la lista de nombres se refresca al montar la
vista y la edición de terceros no forma parte de este Work Item.

---

## Composición en `app/`

Los tres wrappers client (`_components/*-con-propietarios.tsx`) usan `useTodosLosTerceros`,
transforman el resultado a `Propietario[]` y lo pasan por props a `FincasTabs` / `FincaCrear` /
`FincaEditar`. Manejan en render el estado de carga/error de terceros. Así `features/fincas`
nunca importa de `features/terceros` (R44, R45). Las páginas bajo `(dashboard)/fincas` son
Server Components delgados que solo renderizan el wrapper correspondiente (R15, R27, R36).

---

## Rutas y guardia

- **`middleware.ts`**: añadir `/fincas` a `RUTAS_PROTEGIDAS` y `"/fincas"`, `"/fincas/:path*"`
  al `matcher` (R46).
- **`app/(dashboard)/layout.tsx`**: añadir el enlace "Fincas" junto a "Socios de participación"
  (R47).

---

## Decisiones de diseño

- **D1. BFF dedicado por operación.** Reproduce el patrón de `terceros`: la cookie httpOnly se
  adjunta en el servidor y la UI nunca conoce las URLs del backend (R7, R46, R49).
- **D2. Geocodificación por proxy BFF.** Evita CORS, permite enviar `User-Agent` propio, cachear
  y respetar la política de Nominatim, y no expone el servicio externo al navegador (R9–R14).
- **D3. El propietario se resuelve en `app/`.** El backend no devuelve el nombre; `app/` carga
  todos los terceros con `useTodosLosTerceros` y pasa `Propietario[]` al feature (R44, R45).
- **D4. Carga completa de terceros y fincas.** Tanto los nombres de propietario como los pines
  del mapa necesitan la colección completa; se pagina con `LIMITE_MAXIMO` hasta `total` en vez
  de limitarse a la página del listado (R22, R44).
- **D5. Una sola ruta con pestañas.** `/fincas` conmuta Listado/Mapa con estado local; no se
  crean rutas por vista (decisión acordada con el usuario) (R15).
- **D6. Formulario reutilizado.** El mismo `FincaForm` sirve para crear y editar; el modo
  deshabilita el propietario y cambia la operación de envío (R28, R36, R37).
- **D7. La posición del pin es la fuente de verdad.** La dirección solo centra el mapa; las
  coordenadas persistidas salen del pin (R29, R30).
- **D8. "Ver detalle" abre un modal.** No se añade una ruta de detalle (decisión acordada)
  (R24).
- **D9. Mapa client-only.** `dynamic(..., { ssr: false })` en los componentes que importan
  Leaflet, con `'use client'` en el nodo más bajo; CSS de Leaflet importado en esos componentes
  (R25).
- **D10. Marcadores con `divIcon`.** Evita la resolución de los PNG por defecto de Leaflet en el
  bundler y no añade dependencias (R48).
- **D11. Validación zod antes de enviar.** Rangos y campos obligatorios se comprueban en el
  frontend; el backend sigue siendo la autoridad final (R31, R32).
- **D12. Tipos desde el OpenAPI.** Los DTOs de fincas se derivan de `ApiSchemas`; no se
  redefinen a mano (R49).

## Alternativas descartadas

- **Llamar a Nominatim desde el navegador:** CORS, política de uso y `User-Agent` no
  controlables. Descartado (R10).
- **Pestañas como rutas separadas (`/fincas/mapa`):** el usuario acordó una única ruta con
  pestañas.
- **Ruta dedicada de detalle:** acordado como modal (R24).
- **Pasar el tipo `Tercero` de `features/terceros` a `features/fincas`:** rompe el aislamiento
  entre features; se introduce `Propietario` en `fincas` y se mapea en `app/` (R45).
- **Cargar solo la primera página de terceros para resolver nombres:** dejaría sin nombre a los
  propietarios fuera de esa página (R44).
- **Unir la edición del propietario en el formulario:** el `PATCH` no acepta `tercero_id` y está
  fuera de alcance (R37).
- **Librería de mapas con API key o dependencia nueva:** prohibido por R48; `leaflet` +
  `react-leaflet` ya están instalados.
- **Store global de fincas:** contra `architecture.md`; el server state lo cubre TanStack Query.

---

## Testabilidad y verificación

**Automatizable con Jest (`V4`, lógica pura, sin red ni render):**

- `features/fincas/__tests__/schemas.test.ts`: campos obligatorios y límites de latitud/longitud
  (incluidos `-90/90` y `-180/180`).
- `features/fincas/__tests__/mensajes-error.test.ts`: mapeo de `400`/`404`/`409`/`0` y estados
  genéricos.
- `features/fincas/__tests__/query-keys.test.ts`: forma estable de las claves.
- `features/fincas/__tests__/propietarios.test.ts`: índice y texto de respaldo (R21, R44).
- `app/api/geocodificacion/_lib/__tests__/nominatim.test.ts`: `parsearRespuestaNominatim` con
  respuesta válida, vacía y malformada.

**No cubierto por Jest (validación manual `V5`):** render e interacción del mapa, arrastre del
pin, geocodificación real contra Nominatim, flujo completo contra el backend, paginación,
modales y accesibilidad percibida.

---

## Restricciones

- Raíz del repo, sin `src/`; `middleware.ts` en la raíz.
- TypeScript `strict`: sin `any` ni `@ts-ignore`.
- Named exports; `export default` solo donde Next lo exige.
- `'use client'` en el nodo más bajo; Leaflet solo con import dinámico y sin SSR.
- Sin `fetch` en componentes ni obtención de datos con `useEffect`.
- El BFF propaga el código HTTP real; no convierte errores en `200`.
- Sin dependencias nuevas (R48).
- Fuera de alcance: edición del tercero propietario, contratos asociados y cambios en el OpenAPI
  local.

---

## Verificación prevista

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Prettier en verde (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | ESLint sin errores. |
| `V3` | `npm run typecheck` | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Suite en verde, incluidos los tests de lógica pura nuevos. |
| `V5` | Validación manual | Listado/vacío, mapa con pines, popup y detalle, crear con geocodificación, editar, eliminar y `409`. |
