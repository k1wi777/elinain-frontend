# Revisión — Autenticación: BFF, login, registro y rutas protegidas

> Work Item: `2026-09-22_02-28__autenticacion-bff-login-registro-rutas-protegidas` (`type: feature`)
>
> Agente: `reviewer`
> Resultado: **aprobado** (`done`). `V5` (validación manual) queda a cargo del usuario.

---

## Alcance revisado

Se aplicó el **Caso A** (`type == feature`) del rol `reviewer`. Se leyeron
`requirements.md`, `design.md`, `tasks.md`, `meta.json` y el reporte del Implementer
(`impl.md`), y se inspeccionó directamente el código de `app/`, `features/auth/`,
`shared/api/`, `shared/config/` y `middleware.ts` sin confiar solo en el reporte.

---

## Verificaciones realizadas

### Requisitos (`R1`–`R35`)

| Requisito | Comprobación independiente | Resultado |
|-----------|----------------------------|-----------|
| R1 | `app/api/auth/login/route.ts` expone `POST`, parsea defensivamente `email`/`password` (400 si falta) y llama a `createServerClient().post("/usuarios/acceso")`. | Pasa |
| R2 | Éxito = `new NextResponse(null, { status: 204 })` + `fijarSesion`; el cuerpo nunca incluye `tokenAcceso`. | Pasa |
| R3, R4 | `ApiError` se mapea con `respuestaError(error.status)` conservando 401/409/…; un 401 no llega a `fijarSesion` (el `throw` salta al `catch`). | Pasa |
| R5 | `app/api/auth/registro/route.ts` expone `POST` y llama a `/usuarios/registro`. | Pasa |
| R6 | El `catch` del registro responde `respuestaError(409)` y retorna antes de crear la cookie. | Pasa |
| R7 | Tras 201, el handler repite `POST /usuarios/acceso` en servidor, fija la cookie y responde **201** sin token. | Pasa |
| R8 | `app/api/auth/logout/route.ts` responde 204 y ejecuta `limpiarSesion` (cookie a `maxAge: 0`). | Pasa |
| R9 | `_lib/respuestas.ts`: red (`status === 0`) → 502; desconocido → mensaje genérico; nunca filtra el cuerpo del backend. | Pasa |
| R10 | El token solo se escribe en la cookie (`fijarSesion`); `httpOnly: true` y ninguna respuesta BFF serializa el token. | Pasa |
| R11 | `shared/api/server-client.ts` ya lee `SESSION_COOKIE_NAME` de `cookies()` y adjunta `Authorization: Bearer`; el BFF lo reutiliza. | Pasa |
| R12, R13 | `app/(auth)/login/page.tsx` compone `LoginForm`; `esquemaLogin` exige `email` con formato y `password`. | Pasa |
| R14, R17 | `LoginForm` deriva `mensajeErrorAcceso(error.status)` en render (401 incluido) y lo anuncia con `role="alert"`; no hay redirección ante error. | Pasa |
| R15, R16 | `useLogin` redirige en `onSuccess` (`router.replace("/dashboard")` + `refresh`); `Button type="submit"` con `disabled={isPending}`. | Pasa |
| R18, R19 | `app/(auth)/registro/page.tsx` compone `RegistroForm`; `esquemaRegistro` valida nombre, correo y contraseña. | Pasa |
| R20 | `esquemaRegistro.password` usa `.min(8, …)` con mensaje en español; test de 7 vs 8 caracteres. | Pasa |
| R21 | `RegistroForm` asocia `error.status === 409` al campo de correo (`errorCorreo`). | Pasa |
| R22 | `useRegistro` redirige al dashboard en `onSuccess`; el auto-login ocurre en el BFF. | Pasa |
| R23 | `mensajeErrorRegistro` cubre 400/0/genéricos sin detalle técnico. | Pasa |
| R24 | Enlaces `next/link` entre `/login` y `/registro` en ambos formularios. | Pasa |
| R25, R26, R27, R30 | `middleware.ts` evalúa `sesionVigente(request.cookies.get(SESSION_COOKIE_NAME)?.value)` (sin backend ni firma): sin sesión en `/dashboard*` → `/login`; con sesión en `/login`/`/registro` → `/dashboard`; token ausente/en blanco/malformado/vencido → no vigente. | Pasa |
| R28 | `app/(dashboard)/dashboard/page.tsx` es la landing protegida mínima. | Pasa |
| R29 | `LogoutButton` dispara `useLogout`; `cerrarSesion` limpia la cookie y `onSuccess` redirige a `/login`. | Pasa |
| R31 | Validación zod (`features/auth/schemas.ts`) dentro del feature. | Pasa |
| R32 | Tests puros en `shared/api/__tests__/session.test.ts`, `features/auth/__tests__/schemas.test.ts`, `mensajes-error.test.ts` y `env.test.ts`; `V4` verde. | Pasa |
| R33 | `package.json`/`package-lock.json` sin diff; solo dependencias ya instaladas. | Pasa |
| R34 | `shared/` no importa de `features/` ni de `app/`; `features/` no importa de `app/` ni de otro feature; `app/` solo compone (grep sin coincidencias). | Pasa |
| R35 | Mensajes del BFF (`respuestas.ts`) y de la UI (`mensajes-error.ts`) fijados por estado, en español; nunca se muestra el `mensaje` crudo del backend. | Pasa |

### Tareas (`T1`–`T16`)

Las dieciséis tareas están marcadas `[x]` en `tasks.md` y cada una tiene su artefacto
correspondiente. `T16` (checkpoints y evidencia) está cumplida: `impl.md` registra
`V1`–`V4` y los pasos de reproducción de `V5`.

### Arquitectura y convenciones

- Feature-first: todo el dominio de auth vive en `features/auth/`; el BFF en `app/api/auth/`;
  las piezas transversales (`bff-client`, `session`) en `shared/api/`. Correcto.
- Dependencias en un solo sentido: `shared/` no importa de `features/`/`app/`; `features/`
  no importa de `app/`; sin imports entre features. Correcto.
- `app/` sin lógica de negocio: las páginas solo componen y declaran `metadata`. Correcto.
- Sin `fetch` en componentes ni en `features/auth/api`; todo pasa por `createBffClient`.
  Sin `useEffect` para datos. Correcto.
- Sin `any`, `@ts-ignore` ni `@ts-expect-error`; `strict` en verde (`V3`). Correcto.
- Named exports; `export default` solo en `page.tsx`/`layout.tsx`. Correcto.
- `'use client'` en el nodo más bajo: `providers.tsx`, formularios, `LogoutButton` y hooks;
  no en páginas ni layouts. Correcto.
- Sin dependencias nuevas, sin `console.log`/`TODO`/código muerto; `features/.gitkeep`
  eliminado. Correcto.
- Textos de interfaz y mensajes de error en español. Correcto.
- Accesibilidad: `Input` de `shared/ui` vincula `label`, `aria-invalid` y
  `aria-describedby`; `Button` con `type="button"` por defecto y `focus-visible`. Correcto.

### Foco en el flujo de autenticación

- **Propagación de códigos HTTP:** login y registro mapean `ApiError.status` sin convertirlo
  en 200; 401 y 409 llegan intactos al navegador; red (`0`) → 502. Correcto.
- **Token fuera del cuerpo:** respuestas de éxito 204/201 sin cuerpo; única escritura en
  cookie httpOnly. Correcto.
- **Atributos de cookie** (`_lib/sesion.ts`): `httpOnly: true`, `sameSite: "lax"`,
  `secure: getServerEnv().isProduction`, `path: "/"`, y `maxAge = max(0, exp − now)` derivado
  de `obtenerExpiracionJwt`; sin `exp` se emite como cookie de sesión (sin inventar duración).
  Correcto.
- **Verificación del middleware:** decodifica el payload con `atob`, compara `exp * 1000` con
  `Date.now()`, trata malformados como no vigentes y no verifica firma ni consulta al
  backend. Correcto.
- **Redirecciones:** `/dashboard*` sin sesión → `/login`; `/login`/`/registro` con sesión
  vigente → `/dashboard`. Correcto.
- **Auto-login tras registro:** una sola petición del navegador, acceso repetido en el BFF y
  cookie fijada con 201. Correcto.
- **Mapeo 401/409 en formularios:** login usa `mensajeErrorAcceso(status)`; registro asocia
  el 409 al campo de correo y usa `mensajeErrorRegistro` para el resto. Correcto.

### Coincidencia con `design.md`

- Decisiones D1–D10 implementadas según lo especificado (token solo en cookie, auto-login en
  servidor, vigencia sin firma, `maxAge` por `exp`, `secure` por `isProduction`, cliente
  dedicado del BFF, middleware en la raíz, mensajes por estado, `QueryClientProvider` y
  `/dashboard` como única ruta protegida). Correcto.
- Única diferencia respecto al árbol de `design.md`: se añadió
  `app/api/auth/_lib/respuestas.ts`, ausente en el diseño. Está documentado en `impl.md` y
  responde a `T5`/`T6` ("mapeo de `ApiError` … con `{ mensaje }` en español") y a R9/R35;
  evita duplicar el mapeo entre login y registro. Es un helper interno `_lib/`, no cambia
  requisitos, comportamiento ni API pública. Se acepta como desviación interna justificada.

### Alcance

No hay alcance extra: no se tocaron `app/page.tsx`, `package.json`, `tsconfig.json`,
ESLint, Prettier ni Jest; no se modificaron features de negocio ni rutas ajenas.

### Checkpoints

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | **Pasa** | `All matched files use Prettier code style!` |
| `V2` | `npm run lint` | **Pasa** | ESLint sin errores. |
| `V3` | `npm run typecheck` | **Pasa** | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | **Pasa** | 8 suites / 75 tests en verde. |
| `V5` | Validación manual | **Pendiente del usuario** | Requiere backend y entorno real (login, 401, registro y 409, auto-login, rutas protegidas, redirección de autenticados, logout, accesibilidad). Pasos en `impl.md`. No se marca como superada sin confirmación explícita del usuario (`verification.md`). |

`bash .rei/init.sh` finaliza con **código de salida `0`** y `V1`–`V4` en verde.

---

## Observaciones

- El helper `app/api/auth/_lib/respuestas.ts` es la única adición respecto al árbol de
  `design.md`; documentada y justificada (ver arriba).
- La dependencia de tipos de rutas generados (`.next/types/routes.d.ts`, `npx next typegen`)
  señalada en `impl.md` es **preexistente**: `app/layout.tsx` ya usaba `LayoutProps<"/">` en
  `HEAD` y `next-env.d.ts` está en `.gitignore`. No la introduce este Work Item y `V3` pasa.
- `next build` advierte que `middleware.ts` está deprecado en Next 16.3.5 (sugiere `proxy`);
  es una advertencia no bloqueante y `design.md`/`tasks.md` exigen explícitamente
  `middleware.ts`. No se considera incumplimiento.
- `V4` aumentó a 75 tests (17 en `features/auth`, 11 en `session.test.ts` y los de
  `isProduction`), con cobertura pura de esquemas, mensajes y vigencia (R32).

---

## Acciones requeridas

Ninguna. El Work Item cumple sus requisitos, tareas, arquitectura, convenciones y los
checkpoints automatizados; `V5` queda a cargo del usuario.

---

## Estado final

**`done`**.
