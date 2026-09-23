# Implementación — Corrección visual de la pantalla de inicio de sesión

## Resumen

Se corrigió el resultado visual incompleto del rediseño de `/login`. La causa era que
`app/(auth)/layout.tsx` imponía fondo claro y centrado (`bg-zinc-50 px-4 py-12`) y
`LoginShell` no pintaba un fondo oscuro sólido, dejando el texto blanco invisible sobre
el fondo blanco del `body`.

Ahora `/login` ocupa la pantalla completa con fondo oscuro propio (`bg-elinain-bg` + acento
radial dorado), el texto y la tarjeta del formulario tienen contraste correcto y el aside
incorpora un bloque ilustrativo marcado como ejemplo, sin cifras inventadas. `/registro`
conserva su apariencia original.

## Archivos modificados

- `app/(auth)/layout.tsx` — layout neutro (solo renderiza `children`).
- `app/(auth)/registro/page.tsx` — asume el envoltorio claro y centrado para preservar su apariencia.
- `features/auth/components/LoginShell.tsx` — fondo oscuro a pantalla completa, contraste y bloque de ejemplo.
- `features/auth/components/LoginForm.tsx` — superficie/contraste de la tarjeta (sin cambios funcionales).
- `features/auth/auth-styles.ts` — contraste de los campos (sin cambios funcionales).

No se tocaron hooks, `api/`, `schemas.ts`, `mensajes-error.ts`, navegación, validación,
textos de negocio ni flujo de autenticación. No se añadieron dependencias. El cambio en
`globals.css` del Work Item anterior se mantiene sin cambios.

## Cambios realizados

1. `(auth)/layout.tsx`: passthrough de `children`, sin fondo ni centrado.
2. `registro/page.tsx`: recupera el envoltorio `flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12` para no alterar `/registro`.
3. `LoginShell`: raíz `min-h-dvh bg-elinain-bg` con degradado radial dorado; badge real "Plataforma para comerciantes ganaderos"; aside con pill "Trazabilidad por contrato y ciclo".
4. `LoginShell`: `figure` con `glass-panel` etiquetada "Vista de ejemplo · panel de gestión", indicadores con valores `—` (sin cifras), lista de conceptos reales y nota de que son ilustrativos.
5. `LoginForm`/`auth-styles`: tarjeta `bg-elinain-surface/70` con `backdrop-blur` y campos sobre `bg-elinain-bg/60` para contraste.

## Verificación

- V1 `npm run format:check`: pasa.
- V2 `npm run lint`: pasa.
- V3 `npm run typecheck`: pasa.
- V4 `npm test`: pasa.
- `bash .rei/init.sh`: finaliza correctamente (V1–V4 en OK).
- V5 validación manual: ejecutada parcialmente con Chrome headless sobre el servidor de
  desarrollo (`localhost:3000`), a dos tamaños:
  - Login 1440x900: fondo oscuro premium, texto/logo visibles, formulario con contraste,
    bloque de ejemplo con `—` y sin cifras.
  - Login 390x844: composición correcta en móvil; aside oculto.
  - Registro 1440x900: sin cambios respecto a su estado previo.
  Capturas: `/tmp/opencode/login-desktop.png`, `/tmp/opencode/login-mobile.png`,
  `/tmp/opencode/registro-desktop.png`.
  Superada con confirmación explícita del usuario ("quedó bien") el 2026-09-23. Los estados
  interactivos (foco, error de envío, carga y alternancia de contraseña) no se certificaron de
  forma automatizada.

## Observaciones

- La delegación vía subagente no estuvo disponible (saldo insuficiente del modelo del
  subagente); la implementación se ejecutó en el agente principal manteniendo los artefactos
  del arnés.
- Los valores del bloque de ejemplo se muestran como `—` de forma intencional: el bloque es
  ilustrativo y no debe presentar métricas reales ni inventadas.
- El aside solo se muestra desde `lg`; en móvil `/login` se resuelve en una columna.
