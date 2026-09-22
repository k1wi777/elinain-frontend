# Review — Rendimiento: caché por defecto, skeletons de carga y guía de producción

> Work Item: `2026-09-22_14-51__rendimiento-carga-cache-y-skeletons` (`type: task`)
> Agente: `reviewer`
> Estado final: `done`

## Resultado

**Aprobado.** La implementación cumple los 7 pasos del `plan.md`, respeta las restricciones y
no añade alcance. `V1`–`V4` y `bash .rei/init.sh` pasan; `npm run build` también finaliza con
código `0`. `V5` (validación manual) queda a cargo del usuario.

## Verificaciones independientes

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — `All matched files use Prettier code style!` (código `0`). |
| `V2` | `npm run lint` | Pasa — ESLint sin salida (código `0`). |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores (código `0`). |
| `V4` | `npm test` | Pasa — 24 suites / 224 tests en verde (código `0`). |
| `V5` | Validación manual | Pendiente de confirmación del usuario. Sin componente automatizable; pasos documentados en `impl.md`. |
| — | `bash .rei/init.sh` | Código `0`; `V1`–`V4` `[OK]`. |
| — | `npm run build` | Código `0`; compila y prerenderiza 21 rutas (incluidas `/terceros`, `/fincas` y `/contratos`). No queda ningún proceso de `dev`/`start` en segundo plano. |

## Comprobaciones de contenido

- **`app/providers.tsx`**: define `OPCIONES_POR_DEFECTO: QueryClientConfig` y lo pasa a
  `new QueryClient(...)`. Solo configura `defaultOptions.queries` con `staleTime: 60_000`,
  `refetchOnWindowFocus: false` y `retry: 1`. **No** toca `mutations`.
- **`shared/ui/Skeleton.tsx`**: presentacional, sin dominio (solo importa `cn`), named export,
  único prop opcional `className`, base `animate-pulse rounded-md bg-zinc-200` y
  `aria-hidden="true"`. Exportado en `shared/ui/index.ts`.
- **`loading.tsx`**: existen `app/(dashboard)/loading.tsx` y los de `terceros`, `fincas` y
  `contratos`. Todos usan `aria-busy="true"` y `<span className="sr-only">Cargando…</span>`,
  bloques `Skeleton` `aria-hidden` y el mismo contenedor/ancho que su `page.tsx`
  (`mx-auto w-full max-w-4xl`).
- **`README.md`**: incluye la nota de validar el rendimiento con `npm run build` + `npm start`.
- **Restricciones**: sin dependencias nuevas y `package.json`/`package-lock.json` sin cambios;
  sin `any`; `export default` solo en `page.tsx`/`loading.tsx` (`Skeleton` y `Providers` usan
  named export); no se introdujo `HydrationBoundary`/`dehydrate`, prefetch, streaming/PPR ni
  cambios en el BFF/OpenAPI/hooks (`grep` sin coincidencias en código); `shared/` no importa de
  `features/` ni de `app/`.
- **Defaults vs. opciones propias**: las opciones de cada consulta prevalecen sobre el default.
  `useSugerenciasDireccion` conserva `staleTime` de 5 min y `retry: false`; `useTerceros` y
  `useFincas` conservan `placeholderData: keepPreviousData`. Ninguna mutación se ve afectada
  porque `mutations` no se configura.

## Observaciones

- El árbol de trabajo contiene cambios sin commitear de Work Items anteriores
  (`13-39`, `14-44`); son ajenos a este Work Item y ya revisados. Los cambios atribuibles a este
  Work Item son únicamente los 3 modificados y 5 creados que declara el plan.
- El aviso de `next build` sobre `middleware` deprecado es preexistente.
- Sin bloqueos.
