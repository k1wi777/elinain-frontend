# Requisitos — Autenticación: BFF, login, registro y rutas protegidas

> Work Item: `2026-09-22_02-28__autenticacion-bff-login-registro-rutas-protegidas`
> (`type: feature`)
>
> Qué debe hacer el sistema. No contiene decisiones técnicas de implementación (esas viven
> en `design.md`). Sintaxis EARS; cada requisito tiene identificador estable, una única
> responsabilidad y es verificable.

---

## Contexto

El frontend necesita el flujo de autenticación completo sobre la base ya existente en
`shared/api` (cliente HTTP, cookie httpOnly `elinain_session` reservada, `ApiError`). El
backend ya expone `POST /usuarios/acceso` (200 `AccesoRespuestaDto` con `tokenAcceso` y
`usuario`; 400/401/500) y `POST /usuarios/registro` (201 `UsuarioRegistradoDto`; 400/409 por
correo duplicado/500). El registro **no** emite token y no existen endpoints de perfil,
refresh ni logout en el backend.

Piezas del Work Item: (1) BFF en `app/api/auth/*`; (2) feature `auth` con login; (3) feature
`auth` con registro y auto-login; (4) rutas protegidas con middleware, logout y redirección
de usuarios autenticados.

---

## Requisitos

### BFF (`app/api/auth/*`)

#### R1 — Endpoint de acceso en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `POST /api/auth/login` que reciba correo y
contraseña y solicite el acceso al backend.

#### R2 — Sesión creada tras acceso exitoso (Evento)

CUANDO el backend concede el acceso, el BFF DEBE guardar el token de acceso en la cookie
httpOnly de sesión y DEBE responder con éxito sin incluir el token en el cuerpo.

#### R3 — Credenciales inválidas (Error)

SI el backend responde 401 al acceso, ENTONCES el BFF DEBE responder 401 y NO DEBE crear
la cookie de sesión.

#### R4 — Propagación del código HTTP (Ubicuo)

El BFF DEBE propagar al navegador el mismo código de estado HTTP que devuelve el backend,
sin convertirlo en un éxito.

#### R5 — Endpoint de registro en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `POST /api/auth/registro` que registre al
comerciante en el backend.

#### R6 — Correo ya registrado (Error)

SI el backend responde 409 al registro, ENTONCES el BFF DEBE responder 409 y NO DEBE crear
la cookie de sesión.

#### R7 — Auto-login tras registro (Evento)

CUANDO el registro es exitoso, el BFF DEBE autenticar al comerciante reutilizando el flujo
de acceso y DEBE guardar la cookie de sesión, respondiendo con el código de creación.

#### R8 — Endpoint de cierre de sesión (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `POST /api/auth/logout` que elimine la
cookie de sesión.

#### R9 — Fallo del backend o de red (Error)

SI el backend no responde o devuelve un error inesperado, ENTONCES el BFF DEBE responder con
un error controlado y un mensaje claro en español, sin filtrar el detalle técnico.

#### R10 — El token nunca se expone (Ubicuo)

El sistema NUNCA DEBE exponer el token de sesión en el cuerpo de las respuestas del BFF ni
hacerlo accesible al JavaScript del navegador.

#### R11 — Reutilización del token en el servidor (Ubicuo)

El sistema DEBE tomar el token de la cookie httpOnly para el header `Authorization` en las
peticiones autenticadas del servidor, reutilizando el cliente HTTP existente.

### Login

#### R12 — Página de acceso (Ubicuo)

El sistema DEBE ofrecer la ruta `/login` con un formulario de correo electrónico y
contraseña.

#### R13 — Validación de campos del acceso (Error)

SI el usuario envía el formulario con campos vacíos o con un correo de formato inválido,
ENTONCES el sistema DEBE impedir el envío y mostrar el error en el campo correspondiente.

#### R14 — Credenciales rechazadas en el formulario (Error)

SI el acceso devuelve 401, ENTONCES el sistema DEBE mostrar un mensaje claro en el
formulario y NO DEBE redirigir.

#### R15 — Redirección tras acceso exitoso (Evento)

CUANDO el acceso es exitoso, el sistema DEBE redirigir al usuario al dashboard.

#### R16 — Estado de envío (Estado)

MIENTRAS el acceso está en curso, el sistema DEBE impedir envíos duplicados e indicar el
estado de carga.

#### R17 — Otros errores del acceso (Error)

SI el acceso falla por un motivo distinto a 401, ENTONCES el sistema DEBE mostrar un mensaje
claro de error sin exponer detalle técnico.

### Registro

#### R18 — Página de registro (Ubicuo)

El sistema DEBE ofrecer la ruta `/registro` con un formulario de nombre, correo electrónico
y contraseña.

#### R19 — Validación de campos del registro (Error)

SI el usuario envía el formulario con campos vacíos o con un correo de formato inválido,
ENTONCES el sistema DEBE impedir el envío y mostrar el error en el campo correspondiente.

#### R20 — Longitud mínima de la contraseña (Error)

SI la contraseña tiene menos de 8 caracteres, ENTONCES el sistema DEBE impedir el envío y
mostrar el error en el campo de contraseña.

#### R21 — Correo ya registrado en el formulario (Error)

SI el registro devuelve 409, ENTONCES el sistema DEBE mostrar que el correo ya está
registrado, asociado al campo de correo.

#### R22 — Auto-login y redirección tras registrar (Evento)

CUANDO el registro es exitoso, el sistema DEBE dejar al usuario autenticado y redirigirlo al
dashboard, sin un segundo paso de acceso.

#### R23 — Otros errores del registro (Error)

SI el registro falla por un motivo distinto a 409, ENTONCES el sistema DEBE mostrar un
mensaje claro de error sin exponer detalle técnico.

#### R24 — Navegación entre acceso y registro (Ubicuo)

Las páginas `/login` y `/registro` DEBEN enlazarse entre sí.

### Rutas protegidas

#### R25 — Acceso restringido sin sesión (Estado)

MIENTRAS no exista una sesión válida, el sistema DEBE impedir el acceso a las rutas
protegidas y redirigir a `/login`.

#### R26 — Verificación de sesión sin backend (Ubicuo)

El sistema DEBE verificar la sesión en el middleware a partir de la cookie de sesión
(presencia y vigencia), sin consultar al backend.

#### R27 — Usuario autenticado en rutas de acceso (Evento)

CUANDO un usuario con sesión válida visita `/login` o `/registro`, el sistema DEBE
redirigirlo al dashboard.

#### R28 — Landing protegida (Ubicuo)

El sistema DEBE ofrecer `/dashboard` como landing protegida mínima del Work Item.

#### R29 — Cierre de sesión desde la interfaz (Evento)

CUANDO el usuario cierra sesión, el sistema DEBE eliminar la cookie de sesión y redirigirlo a
`/login`.

#### R30 — Cookie ausente o vencida (Evento)

CUANDO la cookie de sesión no existe, está malformada o ha vencido, el sistema DEBE tratar al
usuario como no autenticado.

### Transversal

#### R31 — Validación con zod en el feature (Ubicuo)

El sistema DEBE definir la validación de los formularios de acceso y registro con zod dentro
del feature `auth`.

#### R32 — Cobertura de la lógica pura (Ubicuo)

El sistema DEBE cubrir con tests Jest de lógica pura —sin red ni render— los esquemas de
validación, los mensajes de error y la verificación de vigencia de la cookie de sesión.

#### R33 — Sin dependencias nuevas (Ubicuo)

El sistema NO DEBE incorporar dependencias nuevas: se construye sobre lo ya instalado
(Next.js, React, TanStack Query, react-hook-form, zod y el sistema de diseño propio).

#### R34 — Separación de capas (Ubicuo)

El sistema DEBE mantener la separación `app/` / `features/` / `shared/`: el BFF vive en
`app/api/auth`, la lógica de negocio de autenticación en `features/auth` y las piezas
transversales en `shared/`, sin que `shared/` importe de `features/` ni de `app/`.

#### R35 — Mensajes en español (Ubicuo)

Todo mensaje de error visible al usuario DEBE estar en español y no DEBE mostrar el detalle
técnico del backend.

---

## Trazabilidad con el alcance acordado

| Requisito | Cubre |
|-----------|-------|
| R1–R11 | BFF `app/api/auth/*` (login, registro con auto-login, logout y cookie httpOnly) |
| R12–R17 | Feature `auth`: login (validación, 401 en formulario, redirección) |
| R18–R24 | Feature `auth`: registro (contraseña mínima 8, 409 en formulario, auto-login) |
| R25–R30 | Rutas protegidas (middleware, `/dashboard`, logout, redirección de autenticados) |
| R31–R35 | Convenciones: zod en el feature, tests de lógica pura, sin dependencias nuevas, capas |
