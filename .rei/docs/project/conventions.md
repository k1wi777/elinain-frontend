# Convenciones

> **Documento del proyecto** — personaliza este archivo al adaptar REI Harness a tu repositorio.
>
> Este documento define las convenciones de desarrollo del proyecto.
> El Implementer debe seguirlas durante la implementación y el Reviewer las utilizará para validar la calidad del código.

---

# Objetivo

Mantener un estilo de desarrollo consistente en todo el proyecto.

Las convenciones describen **cómo escribir el código**, no cómo está organizada la arquitectura del sistema. La organización de carpetas y las dependencias entre capas están definidas en `.rei/docs/project/architecture.md`.

El cumplimiento se comprueba con los checkpoints automatizados de `.rei/docs/project/verification.md` (`V1` formato, `V2` lint, `V3` tipos, `V4` tests), cableados en `.rei/init.sh`.

---

# Organización del código

- **Un artefacto por archivo**: un componente por archivo, un hook por archivo, una responsabilidad por módulo. Si un archivo empieza a mezclar responsabilidades, se extrae.
- **Colocación según alcance**: lo genérico y sin dominio vive en `shared/`; lo específico de negocio vive dentro de su feature. No se mueve nada a `shared/` "por si acaso" ni hasta que exista un segundo consumidor real.
- **`index.ts` solo re-exporta**: el barrel de un feature no contiene lógica; únicamente declara su API pública. Lo interno (componentes de detalle, helpers) no se exporta.
- **Tipos en `types.ts`** del feature. Los esquemas de validación de formularios en `schemas.ts`, junto al feature que los usa.
- **Acceso a datos en `api/`**: cada operación del backend tiene su función en la carpeta `api/` del feature. Los componentes no conocen URLs ni cabeceras.
- **Lógica de conexión en `hooks/`**: los hooks del feature son el único puente entre `api/`, TanStack Query y la UI.
- **Código de UI reutilizable en `shared/ui/`**, siempre presentacional y sin conocimiento del dominio.

---

# Nombres

## Idioma

- **Dominio en español**: las entidades y conceptos del negocio conservan su nombre natural (`Tercero`, `Finca`, `Contrato`, `ciclo`, `venta`).
- **Roles técnicos en inglés**: los sufijos y términos de la capa técnica van en inglés (`Table`, `Form`, `Detail`, `Map`, `List`, `Page`).
- El **texto visible al usuario** siempre en español.
- Resultado: `TercerosTable`, `TerceroForm`, `ContratoDetail`, `FincasMap`.

## Identificadores

- **Componentes** en `PascalCase` y con nombre de sustantivo: `TerceroForm`, `ContratosTable`. Sin sufijo `Component`.
- **Hooks** con prefijo `use` en `camelCase`: `useTerceros`, `useContrato`.
- **Funciones y variables** en `camelCase`: `listarTerceros`, `fincaActiva`. Nombres descriptivos; se evitan `data`, `info`, `temp` o `aux`.
- **Booleanos** con prefijo `is`, `has`, `can` o `should`: `isLoading`, `hasError`, `canEdit`.
- **Handlers y props de evento**: `handleSubmit` en la definición, `onSubmit` en la prop.
- **Constantes** en `UPPER_SNAKE_CASE` solo si son realmente inmutables y globales (`MAX_PAGE_SIZE`). Los objetos de configuración van en `camelCase`.
- **Tipos e interfaces** en `PascalCase`, sin prefijo `I`, y se prefiere `type` sobre `interface`.
- **Query keys** de TanStack Query se definen en un único lugar por feature y siguen un patrón consistente: `['terceros', 'list', filtros]`.

## Archivos

El nombre del archivo coincide con el artefacto que exporta. Fuera de `app/`:

| Artefacto | Convención | Ejemplo |
|-----------|-----------|---------|
| Componente | `PascalCase.tsx` | `TerceroForm.tsx` |
| Hook | `camelCase.ts` | `useTerceros.ts` |
| API del feature | `kebab-case.ts` (recurso en plural) | `api/terceros.ts` |
| Utilidad | `kebab-case.ts` | `format-date.ts` |
| Tipos | `types.ts` | `types.ts` |
| Esquemas de validación | `schemas.ts` | `schemas.ts` |
| Barrel | `index.ts` | `index.ts` |

Dentro de `app/`, los archivos reservados de Next van siempre en minúscula: `page.tsx`, `layout.tsx`, `route.ts`, `error.tsx`, `loading.tsx`, `not-found.tsx`.

---

# Estilo de implementación

## Formato

- **Prettier es la autoridad de formato**: no se discute el formato a mano ni se formatea manualmente. El código se escribe y se ejecuta `npm run format`; `npm run format:check` es el checkpoint `V1`.
- Las **clases de Tailwind** quedan ordenadas automáticamente por el plugin de Prettier.
- Los **imports se ordenan automáticamente** agrupados en: React/Next, dependencias externas, `@/shared/*`, `@/features/*` y rutas relativas.
- ESLint (`V2`) se ocupa de reglas de código, no de formato: las reglas de estilo en conflicto están desactivadas vía `eslint-config-prettier`.

## TypeScript

- El proyecto compila en `strict`. No se usa `any`; para valores desconocidos se usa `unknown` y se estrecha el tipo.
- No se usa `@ts-ignore` ni `@ts-expect-error` sin una justificación escrita.
- Los tipos de entidades que provienen del backend se toman de los generados por OpenAPI en `shared/api`; no se redefinen a mano.

## Componentes y React

- **Server Components por defecto**. `'use client'` se añade en el nodo más bajo posible y solo cuando se necesita interactividad, estado o APIs del navegador.
- Se **exportan con named exports**. `export default` se reserva para lo que Next lo exige (`page`, `layout`, `error`, `not-found`, `route`).
- Componentes definidos con **función declarada** y props tipadas con `type Props`:
  ```tsx
  type Props = { fincaId: string };

  export function FincaForm({ fincaId }: Props) { … }
  ```
  No se usa `React.FC`.
- Los componentes de página en `app/` solo **componen**: no contienen lógica de negocio ni llamadas a la API.

## Datos y estado

- El **server state se gestiona con TanStack Query** en los hooks del feature. Nunca se llama a `fetch` desde un componente.
- **Nunca `useEffect` para obtener datos**. El estado derivable se calcula en render, no se sincroniza con efectos.
- Las mutaciones invalidan las query keys afectadas y notifican el resultado en la UI.
- No hay store global de cliente: el estado de UI es local al componente.
- URL, cabeceras y serialización viven en `shared/api`; los features solo piden datos.

## UI y estilos

- Estilos con **Tailwind** directamente en el JSX. No se usan CSS modules.
- Para clases condicionales se usa un helper `cn()` de `shared/lib`; se evitan concatenaciones de strings con ternarios largos.
- Se usan `next/image` y `next/link` en lugar de `<img>` y `<a>`.

## Legibilidad

- Funciones pequeñas, con una única responsabilidad, y **early returns** antes que anidación profunda.
- Se prefiere **composición antes que herencia** y props explícitas antes que configuración por objetos opacos.
- Nada de código muerto ni `console.log` de depuración en el código commiteado.

---

# Manejo de errores

- Las funciones de `api/` **lanzan errores tipados** (`ApiError`, con estado HTTP y mensaje). No devuelven `null` ni valores centinela ante un fallo, y no capturan el error salvo para transformarlo.
- El BFF (`app/api/*`) propaga el código HTTP real del backend; no lo convierte en un `200` con error dentro.
- La UI **reacciona al error**: error de ruta vía `error.tsx` del segmento, error de acción vía Toast o mensaje en el formulario.
- Nunca se ignora un error: no se permiten `catch` vacíos ni promesas sin manejar.
- Los errores de formulario se validan con **zod** antes de enviar; la validación no sustituye la del backend.
- Al usuario se le muestra un **mensaje claro en español**; el detalle técnico (stack, cuerpo de la respuesta del backend) no se muestra en la interfaz.
- No se muestran al usuario mensajes crudos del backend sin revisar.

---

# Accesibilidad

Requisito, no mejora opcional:

- Se usa **HTML semántico** (`button`, `nav`, `label`, headings en orden) antes que `div` con `onClick`.
- **Todo campo de formulario tiene un `<label>` asociado**; los errores se vinculan con `aria-describedby` y se anuncian.
- Las imágenes usan `next/image` con `alt` descriptivo, o `alt=""` si son decorativas.
- La interfaz debe ser **navegable por teclado**, con **foco visible**; no se elimina el outline sin reemplazarlo por un indicador equivalente.
- Los modales gestionan foco, cierre con `Escape` y `aria-modal`.
- Los iconos que transmiten información llevan texto alternativo accesible.

---

# Dependencias

- Se prefiere lo que ya existe: **React, Next.js, la plataforma y las dependencias ya instaladas** antes que añadir una nueva.
- Toda dependencia nueva se **justifica en el spec** del Work Item (qué problema resuelve y por qué no se resuelve con lo existente).
- No se incorporan dos librerías para el mismo propósito.
- Antes de añadir una dependencia se considera su mantenimiento, tamaño y compatibilidad con React 19 y App Router.
- Las versiones quedan fijadas por el lockfile; se actualizan de forma intencional, no accidental.

---

# Comentarios

- Los comentarios explican el **por qué**, no el qué. Si el código necesita explicar qué hace, se reescribe para que sea evidente.
- Se documenta con **JSDoc** la API pública de `features/` y `shared/` (funciones y hooks que otros consumen).
- Los pendientes se marcan con contexto: `// TODO(responsable-o-issue): motivo`.
- Los comentarios y el JSDoc se escriben en español, igual que el texto de la interfaz.
- Se eliminan los comentarios obsoletos al modificar el código que describen.

---

# Qué NO hacer

- No usar `any`, `@ts-ignore` sin justificar, ni silenciar errores del compilador.
- No obtener datos con `useEffect` ni llamar a `fetch` desde componentes o desde `app/`.
- No importar desde dentro de otro feature (`shared/` nunca importa de `features/`; `features/` nunca importa de `app/`).
- No poner lógica de negocio en `app/` ni en `shared/ui/`.
- No duplicar tipos de la API que ya genera OpenAPI.
- No mover código a `shared/` sin que sea genérico y reutilizable.
- No usar `export default` fuera de lo que Next exige.
- No sincronizar estado derivable con efectos.
- No dejar código comentado, `console.log` de depuración ni archivos muertos.
- No escribir nombres ambiguos (`data`, `info`, `temp`, `aux`).
- No añadir dependencias sin justificarlas.
- No mostrar mensajes de error crudos del backend al usuario.
