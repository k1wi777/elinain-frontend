# Revisión — Rediseño visual del listado de ventas

- **Work Item:** `2026-09-23_17-53__rediseno-visual-listado-ventas`
- **Tipo:** task (Caso B)
- **Fecha:** 2026-09-23
- **Agente:** reviewer
- **Estado final:** `done`

## Resultado

Aprobado. El objetivo del `plan.md` se cumplió y las restricciones se respetaron.

## Verificaciones

| ID | Comando | Resultado |
|----|---------|-----------|
| V1 | `npm run format:check` | Pasa — "All matched files use Prettier code style!". |
| V2 | `npm run lint` | Pasa — ESLint sin errores. |
| V3 | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores. |
| V4 | `npm test` | Pasa — 49 suites, 391 tests en verde (incluye los 4 de `resumen.test.ts`). |
| V5 | Validación manual (`/ventas`, ruta protegida) | Pendiente de la validación del usuario; no se marca como superada. |

- `bash .rei/init.sh` finaliza con código de salida `0` (V1–V4 en `[OK]`; el `[WARN]` es
  el aviso esperado de sesión activa en `current.md`).
- `git status` del alcance confirma solo los archivos previstos: modificados
  `app/(dashboard)/ventas/page.tsx`,
  `app/(dashboard)/ventas/_components/listado-con-contratos.tsx`,
  `features/ventas/components/VentasLista.tsx` y
  `features/ventas/components/VentasListado.tsx`; nuevos
  `app/(dashboard)/ventas/loading.tsx`, `features/ventas/resumen.ts` y
  `features/ventas/__tests__/resumen.test.ts`.

## Observaciones

- **Objetivo:** `/ventas` compone encabezado oscuro (eyebrow, `h1` con
  `aria-labelledby`, descripción), cinco tarjetas de resumen y listado en
  `tema="oscuro"`; `page.tsx` queda como contenedor `max-w-7xl`; `loading.tsx` reproduce
  la estructura sin saltos de layout.
- **Datos reales:** `calcularResumenVentas` solo suma `valor_bruto`, `utilidad_total`,
  `valor_comerciante`, `valor_tercero` y `costo_estimado_compra`, todos campos reales de
  `VentaRespuestaDto`; la rentabilidad es `utilidad_total / costo_estimado_compra` y es
  `null` si el costo acumulado no es positivo. La nota visible aclara que los agregados
  corresponden a los registros de la página. No hay merma, GPD, curva de engorde, próximo
  lote, garantías, tasas ni estados inventados.
- **Lógica pura con tests:** `features/ventas/__tests__/resumen.test.ts` cubre lista
  vacía, sumas reales, costo cero (`rentabilidad` `null`) y valores nulos.
- **Restricciones respetadas:** no se modificaron hooks, `api/`, tipos, queries,
  mutaciones, paginación, rutas, permisos, modales, toasts ni mensajes; `VentasSeccion` y
  `VentaCard` quedaron intactos; no se añadieron buscador, rango temporal, PDF, auditoría,
  firma, notificaciones ni acciones/mutaciones; `shared/ui`, `features/ventas/index.ts` y
  `package.json` sin cambios. El feature `ventas` no importa de `features/contratos`.
- **Única desviación resuelta:** el plan ubicaba el CTA `Registrar venta` a la vez en el
  encabezado (paso 2) y "en la misma fila" que el `Select` (bullet de barra de filtros).
  El implementer mantuvo un único CTA en el encabezado, lo que además concuerda con el
  `loading.tsx` del paso 5 y evita duplicar la acción; quedó documentado en `impl.md`. Se
  considera una resolución válida de una contradicción interna del plan, no una
  desviación del objetivo.
- **Ajuste mínimo justificado:** `VentasLista` solo cambió el color de los esqueletos de
  carga en tema oscuro; el resto de la variante oscura ya existía.

## Acciones requeridas

Ninguna. V5 queda a cargo del usuario con los pasos documentados en `impl.md`.
