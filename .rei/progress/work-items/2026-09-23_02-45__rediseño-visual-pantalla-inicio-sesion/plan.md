# Plan: Rediseño visual de la pantalla de inicio de sesión

## Objetivo

Mejorar exclusivamente la presentación visual de `/login` tomando como referencia la imagen proporcionada y el estilo visual definido por el proyecto: oscuro, minimalista, premium y con acento ámbar.

## Alcance

- Refinar la composición responsive de dos columnas en `features/auth/components/LoginShell.tsx`.
- Mejorar jerarquía tipográfica, espaciado, superficies, contraste y tratamiento visual de la imagen existente.
- Pulir los estilos compartidos de campos, etiquetas, enlaces, CTA y estados en `features/auth/auth-styles.ts` y, si es necesario, `features/auth/components/AuthField.tsx` y `features/auth/components/LoginForm.tsx`.
- Mantener únicamente conceptos reales del dominio: compra, engorde, comercialización, fincas, costos, ciclos y participación con terceros.

## Fuera de alcance

- No cambiar hooks, API, validación, esquemas, navegación ni estados de autenticación.
- No agregar dependencias.
- No inventar métricas, funcionalidades, mensajes de negocio o datos operativos.
- No modificar la contextualización ni la lógica del registro.

## Validación

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- Verificación manual de `/login` en escritorio y móvil, incluyendo foco, errores, carga y visibilidad de contraseña.
