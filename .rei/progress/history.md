# Bitácora histórica (append-only)

> Registro histórico de todas las sesiones completadas.
> Nunca modifiques entradas anteriores.
> Siempre añade nuevas entradas al final.

---

## 2026-09-22 — `2026-09-22_01-17__estructura-base-y-env`

- **Work Item:** `2026-09-22_01-17__estructura-base-y-env` — Estructura base del proyecto
  y configuración de entorno (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se creó la estructura base de capas manteniendo `app/` en la raíz
  (sin `src/`): `features/` y `shared/{api,ui,lib}` versionadas con `.gitkeep`, y
  `shared/config/` con `env.ts`. Se corrigió el formato de las variables de entorno
  (formato `KEY=valor`), moviendo los valores locales a `.env.local` y dejando
  `.env.example` como plantilla versionada sin secretos. Se ajustó `.gitignore`
  (`!.env.example` tras `.env*`) y se creó `shared/config/env.ts` como único punto de
  lectura tipada de `process.env` (`API_URL` en servidor/BFF y `NEXT_PUBLIC_API_URL` en
  cliente), con sus tests.
- **Archivos modificados:** creados `features/.gitkeep`, `shared/api/.gitkeep`,
  `shared/ui/.gitkeep`, `shared/lib/.gitkeep`, `shared/config/env.ts` y
  `shared/config/__tests__/env.test.ts`; renombrado `.env` → `.env.local` (reescrito);
  reescrito `.env.example`; modificado `.gitignore`.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (8/8) en verde; `V5` no aplica (cambio estructural y de configuración sin comportamiento
  interactivo). `bash .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_01-38__cliente-http-base`

- **Work Item:** `2026-09-22_01-38__cliente-http-base` — Cliente HTTP base en
  `shared/api` (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó el cliente HTTP base del frontend en `shared/api`
  sobre `axios`, con tres puntos de entrada: `http-client.ts` (núcleo isomorfo con
  cabeceras JSON por defecto, `buildUrl`, `Authorization: Bearer` opcional y normalización
  de rechazos en `ApiError`), `server-client.ts` (server-only; lee la cookie httpOnly vía
  `cookies()` y `getServerEnv()`) y `public-client.ts` (sin token; `getClientEnv()`).
  Se añadieron `request.ts` (helpers puros de cabeceras y URL), `errors.ts` (`ApiError`,
  `mapErrorResponse`, `toApiError`), `session-cookie.ts` (`SESSION_COOKIE_NAME`), `types.ts`
  (`ApiSchemas`) y tests de lógica pura. Se copió el OpenAPI del backend a
  `shared/api/openapi/api-1.json` y se generaron los tipos con `openapi-typescript`
  (`schema.d.ts`), ambos versionados y excluidos de Prettier/ESLint. No se creó barrel
  `shared/api/index.ts` y se eliminó `shared/api/.gitkeep`.
- **Archivos modificados:** creados `shared/api/{types,session-cookie,request,errors,http-client,server-client,public-client}.ts`,
  `shared/api/openapi/{api-1.json,schema.d.ts}`, `shared/api/__tests__/{request,errors}.test.ts`;
  modificados `package.json`, `package-lock.json`, `.prettierignore` y `eslint.config.mjs`;
  eliminado `shared/api/.gitkeep`.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (24/24, 16 nuevos) en verde; `V5` no aplica (módulos headless sin UI ni flujo
  interactivo). `bash .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_01-56__paginacion-y-sistema-de-diseno`

- **Work Item:** `2026-09-22_01-56__paginacion-y-sistema-de-diseno` — Hook genérico de
  paginación y sistema de diseño base (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se entregaron dos piezas base en la capa transversal. (1)
  Paginación en `shared/api`: `pagination.ts` con la aritmética pura (`normalizarLimite`,
  `calcularTotalPaginas`, `calcularPagina`, `calcularOffset`, `normalizarPagina`) y las
  constantes `LIMITE_POR_DEFECTO = 20`/`LIMITE_MINIMO = 1`/`LIMITE_MAXIMO = 100`, más
  `usePagination.ts` (`'use client'`), que guarda `limite`/`offset`, recibe `total` por
  parámetro y deriva en render los indicadores y acciones sin `useEffect`. (2) Sistema de
  diseño en `shared/ui`: `Button` (variantes primario/secundario/peligro), `Input` y
  `Select` (label + `aria-invalid`/`aria-describedby`), `Table` genérica con estados de
  carga/vacío y paginación, `TablePagination` interno (con el tipo estructural
  `PaginacionTabla`), `Modal` sobre `<dialog>` nativo y `Toast` presentacional; barrel
  `shared/ui/index.ts` sin exportar `TablePagination`. Se añadió `cn()` en `shared/lib` y se
  eliminaron `shared/lib/.gitkeep` y `shared/ui/.gitkeep`.
- **Archivos modificados:** creados
  `shared/api/{pagination,usePagination}.ts`, `shared/api/__tests__/pagination.test.ts`,
  `shared/lib/cn.ts`, `shared/lib/__tests__/cn.test.ts`,
  `shared/ui/{Button,Input,Select,Table,TablePagination,Modal,Toast}.tsx` y
  `shared/ui/index.ts`; eliminados `shared/lib/.gitkeep` y `shared/ui/.gitkeep`. Sin cambios
  en dependencias, configuración ni `app/`.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (44/44) en verde; `V5` no aplica (el Work Item solo entrega la base; la validación visual
  e interactiva queda para Work Items posteriores). `bash .rei/init.sh` finaliza con código
  de salida `0`.
- **Estado final:** `done`.
