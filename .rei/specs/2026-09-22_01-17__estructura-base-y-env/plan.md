# Plan — Estructura base del proyecto y configuración de entorno

## Objetivo

Dejar preparada la base del frontend con la organización de capas ya confirmada
(**raíz, sin `src/`**: `app/` + `features/` + `shared/`) y centralizar el acceso tipado
al backend en `shared/config/env.ts`, corrigiendo de paso el formato inválido de
`.env`/`.env.example`, moviendo los valores locales a `.env.local` y permitiendo
versionar `.env.example`.

No es una migración: `app/` ya existe y permanece en la raíz. Solo se crean las capas
que faltan y la configuración de entorno.

## Archivos afectados

| Archivo | Acción |
|---------|--------|
| `features/.gitkeep` | Crear (versiona la carpeta vacía) |
| `shared/api/.gitkeep` | Crear (versiona la carpeta vacía) |
| `shared/ui/.gitkeep` | Crear (versiona la carpeta vacía) |
| `shared/lib/.gitkeep` | Crear (versiona la carpeta vacía) |
| `shared/config/env.ts` | Crear |
| `shared/config/__tests__/env.test.ts` | Crear |
| `.env.local` | Renombrar desde `.env` y reescribir (formato `KEY=valor`) |
| `.env.example` | Reescribir (formato `KEY=valor`) |
| `.gitignore` | Modificar (permitir versionar `.env.example`) |

No se modifica `app/`, `architecture.md`, `AGENTS.md` ni `README.md`.

## Cambios

### 1. Estructura base de carpetas

Crear las carpetas que `architecture.md` define para las capas nuevas y dejar
versionables las que quedan vacías mediante un `.gitkeep`:

- `features/` → se crea la carpeta contenedora (`features/.gitkeep`). No se crean
  subcarpetas de features vacías: `architecture.md` establece que "las carpetas que un
  feature no necesite pueden omitirse; no se crean vacías por simetría".
- `shared/api/`, `shared/ui/`, `shared/lib/` → vacías, versionadas con `.gitkeep`.
- `shared/config/` → contiene `env.ts` (y su test), no necesita `.gitkeep`.

Criterio para versionar carpetas vacías: `.gitkeep`, que es el marcador estándar
aceptado por Git (Git no versiona directorios vacíos por diseño) y el archivo neutro
que Prettier/ESLint ignoran por no ser `.ts`/`.tsx`.

### 2. Variables de entorno

El formato actual (`API_URL: "..."`) es inválido: ni Next.js ni dotenv lo interpretan
(dotenv espera `KEY=valor`). Se separan los valores locales de la plantilla versionada:

**`.env.local`** (no versionado; conserva el valor real del backend). El `.env` actual
se **renombra** a `.env.local`: es el archivo local estándar de Next.js y siempre queda
ignorado por git gracias a la regla `.env*`. Contenido (formato `KEY=valor`):

```dotenv
# URL del backend para el servidor (BFF en app/api/*)
API_URL=https://elinain-production.up.railway.app/api/v1

# URL del backend para lecturas públicas desde el cliente
NEXT_PUBLIC_API_URL=https://elinain-production.up.railway.app/api/v1
```

**`.env.example`** (versionado; plantilla sin secretos):

```dotenv
# URL del backend para el servidor (BFF en app/api/*)
API_URL=https://tu-backend.example.com/api/v1

# URL del backend para lecturas públicas desde el cliente
NEXT_PUBLIC_API_URL=https://tu-backend.example.com/api/v1
```

Se usan exactamente las dos variables que define `architecture.md`: `API_URL` (solo
servidor) y `NEXT_PUBLIC_API_URL` (cliente). No se introducen otras.

### 3. `.gitignore`

La regla `.env*` también ignora `.env.example`. Se añade una negación **después** de la
regla (el orden importa en Git):

```gitignore
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

Así `.env.local` y demás variantes locales (`.env`, `.env.*`) siguen ignoradas, pero la
plantilla `.env.example` se versiona.

### 4. `shared/config/env.ts` — único punto de lectura tipada

Único módulo autorizado a leer `process.env` (lo exige `architecture.md`). Expone dos
lecturas separadas por entorno de ejecución:

```ts
/**
 * Único punto de lectura tipada de `process.env`.
 *
 * - `getClientEnv()`: variables `NEXT_PUBLIC_*`, seguras para el navegador.
 * - `getServerEnv()`: variables de servidor (`API_URL`), solo disponibles en el BFF
 *   (`app/api/*`) y en código de servidor. Nunca debe invocarse desde el cliente.
 *
 * Se usan funciones en lugar de constantes evaluadas al importar el módulo para que un
 * módulo de cliente pueda importar `getClientEnv` sin evaluar `getServerEnv`.
 */

export type Env = { apiUrl: string };

export function readRequiredEnv(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
}

export function getClientEnv(): Env {
  return {
    apiUrl: readRequiredEnv("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL),
  };
}

export function getServerEnv(): Env {
  return {
    apiUrl: readRequiredEnv("API_URL", process.env.API_URL),
  };
}
```

#### Decisión: cómo se separan servidor y cliente

- **Funciones perezosas, no constantes.** Si ambos entornos se evaluaran al importar el
  módulo, un componente de cliente que importe `env.ts` dispararía la validación de
  `API_URL`, que en el bundle de cliente es `undefined`, y fallaría en tiempo de
  ejecución. Con funciones, el cliente solo evalúa `getClientEnv()` y el servidor solo
  `getServerEnv()`.
- **Sin secretos expuestos al cliente.** `API_URL` no lleva el prefijo `NEXT_PUBLIC_`,
  por lo que Next.js no la inyecta en el bundle del navegador: se resuelve como
  `undefined` en el cliente y `getServerEnv()` no puede devolver su valor ahí. Los
  valores sensibles nunca se envían al navegador.
- **Validación temprana y explícita.** `readRequiredEnv` lanza si la variable falta o
  está vacía, en vez de propagar `undefined` silenciosamente.

#### Alternativas descartadas

- **Dos archivos (`env.server.ts` / `env.client.ts`):** rompe la regla de "único punto
  de lectura" y duplica la lógica de validación.
- **Constantes evaluadas al importar:** provoca el fallo de cliente descrito arriba.
- **Añadir dependencia (`server-only`, `@t3-oss/env-nextjs`):** innecesaria para dos
  variables; `conventions.md` pide no añadir dependencias sin justificación y preferir
  lo existente.

### 5. Tests

`conventions.md` y `verification.md` exigen tests para lógica pura nueva. Se añade
`shared/config/__tests__/env.test.ts` (Jest, sin render) cubriendo:

- `readRequiredEnv` devuelve el valor cuando existe.
- `readRequiredEnv` lanza cuando el valor es `undefined` o cadena vacía.
- `getClientEnv` lee `NEXT_PUBLIC_API_URL` (con `process.env` mockeado/restaurado).
- `getServerEnv` lee `API_URL`.
- `getClientEnv`/`getServerEnv` lanzan cuando falta la variable.

Se guardan y restauran los valores originales de `process.env` para no contaminar otros
tests.

> Nota: Next.js **no** carga `.env.local` en el entorno `test` (Jest). No afecta a este
> Work Item porque los tests de `env.ts` mockean `process.env` directamente en lugar de
> leer archivos `.env*`; por eso la suite es independiente de `.env.local`.

## Restricciones

- **No usar `src/`**: la estructura es raíz; `app/` no se mueve ni se toca.
- **No modificar** `architecture.md` ni `AGENTS.md` (la raíz ya está documentada).
- `shared/config/env.ts` es el **único** módulo que lee `process.env`; ningún otro debe
  introducir lecturas directas.
- No añadir dependencias nuevas.
- No crear carpetas de features vacías "por simetría".
- Mantener `strict` de TypeScript: sin `any`, sin `@ts-ignore`.
- Los comentarios/JSDoc y los textos visibles van en español (`conventions.md`).
- `shared/` no importa de `features/` ni de `app/` (no aplica aquí, pero se respeta).

## Pasos

1. [x] Crear `features/.gitkeep`, `shared/api/.gitkeep`, `shared/ui/.gitkeep` y
   `shared/lib/.gitkeep`.
2. [x] Renombrar `.env` a `.env.local` y reescribirlo, junto con `.env.example`, con el
   formato `KEY=valor` y las dos variables.
3. [x] Modificar `.gitignore`: añadir `!.env.example` inmediatamente después de `.env*`.
4. [x] Crear `shared/config/env.ts` con `readRequiredEnv`, `getClientEnv` y `getServerEnv`.
5. [x] Crear `shared/config/__tests__/env.test.ts` con los casos indicados.
6. [x] Ejecutar `npm run format` y verificar los checkpoints.
7. [x] Ejecutar `.rei/init.sh` y confirmar que finaliza sin errores.

## Verificación

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Pasa (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | Sin errores. |
| `V3` | `npm run typecheck` | Sin errores de tipos. |
| `V4` | `npm test` | Suite en verde, incluyendo `shared/config/__tests__/env.test.ts`. |
| `V5` | Validación manual | **No aplica**: cambio estructural y de configuración, sin comportamiento interactivo. Se justifica en `impl.md`. |

Evidencia en `.rei/progress/work-items/2026-09-22_01-17__estructura-base-y-env/impl.md`.

## Fuera de alcance

- `app/api/` (BFF) y `middleware.ts`: se crearán cuando exista una Feature de
  autenticación/consumo.
- Features concretos (`auth/`, `terceros/`, `fincas/`, `contratos/`).
- Cliente HTTP de `shared/api`, componentes de `shared/ui`, helpers de `shared/lib`.
