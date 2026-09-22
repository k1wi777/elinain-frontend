# Diseño — Fincas: mapa acotado a Colombia, sugerencias de dirección con Photon y relleno inverso desde el pin

> Work Item: `2026-09-22_13-39__fincas-mapa-colombia-sugerencias-photon-y-direccion-inversa` (`type: feature`)
>
> Cómo se implementará. Documenta solo las decisiones necesarias para implementar el cambio;
> no es documentación de arquitectura general.

---

## Estrategia de implementación

Se reutiliza la infraestructura existente (`createBffClient`, `respuestaError`, `sesionVigente`,
`ApiError`, TanStack Query, `Input` de `shared/ui`, `leaflet`/`react-leaflet`) y se sustituye
Nominatim por Photon en el proxy BFF, ampliándolo con sugerencias e inversa. El feature gana un
combobox de sugerencias y el formulario rellena la dirección a partir del pin.

```text
Navegador (FincaForm → AutocompletarDireccion / SelectorMapa)
  │  hooks de features/fincas ──► createBffClient()
  ▼
BFF app/api/geocodificacion/{route,sugerencias/route,inversa/route}
  └─ _lib/photon.ts ──► https://photon.komoot.io  (solo servidor: User-Agent, cadencia, caché, bbox Colombia)
```

1. **BFF Photon** (`app/api/geocodificacion/*`): tres endpoints, un cliente interno y una guardia
   de sesión compartida.
2. **Feature `fincas`**: API, hooks (sugerencias por `useQuery`, inversa por `useMutation`),
   combobox `AutocompletarDireccion`, cambios en `FincaForm`, límites compartidos de mapa y
   mensajes de error.
3. **`shared/lib`**: un hook genérico de valor debounced.
4. **Retiro**: se eliminan `_lib/nominatim.ts` y su test.

---

## Archivos involucrados

```text
app/api/geocodificacion/
├── route.ts                                  # modificar: delega en photon.ts + guardia compartida
├── sugerencias/route.ts                      # nuevo: GET sugerencias
├── inversa/route.ts                          # nuevo: GET geocodificación inversa
└── _lib/
    ├── photon.ts                             # nuevo (interno): cliente, caché, cadencia, parseo y formato
    ├── sesion.ts                             # nuevo (interno): guardia de sesión del BFF
    ├── nominatim.ts                          # ELIMINAR
    └── __tests__/
        ├── photon.test.ts                    # nuevo (V4)
        └── nominatim.test.ts                 # ELIMINAR

features/fincas/
├── api/geocodificacion.ts                    # modificar: + sugerencias + inversa
├── hooks/useGeocodificacion.ts               # sin cambios (búsqueda por botón)
├── hooks/useSugerenciasDireccion.ts          # nuevo: useQuery con enabled y caché
├── hooks/useGeocodificacionInversa.ts        # nuevo: useMutation de coordenadas
├── components/AutocompletarDireccion.tsx     # nuevo: combobox accesible
├── components/FincaForm.tsx                  # modificar: combobox, selección y relleno inverso
├── components/SelectorMapa.tsx               # modificar: límites de Colombia
├── components/FincasMapa.tsx                 # modificar: límites de Colombia
├── mapa.ts                                   # nuevo: constantes geográficas de Colombia (puro)
├── mensajes-error.ts                         # modificar: + mensaje de inversa
├── query-keys.ts                             # modificar: + sugerencias
└── __tests__/
    ├── mensajes-error.test.ts                # modificar
    └── query-keys.test.ts                    # modificar

shared/lib/
└── use-valor-debounced.ts                    # nuevo: hook genérico de valor debounced
```

No se modifican `package.json`, `shared/api/openapi/*`, `shared/ui`, Jest, ESLint, Prettier ni el
contrato del backend (R35, R36). `types.ts` no cambia: se reutiliza `ResultadoGeocodificacion`
para búsqueda, cada sugerencia y la respuesta inversa.

---

## BFF de geocodificación (`app/api/geocodificacion/*`)

### Endpoints

| Método y ruta | Parámetros | `200` | Errores |
|---------------|-----------|-------|---------|
| `GET /api/geocodificacion` | `consulta` | `{ latitud, longitud, etiqueta }` | `400` vacía, `404` sin coincidencia, `401`, `502` |
| `GET /api/geocodificacion/sugerencias` | `consulta` | `{ latitud, longitud, etiqueta }[]` | `400` vacía o < mínimo, `401`, `502` |
| `GET /api/geocodificacion/inversa` | `lat`, `lon` | `{ latitud, longitud, etiqueta }` | `400` inválida o fuera de Colombia, `404` sin dirección, `401`, `502` |

- Los tres exigen sesión vigente mediante `_lib/sesion.ts` (`cookies()` + `SESSION_COOKIE_NAME`
  + `sesionVigente`); sin sesión responden `401` sin llamar a Photon (R10).
- `sugerencias` responde `200` con lista vacía cuando no hay coincidencias (R15); no usa `404`.
- La búsqueda e inversa distinguen "sin coincidencia" (`404`) de "proveedor caído" (`502`).
- Mensajes en español vía `respuestaError(status, mensajes)`, con mensajes propios para `400` y
  `404` (R16–R19, R37).

### `_lib/photon.ts` (interno)

**Constantes:** `URL_PHOTON = "https://photon.komoot.io"`, `USER_AGENT` propio de la aplicación,
`CADENCIA_MINIMA_MS = 1000`, `MAX_ENTRADAS_CACHE = 100`, `LIMITE_SUGERENCIAS = 5`,
`BBOX_COLOMBIA = "-79.0,-4.2,-66.8,12.6"`, `CODIGO_PAIS_COLOMBIA = "CO"`,
`MIN_CARACTERES_CONSULTA = 3`.

**Funciones puras (probadas con Jest, R40):**

- `extraerCoordenadas(feature): { latitud, longitud } | null` — lee
  `geometry.coordinates = [lon, lat]`, exige dos números finitos y rangos válidos
  (`-90..90`, `-180..180`) y devuelve latitud/longitud en ese orden.
- `formatearDireccion(propiedades): string` — construye la etiqueta con las partes presentes, en
  orden: nombre del lugar (`name`, si difiere de la vía) → vía (`street` + `housenumber`) →
  `district` → `city` → `county` (solo si difiere de `city`) → `state` → `country`. Recorta cada
  parte, omite las vacías, descarta una parte igual (sin distinguir mayúsculas) a la anterior ya
  incluida y une con `", "`. Sin partes devuelve `""` (R13).
- `esDeColombia(propiedades): boolean` — `true` cuando `countrycode` está ausente o es `"CO"`.
- `parsearRespuestaPhoton(datos): ResultadoGeocodificacion | null` — búsqueda: devuelve la primera
  `feature` con coordenadas válidas y país de Colombia; `null` si no hay ninguna válida (R12, R14).
- `mapearSugerenciasPhoton(datos, limite): ResultadoGeocodificacion[]` — mapea `features` omitiendo
  las inválidas o de otro país y recorta a `limite` (R7, R12).
- `parsearRespuestaInversaPhoton(datos): ResultadoGeocodificacion | null` — inversa: primera
  `feature` con coordenadas válidas; devuelve `null` si la etiqueta formateada queda vacía (R8, R18).

**Funciones con red (no se prueban con Jest):**

- `geocodificarDireccion(consulta)` → `GET /api/?q=&limit=1&lang=es&bbox=<BBOX>&…`.
- `sugerirDirecciones(consulta)` → `GET /api/?q=&limit=<LIMITE_SUGERENCIAS>&lang=es&bbox=<BBOX>&…`.
- `geocodificarInversa(latitud, longitud)` → `GET /reverse?lon=&lat=&lang=es&limit=1`.

**Caché y cadencia (R11):** un `Map<string, unknown>` con acceso tipado y descarte FIFO al superar
`MAX_ENTRADAS_CACHE`; claves `b:<consulta>` (búsqueda), `s:<consulta>` (sugerencias) y
`r:<lat>,<lon>` con 5 decimales (inversa), siempre normalizando el texto (`trim` + minúsculas).
Una cola de promesas serializa las peticiones y espera lo necesario para no superar ~1 req/s. Un
fallo de Photon (`!ok`) lanza `Error`, que el Route Handler traduce a `502`.

### `_lib/sesion.ts` (interno)

`haySesionVigente(): Promise<boolean>` lee la cookie de sesión y evalúa `sesionVigente`. Evita
repetir la guardia en los tres Route Handlers.

---

## Feature `fincas`

### `mapa.ts` (puro)

Constantes compartidas por los dos mapas (R1–R3): `CENTRO_COLOMBIA = [4.5709, -74.2973]`,
`LIMITES_COLOMBIA = [[-4.2, -79.0], [12.6, -66.8]]`, `ZOOM_POR_DEFECTO = 6`, `ZOOM_MINIMO = 5`.
Ambos `MapContainer` reciben `maxBounds={LIMITES_COLOMBIA}`, `maxBoundsViscosity={1}` y
`minZoom={ZOOM_MINIMO}` además del centro/zoom por defecto (R4). `SelectorMapa` conserva su
`ZOOM_UBICACION = 13` para centrar ubicaciones y el `SincronizarCentro` sigue usando `setView`;
`FincasMapa` conserva `fitBounds` sobre las fincas dentro del área acotada (R5).

### `api/geocodificacion.ts`

Sobre `createBffClient()`, propagando `ApiError`:

```ts
buscarCoordenadas(consulta): Promise<ResultadoGeocodificacion>                       // existente
buscarSugerenciasDireccion(consulta): Promise<ResultadoGeocodificacion[]>
buscarDireccionInversa(latitud: number, longitud: number): Promise<ResultadoGeocodificacion>
```

### `query-keys.ts`

Añade `sugerencias: (consulta: string) => ["fincas", "geocodificacion", "sugerencias", consulta]`.
La caché de TanStack Query, indexada por consulta, evita repetir consultas idénticas ya resueltas
en el cliente (R26), complementando la caché del proxy.

### `mensajes-error.ts`

Añade `mensajeErrorGeocodificacionInversa(status)`: `404` → "No se pudo determinar una dirección
para ese punto."; `0` → mensaje de conexión; resto → "No se pudo obtener la dirección del punto.
Inténtalo de nuevo." Se mantiene `mensajeErrorGeocodificacion(status)` para búsqueda y errores de
sugerencias (R23, R30, R37).

### Hooks

- `useSugerenciasDireccion(consulta)` — `useQuery<ResultadoGeocodificacion[], ApiError>` con
  `queryKey: clavesFincas.sugerencias(consulta)`, `enabled: consulta.trim().length >= 3`,
  `staleTime` amplio, `retry: false` (evita ráfagas contra Photon) y sin datos en `useEffect`
  (R20, R26). No se obtienen datos con `useEffect`.
- `useGeocodificacionInversa()` — `useMutation<ResultadoGeocodificacion, ApiError, PosicionFinca>`
  que llama a `buscarDireccionInversa`; se dispara por interacción del usuario (R27, R28).
- `useGeocodificacion()` — sin cambios.

### `shared/lib/use-valor-debounced.ts`

`useValorDebounced<T>(valor: T, retrasoMs: number): T` con `useState` + `useEffect` +
`setTimeout`/`clearTimeout`. Es un temporizador genérico, no obtención de datos, por lo que no
contradice la prohibición de `useEffect` para datos. Vive en `shared/lib` por ser genérico y sin
dominio (R36).

### `components/AutocompletarDireccion.tsx` (`'use client'`)

Combobox controlado; recibe `{ label, error, valor, onCambiarTexto, onSeleccionar }` y usa
`useValorDebounced(valor, 350)` + `useSugerenciasDireccion` internamente. Muestra el campo con
`Input` de `shared/ui` dentro de un contenedor `relative`, y debajo el `listbox` con las
sugerencias (R20–R25, R38):

- ARIA: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"` y
  `aria-activedescendant` en el input; `ul role="listbox"` con `li role="option"` y
  `aria-selected`. Los ids de opción derivan de un `useId()` del componente.
- Teclado: `ArrowDown`/`ArrowUp` mueven la opción activa, `Enter` selecciona la activa, `Escape`
  cierra la lista; el cierre al perder el foco no debe seleccionar por accidente.
- Estados: "Buscando sugerencias…" mientras carga, estado vacío con invitación a ubicar el pin,
  y mensaje no bloqueante ante error (el usuario puede seguir escribiendo).
- Al elegir una opción invoca `onSeleccionar(sugerencia)` y cierra la lista; se evita reabrirla
  inmediatamente por el texto recién seleccionado.

Ubicación: dentro de `features/fincas` porque depende de la API de geocodificación del feature;
no se mueve a `shared/ui`, que debe ser presentacional y sin dominio.

### `components/FincaForm.tsx`

- Reemplaza el `Input` de dirección por `AutocompletarDireccion` (con `useWatch` + `setValue` para
  mantener el registro de react-hook-form), conservando el botón "Ubicar dirección" y su
  mutación de búsqueda, que solo centra el mapa.
- `seleccionarSugerencia(s)`: `setValue("direccion", s.etiqueta, { shouldValidate: true })`,
  `setValue` de `latitud`/`longitud` y `setCentro({ latitud, longitud })` (R25).
- `cambiarPosicion(lat, lng)`: actualiza `latitud`/`longitud` (fuente de verdad, R29) y dispara
  `useGeocodificacionInversa`; los callbacks `onSuccess`/`onError` de la mutación escriben la
  dirección o muestran `mensajeErrorGeocodificacionInversa`. Un `useRef` con un contador de
  solicitud descarta resultados obsoletos para que gane la interacción más reciente (R31).
  Ante error se conserva la dirección previa (R30).
- Actualiza la nota visible para explicar que la dirección puede completarse desde el mapa y que
  las coordenadas guardadas son las del pin (R32).

### `components/SelectorMapa.tsx` y `components/FincasMapa.tsx`

Usan `mapa.ts` para centro, zoom por defecto, `maxBounds`, `maxBoundsViscosity` y `minZoom`
(R1–R5). No cambian su API pública ni su carga con `dynamic(..., { ssr: false })`.

---

## Decisiones de diseño

- **D1. Tres endpoints BFF dedicados en vez de uno con parámetros.** Búsqueda, sugerencias e
  inversa tienen parámetros, formas de respuesta y semántica de error distintas (la búsqueda usa
  `404`; las sugerencias devuelven lista vacía). Separarlos mantiene cada Route Handler simple y
  cada contrato explícito (R6–R8, R15, R18).
- **D2. Un único cliente `photon.ts`.** Centraliza `User-Agent`, cadencia, caché, filtro de país y
  las funciones puras de parseo/formato, reutilizadas por los tres endpoints (R11, R40).
- **D3. Formateo de dirección en el servidor.** El BFF entrega la etiqueta ya formateada; el
  feature solo la escribe. La función pura vive en el BFF y se prueba con Jest (R13, R40).
- **D4. Guardia de sesión compartida.** `_lib/sesion.ts` evita repetir la lectura de cookie en los
  tres handlers (R10).
- **D5. Sugerencias con debounce + `useQuery.enabled`.** El valor debounced se calcula con un hook
  genérico y la consulta se habilita por encima del mínimo de caracteres; TanStack Query cachea
  por consulta y `retry: false` evita ráfagas. No se obtiene datos con `useEffect` (R20, R26).
- **D6. Relleno inverso con `useMutation` disparada por la interacción.** El clic y el `dragend`
  son eventos de usuario; la mutación no cachea y el resultado se aplica comparándolo con la
  posición vigente mediante un contador de solicitud (R27, R28, R31).
- **D7. El pin sigue siendo la fuente de verdad.** El relleno inverso solo escribe `direccion`;
  las coordenadas persistidas siguen viniendo de `latitud`/`longitud` del formulario (R29).
- **D8. Combobox dentro de `features/fincas`.** Depende de la API de geocodificación del feature;
  moverlo a `shared/ui` acoplaría lo presentacional al dominio (R36).
- **D9. Constantes geográficas compartidas en `mapa.ts`.** Evita duplicar centro, límites y zooms
  entre los dos mapas (R1–R3).
- **D10. Formato con deduplicación.** Photon repite `city`/`county`/`state`; descartar la parte
  igual a la anterior y omitir las ausentes produce etiquetas útiles para Colombia (R13).

## Alternativas descartadas

- **Un endpoint único con `modo`:** contratos y errores mezclados; peor de probar (D1).
- **Llamar a Photon desde el navegador:** CORS, `User-Agent` no controlable y sin caché/cadencia
  del lado servidor; prohibido por R9.
- **Mantener Nominatim y añadir Photon solo para sugerencias:** dos proveedores y dos políticas;
  el usuario acordó migrar todo (R33, R34).
- **Debounce con `useEffect` que dispare `fetch`:** viola la convención de no obtener datos con
  efectos y duplica la caché; se usa `useQuery` con `enabled` (D5).
- **Escribir la dirección con un `useEffect` sobre el resultado de una `useQuery`:** sincroniza
  estado derivable con efectos; se usa una mutación con callbacks (D6).
- **Mover el combobox a `shared/ui`:** acoplaría el sistema de diseño a la geocodificación (D8).
- **Filtrar por `countrycode` de forma estricta:** descartaría coincidencias válidas sin país
  declarado; se descartan solo las de país presente y distinto de Colombia (R12).
- **Priorizar sugerencias por cercanía (`lat`/`lon`):** añade estado y complejidad; el `bbox` de
  Colombia es suficiente en este alcance.

---

## Testabilidad y verificación

**Automatizable con Jest (`V4`, lógica pura, sin red ni render):**

- `app/api/geocodificacion/_lib/__tests__/photon.test.ts`: `extraerCoordenadas` (válido con
  `[lon, lat]`, malformado y fuera de rango), `formatearDireccion` (completa, con ausentes, con
  duplicados y vacía), `parsearRespuestaPhoton` (primera válida, salta inválidas y de otro país,
  sin `features`), `mapearSugerenciasPhoton` (mapeo, límite, omisiones y lista vacía) y
  `parsearRespuestaInversaPhoton` (etiqueta formateada, sin `features` y etiqueta vacía).
- `features/fincas/__tests__/mensajes-error.test.ts`: `mensajeErrorGeocodificacionInversa` (`404`,
  `0` y genérico) y regresión de `mensajeErrorGeocodificacion`.
- `features/fincas/__tests__/query-keys.test.ts`: forma de `sugerencias(consulta)`.

**No cubierto por Jest (validación manual `V5`):** límites del mapa, debounce y lista de
sugerencias, navegación por teclado y ARIA, selección de sugerencia, relleno inverso en clic y
arrastre, manejo de sus errores, búsqueda por botón contra Photon y flujo completo de guardado.

---

## Restricciones

- TypeScript `strict`: sin `any` ni `@ts-ignore`; `unknown` + estrechamiento.
- Named exports; `export default` solo donde Next lo exige.
- `'use client'` en el nodo más bajo; Leaflet solo con import dinámico y sin SSR.
- Sin `fetch` en componentes ni obtención de datos con `useEffect`.
- El BFF propaga el código HTTP real y no expone el detalle del proveedor.
- Sin dependencias nuevas (R35).
- El navegador nunca conoce `photon.komoot.io` (R9).

---

## Verificación prevista

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Prettier en verde (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | ESLint sin errores. |
| `V3` | `npm run typecheck` | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Suite en verde, incluidos los tests puros nuevos. |
| `V5` | Validación manual | Mapas acotados, sugerencias accesibles, selección, relleno inverso en clic/arrastre y manejo de errores. |
