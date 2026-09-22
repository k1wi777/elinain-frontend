# Implementación — Landing institucional de Elinain y retiro de la plantilla de Next.js

> Work Item: `2026-09-22_15-38__landing-institucional-y-retiro-plantilla-next` (`type: task`)
> Agente: `implementer`
> Estado: implementado, pendiente de revisión

## Resumen

Se sustituyó la landing plantilla de create-next-app (`app/page.tsx`) por una landing pública e
institucional de Elinain: un Server Component presentacional, en español, con la propuesta de
valor, el problema que resuelve, las capacidades clave, el público objetivo, la visión y los
llamados a la acción hacia `/registro` y `/login`. Además, se eliminaron los cinco assets de la
plantilla que dejaban de usarse. No se añadieron dependencias, formularios ni llamadas a la
API/BFF.

## Archivos

### Modificados

| Archivo | Cambio |
|---------|--------|
| `app/page.tsx` | Reescritura completa: `metadata` propio y estructura semántica (`header`/`main`/`footer`) con las 8 secciones del plan. |

### Eliminados (`git rm`)

| Archivo |
|---------|
| `public/next.svg` |
| `public/vercel.svg` |
| `public/file.svg` |
| `public/globe.svg` |
| `public/window.svg` |

`public/` quedó vacío y, al no quedar assets de la plantilla, no se creó `.gitkeep` (conforme al
plan).

### Conservados sin cambios

| Archivo | Verificación |
|---------|--------------|
| `app/favicon.ico` | Sin modificaciones (`git status` no lo reporta). |
| `app/layout.tsx` | Sin modificaciones (`git status` no lo reporta). |

## Cambios realizados

### `app/page.tsx`

- Server Component puro: sin `'use client'`, sin hooks ni estado; `export default function
  LandingPage()` (el `export default` lo exige Next).
- `export const metadata: Metadata` con el título y la descripción exactos del plan.
- CTA con `next/link` (no `<Button>`), usando las clases visuales de las variantes `primario` y
  `secundario` del sistema de diseño (`shared/ui/Button.tsx`, emerald/zinc y
  `focus-visible:ring-2`), definidas como constantes locales `ESTILOS_BASE_CTA`,
  `ESTILOS_CTA_PRIMARIO` y `ESTILOS_CTA_SECUNDARIO`.
- Estructura semántica con un único `<h1>` (hero) y un `<h2>` por sección; `nav` con
  `aria-label`; foco visible en todos los enlaces mediante `focus-visible:ring-2` +
  `focus-visible:outline-none`; fondo claro coherente con el resto de la aplicación (sin
  variantes `dark:`).
- Contenido exactamente según el plan: cabecera, hero, problema, capacidades, público objetivo,
  visión, CTA final y pie. Sin cifras, testimonios, precios ni enlaces externos.
- Se eliminó el import de `next/image` que solo servía a la plantilla.

## Verificación

### Automatizada

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | Pasa | «All matched files use Prettier code style!». Se ejecutó `npm run format` antes. |
| `V2` | `npm run lint` | Pasa | ESLint sin errores ni warnings. |
| `V3` | `npm run typecheck` | Pasa | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Pasa | 24 suites, 224 tests en verde. No se añadieron tests: no hay lógica pura nueva. |

`bash .rei/init.sh` finaliza con **salida `0`**; los cuatro checkpoints (`V1`–`V4`) aparecen en
`[OK]` y el resumen indica «REI Harness listo para trabajar».

### `V5` — Validación manual

Estado: **pendiente de la aceptación del usuario**. Como evidencia de apoyo se realizó un smoke
test HTTP contra el servidor de desarrollo ya activo en `http://localhost:3000` (no se levantó ni
se dejó ningún servidor propio; el intento en el puerto 3100 abortó porque ya existía un servidor
de Next corriendo, y fue el que se usó para validar):

| Comprobación | Resultado |
|--------------|-----------|
| `GET /` | `200` |
| `<h1>` servido | «Gestiona tu negocio ganadero con datos, no con libretas.» |
| Enlaces a `/login` y `/registro` en el HTML | 3 y 3 (cabecera, hero y CTA final) |
| `<title>` | «Elinain — Gestión integral del engorde bovino» (`metadata` de la página) |
| Referencias a `next.svg`/`vercel.svg` en el HTML servido | 0 |
| `GET /login` y `GET /registro` | `200` y `200` |

Pasos que quedan para el usuario (según el plan): navegación real por los CTA, recorrido con
teclado y foco visible, y revisión de responsive y contraste.

### Referencias a los assets eliminados

- `git grep -n -e "next.svg" -e "vercel.svg" -e "file.svg" -e "globe.svg" -e "window.svg"` sobre
  archivos versionados → **sin coincidencias** (salida `1`).
- `grep -rn "next.svg\|vercel.svg\|file.svg\|globe.svg\|window.svg"` excluyendo únicamente
  `.rei/` y `node_modules/` → solo coincidencias en `.next/` (artefactos de build/compilación
  generados y gitignored: `.next/server/*`, `.next/dev/*`, `.next/cache/*`), que corresponden a
  compilaciones previas de la plantilla y se regeneran en el siguiente build/compilación. No hay
  ninguna referencia en código fuente ni en archivos versionados.

## Observaciones

- `public/` desapareció del árbol de trabajo al quedar vacío, porque Git no versiona directorios
  vacíos. Es el resultado esperado por el plan y no afecta a Next.
- No hubo cambios en `package.json`, `shared/api/openapi/*`, `middleware.ts`, `globals.css`,
  `app/layout.tsx`, `app/favicon.ico` ni en ningún feature.
- El servidor de Next en el puerto 3000 ya estaba en ejecución antes de esta sesión; no se
  detuvo ni se modificó.
