# Tareas — Fincas: mapa acotado a Colombia, sugerencias de dirección con Photon y relleno inverso desde el pin

> Work Item: `2026-09-22_13-39__fincas-mapa-colombia-sugerencias-photon-y-direccion-inversa` (`type: feature`)
>
> Tareas discretas y ordenadas. El Implementer marca cada tarea como `[x]` inmediatamente al
> terminarla. Cada tarea referencia los requisitos (`R…`) que implementa.

---

- [x] **T1 — Hook de valor debounced.** Crear `shared/lib/useValorDebounced.ts` con
  `useValorDebounced<T>(valor, retrasoMs)` usando `setTimeout`/`clearTimeout` (temporizador
  genérico, no obtención de datos). (R20, R36)

- [x] **T2 — Cliente Photon del BFF.** Crear `app/api/geocodificacion/_lib/photon.ts`: constantes
  (URL, `User-Agent` propio, cadencia, caché, `LIMITE_SUGERENCIAS`, `BBOX_COLOMBIA`,
  `MIN_CARACTERES_CONSULTA`), funciones puras `extraerCoordenadas`, `formatearDireccion`,
  `esDeColombia`, `parsearRespuestaPhoton`, `mapearSugerenciasPhoton` y
  `parsearRespuestaInversaPhoton`, y funciones con red `geocodificarDireccion`,
  `sugerirDirecciones` y `geocodificarInversa` con caché FIFO, cadencia ~1 req/s y `lang=es`.
  Añadir `_lib/__tests__/photon.test.ts`. (R6–R8, R11–R14, R18, R26, R40)

- [x] **T3 — Endpoints BFF.** Crear `_lib/sesion.ts` (`haySesionVigente`) y los Route Handlers:
  migrar `route.ts` a `photon.ts` y crear `sugerencias/route.ts` (lista vacía en `200`, mínimo de
  caracteres en `400`) e `inversa/route.ts` (valida `lat`/`lon`, rango y área de Colombia; `404`
  sin dirección). Guardia `401`, mensajes en español y `502` ante fallo del proveedor.
  (R6–R12, R14–R19, R33, R37)

- [x] **T4 — Retiro de Nominatim.** Eliminar `app/api/geocodificacion/_lib/nominatim.ts` y
  `app/api/geocodificacion/_lib/__tests__/nominatim.test.ts`, y verificar que no queden
  referencias a Nominatim en el repositorio. (R33, R34)

- [x] **T5 — Tipos, claves y mensajes del feature.** Añadir `clavesFincas.sugerencias(consulta)` en
  `query-keys.ts` y `mensajeErrorGeocodificacionInversa(status)` en `mensajes-error.ts`; actualizar
  `__tests__/query-keys.test.ts` y `__tests__/mensajes-error.test.ts`. (R23, R30, R37, R40)

- [x] **T6 — API y hooks del feature.** Ampliar `api/geocodificacion.ts` con
  `buscarSugerenciasDireccion` y `buscarDireccionInversa` sobre `createBffClient()`; crear
  `hooks/useSugerenciasDireccion.ts` (`useQuery` con `enabled`, `staleTime` y `retry: false`) y
  `hooks/useGeocodificacionInversa.ts` (`useMutation` de coordenadas). (R7, R8, R20, R26–R28)

- [x] **T7 — Combobox de sugerencias.** Crear
  `features/fincas/components/AutocompletarDireccion.tsx` (`'use client'`): campo con `Input`,
  `useValorDebounced` + `useSugerenciasDireccion`, listbox accesible (`combobox`/`listbox`/
  `option`, `aria-expanded`, `aria-activedescendant`), teclado (`ArrowUp`/`ArrowDown`/`Enter`/
  `Escape`), estados de carga/vacío/error y `onSeleccionar`. (R20–R26, R38)

- [x] **T8 — Integración en el formulario.** Modificar `components/FincaForm.tsx`: usar
  `AutocompletarDireccion` para el campo Dirección, escribir etiqueta + centrar mapa + fijar pin
  al elegir sugerencia, disparar `useGeocodificacionInversa` en `cambiarPosicion` (clic y
  `dragend`) con contador de solicitud para descartar respuestas obsoletas y mensaje de error sin
  borrar la dirección previa; actualizar la nota visible. (R25, R27–R32)

- [x] **T9 — Mapas acotados a Colombia.** Crear `features/fincas/mapa.ts` con centro, límites y
  zooms de Colombia y aplicarlos en `components/SelectorMapa.tsx` y `components/FincasMapa.tsx`
  (`maxBounds`, `maxBoundsViscosity`, `minZoom`), conservando `setView`/`fitBounds`. (R1–R5)

- [x] **T10 — Checkpoints y evidencia.** Ejecutar `npm run format`, `V1` (`format:check`), `V2`
  (`lint`), `V3` (`typecheck`) y `V4` (`test`); confirmar `bash .rei/init.sh` con salida `0`;
  registrar la evidencia en
  `.rei/progress/work-items/2026-09-22_13-39__fincas-mapa-colombia-sugerencias-photon-y-direccion-inversa/impl.md`
  y documentar los pasos de reproducción para `V5`. (R40)

---

## Orden y dependencias

1. `T1`, `T2` y `T5` son independientes entre sí.
2. `T3` depende de `T2`.
3. `T4` depende de `T3`.
4. `T6` depende de `T5`.
5. `T7` depende de `T1` y `T6`.
6. `T8` depende de `T6` y `T7`.
7. `T9` es independiente y puede hacerse en paralelo.
8. `T10` se ejecuta al final, con todo implementado.

## Fuera de alcance

- Google Places y autoalojar Photon/Nominatim.
- Cambios en el contrato del backend, en el OpenAPI local o en `shared/ui`.
- Dependencias npm nuevas y tests de render (la interacción se valida en `V5`).
