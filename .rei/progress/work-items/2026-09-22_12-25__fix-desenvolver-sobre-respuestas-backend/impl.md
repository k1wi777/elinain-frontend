# Implementación — Fix: desenvolver el sobre `{exito, datos}` de las respuestas del backend

> Work Item: `2026-09-22_12-25__fix-desenvolver-sobre-respuestas-backend` (`type: task`)
> Agente: Implementer · Fecha: 2026-09-22

---

## Resumen

Se implementó el plan completo: un helper puro que desenvuelve el sobre
`{ exito: true, datos }` de las respuestas exitosas del backend y su aplicación en un único
punto central (el interceptor de respuesta exitosa de `shared/api/http-client.ts`). Con ello
`server-client`, `public-client` y `bff-client` reciben el payload plano, de modo que login y
registro vuelven a emitir la cookie de sesión (antes respondían `500`) y los listados de
terceros, fincas y contratos recuperan su forma `{ elementos, total, limite, offset }`. No se
tocó el OpenAPI, ningún Route Handler BFF, `errors.ts`, `session.ts` ni los tipos generados, y
no se añadieron dependencias.

## Archivos

### Nuevos

- `shared/api/response.ts` — helper puro `desenvolverRespuesta`.
- `shared/api/__tests__/response.test.ts` — tests de lógica pura del helper.

### Modificados

- `shared/api/http-client.ts` — el interceptor de respuesta exitosa asigna
  `response.data = desenvolverRespuesta(response.data)` y devuelve la respuesta. El
  interceptor de rechazo (`toApiError`) y los cinco métodos (`get/post/put/patch/delete`)
  quedan intactos.

### No modificados (fuera de alcance)

`shared/api/openapi/*`, `app/api/**`, `app/api/auth/_lib/sesion.ts`, `shared/api/errors.ts`
y `shared/api/session.ts`.

## Decisiones relevantes

- **Desenvolvimiento estricto.** Solo se desenvuelve cuando el cuerpo es un objeto no nulo y
  no array, con `exito === true` (booleano estricto) y propiedad propia `datos`
  (`Object.prototype.hasOwnProperty`). Así los cuerpos del BFF (`{mensaje}`), los `204`
  (cuerpo vacío) y los errores (`{exito:false,…}`) atraviesan sin cambios y el helper es
  compatible hacia adelante: si el backend deja de envolver, no altera nada.
- **Un solo punto de cambio.** La corrección vive en el interceptor, por lo que aplica a los
  tres clientes y no obliga a tocar los cinco métodos ni las rutas BFF.
- **Sin `any`.** El objeto desconocido se estrecha con un `asRecord` local que además excluye
  arrays, siguiendo el patrón de `errors.ts`.
- **Defensa en `fijarSesion`/`obtenerExpiracionJwt` descartada**, según el plan: el
  `TypeError` era síntoma, no causa; añadir una guardia enmascararía futuras regresiones.

## Verificación

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format` + `npm run format:check` | Pasa — "All matched files use Prettier code style!" |
| `V2` | `npm run lint` | Pasa — ESLint sin errores |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores |
| `V4` | `npm test` | Pasa — 24 suites, 205 tests (13 tests nuevos de `response.test.ts`) |
| `V5` | Validación manual (curl contra dev server) | Pasa — evidencia abajo |

Además, `bash .rei/init.sh` termina con código de salida `0` y los cuatro checkpoints en
`[OK]`.

### V5 — Evidencia de reproducción

Entorno: backend `https://elinain-production.up.railway.app/api/v1` (operativo) y
`npm run dev` local en `http://localhost:3000`.

1. **Login con credenciales inválidas** — `POST /api/auth/login` →
   `401 Unauthorized` con `{"mensaje":"Correo o contraseña incorrectos."}`, sin sobre
   (el manejador de error no se alteró).
2. **Registro de usuario nuevo** — `POST /api/auth/registro` (usuario desechable
   `impl-v5-<timestamp>@example.com`) → `201 Created` con
   `set-cookie: elinain_session=…; HttpOnly; SameSite=lax`. Antes del fix: `500`.
3. **Login con el usuario creado** — `POST /api/auth/login` → `204 No Content` con
   `set-cookie: elinain_session=…`. Antes del fix: `500`.
4. **Listados autenticados con la cookie**:
   - `GET /api/terceros` → `{"elementos":[],"total":0,"limite":20,"offset":0}`
   - `GET /api/fincas` → `{"elementos":[],"total":0,"limite":20,"offset":0}`
   - `GET /api/contratos` → `{"elementos":[],"total":0,"limite":20,"offset":0}`

   En los tres casos no aparece `exito` ni `datos` en el cuerpo.

Comandos representativos:

```bash
EMAIL="impl-v5-$(date +%s)@example.com"; PASS="PruebaSegura123"
curl -i -X POST http://localhost:3000/api/auth/registro -H 'Content-Type: application/json' \
  -d "{\"nombre\":\"Usuario V5\",\"email\":\"$EMAIL\",\"password\":\"$PASS\"}"
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}"
curl -i -b cookies.txt http://localhost:3000/api/terceros
```

Pendiente solo de confirmación del usuario: los pasos de UI en navegador (login y
listados/creación desde la interfaz), que no aportan información adicional al comportamiento
ya verificado por HTTP.

## Observaciones

- No se modificaron `package.json`, `shared/api/openapi/*`, `shared/ui`, ESLint, Prettier ni
  la configuración de Jest.
- El backend y el dev server se detuvieron tras la verificación; se usó un usuario de prueba
  desechable.
- Se confirma la inconsistencia del contrato del backend (envuelve en `{exito,datos}` lo que
  el OpenAPI documenta plano); queda reportada, fuera del alcance del Work Item.
