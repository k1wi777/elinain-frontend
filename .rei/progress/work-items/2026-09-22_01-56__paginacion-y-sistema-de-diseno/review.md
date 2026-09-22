# Revisión — Hook genérico de paginación y sistema de diseño base

> Work Item: `2026-09-22_01-56__paginacion-y-sistema-de-diseno` (`type: feature`)
>
> Agente: `reviewer`
> Resultado: **aprobado** (`done`).

---

## Alcance revisado

Se aplicó el **Caso A** (`type == feature`) del rol `reviewer`. Se leyeron
`requirements.md`, `design.md`, `tasks.md`, `meta.json` y el reporte del Implementer
(`impl.md`), y se inspeccionó directamente el código en `shared/` sin confiar solo en el
reporte.

---

## Verificaciones realizadas

### Requisitos (`R1`–`R25`)

| Requisito | Comprobación independiente | Resultado |
|-----------|----------------------------|-----------|
| R1, R11 | `shared/api/pagination.ts` contiene aritmética pura sin React ni TanStack Query, separada del hook. | Pasa |
| R2, R8, R9 | Modelo `limite`/`offset`; `normalizarLimite` recorta a `LIMITE_MINIMO = 1`/`LIMITE_MAXIMO = 100` y usa `LIMITE_POR_DEFECTO = 20`. | Pasa |
| R3, R6, R7 | `calcularPagina`, `calcularTotalPaginas` (mínimo 1) y `normalizarPagina` acotan la página derivada; el hook usa `normalizarPagina` sobre `paginaActual`. | Pasa |
| R4, R12 | Acciones `irAPagina`, `irAPaginaAnterior`, `irAPaginaSiguiente`; indicadores `hayPaginaAnterior`/`hayPaginaSiguiente`. | Pasa |
| R5 | `cambiarLimite` normaliza el nuevo límite y reinicia `offset` a `0`. | Pasa |
| R10 | Piezas sin ramificaciones por recurso; `Table`/`usePagination` independientes del dominio. | Pasa |
| R13–R22 | `Button`, `Input`, `Select`, `Table`, `Modal`, `Toast` en `shared/ui`; variantes de `Button`; `aria-invalid`/`aria-describedby` en `Input`/`Select`; `Table` con estados de carga/vacío y paginación; `Modal` sobre `<dialog>`; `Toast` con `role`/`aria-live`; `focus-visible`; `cn()` en `shared/lib`. | Pasa |
| R23 | `shared/api/__tests__/pagination.test.ts` y `shared/lib/__tests__/cn.test.ts` cubren lógica pura; `V4` pasa. | Pasa |
| R24 | `package.json`/`package-lock.json` sin cambios; solo Tailwind, `clsx` y `tailwind-merge` ya instalados. | Pasa |
| R25 | `shared/` no importa de `features/` ni de `app/` (grep sin coincidencias). | Pasa |

`R26` no existe en `requirements.md` (eliminado por decisión del usuario); no se exige.

### Tareas (`T1`–`T12`)

Las doce tareas de `tasks.md` están marcadas `[x]` y cada una tiene su artefacto
correspondiente en el repositorio. `T12` (checkpoints y evidencia) está cumplida: `impl.md`
registra `V1`–`V4` y `V5` como no aplica.

### Arquitectura y convenciones

- Raíz sin `src/`: todo vive en `shared/{api,lib,ui}`. Correcto.
- `shared/` no importa de `features/` ni de `app/`. Correcto.
- Sin dependencias nuevas de interfaz. Correcto.
- `'use client'` solo en `shared/api/usePagination.ts`, `shared/ui/Input.tsx`,
  `shared/ui/Select.tsx` y `shared/ui/Modal.tsx` (los que usan hooks). Correcto.
- Sin `any`, `@ts-ignore` ni `@ts-expect-error`. Correcto.
- Named exports en todos los componentes; sin `export default`. Correcto.
- JSDoc y textos de interfaz en español. Correcto.
- Sin `useEffect` para datos ni estado derivable sincronizado con efectos (el `useEffect` de
  `Modal` sincroniza el DOM con `abierto`, previsto en `design.md`). Correcto.
- Sin `console.log`, `debugger`, `TODO` ni código muerto. Correcto.
- `shared/lib/.gitkeep` y `shared/ui/.gitkeep` eliminados según el diseño. Correcto.

### Coincidencia con `design.md`

- Paginación pura (`pagination.ts`) + hook (`usePagination.ts`) en `shared/api`; el hook
  recibe `total` por parámetro y deriva en render. Correcto.
- `cn()` en `shared/lib` sobre `clsx` + `tailwind-merge`. Correcto.
- Componentes en `shared/ui`, uno por archivo, sobre Tailwind. Correcto.
- `Modal` sobre `<dialog>` con `showModal()`/`close()`, `aria-labelledby`, cierre por
  `Escape` y botón "Cerrar". Correcto.
- `Toast` presentacional, sin temporizadores ni provider. Correcto.
- Tipo estructural `PaginacionTabla` compatible con `EstadoPaginacion`; el barrel
  `shared/ui/index.ts` **no** exporta `TablePagination`. Correcto.
- Única diferencia menor: `design.md` (sección `Table`) menciona que `PaginacionTabla` se
  define en `shared/ui/Table.tsx`, pero `tasks.md` (`T7`) indica crearlo en
  `shared/ui/TablePagination.tsx`. La implementación sigue `tasks.md`, mantiene el tipo
  disponible desde el barrel y no altera el comportamiento ni la API pública. No se
  considera desviación funcional.

### Alcance

No hay alcance extra: no se implementaron pantallas de terceros/fincas/contratos, ni hooks
de datos con TanStack Query, ni BFF de autenticación, ni tokens de diseño, ni cambios en
`app/globals.css`, `package.json`, `tsconfig.json`, Prettier/ESLint/Jest.

### Checkpoints

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | **Pasa** | `All matched files use Prettier code style!`. |
| `V2` | `npm run lint` | **Pasa** | ESLint sin errores. |
| `V3` | `npm run typecheck` | **Pasa** | `tsc --noEmit` sin errores (incluye `Table<T>` y `Modal`). |
| `V4` | `npm test` | **Pasa** | 5 suites / 44 tests en verde, incluidas `pagination.test.ts` y `cn.test.ts`. |
| `V5` | Validación manual | **No aplica** | El Work Item solo entrega la base; su validación visual e interactiva corresponde a los Work Items que integren los componentes en pantallas. |

`bash .rei/init.sh` finaliza con **código de salida `0`** y `V1`–`V4` en verde.

---

## Observaciones

- `TableProps` se exporta desde `shared/ui/Table.tsx` pero no se re-exporta en el barrel;
  queda interno a la API pública, lo que es consistente con `conventions.md`.
- La compatibilidad estructural entre `PaginacionTabla` y `EstadoPaginacion` permite pasar
  el resultado del hook directamente a `Table` sin acoplar `shared/ui` a `shared/api`.
- La diferencia de ubicación de `PaginacionTabla` señalada arriba se documenta como
  observación, no como incumplimiento.

---

## Acciones requeridas

Ninguna. El Work Item cumple su planificación, arquitectura, convenciones y checkpoints.

---

## Estado final

**`done`**.
