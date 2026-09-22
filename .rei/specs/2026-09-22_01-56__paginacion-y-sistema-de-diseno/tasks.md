# Tareas — Hook genérico de paginación y sistema de diseño base

> Work Item: `2026-09-22_01-56__paginacion-y-sistema-de-diseno` (`type: feature`)
>
> Tareas discretas y ordenadas. El Implementer marca cada tarea como `[x]`
> inmediatamente al terminarla. Cada tarea referencia los requisitos (`R…`) que
> implementa.

---

- [x] **T1 — Helper `cn()`.** Crear `shared/lib/cn.ts` exportando
  `cn(...clases: ClassValue[]): string` sobre `clsx` + `tailwind-merge`, con JSDoc en
  español; crear `shared/lib/__tests__/cn.test.ts` cubriendo composición, condicionales y
  resolución de conflictos. Eliminar `shared/lib/.gitkeep`. (R22, R23)

- [x] **T2 — Lógica pura de paginación.** Crear `shared/api/pagination.ts` con
  `LIMITE_POR_DEFECTO = 20`, `LIMITE_MINIMO = 1`, `LIMITE_MAXIMO = 100` y las funciones
  `normalizarLimite`, `calcularTotalPaginas`, `calcularPagina`, `calcularOffset` y
  `normalizarPagina`, con JSDoc. Crear `shared/api/__tests__/pagination.test.ts` cubriendo
  los casos borde (`total = 0`, límite fuera de rango, página/offset fuera de rango).
  (R1, R2, R3, R6, R7, R8, R9, R11, R23)

- [x] **T3 — Hook de paginación.** Crear `shared/api/usePagination.ts` con `'use client'`,
  los tipos `ParametrosPaginacion`/`EstadoPaginacion` y `usePagination({ total,
  limiteInicial?, offsetInicial? })`: estado `limite`/`offset`, derivados `totalPaginas`,
  `paginaActual`, `hayPaginaAnterior` y `hayPaginaSiguiente`, y acciones `irAPagina`,
  `irAPaginaAnterior`, `irAPaginaSiguiente`, `cambiarLimite` (reinicia a la primera
  página) y `reiniciar`. Sin `useEffect`. (R2, R3, R4, R5, R6, R7, R10, R12)

- [x] **T4 — Componente `Button`.** Crear `shared/ui/Button.tsx` con props
  `ButtonHTMLAttributes<HTMLButtonElement>` más `variante?: "primario" | "secundario" |
  "peligro"` (por defecto `"primario"`), `type="button"` por defecto, estilos con `cn()`,
  estado `disabled` y foco visible. (R13, R14, R15, R21)

- [x] **T5 — Componente `Input`.** Crear `shared/ui/Input.tsx` con `'use client'`, props
  `InputHTMLAttributes<HTMLInputElement>` más `label: string` y `error?: string`; `useId()`
  como respaldo del `id`, `<label htmlFor>`, `aria-invalid` y `aria-describedby` cuando hay
  error. (R13, R14, R16, R21)

- [x] **T6 — Componente `Select`.** Crear `shared/ui/Select.tsx` con `'use client'`, props
  `SelectHTMLAttributes<HTMLSelectElement>` más `label: string`,
  `opciones: { valor: string; etiqueta: string }[]` y `error?: string`; mismo patrón
  accesible que `Input`. (R13, R14, R16, R21)

- [x] **T7 — Controles de paginación de la tabla.** Crear `shared/ui/TablePagination.tsx`
  (interno, no exportado) con el tipo estructural `PaginacionTabla` y un `<nav
  aria-label="Paginación">` con botones anterior/siguiente (basados en `Button`,
  deshabilitados según los indicadores) y el texto "Página X de Y". (R18, R21)

- [x] **T8 — Componente `Table`.** Crear `shared/ui/Table.tsx` genérico `<T>` con
  `columnas: ColumnaTabla<T>[]`, `filas`, `obtenerClave`, `cargando?`, `mensajeVacio?` y
  `paginacion?`; renderizar `<table>` semántica con encabezados, filas, estado de carga y
  estado vacío, delegando la paginación en `TablePagination`. El tipo `PaginacionTabla`
  debe ser asignable desde `EstadoPaginacion`. (R10, R13, R14, R17, R18, R21)

- [x] **T9 — Componente `Modal`.** Crear `shared/ui/Modal.tsx` con `'use client'`, props
  `{ abierto, titulo, onCerrar, children, pie? }`, sobre `<dialog>` nativo: `showModal()`/
  `close()` sincronizados con `abierto`, `aria-labelledby` con `useId`, cierre con `Escape`
  (evento `cancel`) y botón "Cerrar". (R13, R14, R19, R21)

- [x] **T10 — Componente `Toast`.** Crear `shared/ui/Toast.tsx` presentacional con props
  `{ abierto, mensaje, variante?: "exito" | "error", onCerrar? }`,
  `role="alert"`/`role="status"` con `aria-live` y botón "Cerrar notificación"; sin
  temporizadores. (R13, R14, R20, R21)

- [x] **T11 — API pública del sistema de diseño.** Crear `shared/ui/index.ts`
  re-exportando `Button`, `Input`, `Select`, `Table` (con `ColumnaTabla` y
  `PaginacionTabla`), `Modal` y `Toast`; no exportar `TablePagination`. Eliminar
  `shared/ui/.gitkeep`. (R13, R14)

- [x] **T12 — Checkpoints y evidencia.** Ejecutar `npm run format`, `V1`
  (`format:check`), `V2` (`lint`), `V3` (`typecheck`) y `V4` (`test`); confirmar
  `bash .rei/init.sh` con salida `0`. Registrar en
  `.rei/progress/work-items/2026-09-22_01-56__paginacion-y-sistema-de-diseno/impl.md` la
  evidencia de `V1`–`V4` y dejar `V5` marcado como **no aplica** (no se requiere
  validación manual en este Work Item). (R23)

---

## Orden y dependencias

1. `T1` y `T2` son independientes entre sí y no dependen de nada.
2. `T3` depende de `T2` (usa la lógica pura).
3. `T4` depende de `T1` (`cn()`); `T5`, `T6` dependen de `T1` también.
4. `T7` depende de `T4` (los botones usan `Button`); `T8` depende de `T7` y `T1`.
5. `T9` y `T10` dependen de `T1`.
6. `T11` depende de `T4`–`T10`.
7. `T12` se ejecuta al final, con todo implementado.

## Fuera de alcance

- Pantallas y hooks de datos de terceros, fincas y contratos (composición en `app/` y
  TanStack Query por feature).
- Capa de tokens de diseño o cambios en `app/globals.css`.
- `ToastProvider`/contexto, auto-cierre de toasts y atrapado de foco manual.
- BFF de autenticación y cualquier otra pieza de UI no listada en R13.
