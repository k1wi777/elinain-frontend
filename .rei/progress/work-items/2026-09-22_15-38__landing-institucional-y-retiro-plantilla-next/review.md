# Revisión — Landing institucional de Elinain y retiro de la plantilla de Next.js

> Work Item: `2026-09-22_15-38__landing-institucional-y-retiro-plantilla-next` (`type: task`)
> Agente: `reviewer`
> Estado final: **`done`**

## Resultado

Aprobado. La implementación cumple todos los pasos y restricciones de `plan.md`, respeta la
arquitectura y las convenciones, y supera los checkpoints `V1`–`V4` y `bash .rei/init.sh`.

## Verificaciones realizadas

### Alcance y contenido

- **Objetivo cumplido.** `app/page.tsx` es una landing pública e institucional en español con
  las 8 secciones del plan (cabecera, hero, problema, capacidades, público objetivo, visión,
  CTA final y pie), con los textos y el `metadata` exactos descritos. Sin añadir alcance.
- **Server Component.** Sin `'use client'`, sin hooks, sin estado, sin `useEffect`; `export
  default function LandingPage()` (lo exige Next) con `metadata: Metadata` propio.
- **CTAs.** Cabecera, hero y CTA final enlazan con `next/link` a `/login` y `/registro`
  (3 enlaces a cada ruta en el HTML servido). Las clases visuales replican las variantes
  `primario`/`secundario` de `shared/ui/Button.tsx` (emerald/zinc, `focus-visible:ring-2`).
  No se usó `cn()` por no haber clases condicionales.
- **Sin restos de la plantilla.** Sin `next/image`, sin `<img>`, sin enlaces externos, sin
  cifras, testimonios ni precios inventados. Un único `<h1>` (hero) y cinco `<h2>` (una por
  sección), en orden; `header`/`main`/`footer`/`nav` semánticos; foco visible en los enlaces.

### Assets eliminados y archivos intactos

- `git rm` de `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg` y
  `public/window.svg` confirmado (`git status`: `D` en los cinco). `public/` quedó vacío.
- `git grep` sobre archivos versionados (`next.svg|vercel.svg|file.svg|globe.svg|window.svg`)
  → sin coincidencias. El `grep -rn` excluyendo `.rei/` y `node_modules/` solo encuentra
  coincidencias en `.next/` (artefactos de build generados y gitignored, de compilaciones
  previas de la plantilla); no hay referencias en código fuente ni en archivos versionados.
- `app/favicon.ico`, `app/layout.tsx`, `middleware.ts`, `app/globals.css`, el BFF (`app/api/`),
  `features/`, `shared/`, `package.json` y `package-lock.json` sin cambios (`git status`).

### Convenciones

- TypeScript `strict`: sin `any`, sin `@ts-ignore`/`@ts-expect-error` en `app/page.tsx`.
- Tailwind directo en el JSX; sin variables CSS nuevas ni cambios de configuración.
- Accesibilidad: HTML semántico, un `<h1>`, headings en orden, `nav` con `aria-label`,
  `focus-visible` en todos los enlaces.

### Automatizada (reejecutada de forma independiente)

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — «All matched files use Prettier code style!» |
| `V2` | `npm run lint` | Pasa — ESLint sin errores |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores |
| `V4` | `npm test` | Pasa — 24 suites / 224 tests |
| — | `bash .rei/init.sh` | Salida `0`; `V1`–`V4` en `[OK]` |

### `V5` — Validación manual de apoyo (HTTP)

Contra el dev server preexistente en `http://localhost:3000` (no se levantó ni detuvo ningún
servidor; no quedaron procesos propios colgados):

- `GET /` → `200`; `<h1>` servido «Gestiona tu negocio ganadero con datos, no con libretas.»;
  `<title>` «Elinain — Gestión integral del engorde bovino» (metadata de la página).
- `href="/login"` ×3 y `href="/registro"` ×3 en el HTML; sin referencias a los assets
  eliminados.
- `GET /login` → `200` y `GET /registro` → `200`.

Queda a cargo del usuario la navegación real por los CTAs, el recorrido con teclado (foco
visible) y la revisión de responsive y contraste, según los pasos de `plan.md`.

## Observaciones

- El `grep` estricto solicitado (excluyendo solo `.rei/` y `node_modules/`) encuentra
  coincidencias únicamente dentro de `.next/`, artefactos de build generados y gitignored
  (incluida una compilación previa de la plantilla). No son código fuente ni archivos
  versionados y se regeneran en el siguiente build; no se consideran una desviación.
- `public/` desaparece del árbol de trabajo al quedar vacío (Git no versiona directorios
  vacíos), conforme a lo previsto por el plan.
- `app/page.tsx` define su `metadata` de página, que prevalece sobre el título del layout solo
  en `/`; comportamiento esperado y documentado en el plan.
