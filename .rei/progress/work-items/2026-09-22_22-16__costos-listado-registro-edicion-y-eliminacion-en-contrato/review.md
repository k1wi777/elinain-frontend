# Revisión — Costos embebidos en el detalle del contrato

> Work Item: `2026-09-22_22-16__costos-listado-registro-edicion-y-eliminacion-en-contrato` (`type: feature`)
>
> Resultado: **aprobado**.

## Verificaciones realizadas

### Requisitos (R1–R20)

Revisado el código fuente real, no solo `impl.md`:

- **R1–R4, R2, R3** — `features/costos/components/CostosSeccion.tsx` lista de forma paginada y filtrada por `contrato_id` (`useCostos` + `Table` con `cargando`/`error`); errores traducidos con `mensajeErrorListarCostos`.
- **R5** — Aviso visible en la sección (`CostosSeccion.tsx:272-274`) y en el formulario (`CostoForm.tsx:143-146`): "los costos son informativos y no afectan el cálculo de la utilidad real."
- **R6–R9** — `CostoForm` cubre los cuatro campos; `datalist id="tipos-costo"` sin restringir el valor; `monto` numérico > 0 con `setValueAs`; `fecha` `type="date"`; `esquemaCosto` valida tipos y usa `fechaDiaAIso`; `handleGuardar` envía `contrato_id`, `fechaDiaAIso(fecha)` y notifica con Toast.
- **R10, R13** — `registroDeshabilitado = contratoEstado === "cerrado"` deshabilita solo "Agregar costo" y muestra el motivo; "Editar" y "Eliminar" permanecen habilitados.
- **R11, R12** — Mismo formulario precargado con `isoAFechaDia`; `EliminarCostoModal` usa `Modal` (sin `window.confirm`).
- **R14, R15** — `mensajes-error.ts` mapea `400`/`404`/`0`/resto con mensajes en español; crear separa "El contrato no existe." y editar/eliminar "El costo no existe."; nunca se expone el mensaje crudo.
- **R16** — Los hooks invalidan `clavesCostos.listas()` y `onCambio` invalida `clavesContratos.todas` en `detalle-con-relaciones.tsx`.
- **R17** — BFF `app/api/costos/route.ts` (GET/POST) y `app/api/costos/[id]/route.ts` (GET/PATCH/DELETE) con `createServerClient` (cookie httpOnly).
- **R18** — `FORMATO_MONEDA` es-CO/COP en el listado.
- **R19** — No existen `app/(dashboard)/costos/page.tsx` ni `features/costos/components/CostosProximamente.tsx`; sin enlace en `layout.tsx`; sin `/costos` en `middleware.ts`.
- **R20** — `ContratoDetalle.tsx` no menciona "Próximamente: ciclos y costos".

### Tareas (T1–T21)

Todas marcadas `[x]` y contrastadas con el código: feature completo (`types`, `schemas`, `mensajes-error`, `query-keys`, `api/`, `hooks/`, 4 componentes), BFF, tests puros, integración en `app/` y limpieza de ruta/placeholder/`Proximamente`. Sin desviaciones respecto a `design.md`.

### Arquitectura

- `features/costos` no importa de otros features; la composición vive en `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`.
- `shared/` no importa de `features/`; sin `fetch` en componentes ni en `app/` (solo el caso preexistente en el helper server-side de geocodificación).
- `process.env` solo se lee en `shared/config/env.ts` (y su test).
- Barril `features/costos/index.ts` exporta únicamente `CostosSeccion`; se eliminó `shared/ui/Proximamente.tsx` junto con su export.

### Convenciones

- Sin `any`, `@ts-ignore`, `@ts-expect-error`, `console.log`, `export default` ni `useEffect` en el feature; DTOs tomados del OpenAPI (`ApiSchemas`) sin redefinir; `monto` con formato local declarado como constante (sin importar de `features/ventas`); mensajes en español sin detalle técnico.

### Checkpoints

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — "All matched files use Prettier code style!". |
| `V2` | `npm run lint` | Pasa — ESLint sin salida, código 0. |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Pasa — 37 suites / 330 tests, 0 fallos. |

`bash .rei/init.sh` finaliza con código de salida `0` y los cuatro checkpoints en verde.

## Observaciones

- `V5` (validación manual) queda a cargo del usuario; no bloquea la revisión. El guion está documentado en `impl.md`.
- La nota de `impl.md` sobre el artefacto generado `.next/types` obsoleto es correcta: no afecta al código fuente y `V3` pasa sobre el árbol final.
- Sin dependencias nuevas ni cambios en `shared/api/openapi/schema.d.ts`.

## Acciones requeridas

Ninguna.
