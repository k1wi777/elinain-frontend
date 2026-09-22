# Impl — Rendimiento: caché por defecto, skeletons de carga y guía de producción

> Work Item: `2026-09-22_14-51__rendimiento-carga-cache-y-skeletons` (`type: task`)
> Agente: `implementer`

## Resumen

Implementados los 7 pasos del `plan.md` sin desviaciones de alcance:

1. `QueryClient` con defaults de `queries` (caché 60 s, sin refetch al foco, `retry: 1`).
2. `Skeleton` genérico en `shared/ui` y su export en el barrel.
3. `loading.tsx` del área protegida y de los segmentos `terceros`, `fincas` y `contratos`.
4. Nota de validación en build de producción en el `README.md`.

No se añadieron dependencias, no se tocó `package.json`, `shared/api/openapi/*`, el BFF ni los
hooks existentes. No se introdujo prefetch/`HydrationBoundary`/streaming/PPR ni se modificó el
"traer todos".

## Archivos

### Creados

- `shared/ui/Skeleton.tsx`
- `app/(dashboard)/loading.tsx`
- `app/(dashboard)/terceros/loading.tsx`
- `app/(dashboard)/fincas/loading.tsx`
- `app/(dashboard)/contratos/loading.tsx`

### Modificados

- `app/providers.tsx`
- `shared/ui/index.ts`
- `README.md`

### Progreso / spec

- `.rei/progress/current.md`
- `.rei/progress/work-items/2026-09-22_14-51__rendimiento-carga-cache-y-skeletons/impl.md`
- `.rei/specs/2026-09-22_14-51__rendimiento-carga-cache-y-skeletons/plan.md` (pasos `[x]`)

## Cambios realizados

- **`app/providers.tsx`**: constante `OPCIONES_POR_DEFECTO: QueryClientConfig` con
  `defaultOptions.queries = { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 }`; se
  pasa a `new QueryClient(OPCIONES_POR_DEFECTO)`. `mutations` conserva sus defaults. Las
  opciones propias de cada consulta siguen prevaleciendo.
- **`shared/ui/Skeleton.tsx`**: componente presentacional sin dominio, named export, con `cn()`
  y un único prop opcional `className`; base `animate-pulse rounded-md bg-zinc-200` y
  `aria-hidden="true"`. Exportado en `shared/ui/index.ts`.
- **`loading.tsx`**: cada uno replica el contenedor/ancho de su `page.tsx`
  (`mx-auto w-full max-w-4xl`), usa `aria-busy="true"` y un `<span className="sr-only">Cargando…</span>`;
  los bloques `Skeleton` van `aria-hidden`. El genérico del área protegida deja el header del
  layout visible y usa título + bloques; `terceros`/`contratos` usan filas tipo tabla y `fincas`
  usa pestañas Listado/Mapa con bloques de filas.
- **`README.md`**: nota junto a la tabla de Scripts: validar el rendimiento percibido con
  `npm run build` + `npm start` porque `npm run dev` compila cada ruta on-demand en la primera
  visita.

## Verificación

`npm run format` ejecutado antes de los checkpoints (solo reformateó `app/providers.tsx`).

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — `All matched files use Prettier code style!` (código 0). |
| `V2` | `npm run lint` | Pasa — ESLint sin salida (código 0). |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores (código 0). |
| `V4` | `npm test` | Pasa — 24 suites / 224 tests en verde (código 0). |
| `V5` | Validación manual | Pendiente de confirmación del usuario. Sin lógica pura nueva → sin tests nuevos. |

`bash .rei/init.sh` → código de salida `0` (V1–V4 `[OK]`).

### Evidencia adicional para `V5` (build de producción)

- Ejecutado `npm run build` → código `0`; compilación correcta en 27.2 s y las 21 rutas
  generadas incluyendo `/terceros`, `/fincas` y `/contratos`. Confirma que los `loading.tsx` y
  los defaults del `QueryClient` no rompen la build. No se dejó ningún servidor (`dev`/`start`)
  en segundo plano.
- Pasos de `V5` a validar por el usuario (requieren backend y sesión):
  1. Entrar a `/terceros`, `/fincas` y `/contratos`: el skeleton del segmento debe verse al
     instante durante la navegación.
  2. Visitar `/terceros` → `/fincas` → `/terceros`: no debe repetirse la carga dentro de los
     60 s; crear/editar/eliminar sigue mostrando datos frescos por invalidación.
  3. Cambiar de pestaña y volver: no debe dispararse refetch automático.
  4. Comparar `npm run dev` con `npm run build && npm start` para validar la experiencia real.

## Observaciones

- `loading.tsx` cubre la navegación/streaming del segmento; como las páginas siguen pidiendo
  datos en el cliente tras la hidratación (prefetch fuera de alcance), los estados de carga
  internos de cada feature siguen aplicando durante ese fetch. Lo que evita repeticiones es la
  caché del punto 1.
- El aviso de `next build` sobre `middleware` deprecado es preexistente y ajeno a este Work Item.
- Sin bloqueos.
