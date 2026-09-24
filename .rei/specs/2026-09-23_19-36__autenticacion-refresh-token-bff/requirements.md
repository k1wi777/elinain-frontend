# Requisitos — Autenticación: refresh token con rotación en el BFF y el middleware

> Work Item: `2026-09-23_19-36__autenticacion-refresh-token-bff` (`type: feature`)
>
> Qué debe hacer el sistema. No contiene decisiones técnicas de implementación (esas viven
> en `design.md`). Sintaxis EARS; cada requisito tiene identificador estable, una única
> responsabilidad y es verificable.

---

## Contexto

El contrato actualizado del backend cambia `POST /usuarios/acceso` para emitir un par de
tokens (`tokenAcceso` JWT + `tokenRefresco` opaco) y agrega `POST /usuarios/refresh`
(rotación de tokens, RTR) y `POST /usuarios/logout` (revoca el token de refresco), con los
DTOs `RefrescarTokenDto` y `CerrarSesionDto`. Hoy el frontend solo guarda `tokenAcceso` y su
logout no revoca nada en el backend.

Decisión acordada: **refresco automático en dos frentes complementarios**.

- **Reactivo en el BFF.** Si una operación autenticada contra el backend recibe 401 por token
  de acceso expirado, el BFF renueva con el token de refresco, actualiza las cookies y
  reintenta la operación.
- **Proactivo en el middleware.** Al navegar a una ruta protegida con el token de acceso
  vencido o ausente pero con el token de refresco aún presente, el middleware renueva de forma
  transparente y deja continuar la navegación, sin redirigir a `/login`. Solo se redirige a
  `/login` cuando la sesión no puede renovarse (rechazo definitivo del refresco).

El backend usa tokens de refresco opacos (sin `exp` legible), por lo que la validez del
refresco solo puede determinarse intentando la renovación.

---

## Requisitos

### Contrato de la API

#### R1 — Contrato actualizado como fuente de tipos (Ubicuo)

El sistema DEBE tomar los tipos del contrato OpenAPI actualizado del backend y regenerar los
tipos generados a partir de él, sin editarlos a mano.

#### R2 — Nuevos esquemas reflejados (Ubicuo)

El sistema DEBE reflejar en los tipos generados que la respuesta de acceso incluye
`tokenAcceso`, `tokenRefresco` y `usuario`, y DEBE disponer de los DTOs `RefrescarTokenDto` y
`CerrarSesionDto` y de las operaciones `POST /usuarios/refresh` y `POST /usuarios/logout`.

### Sesión y cookies

#### R3 — Sesión con ambos tokens tras acceso (Evento)

CUANDO el acceso es exitoso, el BFF DEBE almacenar el token de acceso y el token de refresco
en cookies httpOnly y DEBE responder sin incluir los tokens en el cuerpo.

#### R4 — Sesión con ambos tokens tras registro (Evento)

CUANDO el registro es exitoso y el BFF autentica al comerciante, el BFF DEBE almacenar el
token de acceso y el token de refresco en cookies httpOnly.

#### R5 — Los tokens nunca se exponen (Ubicuo)

Los tokens NUNCA DEBEN ser accesibles al JavaScript del navegador ni viajar en el cuerpo de
las respuestas del BFF o del middleware.

### Refresco reactivo en el BFF

#### R6 — Intento de renovación ante 401 (Evento)

CUANDO una operación autenticada contra el backend recibe 401, el BFF DEBE intentar renovar
la sesión con el token de refresco.

#### R7 — Rotación y reintento (Evento)

CUANDO la renovación reactiva es exitosa, el BFF DEBE actualizar ambas cookies con el nuevo
par de tokens y DEBE reintentar una única vez la operación original.

#### R8 — Resultado del reintento (Evento)

CUANDO la operación original se reintenta, el BFF DEBE devolver el resultado de ese reintento
y DEBE propagar el código HTTP real del backend.

#### R9 — Rechazo definitivo de la renovación reactiva (Error)

SI la renovación reactiva es rechazada de forma definitiva (400 o 401), ENTONCES el BFF DEBE
eliminar la sesión local y DEBE propagar un 401.

#### R10 — Fallo transitorio de la renovación reactiva (Error)

SI la renovación reactiva falla de forma transitoria (red o 5xx), ENTONCES el BFF NO DEBE
eliminar la sesión local y DEBE propagar el error del backend sin convertirlo en un 401.

#### R11 — Rutas excluidas de la renovación reactiva (Ubicuo)

El BFF NO DEBE intentar renovar la sesión para las operaciones de acceso, registro, refresco
y cierre de sesión.

### Refresco proactivo en el middleware

#### R12 — Renovación al navegar a una ruta protegida (Estado)

MIENTRAS el token de acceso esté vencido, ausente o le queden 60 segundos o menos antes de su
`exp`, y exista un token de refresco, el middleware DEBE renovar la sesión y DEBE dejar
continuar la navegación, sin redirigir a `/login`.

> El margen de 60 segundos es una constante nombrada del sistema; una renovación con más de 60
> segundos de holgura no es necesaria. Si al token de acceso le quedan más de 60 segundos, el
> middleware NO DEBE renovar y DEBE continuar la navegación.

#### R13 — Cookies actualizadas tras la renovación proactiva (Evento)

CUANDO la renovación proactiva es exitosa, el middleware DEBE actualizar ambas cookies tanto
en la respuesta como en la petición que continúa, de modo que la navegación use el nuevo
token de acceso sin una segunda renovación.

#### R14 — Rechazo definitivo de la renovación proactiva (Error)

SI la renovación proactiva es rechazada de forma definitiva (400 o 401), ENTONCES el
middleware DEBE eliminar la sesión local y DEBE redirigir a `/login`.

#### R15 — Fallo transitorio de la renovación proactiva (Error)

SI la renovación proactiva falla de forma transitoria (red o 5xx), ENTONCES el middleware NO
DEBE eliminar la sesión local ni redirigir a `/login`, y DEBE dejar continuar la navegación.

#### R16 — Renovación proactiva solo en rutas protegidas (Ubicuo)

El middleware NO DEBE intentar renovar en `/login`, `/registro`, assets ni rutas públicas, y
NO DEBE provocar bucles de redirección.

#### R17 — Compatibilidad con el runtime del middleware (Ubicuo)

El refresco proactivo DEBE ejecutarse sin axios ni APIs exclusivas de Node, de forma
compatible con el runtime del middleware, y sin dependencias nuevas.

### Cierre de sesión

#### R18 — Revocación del token de refresco (Evento)

CUANDO el usuario cierra sesión, el BFF DEBE solicitar al backend la revocación del token de
refresco.

#### R19 — Limpieza de la sesión local (Ubicuo)

El cierre de sesión DEBE eliminar las cookies httpOnly de acceso y de refresco.

#### R20 — Revocación fallida (Error)

SI la revocación en el backend falla, ENTONCES el BFF DEBE cerrar igualmente la sesión local
sin exponer el detalle técnico.

### Transversal

#### R21 — Concurrencia de renovaciones (Estado)

MIENTRAS varias peticiones concurrentes del mismo proceso necesiten renovar con el mismo
token de refresco, el sistema DEBE ejecutar una única renovación compartida.

#### R22 — Cobertura de la lógica pura (Ubicuo)

La lógica pura de la renovación (decisión de navegación, coordinación de concurrencia,
ejecución y clasificación de la renovación, decisión de reintento y opciones de cookie) DEBE
cubrirse con tests Jest de lógica pura, sin red ni render.

#### R23 — Sin dependencias nuevas (Ubicuo)

El sistema NO DEBE incorporar dependencias nuevas.

#### R24 — Separación de capas (Ubicuo)

El sistema DEBE mantener la separación `app/` / `features/` / `shared/`, sin que `shared/`
importe de `features/` ni de `app/`.

#### R25 — Sin cambios de interfaz (Ubicuo)

El sistema NO DEBE modificar la interfaz de usuario ni el comportamiento visual.

#### R26 — TypeScript estricto (Ubicuo)

El sistema DEBE compilar en TypeScript estricto, sin `any` ni `@ts-ignore` injustificados.

---

## Trazabilidad con el alcance acordado

| Requisito | Cubre |
|-----------|-------|
| R1–R2 | Contrato OpenAPI actualizado y tipos regenerados |
| R3–R5 | Ambos tokens en cookies httpOnly (login y registro) |
| R6–R11 | Refresco reactivo en el BFF con rotación, reintento y clasificación de fallos |
| R12–R17 | Refresco proactivo en el middleware (Edge, sin bucle, solo rutas protegidas) |
| R18–R20 | Logout con revocación en el backend y limpieza local |
| R21–R26 | Concurrencia y convenciones: tests, sin dependencias, capas, sin UI, tipos |
