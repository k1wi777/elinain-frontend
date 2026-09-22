# Diseño — Contratos: listado filtrable, apertura, detalle y edición de campos mutables

> Work Item: `2026-09-22_11-56__contratos-listado-filtro-detalle-y-edicion` (`type: feature`)
>
> Cómo se implementará. Documenta solo las decisiones necesarias para implementar el cambio;
> no es documentación de arquitectura general.

---

## Estrategia de implementación

Cuatro piezas coordinadas, reutilizando la infraestructura existente (`createBffClient`,
`createServerClient`, `ApiError`, `usePagination`/`pagination`, `respuestaError`, sistema de
diseño, patrón BFF de `terceros`/`fincas` y aislamiento feature-first):

```text
Navegador (/contratos, /contratos/nuevo, /contratos/[id], /contratos/[id]/editar)
  │  hooks de features/contratos  ──►  createBffClient()  ──►  BFF app/api/contratos/*
  ▼
BFF  ── createServerClient() ──►  backend /api/v1/contratos   (cookie httpOnly)
```

1. **BFF de contratos** (`app/api/contratos/*`): listado, creación, consulta y actualización.
   Sin eliminación (R7).
2. **Feature `contratos`**: tipos, esquemas, mensajes, utilidades puras, API, hooks y
   componentes (listado con filtro, formulario, detalle).
3. **Ampliación mínima de `features/fincas`**: exponer el hook de todas las fincas y el tipo
   `Finca` (ya existen internamente) para que `app/` componga (R45).
4. **Rutas y guardia**: páginas bajo `(dashboard)/contratos`, enlace en el layout y `/contratos`
   en el middleware (R41, R42).

---

## Archivos involucrados

```text
middleware.ts                                        # modificar: añadir /contratos y /contratos/:path*

app/
├── (dashboard)/
│   ├── layout.tsx                                   # modificar: enlace "Contratos"
│   └── contratos/
│       ├── page.tsx                                 # nuevo (server): listado
│       ├── nuevo/page.tsx                           # nuevo (server): apertura
│       ├── [id]/page.tsx                            # nuevo (server): detalle
│       ├── [id]/editar/page.tsx                     # nuevo (server): edición
│       └── _components/                             # composición client (app/)
│           ├── listado-con-relaciones.tsx           # 'use client': terceros+fincas → ContratosListado
│           ├── nuevo-con-relaciones.tsx             # 'use client': terceros+fincas → ContratoCrear
│           ├── detalle-con-relaciones.tsx           # 'use client': terceros+fincas → ContratoDetalle
│           └── editar-con-relaciones.tsx            # 'use client': terceros+fincas → ContratoEditar
└── api/
    └── contratos/
        ├── route.ts                                 # nuevo: GET (lista), POST (crear)
        └── [id]/route.ts                            # nuevo: GET (detalle), PATCH (editar)

features/contratos/
├── api/contratos.ts                                 # nuevo: 4 operaciones del BFF
├── hooks/useContratos.ts                            # nuevo: consulta de todos los contratos
├── hooks/useContrato.ts                             # nuevo: detalle por id
├── hooks/useCrearContrato.ts                        # nuevo
├── hooks/useActualizarContrato.ts                   # nuevo
├── components/ContratosListado.tsx                  # nuevo ('use client'): filtro + tabla + acciones
├── components/ContratoForm.tsx                      # nuevo ('use client'): crear/editar
├── components/ContratoCrear.tsx                     # nuevo ('use client'): conexión de apertura
├── components/ContratoEditar.tsx                    # nuevo ('use client'): conexión de edición
├── components/ContratoDetalle.tsx                   # nuevo ('use client'): detalle + placeholder
├── fechas.ts                                        # nuevo: fechas ISO (puro)
├── participacion.ts                                 # nuevo: composición de porcentajes (puro)
├── filtros.ts                                       # nuevo: filtrado/paginación cliente (puro)
├── relaciones.ts                                    # nuevo: resolución de nombres (puro)
├── query-keys.ts                                    # nuevo
├── schemas.ts                                       # nuevo: esquemas zod de crear y editar
├── mensajes-error.ts                                # nuevo: estado HTTP → mensaje español (puro)
├── types.ts                                         # nuevo: alias de DTOs + tipos propios
├── index.ts                                         # nuevo: API pública
└── __tests__/{schemas,mensajes-error,query-keys,filtros,fechas,participacion,relaciones}.test.ts   # V4

features/fincas/
└── index.ts                                         # modificar: exporta useTodasLasFincas y type Finca
```

No se modifican `package.json`, `shared/api/openapi/*`, Jest, ESLint, Prettier ni `shared/ui`
(R46). `features/terceros` ya expone `useTodosLosTerceros` y el tipo `Tercero`.

---

## BFF de contratos (`app/api/contratos/*`)

Sigue el patrón de `app/api/terceros/*` y `app/api/fincas/*`: parseo defensivo,
`createServerClient()` y `respuestaError(status, mensajes)` (R5, R6).

### `route.ts`

- `GET`: normaliza `limite`/`offset` con `normalizarLimite` y `LIMITE_POR_DEFECTO`
  (`shared/api/pagination`), llama a `GET /contratos` y responde `200` con `PaginaContratosDto`
  (R1).
- `POST`: valida de forma defensiva el cuerpo `CrearContratoDto` — `tercero_id` y `finca_id`
  strings no vacíos, `fecha_apertura` string no vacío, `porcentaje_comerciante` y
  `porcentaje_tercero` números finitos en `[0, 100]`, y los opcionales `raza` (string no vacío),
  `peso_promedio_actual`, `cantidad_actual`, `valor_kilo_referencia` (números finitos `> 0`)— y
  llama a `POST /contratos`; responde `201` con `ContratoRespuestaDto` (R2). Cuerpo inválido →
  `400`. La suma 100 se valida en el frontend y en el backend; el BFF no duplica esa regla de
  negocio (R23).

### `[id]/route.ts`

- `GET`: `GET /contratos/{id}` → `200`; `404` si no existe (R3, R33).
- `PATCH`: lee **solo** campos mutables (`estado`, `fecha_cierre`, `raza`,
  `peso_promedio_actual`, `cantidad_actual`, `valor_kilo_referencia`), exige al menos uno y
  descarta cualquier otro campo, en particular `tercero_id`, `finca_id`, `fecha_apertura` y los
  porcentajes (R4, R8, R38). `estado` ∈ `{"activo", "cerrado"}`; `fecha_cierre` string no vacío;
  los numéricos finitos `> 0`. Llama a `PATCH /contratos/{id}` → `200`.
- **No se exporta `DELETE`** (R7).

### Mensajes por estado

| Estado | Mensaje |
|--------|---------|
| `400` | "Revisa los datos del contrato." |
| `404` | "El contrato no existe." |
| restantes | Mensajes base de `respuestaError` (401/500/502) |

---

## Feature `contratos`

### `types.ts`

Alias de los DTOs generados (R47): `Contrato = ApiSchemas["ContratoRespuestaDto"]`,
`PaginaContratos = ApiSchemas["PaginaContratosDto"]`, `CrearContrato =
ApiSchemas["CrearContratoDto"]`, `ActualizarContrato = ApiSchemas["ActualizarContratoDto"]` y
`FiltrosContratos = { limite: number; offset: number }`. Tipos propios:
`EstadoContrato = "activo" | "cerrado"`, `EstadoFiltroContrato = "todos" | EstadoContrato`, y las
proyecciones que `app/` construye para resolver nombres y filtrar fincas:
`TerceroContrato = { id: string; nombre: string }` y
`FincaContrato = { id: string; nombre: string; tercero_id: string }` (R17, R21, R43, R44).

### `query-keys.ts`

```ts
clavesContratos = {
  todas: ["contratos"],
  lista: () => ["contratos", "list"],
  detalle: (id) => ["contratos", "detail", id],
}
```

El listado se cachea como un único conjunto sin filtros (el filtro es de cliente); las
mutaciones invalidan `lista()` y `detalle(id)` (R11, R39).

### `mensajes-error.ts` (puro)

`mensajeErrorListarContratos(status)`, `mensajeErrorGuardarContrato(status)` —el `400` pide
revisar los datos y el `404` indica que el contrato no existe— y `mensajeErrorDetalleContrato(status)`;
`status === 0` corresponde a fallo de conexión (R15, R28, R33, R40, R48).

### `fechas.ts` (puro)

- `fechaLocalAIso(valor: string): string`: convierte un `datetime-local` (`YYYY-MM-DDTHH:mm`) a
  ISO 8601; devuelve `""` si es inválido (R24).
- `isoAFechaLocal(iso: string): string`: inversa, para precargar el control; devuelve `""` si es
  inválido.
- `formatearFechaHora(iso: string): string`: representación legible en español para listado y
  detalle (R10, R30).

La conversión asume la zona del negocio (Colombia, UTC−5 sin horario de verano) para que la
captura y la presentación sean coherentes y verificables; los tests evitan depender de la zona
horaria del sistema (ver "Testabilidad").

### `participacion.ts` (puro)

`formatearParticipacion({ porcentaje_comerciante, porcentaje_tercero }): string` devuelve
`"60% / 40%"` (comerciante / tercero), la única columna de participación (R10).

### `filtros.ts` (puro)

- `filtrarContratosPorEstado(contratos: Contrato[], filtro: EstadoFiltroContrato): Contrato[]`
  (R12).
- `paginarContratos(contratos: Contrato[], limite: number, offset: number): Contrato[]`: recorta
  la página visible acotando el offset a un rango válido, de modo que un cambio de filtro nunca
  deje la tabla vacía por un offset fuera de rango (R11).

### `relaciones.ts` (puro)

- `indexarNombres(elementos: { id: string; nombre: string }[]): Map<string, string>`.
- `nombreDeTercero(indice, terceroId): string` y `nombreDeFinca(indice, fincaId): string` con
  texto de respaldo ("Socio no disponible" / "Finca no disponible") para ids sin resolver (R18).
- `fincasDeTercero(fincas: FincaContrato[], terceroId: string): FincaContrato[]` para el selector
  de finca filtrado por tercero (R21).

### `schemas.ts`

- `esquemaCrearContrato` (zod): `tercero_id` y `finca_id` strings recortados no vacíos;
  `fecha_apertura` string no vacío; `porcentaje_comerciante` y `porcentaje_tercero` números en
  `[0, 100]`; `raza` string opcional; `peso_promedio_actual`, `cantidad_actual` y
  `valor_kilo_referencia` números `> 0` opcionales. Añade `.refine` de que la suma sea
  exactamente 100 con un mensaje en español (R23, R25).
- `esquemaEditarContrato` (zod): `estado` ∈ `{activo, cerrado}`, `fecha_cierre` string opcional,
  `raza` opcional, numéricos `> 0` opcionales, con `.refine` de que `cerrado` exija
  `fecha_cierre` (R35, R37).
- Tipos inferidos `DatosFormularioCrearContrato` y `DatosFormularioEditarContrato`.

### `api/contratos.ts`

Funciones sobre `createBffClient()` que propagan `ApiError`:

```ts
listarContratos(filtros: FiltrosContratos): Promise<PaginaContratos>
listarTodosLosContratos(): Promise<Contrato[]>          // pagina con LIMITE_MAXIMO hasta total
obtenerContrato(id: string): Promise<Contrato>
crearContrato(datos: CrearContrato): Promise<Contrato>
actualizarContrato(id: string, datos: ActualizarContrato): Promise<Contrato>
```

`listarTodosLosContratos` recorre `GET /api/contratos` con `limite = LIMITE_MAXIMO` desde
`offset = 0` acumulando páginas hasta alcanzar `total`; reutiliza `listarContratos` (R11). No
existe `eliminarContrato` (R7).

### `hooks/`

- `useContratos()`: `useQuery<Contrato[], ApiError>` con clave `clavesContratos.lista()` y
  `queryFn: listarTodosLosContratos` (R11).
- `useContrato(id)`: `useQuery` con clave `detalle(id)`, habilitada solo con `id` (R29).
- `useCrearContrato()`: mutación; al completarse invalida `lista()` (R27).
- `useActualizarContrato()`: mutación `{ id, datos }`; invalida `lista()` y `detalle(id)` (R39).

Nunca se obtienen datos con `useEffect` ni se llama a `fetch` desde componentes.

### Componentes

- **`ContratosListado`** (`'use client'`, props `{ terceros: TerceroContrato[]; fincas:
  FincaContrato[] }`): estado local del filtro `EstadoFiltroContrato` (por defecto `todos`);
  `useContratos()`; calcula en render `filtrarContratosPorEstado` y llama a
  `usePagination({ total: filtrados.length })`; muestra `paginarContratos(filtrados, limite,
  offset)`. Al cambiar el filtro llama a `paginacion.reiniciar()` para volver a la página 1. La
  `Table` de `shared/ui` recibe las columnas Fecha de apertura, Tercero, Finca, Estado y
  Participación (`formatearParticipacion`), con `cargando` y `mensajeVacio`, y las acciones "Ver
  detalle" y "Editar" como `next/link` a `/contratos/[id]` y `/contratos/[id]/editar`. Botón
  "Nuevo contrato" hacia `/contratos/nuevo`. Error de carga con `role="alert"` (R9–R16).
- **`ContratoForm`** (`'use client'`): `useForm` + `zodResolver` con uno de los dos esquemas según
  `modo`.
  - **Crear**: `Select` de tercero, `Select` de finca con las opciones de
    `fincasDeTercero(fincas, terceroElegido)` (R21), `Input type="datetime-local"` para
    `fecha_apertura`, `Input` numéricos de porcentajes con autocompletado del complemento a 100
    vía `setValue` (R22) y campos opcionales. Al enviar convierte la fecha con `fechaLocalAIso`
    (R24).
  - **Editar**: muestra tercero, finca, fecha de apertura y porcentajes deshabilitados/solo
    lectura (R36); `Select` de estado, `Input datetime-local` de fecha de cierre, raza y
    numéricos mutables (R35). Al pasar a `cerrado` exige y autocompleta `fecha_cierre` con la
    fecha actual si está vacía; al volver a `activo` la limpia (R37).
- **`ContratoCrear`** (`'use client'`, props `{ terceros, fincas }`): conecta `ContratoForm` con
  `useCrearContrato`; en éxito muestra confirmación y navega a `/contratos/[id]` con
  `router.push` (R26–R28).
- **`ContratoEditar`** (`'use client'`, props `{ id, terceros, fincas }`): obtiene el contrato con
  `useContrato(id)` y lo precarga; conecta con `useActualizarContrato` enviando solo campos
  mutables; en éxito navega al detalle del contrato (R34, R38–R40).
- **`ContratoDetalle`** (`'use client'`, props `{ id, terceros, fincas }`): `useContrato(id)`;
  muestra todos los datos resolviendo nombres con `relaciones.ts` y "—" para valores no
  informados; incluye el placeholder visible "Próximamente: compras, ventas, ciclos y costos" y
  una acción "Editar" (R29–R33).

### `index.ts`

API pública mínima: `ContratosListado`, `ContratoCrear`, `ContratoEditar`, `ContratoDetalle` y
los tipos `TerceroContrato` y `FincaContrato` que `app/` construye (R43, R44).

---

## Ampliación de `features/fincas`

Con lo mínimo para que `app/` resuelva nombres y filtre fincas sin romper el aislamiento (R45):
`index.ts` pasa a exportar `useTodasLasFincas` (ya existe en `hooks/useTodasLasFincas.ts` y usa
`listarTodasLasFincas`) y el tipo `Finca` (ya existe en `types.ts`). No se crea lógica nueva ni
se modifican `api/`, `hooks/` ni componentes.

---

## Composición en `app/`

Los cuatro wrappers client (`_components/*-con-relaciones.tsx`) usan `useTodosLosTerceros` y
`useTodasLasFincas`, manejan en render su carga/error, transforman `Tercero[]` a
`TerceroContrato[]` y `Finca[]` a `FincaContrato[]`, y los pasan por props al componente del
feature. Así `features/contratos` nunca importa de `features/terceros` ni de `features/fincas`
(R43, R44). Las páginas bajo `(dashboard)/contratos` son Server Components delgados que solo
resuelven `params` y renderizan el wrapper (R9, R19, R29, R34).

---

## Rutas y guardia

- **`middleware.ts`**: añadir `/contratos` a `RUTAS_PROTEGIDAS` y `"/contratos"`,
  `"/contratos/:path*"` al `matcher` (R41).
- **`app/(dashboard)/layout.tsx`**: añadir el enlace "Contratos" junto a "Socios de
  participación" y "Fincas" (R42).

---

## Decisiones de diseño

- **D1. BFF dedicado por operación.** Reproduce el patrón de `terceros`/`fincas`: la cookie
  httpOnly se adjunta en el servidor y la UI nunca conoce las URLs del backend (R5, R47).
- **D2. Filtro y paginación en el cliente.** El backend no filtra por estado; se cargan todos
  los contratos y se filtran/paginan en el cliente para que el total y las páginas reflejen el
  filtro (R11, R12).
- **D3. Carga completa con `LIMITE_MAXIMO`.** Reutiliza el bucle de paginación ya usado por
  terceros y fincas (R11).
- **D4. Detalle en ruta propia.** `/contratos/[id]` con todos los datos y el placeholder de
  secciones futuras (decisión acordada) (R29–R31).
- **D5. Un formulario con `modo`.** `ContratoForm` cubre crear y editar; los campos y esquemas
  difieren por modo (R20, R35, R36).
- **D6. Porcentajes en una sola columna.** `formatearParticipacion` centraliza el formato
  `"60% / 40%"` (R10).
- **D7. `datetime-local` → ISO 8601.** La captura es local y la conversión se aísla en
  `fechas.ts` (R24).
- **D8. Estado y fecha de cierre acoplados.** `cerrado` exige `fecha_cierre` (autocompletada con
  hoy si falta) y `activo` la limpia (R37).
- **D9. Inmutables deshabilitados y nunca enviados.** La UI los muestra en solo lectura y el
  `PATCH` solo transporta campos mutables; el BFF además los descarta (defensa en profundidad)
  (R8, R36, R38).
- **D10. Nombres resueltos en `app/`.** El backend solo devuelve ids; `app/` compone las
  proyecciones `TerceroContrato`/`FincaContrato` y las pasa como props (R17, R43, R44).
- **D11. Sin eliminación.** No se expone `DELETE` porque el backend no lo ofrece; cerrar un
  contrato es cambiar su estado (R7).
- **D12. Tipos desde el OpenAPI.** Los DTOs se derivan de `ApiSchemas`; no se redefinen a mano
  (R47).
- **D13. Zona horaria del negocio.** Las fechas se interpretan y presentan en la zona de Colombia
  (UTC−5, sin DST) para que captura y lectura sean coherentes (R24, R10, R30).

## Alternativas descartadas

- **Filtrar por estado en el backend (`?estado=`):** el endpoint no lo soporta; no se toca el
  OpenAPI (R46).
- **Paginar en servidor y filtrar solo la página visible:** el total y las páginas no
  reflejarían el filtro, contra la decisión acordada (R12).
- **Detalle en modal:** se acordó una ruta propia para dejar espacio a las secciones futuras
  (R29, R31).
- **Reutilizar `esquemaCrearContrato` en edición:** los campos y reglas difieren; se separan los
  esquemas (R35, R37).
- **Enviar los porcentajes u otros inmutables en el `PATCH`:** contradice la inmutabilidad del
  backend y R36/R38.
- **Añadir `DELETE`:** el backend no lo ofrece (R7).
- **Que `features/contratos` importe `Tercero`/`Finca` de otros features:** rompe el aislamiento;
  se usan proyecciones y se compone en `app/` (R43, R44).
- **Store global de contratos:** contra `architecture.md`; el server state lo cubre TanStack
  Query.

---

## Testabilidad y verificación

**Automatizable con Jest (`V4`, lógica pura, sin red ni render):**

- `__tests__/schemas.test.ts`: obligatorios, rangos de porcentajes, suma exactamente 100
  (válida y no válida), opcionales `> 0` y acoplamiento estado/`fecha_cierre` (R23, R25, R37).
- `__tests__/mensajes-error.test.ts`: mapeo de `400`/`404`/`0` y estados genéricos (R15, R28,
  R40, R48).
- `__tests__/query-keys.test.ts`: forma estable de `todas`, `lista` y `detalle(id)` (R49).
- `__tests__/filtros.test.ts`: cada valor de filtro, conjunto vacío y acotado de offset en
  `paginarContratos` (R11, R12).
- `__tests__/fechas.test.ts`: ida y vuelta `fechaLocalAIso`/`isoAFechaLocal`, entradas inválidas
  y formato de presentación; debe evitar depender de la zona del sistema (usar round-trip o
  `timeZone` fijo) (R24).
- `__tests__/participacion.test.ts`: `"60% / 40%"` y casos con enteros y decimales (R10).
- `__tests__/relaciones.test.ts`: índice, respaldos y `fincasDeTercero` (R18, R21).

**No cubierto por Jest (validación manual `V5`):** render, autocompletado de porcentajes,
filtro y paginación interactivos, conversión de fecha en el navegador, flujo completo contra el
backend, modales/estados y accesibilidad percibida.

---

## Restricciones

- Raíz del repo, sin `src/`; `middleware.ts` en la raíz.
- TypeScript `strict`: sin `any` ni `@ts-ignore`.
- Named exports; `export default` solo donde Next lo exige (`page`).
- `'use client'` en el nodo más bajo.
- Sin `fetch` en componentes ni obtención de datos con `useEffect`.
- El BFF propaga el código HTTP real; no convierte errores en `200`.
- Sin dependencias nuevas ni cambios en el OpenAPI local (R46).
- Fuera de alcance: eliminación de contratos, compras, ventas, ciclos y costos.

---

## Verificación prevista

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Prettier en verde (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | ESLint sin errores. |
| `V3` | `npm run typecheck` | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Suite en verde, incluidos los tests de lógica pura nuevos. |
| `V5` | Validación manual | Listado/vacío, filtro, abrir contrato, detalle con placeholder, edición con inmutables y cierre/acoplamiento de fecha. |
