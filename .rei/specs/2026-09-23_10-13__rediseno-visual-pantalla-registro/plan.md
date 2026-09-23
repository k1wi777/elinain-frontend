# Plan — Rediseño visual de la pantalla de registro

> Work Item: `2026-09-23_10-13__rediseno-visual-pantalla-registro` (`type: task`)

## Objetivo

Llevar `/registro` al mismo lenguaje visual oscuro, minimalista y premium de `/login`,
inspirado en la referencia aportada por el usuario. Se extrae un `AuthShell` compartido que
usan `LoginShell` y `RegistroShell`; `/login` debe quedar **visualmente idéntico** (se verifica
con captura). Solo estilos y composición: no se añaden campos ni se altera la funcionalidad.

## Archivos

### Crear

| Archivo | Contenido |
|---------|-----------|
| `features/auth/components/AuthShell.tsx` | Shell compartido: fondo oscuro a pantalla completa, columna izquierda (marca, insignia, título, descripción, formulario) y aside con imagen, pill y panel lateral recibido por prop. Interno (no se exporta). |
| `features/auth/components/AuthIcons.tsx` | Iconos compartidos de auth (`IconoCorreo`, `IconoCandado`, `IconoUsuario`, `BotonVisibilidad`) extraídos de `LoginForm`. Interno. |
| `features/auth/components/RegistroShell.tsx` | Compone `AuthShell` con el copy de registro, `RegistroForm` y un panel lateral de conceptos reales + cifras de ejemplo rotuladas. |

### Modificar

| Archivo | Cambio |
|---------|--------|
| `features/auth/components/LoginShell.tsx` | Usar `AuthShell`; pasar su copy y su panel de ejemplo como props. Sin cambios visuales. |
| `features/auth/components/LoginForm.tsx` | Importar los iconos desde `AuthIcons` (sin cambios visuales ni funcionales). |
| `features/auth/components/RegistroForm.tsx` | Reestilizar en oscuro con `AuthField`, CTA y errores del tema; mismo nombre/correo/contraseña, misma validación y hooks. |
| `app/(auth)/registro/page.tsx` | Renderizar `RegistroShell` desde `@/features/auth`. |
| `features/auth/index.ts` | Exportar `RegistroShell` (y conservar `LoginShell`/`RegistroForm`). |

### No modificar

Hooks, `api/`, `schemas.ts` (sin campo de confirmación ni validaciones nuevas),
`mensajes-error.ts`, navegación, `middleware.ts`, `app/(auth)/layout.tsx` (ya neutro) y
`app/globals.css`. Sin dependencias nuevas.

## Cambios

### 1. `AuthShell.tsx`

Props explícitas: `insignia`, `titulo`, `descripcion`, `etiquetaLateral`, `panelLateral`
(`ReactNode`) y `children`. Reutiliza exactamente la estructura y clases que hoy tiene
`LoginShell`: raíz `min-h-dvh bg-elinain-bg` con acento radial dorado, columna izquierda con
marca "Elinain / Gestión ganadera", insignia dorada, `h1` en `font-display`, descripción y el
formulario; aside (`hidden lg:block`) con `next/image` + overlays, pill superior y el panel
lateral.

### 2. `RegistroShell.tsx`

- `insignia`: "Crea tu cuenta de comerciante"; `titulo`: "Crear cuenta"; descripción sobre
  registrar la operación del negocio.
- `etiquetaLateral`: "Gestión integral del engorde".
- Panel lateral (`figure` con `glass-panel`, rótulo "Vista de ejemplo · panel de gestión"):
  - Cifras de ejemplo visibles (rotuladas como ejemplo): animales en inventario `312`,
    contratos activos `8`, ganancia de peso promedio `+1,2 kg/día`, utilidad del ciclo `—`.
  - Lista de conceptos reales: inventario con trazabilidad por contrato y ciclo; compras,
    ventas y costos del engorde; ganado en participación con reparto de utilidad auditable;
    fincas propias o de terceros.
  - Nota de que los valores son ilustrativos.

### 3. `RegistroForm.tsx`

- Mismos campos y validación (`esquemaRegistro`): nombre, correo y contraseña. Sin campos nuevos.
- `AuthField` con iconos, `ESTILOS_CTA_ACCESO` para el botón, mensaje de error en tono oscuro,
  y enlace a `/login` con el color de acento. Se añade alternancia de visibilidad de contraseña
  (solo UI, con el mismo `BotonVisibilidad` del login).

## Restricciones

- Solo estilos y composición. Prohibido tocar hooks, `api/`, esquemas, validación, navegación,
  flujo de autenticación y textos de negocio válidos.
- No añadir campos al formulario (nada de confirmar contraseña, tipo de perfil, cédula,
  teléfono, términos ni medidor de seguridad).
- `/login` debe quedar visualmente idéntico.
- Cifras de ejemplo solo dentro del panel rotulado "Vista de ejemplo"; no inventar
  funcionalidades, certificaciones, datos operativos ni promesas.
- Sin dependencias nuevas. Respetar el barrel `@/features/auth` y las convenciones del
  proyecto (Tailwind directo, `cn()`, `next/image`/`next/link`, strict sin `any`,
  accesibilidad: labels, foco visible, HTML semántico).

## Pasos

- [x] 1. Extraer `AuthIcons.tsx` desde `LoginForm` y actualizar `LoginForm` para consumirlo.
- [x] 2. Crear `AuthShell.tsx` con la estructura compartida.
- [x] 3. Refactorizar `LoginShell.tsx` para usar `AuthShell`, sin cambios visuales.
- [x] 4. Crear `RegistroShell.tsx` con copy y panel de registro.
- [x] 5. Reestilizar `RegistroForm.tsx` en oscuro (sin cambios funcionales).
- [x] 6. Actualizar `app/(auth)/registro/page.tsx` y `features/auth/index.ts`.
- [x] 7. Verificar visualmente `/login` (idéntico) y `/registro` (nuevo) en desktop y móvil;
      ejecutar y registrar `V1`–`V4` y dejar `V5` a cargo del usuario.
