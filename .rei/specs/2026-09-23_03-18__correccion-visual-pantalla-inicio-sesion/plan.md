# Plan — Corrección visual de la pantalla de inicio de sesión

> Work Item: `2026-09-23_03-18__correccion-visual-pantalla-inicio-sesion` (`type: task`)

## Objetivo

Corregir el resultado visual incompleto del rediseño de `/login` del Work Item
`2026-09-23_02-45__rediseño-visual-pantalla-inicio-sesion`. Hoy `/login` no pinta fondo
oscuro sólido a pantalla completa (el layout `(auth)` impone `bg-zinc-50` con contenido
centrado y el `LoginShell` solo superpone un gradiente radial transparente), por lo que el
texto blanco queda invisible sobre el fondo blanco del `body`.

Resultado esperado: `/login` se ve oscuro, minimalista y premium (fondo casi negro con
`elinain-bg`, superficies carbón, acento dorado, tipografía jerárquica, espaciado generoso),
a pantalla completa. `/registro` debe quedar **visualmente idéntico** a como está hoy.

## Archivos

### Modificar

| Archivo | Cambio |
|---------|--------|
| `app/(auth)/layout.tsx` | Volverlo neutro/passthrough (solo renderiza `children`), sin fondo ni centrado. |
| `app/(auth)/registro/page.tsx` | Asumir el envoltorio claro y centrado (`bg-zinc-50 px-4 py-12`, `items-center justify-center`) para conservar su apariencia actual. |
| `features/auth/components/LoginShell.tsx` | Pintar su propio fondo oscuro sólido a pantalla completa y añadir el bloque ilustrativo marcado como ejemplo. |

### Revisar (modificar solo si es imprescindible para el contraste, sin tocar funcionalidad)

| Archivo | Criterio |
|---------|----------|
| `features/auth/components/LoginForm.tsx` | Ajustes de superficie/contraste sobre fondo oscuro. |
| `features/auth/components/AuthField.tsx` | Ajustes de contraste de campos. |
| `features/auth/auth-styles.ts` | Solo si se centraliza algún estilo nuevo del tema oscuro. |
| `app/globals.css` | Solo si falta un token/utilidad; evitarlo si lo existente basta. |

### No modificar

`app/(auth)/login/page.tsx` (ya compone `LoginShell`), hooks, `api/`, `schemas.ts`,
`mensajes-error.ts`, navegación y flujo de autenticación.

> Los cambios sin commitear del Work Item anterior siguen en el árbol de trabajo y son la
> base de este Work Item: no revertirlos.

## Cambios

### 1. Layout de acceso neutro — `app/(auth)/layout.tsx`

- Eliminar de la raíz el `flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12` y
  dejar un passthrough que solo renderice `{children}` (sin fondo ni centrado).
- Mantener el tipo `Props` y el `export default` que Next exige para `layout.tsx`.

### 2. Preservar `/registro` — `app/(auth)/registro/page.tsx`

- Recuperar el envoltorio que antes aportaba el layout: un contenedor
  `flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12` alrededor del `<main>`
  existente.
- No alterar el `<main>` (ancho, borde, superficie, padding, título ni `RegistroForm`). La
  apariencia final de `/registro` debe ser idéntica a la actual.

### 3. Fondo oscuro propio de `/login` — `features/auth/components/LoginShell.tsx`

- Raíz con fondo oscuro sólido (`bg-elinain-bg`), ocupando el viewport completo (por
  ejemplo `min-h-dvh`/`min-h-screen` combinado con `flex-1`), asegurando que cubre toda la
  pantalla en desktop y móvil.
- Conservar el degradado radial dorado actual como acento sobre el fondo oscuro, no como
  sustituto del color de fondo.
- Revisar el contraste del texto blanco, el logo, el título, el párrafo y la tarjeta del
  formulario contra el fondo oscuro (usar los tokens `elinain-*`, `glass-panel` y
  `font-display`/`font-sans` del proyecto).

### 4. Bloque ilustrativo de ejemplo — `features/auth/components/LoginShell.tsx`

- Añadir en el lado de la imagen un bloque ilustrativo sutil inspirado en
  `LandingDashboardPreview`, **marcado explícitamente como ejemplo** (etiqueta visible
  "Vista de ejemplo" / `figcaption`).
- Usar **solo conceptos reales del producto** (compras y ventas, costos del engorde, fincas,
  ciclos, participación con terceros), **sin cifras ni métricas inventadas**, sin datos
  ficticios y sin prometer funcionalidad inexistente.
- Mantener accesibilidad: `figure`/`figcaption`, elementos decorativos con `aria-hidden`,
  imágenes con `next/image` y `alt` adecuado.

## Restricciones

- **Solo estilos y composición.** Prohibido tocar hooks, `api/`, esquemas, validación,
  navegación, flujo de autenticación y textos de negocio válidos.
- **Sin dependencias nuevas.**
- `/login` debe pintar su propio fondo oscuro a pantalla completa.
- `/registro` debe quedar visualmente idéntico a como está hoy.
- El bloque ilustrativo debe estar marcado como ejemplo y no incluir cifras ni métricas
  inventadas.
- Respetar `@/features/auth` (barrel) y las convenciones del proyecto: Tailwind directo,
  `cn()` para clases condicionales, `next/image`/`next/link`, TypeScript `strict` sin `any`,
  accesibilidad (labels, foco visible, HTML semántico).
- No cambiar rutas ni `metadata`.

## Pasos

- [x] 1. Dejar `app/(auth)/layout.tsx` neutro (passthrough de `children`).
- [x] 2. Reponer en `app/(auth)/registro/page.tsx` el envoltorio claro y centrado que aportaba el
   layout, sin cambiar el `<main>`.
- [x] 3. Dar a la raíz de `LoginShell` fondo oscuro sólido a pantalla completa y ajustar el
   contraste de texto, logo, formulario y superficies.
- [x] 4. Añadir el bloque ilustrativo de ejemplo en el aside, con conceptos reales y sin cifras.
- [x] 5. Ajustar `LoginForm`/`AuthField`/`auth-styles`/`globals.css` solo si el contraste lo exige,
   sin cambios funcionales.
- [x] 6. Verificar que `/registro` no cambió visualmente y que `/login` se ve oscuro en desktop y
   móvil.
- [x] 7. Ejecutar los checkpoints y registrar la evidencia en
   `.rei/progress/work-items/2026-09-23_03-18__correccion-visual-pantalla-inicio-sesion/impl.md`:
   - `V1` `npm run format:check`
   - `V2` `npm run lint`
   - `V3` `npm run typecheck`
   - `V4` `npm test`
   - `V5` validación manual de diseño por el usuario (login oscuro y premium a pantalla
     completa en desktop y móvil; `/registro` idéntico; bloque de ejemplo sin cifras;
     contraste y foco visibles).
