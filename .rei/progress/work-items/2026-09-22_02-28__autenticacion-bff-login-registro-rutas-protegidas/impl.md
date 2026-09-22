# Implementación — Autenticación: BFF, login, registro y rutas protegidas

> Work Item: `2026-09-22_02-28__autenticacion-bff-login-registro-rutas-protegidas` (`type: feature`)
>
> Agente: `implementer`
> Resultado: implementación completada; `V1`–`V4` en verde y `bash .rei/init.sh` con
> código de salida `0`. `V5` pendiente de validación manual del usuario.

---

## Resumen

Se implementaron las cuatro piezas definidas en `design.md`, alrededor de la cookie
httpOnly `elinain_session`:

1. **BFF** (`app/api/auth/*`): `login`, `registro` (con auto-login en servidor) y `logout`,
   más el helper interno `_lib/sesion.ts` que fija/limpia la cookie. El token nunca viaja en
   el cuerpo de la respuesta.
2. **Feature `auth`**: `schemas.ts` (zod), `types.ts` (alias de DTOs), `mensajes-error.ts`,
   `api/auth.ts`, hooks de mutación (`useLogin`, `useRegistro`, `useLogout`) y formularios
   (`LoginForm`, `RegistroForm`, `LogoutButton`).
3. **Páginas**: `(auth)/login`, `(auth)/registro` y la landing protegida
   `(dashboard)/dashboard`, más `app/providers.tsx` (TanStack Query) montado en el layout
   raíz.
4. **Middleware** (`middleware.ts`) como guardia de navegación basada en la vigencia del
   JWT, sin consultar al backend.

Se ejecutaron las tareas `T1`–`T16` en el orden de `tasks.md`, sin añadir alcance. No se
modificó `app/page.tsx`, no se añadieron dependencias ni se tocaron `package.json`,
`tsconfig.json`, ESLint, Prettier o Jest.

---

## Archivos

### Creados

| Archivo | Tarea | Contenido |
|---------|-------|-----------|
| `shared/api/bff-client.ts` | T1 | `createBffClient(): HttpClient` = `createHttpClient({ baseUrl: "" })` con JSDoc. |
| `shared/api/session.ts` | T2 | `obtenerExpiracionJwt` y `sesionVigente` (puro, apto para Edge). |
| `shared/api/__tests__/session.test.ts` | T2 | 11 tests: ausente, blanco, malformado, sin `exp`, vigente y vencido. |
| `app/api/auth/_lib/sesion.ts` | T4 | `fijarSesion` / `limpiarSesion` con atributos de cookie (httpOnly, lax, secure por `isProduction`, path `/`, maxAge por `exp`). |
| `app/api/auth/_lib/respuestas.ts` | T5 | Helper interno `respuestaError(status)` con mensajes controlados en español y propagación del código real (`0` → `502`). |
| `app/api/auth/login/route.ts` | T5 | `POST` 400 ante cuerpo inválido, acceso vía `createServerClient()`, 204 + cookie, mapeo de `ApiError`. |
| `app/api/auth/registro/route.ts` | T6 | `POST` 400 defensivo, 409 propagado sin cookie, auto-login en servidor y 201 + cookie. |
| `app/api/auth/logout/route.ts` | T7 | `POST` 204 + `limpiarSesion`. |
| `features/auth/types.ts` | T8 | Alias `CredencialesAcceso` y `DatosRegistro` desde `ApiSchemas`. |
| `features/auth/schemas.ts` | T8 | `esquemaLogin` y `esquemaRegistro` (email con formato, password `min(8)`, mensajes en español). |
| `features/auth/mensajes-error.ts` | T8 | `mensajeErrorAcceso` y `mensajeErrorRegistro` (mapeo de 401/409/400/0 y genéricos). |
| `features/auth/__tests__/schemas.test.ts` | T8 | 10 tests de validación. |
| `features/auth/__tests__/mensajes-error.test.ts` | T8 | 7 tests de mapeo de estados. |
| `features/auth/api/auth.ts` | T9 | `iniciarSesion`, `registrarUsuario`, `cerrarSesion` sobre `createBffClient()`. |
| `features/auth/hooks/useLogin.ts` | T9 | Mutación con redirección al dashboard en éxito. |
| `features/auth/hooks/useRegistro.ts` | T9 | Mutación con redirección al dashboard en éxito. |
| `features/auth/hooks/useLogout.ts` | T9 | Mutación con redirección a `/login` en éxito. |
| `features/auth/components/LoginForm.tsx` | T10 | `'use client'`, `useForm` + `zodResolver`, `Input`/`Button`, error general con `role="alert"`, enlace a `/registro`. |
| `features/auth/components/RegistroForm.tsx` | T10 | Igual, con 409 asociado al campo de correo y enlace a `/login`. |
| `features/auth/components/LogoutButton.tsx` | T11 | Botón que dispara `useLogout` y se deshabilita en curso. |
| `features/auth/index.ts` | T11 | Barrel público: `LoginForm`, `RegistroForm`, `LogoutButton`. |
| `app/providers.tsx` | T12 | `'use client'`, `QueryClientProvider` con `QueryClient` creado con `useState`. |
| `app/(auth)/layout.tsx` | T13 | Contenedor centrado de las pantallas de acceso. |
| `app/(auth)/login/page.tsx` | T13 | Server Component con `metadata` que compone `LoginForm`. |
| `app/(auth)/registro/page.tsx` | T13 | Server Component con `metadata` que compone `RegistroForm`. |
| `app/(dashboard)/layout.tsx` | T14 | Cabecera mínima con enlace al panel y `LogoutButton`. |
| `app/(dashboard)/dashboard/page.tsx` | T14 | Landing protegida mínima, sin datos de usuario. |
| `middleware.ts` | T15 | Guardia de rutas protegidas y redirección de usuarios autenticados. |

### Modificados

| Archivo | Tarea | Cambio |
|---------|-------|--------|
| `shared/config/env.ts` | T3 | `Env` incluye `isProduction`; `getClientEnv()` y `getServerEnv()` lo calculan desde `NODE_ENV`. |
| `shared/config/__tests__/env.test.ts` | T3 | Aserciones actualizadas a `isProduction` y 3 tests nuevos para el flag. |
| `app/layout.tsx` | T12 | `lang="es"`, metadata del producto y `<Providers>` envolviendo `children`. |

### Eliminados

| Archivo | Tarea | Motivo |
|---------|-------|--------|
| `features/.gitkeep` | T11 | La carpeta ya contiene `features/auth/`. |

---

## Trazabilidad con los requisitos

| Requisito | Dónde se cubre |
|-----------|----------------|
| R1–R4 | `app/api/auth/login/route.ts` + `_lib/respuestas.ts`. |
| R5–R7 | `app/api/auth/registro/route.ts` (409 sin cookie y auto-login en servidor). |
| R8 | `app/api/auth/logout/route.ts` + `limpiarSesion`. |
| R9 | `_lib/respuestas.ts` (502/500 con mensaje controlado). |
| R10 | `fijarSesion` escribe solo la cookie; los handlers nunca incluyen el token en el cuerpo. |
| R11 | BFF y rutas autenticadas sobre `createServerClient()`, que lee la cookie httpOnly. |
| R12, R13, R18, R19 | `LoginForm`/`RegistroForm` + `esquemaLogin`/`esquemaRegistro` con `zodResolver`. |
| R14, R17 | `mensajeErrorAcceso` sobre `error.status` + `role="alert"`. |
| R15, R22 | `onSuccess` de `useLogin`/`useRegistro` (`router.replace("/dashboard")` + `refresh`). |
| R16 | `disabled={isPending}` en los formularios. |
| R20 | `esquemaRegistro` con `min(8)` y mensaje en español. |
| R21 | `RegistroForm` asocia el 409 al campo de correo. |
| R23 | `mensajeErrorRegistro` para el resto de estados. |
| R24 | Enlaces `next/link` entre `/login` y `/registro`. |
| R25–R27, R30 | `middleware.ts` con `sesionVigente` y el matcher de rutas. |
| R28 | `app/(dashboard)/dashboard/page.tsx`. |
| R29 | `LogoutButton` + `useLogout` (`cerrarSesion` → `/login`). |
| R31 | `features/auth/schemas.ts`. |
| R32 | Tests de `session.test.ts`, `schemas.test.ts`, `mensajes-error.test.ts` y `env.test.ts`. |
| R33 | Sin dependencias nuevas. |
| R34 | `shared/` solo importa de `shared/`; `features/` de `shared/`; `app/` compone. |
| R35 | Mensajes fijados en `mensajes-error.ts` y `_lib/respuestas.ts`; nunca se muestra el `mensaje` crudo del backend. |

---

## Proceso de verificación

Comandos ejecutados desde la raíz del repositorio tras `npm run format`.

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | **Pasa** | `All matched files use Prettier code style!` |
| `V2` | `npm run lint` | **Pasa** | ESLint sin errores ni advertencias. |
| `V3` | `npm run typecheck` | **Pasa** | `tsc --noEmit` sin errores. Requirió `npx next typegen` para regenerar `.next/types/routes.d.ts` con las rutas nuevas (`/login`, `/registro`, `/dashboard`) que consumen `next/link` y `router.replace` tipados. |
| `V4` | `npm test` | **Pasa** | 8 suites / 75 tests en verde (17 nuevos en `features/auth`, 11 en `session.test.ts` y los 3 nuevos de `isProduction`). |
| `bash .rei/init.sh` | — | **Código 0** | `V1`–`V4` en verde en la Sección 4. |

Además, como comprobación extra no exigida como checkpoint, `npm run build` finalizó con
código `0` (10 rutas, BFF y middleware incluidos).

### Pasos de reproducción para `V5` (validación manual)

Requiere backend disponible y `API_URL`/`NEXT_PUBLIC_API_URL` configurados en `.env.local`.

1. `npm run dev` y abrir `http://localhost:3000/dashboard`.
   - **Esperado:** redirección a `/login` (middleware sin sesión).
2. En `/login`, enviar el formulario vacío y luego con correo `sin-arroba`.
   - **Esperado:** errores de campo en español; no se envía la petición.
3. Enviar credenciales incorrectas (`401`).
   - **Esperado:** mensaje "Correo o contraseña incorrectos." en el formulario; sin
     redirección y sin cookie (comprobar en DevTools → Application → Cookies).
4. Acceder con credenciales válidas.
   - **Esperado:** redirección a `/dashboard`, cookie `elinain_session` marcada `HttpOnly`
     (no legible desde `document.cookie` en consola) y con `Max-Age` acorde al `exp`.
5. Con sesión iniciada, visitar `/login` y `/registro`.
   - **Esperado:** redirección a `/dashboard`.
6. Cerrar sesión desde la cabecera del panel.
   - **Esperado:** cookie eliminada y redirección a `/login`.
7. En `/registro`, validar: contraseña de 7 caracteres rechazada; correo ya registrado
   (`409`) asociado al campo de correo; registro nuevo con auto-login y redirección al
   dashboard sin pasar de nuevo por login.
8. Navegación por teclado y foco visible en formularios y botón de cierre de sesión.

---

## Observaciones

- **Helper interno adicional:** `app/api/auth/_lib/respuestas.ts` no figuraba en el árbol de
  `design.md`. Se añadió para no duplicar entre `login` y `registro` el mapeo de errores a
  mensajes controlados (R9, R35). Es interno (carpeta `_lib`) y no cambia el alcance.
- **Middleware deprecado en Next 16.3.5:** `next build` emite
  `The "middleware" file convention is deprecated. Please use "proxy" instead.` Es una
  advertencia no bloqueante; `middleware.ts` es lo que exige `design.md`/`tasks.md` y sigue
  funcionando. No se migró a `proxy.ts` para no desviarse del Work Item.
- **Regeneración de tipos de rutas:** con las typed routes de Next 16, `next/link` y
  `router.replace` validan contra `.next/types/routes.d.ts`. Antes de `V3` hay que ejecutar
  `npx next typegen` (o `next dev`/`build`) para que incluya las rutas
  nuevas; el archivo generado está en `.next/` y no se versiona.
- No se hicieron commits.
