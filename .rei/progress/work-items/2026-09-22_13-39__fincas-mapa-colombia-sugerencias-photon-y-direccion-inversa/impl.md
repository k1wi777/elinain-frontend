# Implementación — Fincas: mapa acotado a Colombia, sugerencias Photon y dirección inversa

> Work Item: `2026-09-22_13-39__fincas-mapa-colombia-sugerencias-photon-y-direccion-inversa`
> (`type: feature`) — Agente: `implementer`.

## Resumen

Se implementaron T1–T10 según `requirements.md`, `design.md` y `tasks.md`. La geocodificación
se migró por completo de Nominatim a **Photon** a través de tres endpoints BFF autenticados
(búsqueda, sugerencias e inversa), se añadió un combobox de direcciones accesible, el relleno
inverso desde el pin (clic y `dragend`) con descarte de respuestas obsoletas y ambos mapas
quedaron acotados a Colombia. No se añadieron dependencias ni se tocaron `package.json`,
`shared/api/openapi/*`, `shared/ui`, ESLint, Prettier ni Jest.

## Desviación justificada de la convención

El `design.md` nombraba el hook genérico como `shared/lib/use-valor-debounced.ts`
(`kebab-case`), pero `.rei/docs/project/conventions.md` exige `camelCase.ts` para hooks. Se
implementó como **`shared/lib/useValorDebounced.ts`**, exportando `useValorDebounced`. Es la
única desviación respecto del diseño; el resto se respetó tal cual.

## Archivos

**Nuevos**

| Ruta | Contenido |
|------|-----------|
| `shared/lib/useValorDebounced.ts` | Hook genérico de valor debounced (temporizador). |
| `app/api/geocodificacion/_lib/photon.ts` | Cliente Photon: constantes, caché FIFO, cadencia ~1 req/s, parseo/formato puros y funciones de red. |
| `app/api/geocodificacion/_lib/sesion.ts` | `haySesionVigente` compartida por los tres handlers. |
| `app/api/geocodificacion/_lib/__tests__/photon.test.ts` | 19 tests de lógica pura de Photon. |
| `app/api/geocodificacion/sugerencias/route.ts` | `GET` sugerencias (lista vacía en `200`, mínimo en `400`). |
| `app/api/geocodificacion/inversa/route.ts` | `GET` inversa (valida `lat`/`lon`, rango y área de Colombia; `404` sin dirección). |
| `features/fincas/hooks/useSugerenciasDireccion.ts` | `useQuery` con `enabled`, `staleTime` y `retry: false`. |
| `features/fincas/hooks/useGeocodificacionInversa.ts` | `useMutation` de coordenadas. |
| `features/fincas/components/AutocompletarDireccion.tsx` | Combobox accesible de sugerencias. |
| `features/fincas/mapa.ts` | Centro, límites y zooms de Colombia. |

**Modificados**

| Ruta | Cambio |
|------|--------|
| `app/api/geocodificacion/route.ts` | Delega en `photon.ts` y usa `haySesionVigente`. |
| `features/fincas/api/geocodificacion.ts` | + `buscarSugerenciasDireccion` y `buscarDireccionInversa`; JSDoc migrado a Photon. |
| `features/fincas/query-keys.ts` | + `sugerencias(consulta)`. |
| `features/fincas/mensajes-error.ts` | + `mensajeErrorGeocodificacionInversa`. |
| `features/fincas/__tests__/query-keys.test.ts` | + test de `sugerencias()`. |
| `features/fincas/__tests__/mensajes-error.test.ts` | + tests del mensaje inverso. |
| `features/fincas/components/FincaForm.tsx` | Combobox, selección, relleno inverso con contador y nota nueva. |
| `features/fincas/components/SelectorMapa.tsx` | `maxBounds`, `maxBoundsViscosity`, `minZoom` desde `mapa.ts`. |
| `features/fincas/components/FincasMapa.tsx` | Ídem en el mapa general. |

**Eliminados**

- `app/api/geocodificacion/_lib/nominatim.ts`
- `app/api/geocodificacion/_lib/__tests__/nominatim.test.ts`

## Decisiones y observaciones

- **Tipo compartido:** `photon.ts` importa `ResultadoGeocodificacion` de
  `@/features/fincas/types` (solo tipo). La dependencia `app/ → features/` es la dirección
  permitida por la arquitectura y evita duplicar el contrato.
- **Sesión primero:** los tres endpoints resuelven `haySesionVigente` antes de validar
  parámetros o llamar a Photon (R10).
- **Búsqueda vs. sugerencias:** la búsqueda responde `400` solo con consulta vacía; las
  sugerencias exigen `MIN_CARACTERES_CONSULTA` (`400` por debajo) y devuelven lista vacía en
  `200`; la inversa valida numérico + rango + caja de Colombia (`400`).
- **Caché:** los miss (`null`) no se cachean; las listas vacías de sugerencias sí. Claves
  `b:`, `s:` y `r:<lat>,<lon>` normalizadas (5 decimales en la inversa).
- **ARIA:** `aria-expanded` es `true` cuando hay opciones visibles; los estados de carga,
  vacío y error se anuncian en una región `role="status"`/`role="alert"` sin romper el patrón
  listbox/activedescendant.
- **Sin referencias a Nominatim** en código de `app/`, `features/` ni `shared/`
  (`grep -rniE "nominatim"` excluyendo `.rei/`, `node_modules/` y `.next/` no devuelve nada).

## Verificación

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format` + `npm run format:check` | **Pasa** (`All matched files use Prettier code style!`, exit 0). |
| `V2` | `npm run lint` | **Pasa** (sin errores ni warnings, exit 0). |
| `V3` | `npx next typegen` + `npm run typecheck` | **Pasa** (`tsc --noEmit` exit 0). Se ejecutó `typegen` por las rutas nuevas. |
| `V4` | `npm test` | **Pasa**: 24 suites, 220 tests (19 de `photon.test.ts`), exit 0. |
| — | `bash .rei/init.sh` | **Pasa** con salida `0`; V1–V4 `[OK]`. |
| `V5` | Validación manual | **Pendiente** (requiere sesión autenticada; ver pasos). |

### Comprobación HTTP del BFF (apoyo a V5)

Contra el servidor de desarrollo ya activo en `http://localhost:3000`, sin sesión:

```text
GET /api/geocodificacion?consulta=medellin              -> 401 {"mensaje":"Tu sesión no es válida o ha expirado."}
GET /api/geocodificacion/sugerencias?consulta=medellin  -> 401 {"mensaje":"Tu sesión no es válida o ha expirado."}
GET /api/geocodificacion/inversa?lat=4.7&lon=-74.1      -> 401 {"mensaje":"Tu sesión no es válida o ha expirado."}
```

Confirma que las tres rutas existen y aplican la guardia de sesión (R9, R10, R37). La
validación con sesión (200 con datos reales de Photon) queda para V5.

### Pasos de reproducción de V5

1. `npm run dev` y acceder a la aplicación con un usuario autenticado.
2. **Mapas acotados (R1–R5):** en `/fincas/nueva` (o editar) y en la pestaña "Mapa" de
   `/fincas`, intentar arrastrar el mapa fuera de Colombia y alejar el zoom por debajo del
   mínimo: la vista no debe abandonar el territorio.
3. **Sugerencias (R20–R26, R38):** escribir `med` en Dirección; tras ~350 ms aparece
   "Buscando sugerencias…" y luego opciones. Recorrerlas con `ArrowUp`/`ArrowDown`, elegir con
   `Enter`, cerrar con `Escape`; comprobar que el campo anuncia la opción activa. Al elegir una,
   verificar que la etiqueta se escribe y el mapa se centra con el pin colocado. Probar una
   consulta sin coincidencias (estado vacío) y con 1–2 caracteres (sin consulta).
4. **Relleno inverso (R27–R32):** hacer clic en el mapa y comprobar que la Dirección se
   completa; arrastrar el pin y soltar, y comprobar que se actualiza. Hacer varias
   interacciones seguidas y confirmar que prevalece la última. Guardar comprobando que las
   coordenadas enviadas son las del pin.
5. **Errores (R19, R23, R30):** simular fallo del proveedor (p. ej. cortando red) y verificar
   los mensajes en español, que la dirección previa se conserva y que el guardado no se
   bloquea. Enviar el formulario sin dirección o sin pin y comprobar la validación (R39).
6. **Búsqueda por botón (R6, R14, R18):** usar "Ubicar dirección" con una dirección válida
   (centra el mapa) y con una inexistente (mensaje de no encontrada).

## Observaciones relevantes

- No se dejaron servidores de desarrollo propios en ejecución. El servidor de `:3000` ya
  estaba activo antes de esta sesión y no se detuvo.
- No se modificó la planificación salvo el marcado de tareas completadas en `tasks.md`.
