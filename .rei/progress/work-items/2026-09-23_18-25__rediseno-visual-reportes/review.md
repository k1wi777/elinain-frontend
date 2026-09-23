# Revisión — Rediseño visual de reportes: contratos activos e historial de ventas

- **Work Item:** `2026-09-23_18-25__rediseno-visual-reportes`
- **Tipo:** task (Caso B)
- **Fecha:** 2026-09-23
- **Agente:** reviewer

## Estado final

`done`.

## Verificaciones realizadas

| ID | Comando | Resultado |
|----|---------|-----------|
| V1 | `npm run format:check` | Pasa — "All matched files use Prettier code style!". |
| V2 | `npm run lint` | Pasa — ESLint sin errores. |
| V3 | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores. |
| V4 | `npm test` | Pasa — 52 suites / 404 tests en verde. |
| V5 | Validación manual | Pendiente — la ejecuta el usuario sobre ambas rutas protegidas; no se marca como superada. |

`bash .rei/init.sh` finaliza con código de salida `0` (V1–V4 `[OK]`; único `[WARN]` esperado
por la sesión activa en `current.md`).

## Observaciones

- **Objetivo cumplido:** ambas pantallas (`/reportes/contratos-activos` y
  `/reportes/historial-ventas`) pasan al tema oscuro con encabezado (eyebrow dorado, `h1` con
  `aria-labelledby` y descripción), navegación superior y tablas `tema="oscuro"`.
- **Navegación:** `NavegacionReportes` es un `nav` con dos `next/link` a las rutas ya
  existentes, marca el activo con `aria-current="page"` y subrayado dorado. No crea rutas ni
  pestañas nuevas; los `page.tsx` solo se adelgazan a `max-w-7xl` y conservan `metadata`.
- **Datos reales:** las columnas y tarjetas usan únicamente campos del OpenAPI
  (`ContratoActivoDetalleDto`, `ResumenHistorialVentasDto`, `VentaHistorialItemDto`). Las
  sumas nuevas (`calcularResumenContratos`) y la participación derivada
  (`calcularParticipacionComerciante`, con `null` ante total cero/no finito) parten de campos
  existentes; no se inventan potreros, hectáreas, aforos, GPD, inspecciones ni estados.
- **Lógica pura nueva con tests:** `resumen-contratos.ts` (4 tests) y `participacion.ts`
  (3 tests), ambos en `features/reportes/__tests__/`.
- **Sin tocar:** `hooks/`, `api/`, `types.ts`, `orden.ts`, `query-keys.ts`, `formatos.ts`,
  `mensajes-error.ts`, `index.ts`, `shared/ui/*`, `app/api/*` ni otras pantallas. `git status`
  solo lista componentes de `reportes`, los dos `page.tsx` y los archivos nuevos.
- **Se conservan:** `ordenarContratosPorUtilidadDescendente`,
  `ordenarVentasPorFechaDescendente`, `LIMITE_VENTAS_VISIBLES`, `recortarVentas` y el control
  "Ver todo" / "Ver menos".
- **Sin alcance añadido:** no hay buscador, filtros, rango temporal, descargas, auditoría,
  certificados, notificaciones, mutaciones ni acciones nuevas; sin dependencias nuevas.
- **`TarjetaIndicador`:** la prop `tema` es opcional con `"claro"` por defecto y los estilos
  del tema claro son idénticos a los previos, por lo que no rompe a otros consumidores.

## Acciones requeridas

Ninguna.
