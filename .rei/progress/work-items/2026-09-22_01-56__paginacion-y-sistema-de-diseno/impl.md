# Implementación — Hook genérico de paginación y sistema de diseño base

> Work Item: `2026-09-22_01-56__paginacion-y-sistema-de-diseno` (`type: feature`)
>
> Agente: `implementer`
> Resultado: implementación completada, `V1`–`V4` en verde; `V5` **no aplica**.

---

## Resumen

Se implementaron las dos piezas base definidas en `design.md`, respetando
`architecture.md` (raíz del repo, sin `src/`; `shared/` no importa de `features/` ni de
`app/`):

1. **Paginación genérica** en `shared/api/`: la aritmética pura (`pagination.ts`) y el
   hook de estado (`usePagination.ts`).
2. **Sistema de diseño base** en `shared/ui/`: `Button`, `Input`, `Select`, `Table` (con
   paginación), `Modal`, `Toast` y el barrel público, más el helper `cn()` en
   `shared/lib`.

Se ejecutaron las tareas `T1`–`T12` en el orden de `tasks.md`, sin añadir ni quitar
alcance. No se añadieron dependencias, no se modificaron `app/globals.css`, `package.json`,
`tsconfig.json`, `.prettierignore` ni `eslint.config.mjs`, y no se hicieron commits.

---

## Archivos

### Creados

| Archivo | Tarea | Contenido |
|---------|-------|-----------|
| `shared/lib/cn.ts` | T1 | `cn(...clases: ClassValue[]): string` = `twMerge(clsx(clases))`, con JSDoc. |
| `shared/lib/__tests__/cn.test.ts` | T1 | 5 tests: composición, condicionales, conflictos de Tailwind, arrays/objetos. |
| `shared/api/pagination.ts` | T2 | Constantes `LIMITE_POR_DEFECTO`/`LIMITE_MINIMO`/`LIMITE_MAXIMO` y las funciones puras `normalizarLimite`, `calcularTotalPaginas`, `calcularPagina`, `calcularOffset`, `normalizarPagina`. |
| `shared/api/__tests__/pagination.test.ts` | T2 | 15 tests con casos borde (`total = 0`, límite fuera de rango, página/offset fuera de rango). |
| `shared/api/usePagination.ts` | T3 | Hook `'use client'` con `ParametrosPaginacion`/`EstadoPaginacion`, estado `limite`/`offset`, derivados y acciones; sin `useEffect`. |
| `shared/ui/Button.tsx` | T4 | Botón con variantes `primario`/`secundario`/`peligro`, `type="button"` por defecto, `disabled` y foco visible. |
| `shared/ui/Input.tsx` | T5 | Campo de texto `'use client'` con `label`, `error`, `useId()`, `aria-invalid` y `aria-describedby`. |
| `shared/ui/Select.tsx` | T6 | Selector `'use client'` con `label`, `opciones`, `error` y el mismo patrón accesible que `Input`. |
| `shared/ui/TablePagination.tsx` | T7 | Tipo estructural `PaginacionTabla` y `<nav aria-label="Paginación">` con botones anterior/siguiente sobre `Button`. Interno, no exportado en el barrel. |
| `shared/ui/Table.tsx` | T8 | Tabla genérica `<T>` con `columnas`, `filas`, `obtenerClave`, `cargando`, `mensajeVacio` y `paginacion`; encabezados, celdas mediante `render`, estado de carga/vacío. |
| `shared/ui/Modal.tsx` | T9 | Modal `'use client'` sobre `<dialog>` nativo (`showModal()`/`close()`, `aria-labelledby`, cierre con `Escape` y botón "Cerrar"). |
| `shared/ui/Toast.tsx` | T10 | Notificación presentacional con `role`/`aria-live` según variante y botón "Cerrar notificación", sin temporizadores. |
| `shared/ui/index.ts` | T11 | Barrel público: `Button`, `Input`, `Modal`, `Select`, `Table` (+ `ColumnaTabla`), tipo `PaginacionTabla` y `Toast`. No exporta `TablePagination`. |
| `.rei/progress/work-items/2026-09-22_01-56__paginacion-y-sistema-de-diseno/impl.md` | T12 | Este documento. |

### Eliminados

| Archivo | Tarea | Motivo |
|---------|-------|--------|
| `shared/lib/.gitkeep` | T1 | La carpeta ya contiene `cn.ts`. |
| `shared/ui/.gitkeep` | T11 | La carpeta ya contiene los componentes. |

---

## Trazabilidad con los requisitos

| Requisito | Dónde se cubre |
|-----------|----------------|
| R1, R2 | `shared/api/pagination.ts` (alojamiento transversal y modelo `limite`/`offset`). |
| R3 | `calcularPagina` + `calcularTotalPaginas`, usados por `usePagination`. |
| R4 | Acciones `irAPagina`, `irAPaginaAnterior`, `irAPaginaSiguiente`. |
| R5 | `cambiarLimite` normaliza y reinicia el offset a 0. |
| R6 | `total = 0` ⇒ `calcularTotalPaginas` devuelve 1 y los indicadores quedan `false`. |
| R7 | `normalizarPagina` acota la página derivada a `[1, totalPaginas]`. |
| R8 | `normalizarLimite` recorta al rango 1–100. |
| R9 | `LIMITE_POR_DEFECTO = 20`. |
| R10 | Pieza sin ramificaciones por recurso; `Table`/`usePagination` independientes del dominio. |
| R11 | Aritmética en `pagination.ts`, separada del hook de React. |
| R12 | `hayPaginaAnterior` / `hayPaginaSiguiente`. |
| R13, R14 | Componentes en `shared/ui` con named exports y props tipadas. |
| R15 | `variante` de `Button` + `disabled` nativo. |
| R16 | `label` + `aria-invalid`/`aria-describedby` en `Input` y `Select`. |
| R17 | `Table` con encabezados, filas, `cargando`, `mensajeVacio` y `render` por celda. |
| R18 | `Table` + `TablePagination`. |
| R19 | `Modal` sobre `<dialog>` (`aria-labelledby`, `Escape`, restauración de foco nativa). |
| R20 | `Toast` con `role="alert"`/`role="status"` y botón de cierre. |
| R21 | `focus-visible` y controles semánticos en todos los componentes interactivos. |
| R22 | `shared/lib/cn.ts`. |
| R23 | Tests de `pagination.test.ts` y `cn.test.ts` (`V4`). |
| R24 | Sin dependencias nuevas; solo Tailwind, `clsx` y `tailwind-merge` ya instalados. |
| R25 | Todo vive en `shared/`; `shared/` no importa de `features/` ni de `app/`. |

---

## Proceso de verificación

Comandos ejecutados desde la raíz del repositorio.

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | **Pasa** | `All matched files use Prettier code style!` (tras `npm run format`). |
| `V2` | `npm run lint` | **Pasa** | ESLint sin errores ni advertencias. |
| `V3` | `npm run typecheck` | **Pasa** | `tsc --noEmit` sin errores, incluidos `Table<T>` y `Modal`. |
| `V4` | `npm test` | **Pasa** | 5 suites / 44 tests en verde, incluidas `pagination.test.ts` (15) y `cn.test.ts` (5). |
| `V5` | Validación manual | **No aplica** | El Work Item solo entrega la base; su validación visual e interactiva queda para los Work Items que integren los componentes en pantallas (`design.md`). |

Además, `bash .rei/init.sh` finalizó con **código de salida `0`**, con `V1`–`V4` en
verde.

Durante el desarrollo también se usaron verificaciones rápidas por tarea:
`npx jest <archivo>` para los tests y `npx tsc --noEmit` + `npx eslint <archivo>` tras cada
componente.

---

## Observaciones

- El `total` se recibe por parámetro en `usePagination` y todo lo derivado se calcula en
  render (sin `useEffect`), tal como exige `conventions.md`.
- `shared/ui/TablePagination.tsx` queda como módulo interno: no se re-exporta en el
  barrel, pero su tipo `PaginacionTabla` sí es público para tipar la prop `paginacion`.
- `PaginacionTabla` es estructural y compatible con `EstadoPaginacion`, de modo que un
  feature puede pasar el resultado del hook directamente sin adaptadores y sin que
  `shared/ui` dependa de `shared/api`.
- Ajustes manuales respecto al borrador de `design.md`: `normalizarPagina` devuelve 1
  cuando `totalPaginas` es 0 (caso contemplado como borde); `Table` expone `ColumnaTabla`
  y `TableProps` se mantiene interno. No se modifica la planificación.
- No se hicieron commits.
