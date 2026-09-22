# Plan — Landing institucional de Elinain y retiro de la plantilla de Next.js

> Work Item: `2026-09-22_15-38__landing-institucional-y-retiro-plantilla-next` (`type: task`)

## Objetivo

Sustituir la landing plantilla de create-next-app por una **landing pública e institucional de
Elinain**: un Server Component presentacional, en español, con información real del producto
(nombre, propuesta de valor, problema que resuelve, capacidades clave, público objetivo) y
llamados a la acción hacia `/login` y `/registro`. Además, eliminar los assets de la plantilla
que dejan de usarse.

Sin formularios, sin llamadas a la API, sin interactividad y sin dependencias nuevas.

## Archivos

### Modificar

| Archivo | Cambio |
|---------|--------|
| `app/page.tsx` | Reescritura completa: de la landing plantilla a la landing de Elinain. Añade `metadata` propio de la página. |

### Eliminar

| Archivo | Motivo |
|---------|--------|
| `public/next.svg` | Solo lo usaba `app/page.tsx` (logo de Next.js). |
| `public/vercel.svg` | Solo lo usaba `app/page.tsx` (logomark de Vercel). |
| `public/file.svg` | Asset de la plantilla sin referencias en el código. |
| `public/globe.svg` | Asset de la plantilla sin referencias en el código. |
| `public/window.svg` | Asset de la plantilla sin referencias en el código. |

### Conservar sin cambios

| Archivo | Motivo |
|---------|--------|
| `app/favicon.ico` | Icono de la aplicación. |
| `app/layout.tsx` | Ya declara `lang="es"` y el `metadata` de Elinain. |

No se crean archivos. No hay lógica pura nueva → no hay tests nuevos.

## Cambios

### 1. `app/page.tsx`

Server Component por defecto (sin `'use client'`), con `export default function` (lo exige
Next) y `metadata` propio. Estructura semántica: `<header>`, `<main>` y `<footer>`, con un
único `<h1>` y `<h2>` por sección.

**Metadata de la página** (aporta un título y una descripción orientados a la propuesta de
valor, siguiendo el patrón de las demás páginas):

```tsx
export const metadata: Metadata = {
  title: "Elinain — Gestión integral del engorde bovino",
  description:
    "Plataforma para comerciantes ganaderos que centraliza inventario, compras y ventas, costos, sanidad y ganado en participación, con trazabilidad y métricas de rentabilidad.",
};
```

**Secciones y contenido** (texto visible en español; sin cifras, testimonios ni precios):

1. **Cabecera** — wordmark "Elinain" (enlace a `/`) y enlaces "Iniciar sesión" (`/login`) y
   "Crear cuenta" (`/registro`).
2. **Hero** — `<h1>`: "Gestiona tu negocio ganadero con datos, no con libretas." Párrafo:
   "Elinain centraliza inventario, compras y ventas, costos, sanidad y ganado en participación
   para que conozcas la rentabilidad real de cada ciclo y de cada animal." CTA primario
   "Crear cuenta" → `/registro`; CTA secundario "Iniciar sesión" → `/login`.
3. **Problema** — `<h2>`: "De la libreta y el Excel a decisiones con datos". Lista:
   - Información manual dispersa y difícil de conciliar.
   - Dificultad para calcular el costo real por animal y la rentabilidad por ciclo.
   - Reparto de utilidades del ganado en participación propenso a errores.
   - Falta de una vista consolidada cuando se opera en varias fincas.
4. **Capacidades** — `<h2>`: "Lo que centraliza Elinain". Lista: inventario de animales;
   compras y ventas; costos operativos; sanidad animal; ganado en participación con terceros;
   facturación; operación en varias fincas (propias o de terceros); trazabilidad y métricas de
   rentabilidad.
5. **Público objetivo** — `<h2>`: "Para quién es". Texto: "Para comerciantes ganaderos
   —personas y pymes que compran animales, los engordan y los venden—. No es una herramienta
   de cría ni de producción agrícola."
6. **Visión** — `<h2>`: "Hacia una gestión basada en datos". Texto: "Elinain reemplaza la
   gestión empírica por información consolidada y confiable. La analítica avanzada y la
   inteligencia artificial se incorporarán en fases posteriores."
7. **CTA final** — `<h2>`: "Empieza a gestionar con datos". Repite los enlaces a `/registro`
   (primario) y `/login` (secundario).
8. **Pie** — "Elinain — Plataforma de gestión para la compra, engorde y comercialización de
   ganado bovino."

### 2. Decisiones de diseño

**a. Enlaces con `next/link`, no `<Button>`.** `shared/ui/Button` renderiza un `<button>`, útil
para acciones, no para navegar; anidar un botón dentro de un enlace produce HTML interactivo
anidado inválido. Los CTA usan `next/link` con las clases visuales de las variantes
`primario`/`secundario` del sistema de diseño (emerald/zinc, `focus-visible:ring-2`), definidas
en constantes locales del propio `page.tsx`.

**Alternativa descartada:** extraer un `LinkButton` a `shared/ui`. Solo habría un consumidor
(la landing), y la convención pide un segundo consumidor real para mover algo a `shared/`; si
otra superficie necesita link-buttons, se extraerá entonces.

**b. Paleta coherente con la aplicación.** Se usan zinc (neutros) y emerald (acción), igual que
las páginas existentes, sobre fondo claro. No se usan variantes `dark:` de la plantilla: el
resto de la aplicación es de un solo tema, y un landing oscuro que desemboca en pantallas
claras resultaría incoherente. No se introduce configuración nueva de Tailwind.

**c. `metadata` por página.** Se añade para que la ruta pública tenga título y descripción
orientados a la propuesta de valor, siguiendo el patrón de `(auth)/login`, `(auth)/registro` y
los módulos del dashboard.

**d. Middleware sin cambios.** `/` no está protegida ni redirige a usuarios autenticados; es
intencionalmente pública y el alcance no incluye modificarla.

## Restricciones

- Sin dependencias nuevas ni cambios en `package.json`.
- Server Component puro: sin `'use client'`, sin estado, sin hooks, sin `useEffect`.
- Sin formularios, sin llamadas a la API/BFF, sin tocar `shared/api/openapi/*`, `middleware.ts`
  ni features.
- Texto visible en español; nada de cifras, testimonios, precios ni enlaces externos de la
  plantilla.
- TypeScript `strict`, sin `any`; `export default` solo donde Next lo exige (`page.tsx`).
- Tailwind directo en el JSX; `cn()` solo si hay clases condicionales (en esta página, si no
  las hay, no se usa).
- Accesibilidad: un solo `<h1>`, headings en orden, HTML semántico, foco visible en enlaces y
  contraste suficiente.
- Ninguna referencia a los assets eliminados; actualizar/retirar los imports de `next/image`
  que solo servían a la plantilla.
- Formato con Prettier (`npm run format`) antes de `V1`.

## Pasos

1. [x] Confirmar con `grep` que `next.svg`, `vercel.svg`, `file.svg`, `globe.svg` y `window.svg` no
   se referencian en el código (hecho: solo `app/page.tsx` usa `next.svg` y `vercel.svg`).
2. [x] Reescribir `app/page.tsx` con la estructura, los textos y el `metadata` descritos.
3. [x] Eliminar `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg` y
   `public/window.svg` (p. ej. `git rm`). Verificar que `public/` quede sin assets de la
   plantilla; si queda vacío, no requiere `.gitkeep`.
4. [x] `npm run format` y ejecutar `V1`–`V4`; confirmar `bash .rei/init.sh` con salida `0`.
5. [x] Documentar la evidencia de `V1`–`V4` y los pasos de `V5` en
   `.rei/progress/work-items/2026-09-22_15-38__landing-institucional-y-retiro-plantilla-next/impl.md`.

## Verificación

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Pasa (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | Sin errores. |
| `V3` | `npm run typecheck` | Sin errores. |
| `V4` | `npm test` | Suite completa en verde (no hay lógica pura nueva; no se añaden tests). |
| `V5` | Validación manual | Landing pública, CTAs y ausencia de referencias a los assets eliminados. |

Pasos de `V5` (requieren `npm run dev`):

1. Abrir `/` sin sesión: se ve la landing de Elinain con el `<h1>` y las secciones descritas.
2. Comprobar que "Crear cuenta" navega a `/registro` y "Iniciar sesión" navega a `/login`
   (tanto en la cabecera, en el hero y en el CTA final).
3. Recorrer la página solo con teclado: enlaces alcanzables y con foco visible; sin imágenes
   rotas.
4. Revisar responsive (móvil y escritorio) y contraste de textos.
5. Ejecutar `grep -rn "next.svg\|vercel.svg\|file.svg\|globe.svg\|window.svg"` sobre el
   repositorio (excluyendo `.rei/`) y confirmar que no queda ninguna referencia.

## Fuera de alcance

- Rediseñar la autenticación, tocar el middleware o las rutas existentes.
- Secciones interactivas, formularios, testimonios, precios, imágenes nuevas o integración con
  el backend.
- Cambios de configuración de Tailwind, `globals.css`, `app/layout.tsx` o `app/favicon.ico`.
