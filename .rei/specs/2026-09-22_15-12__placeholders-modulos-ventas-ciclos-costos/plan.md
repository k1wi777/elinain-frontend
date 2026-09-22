# Plan — Preparación de módulos bloqueados por backend: ventas, ciclos y costos

> Work Item: `2026-09-22_15-12__placeholders-modulos-ventas-ciclos-costos` (`type: task`)

## Objetivo

Dejar preparado el patrón de integración de los módulos que el backend todavía no expone
(`ventas`, `ciclos`, `costos`), sin lógica de negocio ni llamadas a la API:

1. Crear `features/ventas`, `features/ciclos` y `features/costos` con un componente de
   marcador de posición y su barrel, listos para reemplazarse cuando el backend libere los
   endpoints.
2. Crear las rutas protegidas `/ventas`, `/ciclos` y `/costos` con una vista "Próximamente"
   que anticipe qué vivirá ahí.
3. Añadir sus enlaces a la navegación del área protegida y proteger las rutas en
   `middleware.ts`.

No se maquetan formularios, no se usan datos de ejemplo, no se añaden dependencias y no se
toca el OpenAPI ni el BFF.

## Archivos

### Crear

| Archivo | Contenido |
|---------|-----------|
| `shared/ui/Proximamente.tsx` | Componente presentacional y sin dominio `Proximamente` (`titulo`, `descripcion`). |
| `features/ventas/components/VentasProximamente.tsx` | Marcador de posición del módulo ventas. |
| `features/ciclos/components/CiclosProximamente.tsx` | Marcador de posición del módulo ciclos. |
| `features/costos/components/CostosProximamente.tsx` | Marcador de posición del módulo costos. |
| `features/ventas/index.ts` | Barrel público del feature `ventas`. |
| `features/ciclos/index.ts` | Barrel público del feature `ciclos`. |
| `features/costos/index.ts` | Barrel público del feature `costos`. |
| `app/(dashboard)/ventas/page.tsx` | Página de `/ventas` (Server Component delgado + `metadata`). |
| `app/(dashboard)/ciclos/page.tsx` | Página de `/ciclos` (Server Component delgado + `metadata`). |
| `app/(dashboard)/costos/page.tsx` | Página de `/costos` (Server Component delgado + `metadata`). |

### Modificar

| Archivo | Cambio |
|---------|--------|
| `shared/ui/index.ts` | Exportar `Proximamente` en el barrel. |
| `app/(dashboard)/layout.tsx` | Añadir a la `<nav>` los enlaces `/ventas`, `/ciclos` y `/costos`. |
| `middleware.ts` | Añadir `/ventas`, `/ciclos` y `/costos` a `RUTAS_PROTEGIDAS` y al `matcher`. |

No se crean ni modifican más archivos. No hay lógica pura nueva → no hay tests nuevos.

## Cambios

### 1. Decisiones de diseño

**a. Pieza presentacional compartida — `shared/ui/Proximamente.tsx`.**
Las tres rutas muestran el mismo bloque visual, así que el markup se extrae a `shared/ui` en
lugar de triplicarse. Se justifica por tener **tres consumidores reales** (la convención pide
un segundo consumidor para mover algo a `shared/`). Es presentacional, sin dominio (el texto
llega por props) y con named export, por lo que cumple las reglas de `shared/ui`.

Props: `titulo: string` y `descripcion: string`. Renderiza el contenedor, el `<h1>` y el
panel de aviso; el texto de dominio lo aporta cada feature vía props. El componente asume la
estructura de la página (`section` + `h1`) porque su contenido es íntegramente el marcador de
posición; eso mantiene las páginas de `app/` delgadas.

**b. Marcador de posición por feature.**
Cada feature expone un componente `<Modulo>Proximamente` que compone `shared/ui/Proximamente`
con su título y descripción. Así el `index.ts` publica una pieza real que `app/` consume (no
un archivo muerto) y el contenido del módulo vive dentro de su feature. Cuando el backend
libere los endpoints, la página sustituye `<Modulo>Proximamente />` por el componente real sin
cambiar el patrón (`page` → barrel del feature).

**Alternativas descartadas:**

- `index.ts` que exporte solo las constantes `titulo`/`descripcion` y que la página arme el
  `Proximamente`: deja a `app/` ensamblando UI con textos de dominio y convierte el barrel en
  un contenedor de datos en lugar de la API pública que la página consume.
- Que cada feature renderice su propio panel sin pieza compartida: triplica el mismo markup y
  las mismas clases de Tailwind.

### 2. Contenido de los archivos

`shared/ui/Proximamente.tsx`:

```tsx
/** Props del componente `Proximamente`. */
type Props = {
  /** Título del módulo que aún no está disponible. */
  titulo: string;
  /** Descripción breve de lo que ofrecerá el módulo. */
  descripcion: string;
};

/**
 * Marcador de posición de un módulo pendiente.
 *
 * Es puramente presentacional y no conoce el dominio: recibe el título y la descripción por
 * props y aporta el lenguaje visual de "disponible próximamente".
 */
export function Proximamente({ titulo, descripcion }: Props) {
  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">{titulo}</h1>
      <p className="mt-2 text-sm text-zinc-600">{descripcion}</p>
      <p className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
        Próximamente.
      </p>
    </section>
  );
}
```

Cada `features/<modulo>/components/<Modulo>Proximamente.tsx` sigue el mismo patrón:

```tsx
import { Proximamente } from "@/shared/ui";

/** Marcador de posición del módulo de ventas, bloqueado por el backend. */
export function VentasProximamente() {
  return (
    <Proximamente
      titulo="Ventas"
      descripcion="Aquí registrarás y consultarás las ventas de ganado, con precio, peso y utilidad por ciclo."
    />
  );
}
```

Textos concretos:

| Módulo | `titulo` | `descripcion` |
|--------|----------|---------------|
| ventas | `Ventas` | Aquí registrarás y consultarás las ventas de ganado, con precio, peso y utilidad por ciclo. |
| ciclos | `Ciclos` | Aquí gestionarás los ciclos de engorde: inicio, avance de pesos y cierre de cada lote. |
| costos | `Costos` | Aquí registrarás los costos operativos y sanitarios para calcular la rentabilidad de cada ciclo. |

Cada `features/<modulo>/index.ts` es un barrel de una sola exportación, con el mismo JSDoc que
los barrels existentes:

```ts
/**
 * API pública del feature `ventas`.
 *
 * Módulo bloqueado por el backend: expone solo el marcador de posición que `app/` compone en
 * su ruta. Cuando el backend libere los endpoints se sustituirá por los componentes reales.
 */
export { VentasProximamente } from "@/features/ventas/components/VentasProximamente";
```

Cada página de `app/(dashboard)/<modulo>/page.tsx` es un Server Component delgado:

```tsx
import type { Metadata } from "next";

import { VentasProximamente } from "@/features/ventas";

export const metadata: Metadata = { title: "Ventas | Elinain" };

/**
 * Página del módulo de ventas.
 *
 * Módulo bloqueado por el backend: compone el marcador de posición del feature `ventas`.
 */
export default function VentasPage() {
  return <VentasProximamente />;
}
```

`metadata.title` por módulo: `Ventas | Elinain`, `Ciclos | Elinain`, `Costos | Elinain`.

### 3. Navegación — `app/(dashboard)/layout.tsx`

Añadir tres `<Link>` dentro de la `<nav>` existente, después de "Contratos", con el mismo
estilo que los actuales (`text-sm text-zinc-600 hover:text-zinc-900`):

- `/ventas` → "Ventas"
- `/ciclos` → "Ciclos"
- `/costos` → "Costos"

### 4. Middleware — `middleware.ts`

- `RUTAS_PROTEGIDAS`: añadir `"/ventas"`, `"/ciclos"` y `"/costos"`.
- `config.matcher`: añadir `"/ventas"`, `"/ventas/:path*"`, `"/ciclos"`, `"/ciclos/:path*"`,
  `"/costos"` y `"/costos/:path*"`, siguiendo el patrón de las rutas existentes.

### 5. Coherencia con el detalle de contrato

El placeholder existente en `features/contratos/components/ContratoDetalle.tsx`
("Próximamente: compras, ventas, ciclos y costos.") se mantiene sin cambios y queda coherente
con estas páginas. El módulo de compras no se crea (fuera de alcance).

## Restricciones

- Sin dependencias nuevas ni cambios en `package.json`.
- Sin `any`; TypeScript `strict`; named exports (en `app/` solo `page.tsx` usa
  `export default`, que Next exige).
- No tocar `shared/api/openapi/*`, el BFF (`app/api/*`) ni ningún hook o componente
  existente de los features actuales.
- Nada de formularios, datos de ejemplo, hooks, tipos de dominio del backend ni llamadas a
  la API: solo estructura y navegación.
- `shared/` no importa de `features/` ni de `app/`; los features no importan entre sí; `app/`
  solo compone.
- Las carpetas de feature se crean a propósito y con contenido mínimo aunque el backend aún
  no exponga los endpoints; es la excepción documentada a la regla de "no crear carpetas
  vacías por simetría", porque establecen el patrón de integración de estos módulos.
- Formato con Prettier (`npm run format` antes de `V1`); orden de clases Tailwind por el
  plugin.

## Pasos

1. [x] Crear `shared/ui/Proximamente.tsx` y exportarlo en `shared/ui/index.ts`.
2. [x] Crear `features/ventas/components/VentasProximamente.tsx`, `features/ciclos/components/CiclosProximamente.tsx` y `features/costos/components/CostosProximamente.tsx`.
3. [x] Crear los barrels `features/ventas/index.ts`, `features/ciclos/index.ts` y `features/costos/index.ts`.
4. [x] Crear `app/(dashboard)/ventas/page.tsx`, `app/(dashboard)/ciclos/page.tsx` y `app/(dashboard)/costos/page.tsx`.
5. [x] Añadir los tres enlaces a la `<nav>` de `app/(dashboard)/layout.tsx`.
6. [x] Añadir las rutas y sus `:path*` a `RUTAS_PROTEGIDAS` y al `config.matcher` de `middleware.ts`.
7. [x] `npm run format` y ejecutar `V1`–`V4`; confirmar `bash .rei/init.sh` con salida `0`.
8. [x] Documentar la evidencia de `V1`–`V4` y los pasos de `V5` en `.rei/progress/work-items/2026-09-22_15-12__placeholders-modulos-ventas-ciclos-costos/impl.md`.

## Verificación

| ID | Comando | Criterio |
|----|---------|----------|
| `V1` | `npm run format:check` | Pasa (ejecutar `npm run format` antes). |
| `V2` | `npm run lint` | Sin errores. |
| `V3` | `npm run typecheck` | Sin errores. |
| `V4` | `npm test` | Suite completa en verde (no hay lógica pura nueva; no se añaden tests). |
| `V5` | Validación manual | Rutas, placeholder y redirección sin sesión. |

Pasos de `V5` (requieren `npm run dev`):

1. Con sesión iniciada, la cabecera del área protegida debe mostrar los enlaces "Ventas",
   "Ciclos" y "Costos" junto a los existentes.
2. Visitar `/ventas`, `/ciclos` y `/costos`: cada ruta debe mostrar su título, la descripción
   del módulo y el aviso "Próximamente.".
3. Navegar con los enlaces de la cabecera entre las tres rutas y comprobar que el enlace
   responde a la ruta esperada.
4. Sin sesión (o con la cookie caducada), visitar `/ventas`, `/ciclos` y `/costos`: el
   middleware debe redirigir a `/login`.

## Fuera de alcance

- Cualquier integración real con el backend, llamadas a la API, hooks o tipos de dominio.
- Formularios, tablas, datos de ejemplo y diseño de las vistas reales.
- El módulo de compras (solo se menciona como referencia en el placeholder de detalle de
  contrato).
- Cambios en el OpenAPI, el BFF, la caché de TanStack Query o los features existentes.
