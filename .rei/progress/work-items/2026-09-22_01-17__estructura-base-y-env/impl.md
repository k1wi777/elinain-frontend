# Implementación — Estructura base del proyecto y configuración de entorno

- **Work Item:** `2026-09-22_01-17__estructura-base-y-env`
- **Tipo:** `task` (Caso B)
- **Fecha:** `2026-09-22`
- **Agente:** `implementer`
- **Plan:** `.rei/specs/2026-09-22_01-17__estructura-base-y-env/plan.md`

## Resumen

Se implementó exactamente el `plan.md` aprobado: se creó la estructura base de capas
manteniendo `app/` en la raíz (sin `src/`), se corrigió el formato de las variables de
entorno moviendo los valores locales a `.env.local` y dejando `.env.example` como
plantilla versionada, y se creó `shared/config/env.ts` como único punto de lectura tipada
de `process.env`, con sus tests.

No se modificaron `app/`, `architecture.md`, `AGENTS.md` ni `README.md`. No se añadieron
dependencias. No se realizaron commits de git.

## Archivos modificados

| Archivo | Acción |
|---------|--------|
| `features/.gitkeep` | Creado |
| `shared/api/.gitkeep` | Creado |
| `shared/ui/.gitkeep` | Creado |
| `shared/lib/.gitkeep` | Creado |
| `shared/config/env.ts` | Creado |
| `shared/config/__tests__/env.test.ts` | Creado |
| `.env.local` | Renombrado desde `.env` y reescrito (`KEY=valor`) |
| `.env.example` | Reescrito (`KEY=valor`, sin secretos) |
| `.gitignore` | Modificado (`!.env.example` tras `.env*`) |

## Cambios realizados

### 1. Estructura base de carpetas

- Creadas `features/` y `shared/{api,ui,lib}` con un `.gitkeep` para versionar las carpetas
  vacías (Git no versiona directorios vacíos).
- `shared/config/` contiene `env.ts` y su test, por lo que no necesita `.gitkeep`.
- No se crearon subcarpetas de features vacías "por simetría", según `architecture.md`.

### 2. Variables de entorno

- El `.env` con formato inválido (`API_URL: "..."`) se renombró a **`.env.local`** y se
  reescribió con formato dotenv (`KEY=valor`), conservando el valor real del backend en
  `API_URL` y duplicándolo en `NEXT_PUBLIC_API_URL` (este último para lecturas públicas
  desde el cliente).
- **`.env.example`** quedó como plantilla versionada sin secretos, con las mismas dos
  claves y una URL de ejemplo.
- Se usan exactamente las dos variables definidas en `architecture.md`; no se introdujeron
  otras.

### 3. `.gitignore`

- Se añadió `!.env.example` inmediatamente después de la regla `.env*`, de modo que las
  variantes locales (`.env`, `.env.local`, `.env.*`) siguen ignoradas pero la plantilla
  `.env.example` es versionable.

### 4. `shared/config/env.ts`

- Único módulo autorizado a leer `process.env`. Expone:
  - `readRequiredEnv(name, value)`: devuelve el valor o lanza si es `undefined`, cadena
    vacía o solo espacios.
  - `getClientEnv()`: lee `NEXT_PUBLIC_API_URL` (segura para el navegador).
  - `getServerEnv()`: lee `API_URL` (solo servidor/BFF, nunca en el cliente).
- Se usan **funciones perezosas** en lugar de constantes evaluadas al importar para que un
  módulo de cliente pueda importar `getClientEnv` sin evaluar `getServerEnv`.
- `strict`, sin `any`, sin `@ts-ignore`; JSDoc y comentarios en español.

### 5. Tests

- `shared/config/__tests__/env.test.ts` (Jest, `testEnvironment: node`, sin render) cubre
  los 8 casos del plan: valor presente, `undefined`, cadena vacía y solo espacios en
  `readRequiredEnv`; lectura y ausencia de `NEXT_PUBLIC_API_URL` y `API_URL` en
  `getClientEnv`/`getServerEnv`.
- Se guardan y restauran los valores originales de `process.env` en `afterEach`, por lo que
  la suite no depende de `.env.local` (Next.js tampoco lo carga en el entorno `test`).

## Proceso de verificación

Los checkpoints se ejecutaron con `npm run format` previo (paso 6 del plan) y luego el
gate completo vía `bash .rei/init.sh` (paso 7).

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format:check` | Pasa | `All matched files use Prettier code style!` Prettier reformateó `shared/config/env.ts` y `shared/config/__tests__/env.test.ts`. |
| `V2` | `npm run lint` | Pasa | ESLint sin errores ni warnings. |
| `V3` | `npm run typecheck` | Pasa | `tsc --noEmit` sin errores bajo `strict`. |
| `V4` | `npm test` | Pasa | 1 suite, 8 tests, 0 fallos (`shared/config/__tests__/env.test.ts`). |
| `V5` | Validación manual | **No aplica** | Cambio estructural y de configuración de entorno, sin comportamiento interactivo, visual ni flujos contra el backend que validar manualmente. Se justifica aquí según `verification.md`. |

### `bash .rei/init.sh`

Salida final: `[OK] REI Harness listo para trabajar.` con código de salida `0` y los cuatro
checkpoints (`Formato (V1)`, `Lint (V2)`, `Tipos (V3)`, `Tests (V4)`) en `[OK]`.

El script emitó un `[WARN]` en la Sección 3 ("Existe una sesión registrada en
`.rei/progress/current.md`"), esperado al ejecutarse durante la implementación de un Work
Item activo; no es un fallo y no afecta al código de salida.

Verificación adicional de `.gitignore` con `git check-ignore`:

- `.env.local` → ignorado (regla `.env*`).
- `.env.example` → **no** ignorado, por lo tanto versionable.

## Observaciones relevantes

- No se tocó `app/` ni se creó `src/`.
- No se introdujeron dependencias nuevas.
- `shared/config/env.ts` queda como el único módulo que lee `process.env`; cualquier futura
  lectura deberá pasar por él.
- El valor real del backend no se replica en `.env.example` (plantilla sin secretos) ni se
  expone `API_URL` al cliente (sin prefijo `NEXT_PUBLIC_`).
- No se realizaron commits de git.
