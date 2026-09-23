# Revisión — Estilo oscuro de formularios y modales con glassmorphism

- **Work Item:** `2026-09-23_18-48__estilo-oscuro-formularios-y-modales`
- **Tipo:** `task`
- **Reviewer:** reviewer
- **Estado final:** `done`

## Resultado

Aprobado. El objetivo del plan se cumplió y las restricciones se respetaron. `Input`, `Select`
y `Modal` quedan oscuros por defecto, el `Modal` usa `glass-panel` con backdrop
`bg-black/60 backdrop:backdrop-blur-sm`, y la variante `secundario` de `Button` es legible
sobre el tema oscuro. Los formularios, páginas y modales de terceros, fincas, contratos,
compras, ciclos, costos y ventas se alinearon sustituyendo únicamente clases de color.

## Verificaciones

Revisión por lectura del diff (`git diff` sobre 27 archivos + `meta.json`/`plan.md`/`impl.md`):

- **Alcance del color:** `shared/ui/Input.tsx`, `Select.tsx` y `Modal.tsx` con base oscura por
  defecto (borde `white/10`, fondo `white/[0.03]`, texto `white`, foco `elinain-gold`,
  `color-scheme:dark` y `option` nativas oscuras); errores a `text-red-400`/`border-red-500/60`.
- **Lógica intacta:** el diff solo modifica clases Tailwind, salvo la retirada planificada de la
  prop `tema` de `Modal` (paso 3) y su ajuste en `FincaDetalleModal`. No se tocaron zod,
  `react-hook-form`, props públicas de formularios, hooks, `api/`, `schemas.ts`, queries,
  mutaciones, rutas, mensajes ni textos funcionales.
- **`tema` en `Modal`:** no queda ningún consumidor que pase `tema` al `Modal`; los `tema=`
  restantes pertenecen a `Table`/`TablePagination`/`VentaCard`/`TarjetaIndicador`, fuera del
  componente.
- **Colores claros en el alcance:** sin `text-zinc-900`, `bg-white`, `border-zinc-200` ni
  `text-zinc-700` en los formularios/modales del alcance; los restos detectados
  (`VentaCard`, `VentasLista`, `TarjetaIndicador`) son ramas `"claro"` de componentes con tema
  opcional, fuera del alcance de este Work Item.
- **Accesibilidad:** se conservan `<label>` asociado, `aria-invalid`, `aria-describedby`; el
  `Modal` mantiene el `<dialog>` nativo (`showModal`, `onCancel`/`Escape`, foco atrapado,
  `aria-labelledby`). Sin cambios en roles ni en el comportamiento del teclado.
- **`features/auth/*`:** sin modificaciones (git status).
- **Dependencias:** `package.json`/`package-lock.json` sin cambios; sin dependencias nuevas.
- **Flujos rediseñados:** los consumidores de `Button secundario` y de los controles oscuros
  viven en superficies oscuras; `TablePagination`, `VentasListado` y `FincaDetalleModal`
  mantienen sus overrides/características.

## Checkpoints

| ID | Comando | Resultado |
|----|---------|-----------|
| V1 | `npm run format:check` | Pasa — `All matched files use Prettier code style!` |
| V2 | `npm run lint` | Pasa — sin errores |
| V3 | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores |
| V4 | `npm test` | Pasa — 52 suites / 404 tests |
| V5 | Validación manual | **Pendiente** — rutas protegidas; no ejecutable por el agente ni certificada por el usuario |
| — | `bash .rei/init.sh` | Código de salida `0` con V1–V4 en verde |

## Observaciones

- `AutocompletarDireccion` (texto "Buscando sugerencias…") y el placeholder de carga del mapa
  en `FincaForm` conservan `text-zinc-500` sobre superficie oscura. No es uno de los colores
  claros prohibidos por el plan y no compromete la legibilidad; no bloquea la aprobación.
- V5 no se marca como superada: queda a cargo del usuario según el checklist de `impl.md`.
