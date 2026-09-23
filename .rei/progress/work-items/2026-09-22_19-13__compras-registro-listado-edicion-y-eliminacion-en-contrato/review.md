# Revisión — Compras en el detalle de contrato

> Work Item: `2026-09-22_19-13__compras-registro-listado-edicion-y-eliminacion-en-contrato`
> (`type: feature`) · Agente: Reviewer · Fecha: 2026-09-22

---

## Resultado

`done` — la implementación cumple R1–R21, completa T1–T9 y no introduce alcance extra.
Todas las verificaciones automatizadas pasan de forma independiente y `bash .rei/init.sh`
termina con código `0`. `V5` (validación manual) queda a cargo del usuario, con los pasos
de `impl.md`.

## Verificaciones

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — "All matched files use Prettier code style!" |
| `V2` | `npm run lint` | Pasa — ESLint sin errores |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores |
| `V4` | `npm test` | Pasa — 27 suites / 248 tests (incluidas las 3 suites nuevas de `compras` y `shared/lib/__tests__/fechas.test.ts`) |
| `V5` | Validación manual | Pendiente del usuario (no aplica como bloqueo de código) |

`bash .rei/init.sh`: código de salida `0`, con `V1`–`V4` en `[OK]`.

Comprobación HTTP independiente contra el dev server activo:
`GET /api/compras?contrato_id=…&limite=20&offset=0` sin sesión → `401`
`{"mensaje":"Tu sesión no es válida o ha expirado."}` (ruta reconocida y BFF operativo).

## Verificación por requisitos y tareas

- **R1–R6 (listado):** `ComprasSeccion` se compone en `detalle-con-relaciones.tsx` con
  `<ComprasSeccion contratoId={id} />`, filtra por contrato y pagina en servidor con
  `limite`/`offset`, mostrando fecha, cantidad, peso promedio, precio/kilo, valor total y
  nota; expone carga y vacío vía `Table` y error en español vía `role="alert"`.
- **R7–R10 (registro):** `esquemaCompra` exige los cinco campos (cantidad entera `> 0`,
  peso y precio `> 0`, nota no vacía, fecha válida con `fechaLocalAIso`); el POST del BFF
  valida de forma defensiva y responde `201`; las mutaciones invalidan
  `clavesCompras.listas()` y el valor total reaparece en el listado refrescado.
- **R11–R16 (edición):** `CompraForm` precarga con `isoAFechaLocal` y no renderiza campo de
  contrato; el `PATCH` descarta `contrato_id` y exige al menos un mutable; editar/eliminar
  siempre visibles; el `409` devuelve el texto exacto de R15 y el formulario no se cierra.
- **R17–R20 (eliminación):** `EliminarCompraModal` pide confirmación previa; el `DELETE`
  responde `200`; el `409` devuelve el texto exacto de R19 y el diálogo permanece abierto.
- **R21 (fechas):** captura, precarga y presentación usan las utilidades de
  `@/shared/lib/fechas` en zona Colombia (UTC−5) e ISO 8601.
- **T1 (refactor):** `shared/lib/fechas.ts` y `shared/lib/__tests__/fechas.test.ts` existen;
  `features/contratos/fechas.ts` y su test ya no; los imports de `features/contratos/schemas.ts`
  y de `ContratoForm`, `ContratoDetalle`, `ContratosListado`, `ContratoCrear` y `ContratoEditar`
  apuntan a `@/shared/lib/fechas`; `grep` no encuentra referencias a `features/contratos/fechas`.
- **T2–T4 (BFF):** `GET /api/compras` con `limite`/`offset`/`contrato_id` normalizados;
  `POST` validado (`400`); `[id]` con `GET`, `PATCH` (solo mutables) y `DELETE` `200`;
  `respuestaError` propaga el código real (red → `502`) y los `409` de modificar/eliminar
  con sus mensajes específicos.
- **T5–T7 (feature):** tipos desde `ApiSchemas`; `api/compras.ts`; `clavesCompras`; hooks que
  invalidan `clavesCompras.listas()`; `mensajes-error` con `409`/`0`; componentes; `index.ts`
  expone solo `ComprasSeccion`.
- **T8 (composición):** placeholder de `ContratoDetalle` → "Próximamente: ventas, ciclos y
  costos."; `features/compras` y `features/contratos` no se importan entre sí; `shared/` no
  importa de `features/` ni de `app/`.
- **T9 (verificación):** `V1`–`V4` reejecutados en verde y `bash .rei/init.sh` con código `0`.

## Convenciones

- `strict` sin `any`, `@ts-ignore` ni `@ts-expect-error`; sin `console.log`/`TODO`.
- Named exports; `'use client'` en el nodo más bajo; sin `fetch` en componentes ni
  `useEffect` para datos; sin `export default` fuera de Next.
- Sin dependencias nuevas ni cambios en `package.json`, `shared/api/openapi/*`, ESLint,
  Prettier o Jest (confirmado con `git status`/`git diff`).

## Observaciones

- **No bloqueante:** `CompraFormModal` se renderiza siempre (el `Modal` permanece montado) y
  depende de `key={compra?.id ?? "crear"}` para reiniciar el formulario. Cuando se registra
  una compra tras otra sin cambiar de `key` (crear → cancelar/crear o crear → éxito → crear),
  el formulario conserva los valores previos. No incumple R1–R21 ni T1–T9; se recomienda, a
  futuro, condicionar el render del modal como en `TercerosTable` para garantizar un
  formulario limpio en cada apertura.

## Acciones requeridas

Ninguna.
