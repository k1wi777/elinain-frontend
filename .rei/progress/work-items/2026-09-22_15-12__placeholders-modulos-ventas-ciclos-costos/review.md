# Revisión — Preparación de módulos bloqueados: ventas, ciclos y costos

> Work Item: `2026-09-22_15-12__placeholders-modulos-ventas-ciclos-costos` (`type: task`)
> Agente: `reviewer`

## Resultado

**`done`** — La implementación cumple íntegramente el `plan.md`, sin desviaciones ni alcance
añadido, y todas las verificaciones pasan.

## Verificaciones

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | pasa (exit `0`) | `All matched files use Prettier code style!`. |
| `V2` | `npm run lint` | pasa (exit `0`) | ESLint sin errores. |
| `V3` | `npm run typecheck` | pasa (exit `0`) | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | pasa (exit `0`) | 24 suites / 224 tests en verde. |
| `V5` | Validación manual por HTTP | pasa | Vista "Próximamente" con sesión y redirección a `/login` sin sesión. |
| — | `bash .rei/init.sh` | pasa (exit `0`) | `V1`–`V4` en verde; el `WARN` de sesión registrada es esperado. |

### Evidencia de `V5` (reejecutada por el Reviewer)

Servidor `next dev` ya activo en `http://localhost:3000`; no se levantó ni se dejó ningún
proceso adicional.

1. **Sin sesión** (`curl` sin cookie): `/ventas`, `/ciclos` y `/costos` → `307` hacia
   `http://localhost:3000/login`; `/login` → `200`.
2. **Con sesión** (cookie `elinain_session` con `exp` vigente): cada ruta responde `200` con
   su `<title>` (`Ventas | Elinain`, `Ciclos | Elinain`, `Costos | Elinain`), su `<h1>`, la
   descripción exacta del plan y el aviso "Próximamente.".
3. **Navegación**: el HTML de `/ventas` incluye los enlaces `href="/ventas"`, `href="/ciclos"`
   y `href="/costos"` en la cabecera del área protegida.

## Comprobación del plan

- **Pasos 1–8**: completados. `shared/ui/Proximamente.tsx` + export en el barrel; los tres
  `<Modulo>Proximamente` con sus barrels de una sola exportación y JSDoc; las tres páginas
  `page.tsx` (Server Components delgados con `metadata` por módulo); los enlaces en
  `app/(dashboard)/layout.tsx`; las rutas y sus `:path*` en `RUTAS_PROTEGIDAS` y el matcher de
  `middleware.ts`.
- **Textos exactos**: coinciden literalmente con la tabla del plan (títulos `Ventas`/`Ciclos`/
  `Costos` y descripciones de cada módulo).
- **Sin alcance añadido**: no hay formularios, datos de ejemplo, hooks, tipos de dominio ni
  llamadas a la API. Solo los 10 archivos creados y 3 modificados previstos.
- **`shared/`, `features/` y `app/`**: `shared/` no importa de `features/` ni de `app/`; los
  features no importan entre sí (cada barrel solo referencia su propio componentes); `app/`
  solo compone.
- **Convenciones**: sin `any` ni `@ts-ignore`/`@ts-expect-error`; named exports salvo
  `export default` en `page.tsx` (exigido por Next); componentes con `type Props` y función
  declarada; JSDoc en la API pública; textos en español.
- **Sin efectos colaterales**: `package.json`/`package-lock.json`, `shared/api/openapi/*`, el
  BFF (`app/api/*`) y los features existentes (`auth`, `terceros`, `fincas`, `contratos`) no
  presentan cambios. El placeholder previo de `ContratoDetalle` quedó intacto, como pedía el
  plan.

## Observaciones

- Sin bloqueos ni desviaciones. La única salvedad es la confirmación visual final del usuario
  (`V5`), ya cubierta por la validación HTTP independiente y por los pasos documentados en
  `impl.md`.

## Acciones requeridas

Ninguna.
