# Requisitos — Cliente HTTP base en `shared/api`

> Work Item: `2026-09-22_01-38__cliente-http-base` (`type: feature`)
>
> Qué debe hacer el cliente HTTP base del frontend. No contiene decisiones técnicas de
> implementación (esas viven en `design.md`). Sintaxis EARS; cada requisito tiene
> identificador estable, una única responsabilidad y es verificable.

---

## Contexto

El frontend consume la API REST del backend (OpenAPI 3.0.0, base `/api/v1`, seguridad
`bearer` JWT). El cliente HTTP base centraliza el transporte para que ningún feature
duplique headers, URLs, serialización ni manejo de errores.

---

## Requisitos

### R1 — Origen único de la URL base (Ubicuo)

El sistema DEBE obtener la URL base del backend exclusivamente desde
`shared/config/env.ts`, sin leer `process.env` en ningún otro módulo del cliente HTTP.

### R2 — Valores por defecto de las peticiones (Evento)

CUANDO se crea una instancia del cliente HTTP, el sistema DEBE configurar por defecto las
cabeceras `Content-Type: application/json` y `Accept: application/json`.

### R3 — Autorización Bearer automática en servidor (Evento)

CUANDO se ejecuta una operación autenticada mediante el cliente de servidor, el sistema
DEBE adjuntar la cabecera `Authorization: Bearer <token>` leyendo el token desde la cookie
httpOnly de sesión.

### R4 — Nombre de cookie compartido (Ubicuo)

El sistema DEBE exponer el nombre de la cookie de sesión como una constante exportada y
reutilizable por otras capas, sin cadenas literales duplicadas.

### R5 — Ausencia de sesión no es error local (Estado)

MIENTRAS el cliente de servidor no encuentre la cookie de sesión, el sistema DEBE ejecutar
la petición sin la cabecera `Authorization` y sin lanzar un error propio; la decisión de
autorización queda en el backend.

### R6 — Cliente público sin token (Evento)

CUANDO el cliente público ejecuta una petición, el sistema DEBE usar la URL base pública y
NUNCA adjuntar el token de sesión.

### R7 — Mapeo centralizado de errores del backend (Evento)

CUANDO el backend responde con un error (400, 401, 404, 409 o 500), el sistema DEBE
transformarlo en un único error tipado que exponga el código de estado HTTP y un mensaje.

### R8 — Detalle de validación accesible (Opcional)

DONDE la respuesta de error incluye la lista `errores`, el sistema DEBE exponerla accesible
al consumidor del cliente.

### R9 — Fallo de red o error no identificable (Error)

SI ocurre un fallo de red o un error que no proviene del backend, ENTONCES el sistema DEBE
representarlo con un error tipado de código de estado `0` y un mensaje en español.

### R10 — Cuerpo exitoso ya interpretado (Ubicuo)

El sistema DEBE devolver las respuestas exitosas con su cuerpo ya interpretado como JSON,
sin envoltorios adicionales.

### R11 — Uso uniforme desde los features (Ubicuo)

El sistema DEBE permitir que los módulos `api/` de los features ejecuten operaciones sin
construir URLs ni cabeceras y sin leer variables de entorno.

### R12 — Generación de tipos desde OpenAPI (Evento)

CUANDO se ejecuta `npm run generate:api`, el sistema DEBE regenerar los tipos TypeScript a
partir del documento OpenAPI alojado en el repositorio.

### R13 — Tipos generados disponibles sin red (Ubicuo)

El sistema DEBE versionar el documento OpenAPI y los tipos generados, de modo que el
chequeo de tipos funcione sin acceso a la red ni pasos adicionales.

### R14 — Lógica pura cubierta por tests (Ubicuo)

El sistema DEBE cubrir con tests Jest de lógica pura —sin red ni render— la construcción de
URL, la construcción de cabeceras y el mapeo de errores del cliente HTTP.

### R15 — Cuerpo de error no reconocido (Error)

SI el cuerpo de una respuesta de error no tiene la forma esperada, ENTONCES el sistema DEBE
usar un mensaje por defecto acorde al código de estado.

### R16 — Aislamiento de capas (Ubicuo)

El sistema DEBE mantener el cliente HTTP dentro de `shared/api`, sin importar `features/`
ni `app/` y sin contener lógica de dominio.

---

## Trazabilidad con la descripción del Work Item

| Requisito | Cubre |
|-----------|-------|
| R1 | URL base desde `env.ts` |
| R2 | Headers JSON por defecto |
| R3–R6 | Authorization Bearer server-first y cliente público |
| R4 | Constante compartida para la cookie de sesión (T0.5) |
| R7–R9, R15 | Mapeo centralizado de errores del backend |
| R10 | Parseo de respuestas exitosas |
| R11 | Evitar duplicación en los features |
| R12–R13 | Tipos generados con `openapi-typescript` |
| R14 | Tests de lógica pura exigidos por `verification.md` |
| R16 | `architecture.md` / `conventions.md` |
