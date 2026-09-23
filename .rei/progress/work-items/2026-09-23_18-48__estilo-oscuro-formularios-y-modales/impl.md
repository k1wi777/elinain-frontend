# Implementación — Estilo oscuro de formularios y modales con glassmorphism

- **Work Item:** `2026-09-23_18-48__estilo-oscuro-formularios-y-modales`
- **Tipo:** `task`
- **Implementer:** implementer
- **Plan:** `.rei/specs/2026-09-23_18-48__estilo-oscuro-formularios-y-modales/plan.md`

## Resumen

Se alinearon todos los formularios y modales con la estética oscura del shell centralizando
el cambio en `shared/ui`: `Input`, `Select` y `Modal` pasan a oscuro por defecto, el `Modal`
usa glassmorphism y la variante `secundario` de `Button` (Cancelar/Cerrar/paginación) se
volvió legible sobre fondo oscuro. Después se corrigieron únicamente los textos, tarjetas y
desplegables que aún usaban colores claros en terceros, fincas, contratos, compras, ciclos,
costos y ventas. No se tocó lógica de formularios, zod, `react-hook-form`, props públicas,
hooks, `api/`, `schemas.ts`, queries, mutaciones, rutas, mensajes, textos funcionales ni
accesibilidad. No se añadieron dependencias.

## Pasos del plan

Los 11 pasos ejecutables se completaron en orden y quedaron marcados `[x]` en `plan.md`. El
paso 12 (V5) queda **pendiente** de la validación manual del usuario sobre rutas protegidas.

## Archivos modificados

### `shared/ui` (base del sistema de diseño)

- `shared/ui/Input.tsx` — control oscuro por defecto (`border-white/10`, `bg-white/[0.03]`,
  `text-white`, `placeholder:text-zinc-500`, foco dorado); label `text-zinc-300`; error
  `border-red-500/60` y mensaje `text-red-400`; `[color-scheme:dark]` y neutralización del
  autofill de Chrome con la superficie del sistema. Se conservan `useId`, `aria-invalid`,
  `aria-describedby` y la firma pública.
- `shared/ui/Select.tsx` — misma base oscura y estados de error que `Input`, con
  `[&>option]:bg-elinain-surface [&>option]:text-white` y `[color-scheme:dark]`. Se conserva
  la accesibilidad y la firma.
- `shared/ui/Modal.tsx` — tema oscuro con `glass-panel rounded-2xl` y
  `backdrop:bg-black/60 backdrop:backdrop-blur-sm`; cabecera/pie `border-white/8`, título
  `text-white` y botón "Cerrar" oscuro con foco dorado. Se **retiró la prop `tema`** y su
  variante clara (sin consumidores) para simplificar la API. No se alteró el comportamiento
  nativo de `<dialog>` (`showModal`, foco atrapado, `Escape`, `aria-modal`).
- `shared/ui/Button.tsx` — variante `secundario` oscura por defecto; `primario` y `peligro`
  intactos.

### Terceros

- `features/terceros/components/TerceroForm.tsx` — error general `text-red-400`.
- `features/terceros/components/EliminarTerceroModal.tsx` — párrafo `text-zinc-300`, error
  `text-red-400`.

### Fincas

- `features/fincas/components/FincaForm.tsx` — placeholder de carga del mapa
  `border-white/8 bg-white/[0.03]`, nota `text-zinc-400` y errores `text-red-400`.
- `features/fincas/components/FincaCrear.tsx` / `FincaEditar.tsx` — título `text-white`,
  descripción `text-zinc-400` y error `text-red-400`.
- `features/fincas/components/EliminarFincaModal.tsx` — párrafo `text-zinc-300`, error
  `text-red-400`.
- `features/fincas/components/AutocompletarDireccion.tsx` — desplegable
  `border-white/10 bg-elinain-surface shadow-2xl`, opciones `text-zinc-200`, opción activa
  `bg-elinain-gold/15 text-white` y error `text-red-400`; roles y teclado intactos.
- `features/fincas/components/SelectorMapa.tsx` — borde del contenedor `border-white/8
  bg-white/[0.03]`.
- `features/fincas/components/FincaDetalleModal.tsx` — se retiró `tema="oscuro"` (la prop ya
  no existe) y se actualizó el JSDoc; el detalle mantiene sus clases oscuras propias.

### Contratos

- `features/contratos/components/ContratoForm.tsx` — nota `text-zinc-400`, error `text-red-400`.
- `features/contratos/components/ContratoCrear.tsx` / `ContratoEditar.tsx` — título
  `text-white`, descripción `text-zinc-400` y error `text-red-400`.

### Compras, ciclos y costos

- `features/compras/components/CompraForm.tsx` y `features/ciclos/components/CicloForm.tsx` —
  nota `text-zinc-400`, error `text-red-400`.
- `features/costos/components/CostoForm.tsx` — nota informativa
  `border-white/8 bg-white/[0.03] text-zinc-400`, error `text-red-400`.
- `EliminarCompraModal.tsx`, `EliminarCicloModal.tsx` y `EliminarCostoModal.tsx` — párrafo
  `text-zinc-300`, error `text-red-400`; botón "Eliminar" se mantiene en `peligro`.

### Ventas

- `features/ventas/components/VentaForm.tsx` — error `text-red-400`.
- `features/ventas/components/ResultadoVentaModal.tsx` — `text-zinc-900` → `text-white` en
  los encabezados y valores del desglose.

### Wrappers de `app/`

- `app/(dashboard)/fincas/_components/nueva-con-propietarios.tsx` y
  `editar-con-propietarios.tsx`; `app/(dashboard)/contratos/_components/nuevo-con-relaciones.tsx`
  y `editar-con-relaciones.tsx` — errores `text-red-400`, carga `text-zinc-400`.

## Verificación

Ejecutada sobre el árbol final, sin cambios pendientes.

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| V1 | `npm run format:check` | Pasa | `All matched files use Prettier code style!`. Se ejecutó antes `npm run format`. |
| V2 | `npm run lint` | Pasa | ESLint sin salida ni errores. |
| V3 | `npm run typecheck` | Pasa | `tsc --noEmit` sin errores (confirma que la retirada de `tema` no rompe tipos). |
| V4 | `npm test` | Pasa | 52 suites / 404 tests en verde. Sin tests nuevos: el cambio es solo de presentación. |
| V5 | Validación manual del usuario | Pendiente | No ejecutable por el agente (rutas protegidas). Ver checklist abajo. |

### V5 — Checklist de validación manual

Sobre `bash .rei/dev` (`npm run dev`) y sesión iniciada:

1. `/terceros`: crear/editar socio en modal (campos, Cancelar/Guardar) y eliminar socio
   (modal oscuro con glass, error `409`).
2. `/fincas/nueva` y `/fincas/[id]/editar`: selects, inputs, mapa (contraste del borde y
   tiles), desplegable de `AutocompletarDireccion` (opciones y opción activa dorada),
   "Ubicar dirección", nota y errores.
3. `/contratos/nuevo` y `/contratos/[id]/editar`: selects, inputs de fecha/hora y numéricos,
   nota de participación y errores.
4. Pestañas del detalle de contrato: compras, ciclos, costos y ventas; abrir modales de
   registrar/editar, modal de resultado de venta y modales de eliminación.
5. Comprobar botones Cancelar/Cerrar/Eliminar/Guardar, paginación (`TablePagination`) y
   cierre con `Escape` y foco atrapado en todos los modales.
6. Verificar que los listados ya rediseñados (terceros, fincas, contratos, ventas,
   dashboard, reportes) y `FincaDetalleModal` no se rompieron.

## Observaciones relevantes

- El `Select` de filtro de `VentasListado` ya pasa overrides oscuros
  (`border-white/10 bg-white/[0.03] text-white ... [&_option]:...`); con la nueva base oscura
  del `Select` y `tailwind-merge` los overrides siguen resolviendo sin conflicto.
- `TablePagination` usa `Button variante="secundario"` con overrides oscuros en `tema="oscuro"`;
  `tailwind-merge` hace prevalecer el override, por lo que la paginación oscura no cambia.
  La rama `tema="claro"` (sin consumidores actuales) hereda ahora el botón oscuro; queda
  cubierta por V5.
- `LogoutButton` (auth) usa `Button variante="secundario"`: al ser el shell oscuro, el nuevo
  estilo es coherente. No se modificó ningún archivo de `features/auth/*`.
- `CompraFormModal`, `CicloFormModal`, `CostoFormModal` y `VentaFormModal` no contenían estilos
  claros propios; con el `Modal` oscuro quedan alineados sin cambios.
- Las páginas Server Component de nueva/editar de fincas y contratos no requirieron cambios.
- No se añadieron dependencias.
