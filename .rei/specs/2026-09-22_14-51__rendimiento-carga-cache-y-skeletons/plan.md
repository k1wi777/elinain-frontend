# Plan — Rendimiento: caché por defecto, skeletons de carga y guía de producción

> Work Item: `2026-09-22_14-51__rendimiento-carga-cache-y-skeletons` (`type: task`)

## Objetivo

Mejorar la percepción de velocidad sin cambiar la arquitectura:

1. Que navegar entre vistas reutilice los datos ya cargados, configurando `defaultOptions` del `QueryClient`.
2. Dar retroalimentación inmediata en la carga de los segmentos del área protegida con `loading.tsx` y un `Skeleton` genérico.
3. Dejar documentado que el rendimiento real solo se evalúa en una build de producción.

Diagnóstico ya medido (no se repite aquí: ver `meta.json`): `staleTime` por defecto `0`, `refetchOnWindowFocus` activo, backend ~0.68–0.99 s por petición, fetch del lado cliente tras la hidratación.

## Archivos

### Crear

| Archivo | Contenido |
|---------|-----------|
| `shared/ui/Skeleton.tsx` | Componente presentacional `Skeleton`: bloque gris pulsante. |
| `app/(dashboard)/loading.tsx` | Fallback de carga genérico del área protegida. |
| `app/(dashboard)/terceros/loading.tsx` | Skeleton del listado de terceros. |
| `app/(dashboard)/fincas/loading.tsx` | Skeleton del listado/mapa de fincas. |
| `app/(dashboard)/contratos/loading.tsx` | Skeleton del listado de contratos. |

### Modificar

| Archivo | Cambio |
|---------|--------|
| `app/providers.tsx` | `defaultOptions.queries` en el `QueryClient`. |
| `shared/ui/index.ts` | Exportar `Skeleton` en el barrel. |
| `README.md` | Nota sobre validar rendimiento en build de producción. |

No se crean ni modifican más archivos. No hay lógica pura nueva → no hay tests nuevos.

## Cambios

### 1. `app/providers.tsx` — defaults del `QueryClient`

Definir una constante `OPCIONES_POR_DEFECTO` y pasarla a `new QueryClient(...)`:

- `queries.staleTime: 60_000` (60 s). Navegar entre vistas y volver reutiliza la caché en lugar de repetir la petición de ~0.7–1 s. Es seguro porque las mutaciones ya invalidan explícitamente sus query keys (convención del proyecto).
- `queries.refetchOnWindowFocus: false`. Evita refetches sorpresa al volver a la pestaña; la frescura la gobiernan `staleTime` y la invalidación.
- `queries.retry: 1`. El default de queries es `3`; con un backend lento eso alarga la espera ante fallos. Un reintento mantiene cierta resiliencia sin penalizar el tiempo de error.

Solo se configuran `queries`. `mutations` queda con sus defaults, por lo que el comportamiento de las mutaciones (crear/editar/eliminar) no cambia. Las opciones propias de cada consulta siguen prevaleciendo sobre el default: `useSugerenciasDireccion` conserva su `staleTime` de 5 min y su `retry: false`; `useTerceros`/`useFincas` conservan `keepPreviousData`.

### 2. `shared/ui/Skeleton.tsx` — componente genérico

Componente presentacional, sin dominio, con `cn()` y un único prop opcional `className`; aplica `animate-pulse rounded-md bg-zinc-200` como base y `aria-hidden="true"` (decorativo). Exportar en `shared/ui/index.ts`:

```ts
export { Skeleton } from "@/shared/ui/Skeleton";
```

Justificación: hay al menos cuatro `loading.tsx` que necesitan los mismos bloques; centralizarlos en `shared/ui` evita repetir clases de Tailwind y mantiene el lenguaje visual. Es genérico y reutilizable, cumple las reglas de `shared/ui` (presentacional, sin dominio, con named export).

### 3. `loading.tsx` — feedback inmediato

- `app/(dashboard)/loading.tsx`: fallback para todo el área protegida (Next lo aplica a los segmentos que no tengan su propio `loading.tsx`). El `header` del `(dashboard)/layout.tsx` permanece visible porque el boundary suspende solo el contenido de la página; el skeleton replica el ancho de página (`mx-auto w-full max-w-4xl`): título y un par de bloques.
- `terceros/loading.tsx`, `fincas/loading.tsx`, `contratos/loading.tsx`: cada uno con un skeleton acorde a su contenido (filas tipo tabla para terceros y contratos; bloques de listado/mapa para fincas), reutilizando `Skeleton` y el mismo contenedor/ancho que su `page.tsx`.
- Accesibilidad: el contenedor expone `aria-busy` y un texto solo para lectores (`<span className="sr-only">Cargando…</span>`); los bloques `Skeleton` van `aria-hidden`.

Nota de alcance: `loading.tsx` cubre la navegación/streaming del segmento en el servidor. Como las páginas siguen pidiendo los datos en el cliente tras la hidratación (fuera de alcance el prefetch), los estados de carga existentes de cada feature (`Table cargando`, "Cargando…") siguen aplicando durante ese fetch; lo que elimina repeticiones es la caché del punto 1.

### 4. `README.md` — guía de producción

Añadir, junto a la tabla de `Scripts`, una nota breve: el rendimiento percibido debe validarse con `npm run build` + `npm start`, porque `npm run dev` compila cada ruta on-demand en la primera visita y añade segundos que no existen en producción. No se modifica `verification.md` ni ningún otro documento.

## Restricciones

- Sin dependencias nuevas y sin cambios en `package.json`.
- Sin `any`; TypeScript `strict`; named exports (en `app/` solo `loading.tsx`/`page.tsx` usan `export default`, que Next exige).
- No tocar `shared/api/openapi/*` ni el BFF (`app/api/*`); no se cambia el fetch ni los hooks existentes.
- No tocar la arquitectura: nada de `HydrationBoundary`/`dehydrate`, prefetch en servidor, streaming/PPR ni reducción del "traer todos".
- `shared/ui/Skeleton.tsx` es presentacional y sin dominio; `shared/` no importa de `features/` ni de `app/`.
- `mutations` del `QueryClient` no se configuran.
- Formato con Prettier (`npm run format` antes de `V1`); clases Tailwind ordenadas por el plugin.

## Pasos

1. [x] `app/providers.tsx`: crear `OPCIONES_POR_DEFECTO` y usarlo en `new QueryClient(...)` (`staleTime` 60 s, `refetchOnWindowFocus: false`, `retry: 1` solo para `queries`).
2. [x] Crear `shared/ui/Skeleton.tsx` y exportarlo en `shared/ui/index.ts`.
3. [x] Crear `app/(dashboard)/loading.tsx`.
4. [x] Crear `terceros/loading.tsx`, `fincas/loading.tsx` y `contratos/loading.tsx`.
5. [x] Añadir la nota de build de producción al `README.md`.
6. [x] `npm run format` y ejecutar `V1`–`V4`; confirmar `bash .rei/init.sh` con salida `0`.
7. [x] Documentar la evidencia de `V1`–`V4` y los pasos de `V5` en `.rei/progress/work-items/2026-09-22_14-51__rendimiento-carga-cache-y-skeletons/impl.md`.

## Verificación

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Pasa (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | Sin errores. |
| `V3` | `npm run typecheck` | Sin errores. |
| `V4` | `npm test` | Suite completa en verde (no hay lógica pura nueva; no se añaden tests). |
| `V5` | Validación manual | Navegación con caché, feedback inmediato y build de producción. |

Pasos de `V5` (requieren backend y sesión iniciada):

1. Entrar a `/terceros`, `/fincas` y `/contratos`; en la navegación debe verse de inmediato el skeleton del segmento.
2. Visitar `/terceros`, ir a `/fincas` y volver a `/terceros`: no debe repetirse la carga (los datos se reutilizan durante 60 s); los cambios propios ya invalidan su key, así que crear/editar/eliminar sigue mostrando datos frescos.
3. Cambiar de pestaña del navegador y volver: no debe dispararse un refetch automático.
4. Recomendación de rendimiento: comparar `npm run dev` con `npm run build && npm start` y validar la experiencia en la build de producción, que es la real.

## Fuera de alcance

- Prefetch en servidor con `HydrationBoundary`/`dehydrate` y streaming/PPR.
- Paralelizar o reducir el "traer todos" de terceros/fincas/contratos.
- Cambios de arquitectura o en el BFF/OpenAPI.
- Sustituir los estados de carga internos de cada feature.
