# Implementación — Rediseño visual de la pantalla de registro

## Resumen

Se aplicó a `/registro` el mismo lenguaje visual oscuro, minimalista y premium de `/login`.
Se extrajo un `AuthShell` compartido (más `AuthIcons`), se refactorizó `LoginShell` para usarlo
—quedando **pixel-idéntico**— y se creó `RegistroShell` con el `RegistroForm` reestilizado en
oscuro. No se modificó la funcionalidad.

## Archivos modificados

- Creados: `features/auth/components/AuthShell.tsx`, `AuthIcons.tsx`, `RegistroShell.tsx`.
- Modificados: `features/auth/components/LoginShell.tsx` (usa `AuthShell`),
  `LoginForm.tsx` (consume `AuthIcons`), `RegistroForm.tsx` (estilos oscuros),
  `app/(auth)/registro/page.tsx` (compone `RegistroShell`) y `features/auth/index.ts`
  (exporta `RegistroShell`).

No se tocaron hooks, `api/`, `schemas.ts`, `mensajes-error.ts`, navegación, `middleware.ts`,
`app/(auth)/layout.tsx` ni `app/globals.css`. Sin dependencias nuevas.

## Cambios realizados

1. `AuthIcons.tsx`: `IconoCorreo`, `IconoCandado`, `IconoUsuario` y `BotonVisibilidad`,
   extraídos de `LoginForm` para reutilizarlos en ambos formularios.
2. `AuthShell.tsx`: shell compartido con fondo oscuro a pantalla completa, columna izquierda
   (marca, insignia, título, descripción y formulario) y aside con imagen, pill y panel lateral.
3. `LoginShell.tsx`: usa `AuthShell` con su copy y su panel de ejemplo; sin cambios visuales.
4. `RegistroShell.tsx`: usa `AuthShell` con copy de registro y un panel rotulado
   "Vista de ejemplo · panel de gestión" con cifras de ejemplo (`312`, `8`, `+1,2 kg/día`, `—`)
   y conceptos reales del producto.
5. `RegistroForm.tsx`: `AuthField` con iconos, CTA oscuro y error en tono oscuro; mismos campos
   (`nombre`, `email`, `password`), misma validación (`esquemaRegistro`) y mismos hooks. Se
   añadió la alternancia de visibilidad de contraseña (solo UI, reutilizando `BotonVisibilidad`).
6. `registro/page.tsx` y barrel actualizados.

## Verificación

- V1 `npm run format:check`: pasa.
- V2 `npm run lint`: pasa.
- V3 `npm run typecheck`: pasa.
- V4 `npm test`: pasa.
- `bash .rei/init.sh`: finaliza con código de salida `0` (V1–V4 en `OK`).
- V5 validación manual: ejecutada parcialmente con Chrome headless sobre `localhost:3000`.
  - Login 1440x900: `md5sum` idéntico al de la versión aprobada
    (`352c185f57d0fc8ff827891abcc20988`), por lo que no hay regresión visual.
  - Registro 1440x900 y 390x844: layout oscuro de dos columnas, panel de ejemplo rotulado y
    formulario con contraste correcto.
  Capturas: `/tmp/opencode/login-after-desktop.png`,
  `/tmp/opencode/registro-after-desktop.png`, `/tmp/opencode/registro-after-mobile.png`.
  Pendiente la confirmación explícita del usuario y los estados interactivos.

## Observaciones

- La delegación vía subagente sigue sin estar disponible por saldo insuficiente del modelo; la
  implementación se ejecutó en el agente principal manteniendo los artefactos del arnés.
- Las cifras del panel de registro son de ejemplo y están rotuladas como tales; no representan
  datos reales ni prometen funcionalidad inexistente.
- El formulario conserva únicamente los tres campos existentes: no se añadieron perfil, cédula,
  teléfono, confirmación de contraseña, términos ni medidor de seguridad.
