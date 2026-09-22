# Tareas — Autenticación: BFF, login, registro y rutas protegidas

> Work Item: `2026-09-22_02-28__autenticacion-bff-login-registro-rutas-protegidas`
> (`type: feature`)
>
> Tareas discretas y ordenadas. El Implementer marca cada tarea como `[x]`
> inmediatamente al terminarla. Cada tarea referencia los requisitos (`R…`) que
> implementa.

---

- [x] **T1 — Cliente del BFF.** Crear `shared/api/bff-client.ts` con
  `createBffClient(): HttpClient` sobre `createHttpClient({ baseUrl: "" })` y JSDoc;
  documentar que produce rutas relativas de mismo origen y no adjunta token. (R11, R34)

- [x] **T2 — Vigencia de la cookie de sesión.** Crear `shared/api/session.ts` (puro y seguro
  para Edge) con `obtenerExpiracionJwt(token): number | undefined` y
  `sesionVigente(token, ahoraMs?): boolean`, decodificando el payload del JWT con `atob`.
  Crear `shared/api/__tests__/session.test.ts` cubriendo token ausente, malformado, sin
  `exp`, vigente y vencido. (R26, R30, R32)

- [x] **T3 — `isProduction` en el entorno.** Ampliar `shared/config/env.ts` con
  `isProduction: process.env.NODE_ENV === "production"` en `Env` y en `getClientEnv()` /
  `getServerEnv()`; actualizar `shared/config/__tests__/env.test.ts`. (R33, R34)

- [x] **T4 — Helper interno de cookie.** Crear `app/api/auth/_lib/sesion.ts` con
  `fijarSesion(response, tokenAcceso)` y `limpiarSesion(response)`, aplicando los atributos
  de cookie (httpOnly, sameSite `lax`, secure por `isProduction`, path `/`, maxAge derivado
  de `obtenerExpiracionJwt`). (R2, R8, R10)

- [x] **T5 — BFF de login.** Crear `app/api/auth/login/route.ts`: parseo defensivo del cuerpo
  (400 si es inválido), `POST /usuarios/acceso` vía `createServerClient()`, respuesta 204 con
  `fijarSesion` en éxito, y mapeo de `ApiError` a su estado (502 si `status === 0`) con
  `{ mensaje }` en español. (R1, R2, R3, R4, R9, R10, R11)

- [x] **T6 — BFF de registro con auto-login.** Crear `app/api/auth/registro/route.ts`: 400 si
  el cuerpo es inválido, `POST /usuarios/registro` (409 propagado sin cookie) y, tras 201,
  `POST /usuarios/acceso` con las mismas credenciales para fijar la cookie y responder 201
  sin token. (R5, R6, R7, R9, R10)

- [x] **T7 — BFF de logout.** Crear `app/api/auth/logout/route.ts`: responder 204 y
  `limpiarSesion`. (R8)

- [x] **T8 — Esquemas y mensajes del feature.** Crear `features/auth/schemas.ts` con
  `esquemaLogin` y `esquemaRegistro` (email con formato, password `min(8)`, mensajes en
  español) y `features/auth/types.ts` con los alias `CredencialesAcceso` y `DatosRegistro`
  desde `ApiSchemas`. Crear `features/auth/mensajes-error.ts` con `mensajeErrorAcceso` y
  `mensajeErrorRegistro`. Crear `features/auth/__tests__/schemas.test.ts` y
  `features/auth/__tests__/mensajes-error.test.ts`. (R13, R19, R20, R31, R32, R35)

- [x] **T9 — API y hooks del feature.** Crear `features/auth/api/auth.ts` con
  `iniciarSesion`, `registrarUsuario` y `cerrarSesion` usando `createBffClient()`; crear
  `features/auth/hooks/useLogin.ts`, `useRegistro.ts` y `useLogout.ts` como mutaciones de
  TanStack Query (error tipado `ApiError`; éxito redirige con `router.replace` +
  `router.refresh`). (R14, R15, R17, R22, R23, R29)

- [x] **T10 — Formularios.** Crear `features/auth/components/LoginForm.tsx` y
  `RegistroForm.tsx` (`'use client'`, `useForm` + `zodResolver`, `Input`/`Button` de
  `shared/ui`, error general derivado en render con `role="alert"`, 409 asociado al campo de
  correo en registro, enlace entre ambas páginas con `next/link`, envío deshabilitado
  mientras está en curso). (R12, R13, R14, R16, R17, R18, R19, R20, R21, R23, R24)

- [x] **T11 — Logout de la interfaz.** Crear `features/auth/components/LogoutButton.tsx`
  (`'use client'`) que dispare `useLogout` y se deshabilite durante la petición. Crear
  `features/auth/index.ts` exportando `LoginForm`, `RegistroForm` y `LogoutButton`; eliminar
  `features/.gitkeep`. (R29, R34)

- [x] **T12 — Provider de TanStack Query.** Crear `app/providers.tsx` (`'use client'`) con
  `QueryClientProvider` y un `QueryClient` creado con `useState`; montarlo en `app/layout.tsx`
  junto con `lang="es"` y la metadata del producto. (R15, R22, R29, R34)

- [x] **T13 — Páginas de acceso.** Crear `app/(auth)/layout.tsx` (contenedor centrado),
  `app/(auth)/login/page.tsx` y `app/(auth)/registro/page.tsx` como Server Components que
  renderizan el formulario correspondiente y definen `metadata`. (R12, R18, R24)

- [x] **T14 — Landing protegida.** Crear `app/(dashboard)/layout.tsx` (cabecera mínima con
  `LogoutButton` y `children`) y `app/(dashboard)/dashboard/page.tsx` (landing protegida
  mínima, sin datos de usuario). (R28, R29)

- [x] **T15 — Middleware de rutas protegidas.** Crear `middleware.ts` en la raíz con el
  matcher `["/dashboard", "/dashboard/:path*", "/login", "/registro"]`: sin sesión vigente
  en ruta protegida redirige a `/login`; con sesión vigente en `/login` o `/registro`
  redirige a `/dashboard`. Debe usar `SESSION_COOKIE_NAME` y `sesionVigente`, sin llamar al
  backend. (R25, R26, R27, R30)

- [x] **T16 — Checkpoints y evidencia.** Ejecutar `npm run format`, `V1`
  (`format:check`), `V2` (`lint`), `V3` (`typecheck`) y `V4` (`test`); confirmar
  `bash .rei/init.sh` con salida `0`. Registrar la evidencia de `V1`–`V4` en
  `.rei/progress/work-items/2026-09-22_02-28__autenticacion-bff-login-registro-rutas-protegidas/impl.md`
  y documentar los pasos de reproducción para `V5` (validación manual del usuario). (R32)

---

## Orden y dependencias

1. `T1`, `T2` y `T3` son independientes y no dependen de nada.
2. `T4` depende de `T1` (implícito), `T2` y `T3`.
3. `T5`, `T6` y `T7` dependen de `T4`; `T6` reutiliza además el flujo de `T5`.
4. `T8` es independiente de `T1`–`T7`.
5. `T9` depende de `T1` y `T8`.
6. `T10` depende de `T8` y `T9`; `T11` depende de `T9`.
7. `T12` no depende de las piezas de autenticación, pero debe existir antes de usar las
   mutaciones en `T13`/`T14`.
8. `T13` y `T14` dependen de `T10`, `T11` y `T12`.
9. `T15` depende de `T2`.
10. `T16` se ejecuta al final, con todo implementado.

## Fuera de alcance

- Resto de features de negocio (terceros, fincas, contratos) y sus rutas protegidas.
- Recuperación de contraseña, perfil de usuario, refresh de token y logout en el backend.
- Modificación de `app/page.tsx` (placeholder de create-next-app).
- Librería de render para tests (la interacción se valida en `V5`).
