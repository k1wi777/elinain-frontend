# Verification

> **Documento del proyecto** — personaliza este archivo al adaptar REI Harness a tu repositorio.
>
> Este documento define cómo se verifica que un Work Item ha sido implementado correctamente.
>
> El objetivo no es indicar **qué** se implementó, sino **cómo demostrar que funciona**.

## Estrategia de verificación

La verificación de Elinain Frontend combina comprobaciones automatizadas y validación manual.

**Automatizable:**

- **Prettier** (`npm run format:check`): formato consistente, orden de imports y de clases de Tailwind.
- **ESLint** (`npm run lint`): reglas de React, Next y TypeScript del proyecto, sin reglas de formato (las gestiona Prettier).
- **TypeScript** (`npm run typecheck` → `tsc --noEmit`): chequeo completo de tipos. Es el checkpoint más importante porque **no se usa `npm run build`** como verificación de Work Item.
- **Jest** (`npm test`): tests unitarios de lógica pura.

**No automatizable (por ahora):**

- Cualquier comportamiento que requiera renderizar React. En el alcance actual **Jest no incluye una librería de render** (React Testing Library), por lo que no hay tests de componentes ni de hooks con estado. Eso queda en validación manual.
- Flujos reales contra el backend, diseño visual, responsive y accesibilidad percibida.

**Alcance de los tests automatizados:**

Jest cubre únicamente **lógica pura y sin render**:

- utilidades de `shared/lib`;
- funciones de `api/` y transformaciones/mappers de datos;
- esquemas de validación zod;
- factorías de query keys y helpers puros.

Toda lógica pura nueva debe incorporar sus tests.

> Mientras el proyecto no tenga tests, `npm test` usa `--passWithNoTests` para no fallar con la suite vacía. Ese flag **no exime** de escribir tests para la lógica pura nueva.

## Organización de los tests

Los tests se colocan junto al código que prueban, dentro de una carpeta `__tests__/`:

```text
features/
└── terceros/
    ├── api/
    ├── components/
    └── __tests__/
        ├── terceros-api.test.ts
        └── tercero-schema.test.ts

shared/
└── lib/
    └── __tests__/
        └── format-date.test.ts
```

- Un archivo de test por unidad bajo prueba, con el nombre del artefacto: `<artefacto>.test.ts` (o `.test.tsx` cuando en el futuro exista render).
- Los tests no llaman a la API real ni a la red: se mockean las dependencias.

## Dos velocidades de ejecución

| Momento | Comando | Objetivo |
|---------|---------|----------|
| Durante la implementación (loop rápido) | `npm run test:related -- <archivos>` (Jest `--findRelatedTests`) o `npx jest features/<feature>` | Feedback inmediato sobre lo que se está tocando. |
| Antes de solicitar revisión (gate obligatorio) | `npm test` | Regresión de todo el proyecto; es el checkpoint `V4`. |

Correr solo los tests del feature **no sustituye** la suite completa: un cambio en `shared/` o en un tipo compartido puede romper features que no se tocaron, y `--findRelatedTests` solo sigue el grafo de imports, no el acoplamiento real en runtime.

**`npm run build` no forma parte de los checkpoints de Work Item** por su coste. Se reserva como verificación previa a despliegue o en CI.

## Checkpoints de verificación

Cada checkpoint posee un identificador estable (`V1`, `V2`, ...). El Implementer y el Reviewer deben referenciar estos IDs en sus reportes en vez de describir la verificación de forma libre.

| ID | Comando | Descripción |
|----|---------|-------------|
| `V1` | `npm run format:check` | Prettier: código, imports y clases de Tailwind con formato correcto. |
| `V2` | `npm run lint` | ESLint sin errores. |
| `V3` | `npm run typecheck` | `tsc --noEmit` sin errores de tipos. |
| `V4` | `npm test` | Suite completa de Jest en verde. |
| `V5` | Validación manual | Aceptación funcional y de diseño por parte del usuario. Solo cuando el Work Item tenga comportamiento no automatizable. |

> Estos mismos comandos están cableados en `.rei/init.sh` (Sección 4, `run_check`) para que su resultado se refleje en el código de salida del script. Si añades o modificas un checkpoint aquí, actualiza también `.rei/init.sh`.

## Validación manual

La validación manual (`V5`) cubre lo que la suite de Jest no puede comprobar: comportamiento de componentes, flujos contra el backend, diseño visual, responsive y accesibilidad percibida.

- La ejecuta el **usuario** al cerrar el Work Item, sobre el entorno de desarrollo.
- El Implementer debe dejar indicado **qué** debe revisarse y **cómo** reproducirlo.
- Se registra como cualquier otro checkpoint: resultado, y observaciones o capturas cuando aplique.
- Si un Work Item no tiene componente manual, `V5` se marca como **no aplica** con su justificación.

## Evidencia

Como mínimo, por cada checkpoint ejecutado:

- ID del checkpoint (`V1`, `V2`, ...);
- resultado (pasa / falla / no aplica);
- comando ejecutado;
- observaciones relevantes (logs, capturas, pasos de reproducción) cuando el checkpoint no sea automatizable.

La evidencia debe documentarse en:

```
.rei/progress/work-items/<work-item-id>/impl.md
```

## Bloqueos

Un Work Item pasa a `blocked` cuando alguna verificación falla y no puede resolverse dentro del alcance de la sesión.

El protocolo exacto para declarar un bloqueo (qué documentar, dónde, y cómo detenerse) está definido en el archivo de rol correspondiente (`.rei/agents/implementer.md`, `.rei/agents/reviewer.md`).

Nunca continúes la implementación ni solicites revisión ignorando una verificación fallida.

## Qué NO hacer

- No asumir que un cambio funciona sin verificarlo contra los checkpoints definidos.
- No omitir checkpoints definidos para el proyecto.
- No sustituir `V4` (suite completa) por los tests del feature ni por `--findRelatedTests`.
- No usar `npm run build` como checkpoint de Work Item.
- No escribir tests que llamen a la API real o a la red.
- No probar componentes o hooks de React mientras no exista una librería de render; ese comportamiento se valida en `V5`.
- No marcar `V5` como superada sin confirmación explícita del usuario.
- No solicitar revisión sin evidencia suficiente por cada checkpoint.
- No describir una verificación de forma libre si ya existe un ID (`V1`, `V2`, ...) para ella.
