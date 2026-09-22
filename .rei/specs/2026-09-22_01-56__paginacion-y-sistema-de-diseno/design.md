# Diseño — Hook genérico de paginación y sistema de diseño base

> Work Item: `2026-09-22_01-56__paginacion-y-sistema-de-diseno` (`type: feature`)
>
> Cómo se implementará. Documenta solo las decisiones necesarias para implementar el
> cambio; no es documentación de arquitectura general.

---

## Estrategia de implementación

El Work Item entrega dos piezas independientes pero coordinadas, ambas en la capa
transversal (`shared/`), respetando `architecture.md` (raíz del repo, sin `src/`):

1. **Paginación** (`shared/api/`): se separa la lógica en dos módulos.
   - `pagination.ts`: funciones puras de cálculo (`calcularTotalPaginas`, `calcularPagina`,
     `calcularOffset`, `normalizarPagina`, `normalizarLimite`) y constantes
     (`LIMITE_POR_DEFECTO = 20`, `LIMITE_MINIMO = 1`, `LIMITE_MAXIMO = 100`).
   - `usePagination.ts`: hook de React (`'use client'`) que guarda `limite`/`offset` en
     estado local, recibe `total` por parámetro y deriva en render los valores de
     paginación, delegando todo cálculo en `pagination.ts`.

   El hook no obtiene datos ni conoce TanStack Query: solo gestiona estado de paginación.
   El feature conecta `total` desde su respuesta y pasa `limite`/`offset` a su consulta.

2. **Sistema de diseño** (`shared/ui/`): componentes presentacionales sobre Tailwind v4,
   más el helper `cn()` en `shared/lib/cn.ts`. Un componente por archivo, exportaciones
   nombradas y props genéricas. La tabla delega sus controles de paginación en un
   componente interno y acepta un tipo estructural compatible con el hook de paginación.

---

## Archivos involucrados

```text
shared/
├── api/
│   ├── pagination.ts                 # lógica pura de paginación + constantes
│   ├── usePagination.ts              # hook React ('use client')
│   └── __tests__/
│       └── pagination.test.ts        # tests de la lógica pura (V4)
├── lib/
│   ├── cn.ts                         # helper de clases condicionales
│   └── __tests__/
│       └── cn.test.ts                # test del helper (V4)
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── Select.tsx
    ├── Table.tsx
    ├── TablePagination.tsx           # interno (no se exporta en el barrel)
    ├── Modal.tsx
    ├── Toast.tsx
    └── index.ts                      # API pública del sistema de diseño
```

Archivos de limpieza:

| Archivo | Acción |
|---------|--------|
| `shared/ui/.gitkeep` | Eliminar (la carpeta ya contiene componentes). |
| `shared/lib/.gitkeep` | Eliminar (la carpeta ya contiene `cn.ts`). |

No se modifica `app/globals.css`, `package.json`, `tsconfig.json` ni la configuración de
Prettier/ESLint/Jest: no se añaden dependencias ni se requieren alias nuevos.

---

## Diseño del hook de paginación

### Lógica pura (`pagination.ts`)

```ts
export const LIMITE_POR_DEFECTO = 20;
export const LIMITE_MINIMO = 1;
export const LIMITE_MAXIMO = 100;

export function normalizarLimite(limite: number): number;
export function calcularTotalPaginas(total: number, limite: number): number;
export function calcularPagina(offset: number, limite: number): number;
export function calcularOffset(pagina: number, limite: number): number;
export function normalizarPagina(pagina: number, totalPaginas: number): number;
```

Reglas de cálculo (justifican R3, R6, R7, R8, R9):

- `normalizarLimite`: si el valor no es finito o es menor que el mínimo, devuelve
  `LIMITE_POR_DEFECTO`/mínimo; si supera 100, lo recorta a `LIMITE_MAXIMO`.
- `calcularTotalPaginas(total, limite)`: `Math.max(1, Math.ceil(total / limite))`. Con
  `total = 0` devuelve 1 para que la UI siempre muestre "Página 1 de 1".
- `calcularPagina(offset, limite)`: `Math.floor(offset / limite) + 1`.
- `calcularOffset(pagina, limite)`: `(pagina - 1) * limite`, sin valores negativos.
- `normalizarPagina(pagina, totalPaginas)`: acota al rango `[1, totalPaginas]`.

### Hook (`usePagination.ts`)

```ts
export type ParametrosPaginacion = {
  total: number;
  limiteInicial?: number;
  offsetInicial?: number;
};

export type EstadoPaginacion = {
  limite: number;
  offset: number;
  total: number;
  totalPaginas: number;
  paginaActual: number;
  hayPaginaAnterior: boolean;
  hayPaginaSiguiente: boolean;
  irAPagina: (pagina: number) => void;
  irAPaginaAnterior: () => void;
  irAPaginaSiguiente: () => void;
  cambiarLimite: (limite: number) => void;
  reiniciar: () => void;
};

export function usePagination(
  parametros: ParametrosPaginacion,
): EstadoPaginacion;
```

- Estado: `limite` (normalizado al inicializar) y `offset` (no negativo).
- Derivado en render, nunca con `useEffect` (`conventions.md`): `totalPaginas`,
  `paginaActual` (normalizada), `hayPaginaAnterior` (`offset > 0`) y `hayPaginaSiguiente`
  (`paginaActual < totalPaginas`).
- `irAPagina` normaliza la página pedida con `normalizarPagina` y recalcula el `offset`.
- `irAPaginaSiguiente`/`irAPaginaAnterior` solo actúan si el indicador correspondiente
  está disponible.
- `cambiarLimite` normaliza el nuevo límite y reinicia el `offset` a 0 (vuelve a la
  primera página).
- `reiniciar` devuelve `limite` y `offset` a sus valores iniciales normalizados.
- El hook devuelve el objeto completo para que el feature lo pase tal cual a `Table`.

---

## Diseño de los componentes de UI

Convenciones aplicadas a todos: `PascalCase.tsx`, función declarada, `type Props`, named
export, estilos con Tailwind y `cn()` para lo condicional. No se usan `React.FC` ni
`export default`.

### `Button`

- Props: `ButtonHTMLAttributes<HTMLButtonElement>` más `variante?: "primario" |
  "secundario" | "peligro"` (por defecto `"primario"`).
- `type="button"` por defecto para evitar envíos accidentales de formulario; puede
  sobrescribirse con `type="submit"`.
- Estilos por variante con `cn()`; `disabled` nativo con estilos y cursor coherentes;
  `focus-visible` con anillo visible.

### `Input`

- Props: `InputHTMLAttributes<HTMLInputElement>` más `label: string` y `error?: string`.
- `'use client'`: usa `useId()` para generar el `id` cuando no se recibe uno.
- Renderiza `<label htmlFor>` + `<input>`; con `error`, aplica `aria-invalid` y
  `aria-describedby` apuntando al párrafo de error.

### `Select`

- Props: `SelectHTMLAttributes<HTMLSelectElement>` más `label: string`,
  `opciones: { valor: string; etiqueta: string }[]` y `error?: string`.
- Mismo patrón accesible que `Input`; `'use client'` por `useId()`.

### `Table`

- Genérico `<T>` con `type Props<T>`:
  - `columnas: ColumnaTabla<T>[]` donde `ColumnaTabla<T>` = `{ clave; encabezado;
    render: (fila: T) => ReactNode; alineacion?; className? }`.
  - `filas: T[]`, `obtenerClave: (fila: T) => string | number`.
  - `cargando?: boolean`, `mensajeVacio?: string` (con texto por defecto en español).
  - `paginacion?: PaginacionTabla` (opcional).
- Renderiza `<table>` semántica con `<thead>`/`<tbody>`, estado de carga y estado vacío.
- `PaginacionTabla` se define en `shared/ui/Table.tsx` con campos estructuralmente
  compatibles con `EstadoPaginacion` (`paginaActual`, `totalPaginas`, `total`, `limite`,
  `hayPaginaAnterior`, `hayPaginaSiguiente`, `irAPaginaAnterior`, `irAPaginaSiguiente`,
  `irAPagina?`). Así el feature puede pasar el resultado del hook directamente
  (`paginacion={paginacion}`) sin adaptadores ni acoplar `shared/ui` a `shared/api`.
- `TablePagination.tsx` (interno, no exportado en el barrel) renderiza un `<nav
  aria-label="Paginación">` con los botones anterior/siguiente y el texto "Página X de Y";
  los botones se apoyan en `Button` y se deshabilitan con los indicadores.

### `Modal`

- Props: `{ abierto: boolean; titulo: string; onCerrar: () => void; children: ReactNode;
  pie?: ReactNode }`.
- `'use client'`. Se construye sobre el elemento nativo `<dialog>`: `showModal()`/
  `close()` en un `useEffect` sincronizado con `abierto`, lo que aporta de forma nativa
  foco atrapado, `aria-modal`, cierre con `Escape` y restauración de foco.
- `aria-labelledby` apunta al título (`useId`). El evento `cancel` (Escape) invoca
  `onCerrar`; se ofrece además un botón de cierre con nombre accesible "Cerrar".
- No requiere `createPortal`: `<dialog>` modal se superpone y bloquea el resto del
  documento.

### `Toast`

- Props: `{ abierto: boolean; mensaje: string; variante?: "exito" | "error"; onCerrar?:
  () => void }`.
- Presentacional, posicionado de forma fija; si `abierto` es `false` no renderiza nada.
- `role="alert"` para error y `role="status"` para éxito, con `aria-live` correspondiente;
  botón de cierre con nombre accesible "Cerrar notificación".
- Sin temporizadores ni auto-cierre: la visibilidad la controla el consumidor
  (simplicidad y evitar efectos).

### `shared/ui/index.ts`

Barrel de la API pública del sistema de diseño: re-exporta `Button`, `Input`, `Select`,
`Table` (y sus tipos `ColumnaTabla`/`PaginacionTabla`), `Modal` y `Toast`. No exporta
`TablePagination` (interno). No arrastra código server-only, a diferencia de `shared/api`.

### `shared/lib/cn.ts`

`cn(...clases: ClassValue[]): string` = `twMerge(clsx(clases))`, usando `clsx` y
`tailwind-merge` ya instalados. Se documenta con JSDoc.

---

## Decisiones de diseño

### D1. Ubicación del hook de paginación

`architecture.md` ubica explícitamente el "hook genérico de paginación" en `shared/api`.
Se respeta esa decisión: `pagination.ts` (puro) y `usePagination.ts` (hook) viven ahí. No
se crea un barrel en `shared/api` porque arrastraría módulos server-only al cliente
(decisión ya tomada en `2026-09-22_01-38__cliente-http-base`); el hook se importa por su
módulo.

### D2. `total` como parámetro, no como estado

El `total` proviene de la respuesta del backend, que es asíncrona y la gestiona TanStack
Query. El hook lo recibe como parámetro y calcula el derivado en render, evitando
sincronizar estado con efectos (`conventions.md`). El feature llama
`usePagination({ total: data?.total ?? 0, ... })`.

### D3. Separar lógica pura del hook (R11, R23)

`verification.md` solo permite tests Jest de lógica pura sin render. Toda la aritmética de
paginación vive en `pagination.ts` y es testeable; `usePagination.ts` queda reducido a
estado y composición y no se cubre con tests automatizados en este Work Item (su validación
interactiva queda para más adelante). Esta separación es la que hace posible cubrir R23 sin
una librería de render.

### D4. Reinicio de página al cambiar `limite`

Cambiar el tamaño de página mantiene el `offset` anterior y puede dejar al usuario fuera de
rango; se reinicia a la primera página, que es el comportamiento esperado en listados.

### D5. `totalPaginas` mínimo 1

Con `total = 0` se reporta 1 página para que la interfaz no muestre "Página 0 de 0" y los
indicadores de navegación queden deshabilitados. Decisión consistente con R6.

### D6. Tipo estructural `PaginacionTabla` en `shared/ui`

`shared/ui` no debe depender de `shared/api` para mantener sus componentes sin acoplamiento
con la capa de datos. Se declara un tipo estructural con los mismos nombres de campo que
`EstadoPaginacion`, de modo que el resultado del hook sea asignable directamente. Se
prefiere esta duplicación mínima y explícita antes que importar el tipo del hook.

### D7. `Modal` sobre `<dialog>` nativo

Se descarta implementar a mano el atrapado de foco y el manejo de `Escape`, y también
`createPortal`: el elemento `<dialog>` con `showModal()` cubre accesibilidad, superposición
y restauración de foco sin dependencias ni código frágil.

### D8. `Toast` presentacional, sin provider ni auto-cierre

Un `ToastProvider`/contexto o temporizadores añadirían estado global y efectos que el
alcance no pide. El consumidor controla la visibilidad con su propio estado local, en línea
con "estado de UI local" y "simplicidad antes que complejidad".

### D9. Sin capa de tokens de diseño

No se modifican `app/globals.css` ni el tema de Tailwind: el alcance acordado enumera los
componentes, no un sistema de tokens. Los componentes usan la paleta y utilidades de
Tailwind de forma consistente. Una capa de tokens queda fuera de este Work Item.

### D10. Barrel en `shared/ui`

A diferencia de `shared/api`, `shared/ui` no contiene código server-only, por lo que un
`index.ts` que re-exporte los componentes es seguro y da un punto de entrada claro al
sistema de diseño. `TablePagination` no se exporta por ser interno.

---

## Alternativas descartadas

- **Hook de paginación en `shared/lib`:** `architecture.md` lo ubica en `shared/api`;
  además ahí vive el contrato del backend con el que se alinea.
- **Hook acoplado a TanStack Query:** ataría la paginación a un cliente de datos concreto
  y rompería la reutilización entre features. El hook gestiona solo estado de paginación.
- **Guardar `total` dentro del hook con `useEffect`:** viola "no sincronizar estado
  derivable con efectos"; además el `total` pertenece a la respuesta.
- **Auto-atrapado de foco manual en `Modal`:** más código, más frágil y con riesgo de
  errores de accesibilidad; `<dialog>` lo resuelve de forma nativa.
- **`createPortal` para `Modal`:** innecesario con `<dialog>` modal.
- **`ToastProvider`/contexto y auto-cierre:** estado global y efectos innecesarios para el
  alcance.
- **Importar `EstadoPaginacion` desde `shared/ui`:** acoplaría la UI a `shared/api`;
  se usa un tipo estructural.
- **Añadir shadcn/Radix u otra librería de componentes:** prohibido por el alcance
  (sin dependencias nuevas de UI).
- **Tokens de diseño en `globals.css`:** fuera de alcance; los componentes usan Tailwind
  directamente.

---

## Testabilidad y verificación

**Automatizable con Jest (lógica pura, sin red ni render):**

- `shared/api/__tests__/pagination.test.ts`: `normalizarLimite`, `calcularTotalPaginas`,
  `calcularPagina`, `calcularOffset` y `normalizarPagina`, incluyendo casos borde
  (`total = 0`, `limite` fuera de rango, página/offset fuera de rango).
- `shared/lib/__tests__/cn.test.ts`: composición de clases, clases condicionales y
  resolución de conflictos de Tailwind.

Estos tests cubren R23 y las partes puras de R3, R6, R7, R8, R9.

**No cubierto en este Work Item (sin validación manual):**

En este Work Item no se realiza validación manual (`V5` no aplica): el objetivo es dejar la
base lista. La parte visual e interactiva de los componentes y del hook no se valida aquí y
queda para Work Items posteriores, cuando se integren en las pantallas:

- `usePagination.ts` usa estado de React; sin librería de render no se testea con Jest
  (`verification.md`). Su aritmética sí queda cubierta vía `pagination.ts`.
- Los componentes `Button`, `Input`, `Select`, `Table`, `Modal` y `Toast`: sin librería de
  render no hay tests de componentes. Su comportamiento (variantes, estado de carga/vacío,
  paginación, apertura/cierre de modal con `Escape`, anuncio del toast, foco visible y
  navegación por teclado) se validará más adelante, fuera de este Work Item.

---

## Restricciones

- Raíz del repo, sin `src/`; todo vive en `shared/api`, `shared/lib` y `shared/ui`.
- `shared/` no importa de `features/` ni de `app/` (R25).
- TypeScript `strict`: sin `any`, sin `@ts-ignore`; los desconocidos se estrechan con
  `unknown`.
- Named exports; `export default` solo donde Next lo exige (no aplica aquí).
- Textos de interfaz y JSDoc en español.
- Sin dependencias nuevas de UI (R24).
- `'use client'` solo donde hay hooks/estado: `Input`, `Select`, `Modal` y
  `usePagination.ts`.
- Este Work Item no implementa las pantallas de terceros, fincas o contratos, ni sus
  hooks de datos con TanStack Query, ni el BFF de autenticación.

---

## Verificación prevista

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Prettier en verde (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | ESLint sin errores. |
| `V3` | `npm run typecheck` | `tsc --noEmit` sin errores, con los componentes genéricos. |
| `V4` | `npm test` | Suite en verde, incluyendo `pagination.test.ts` y `cn.test.ts`. |
| `V5` | — | No aplica: no se requiere validación manual en este Work Item. |
