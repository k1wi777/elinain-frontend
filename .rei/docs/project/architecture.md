# Arquitectura

> **Documento del proyecto** — personaliza este archivo al adaptar REI Harness a tu repositorio.
>
> Este documento define las decisiones arquitectónicas del proyecto.
> El Implementer debe respetarlas durante la implementación y el Reviewer las utilizará como criterio de validación.

---

# Objetivo

Este documento describe cómo está organizado **Elinain Frontend** y las reglas arquitectónicas que deben mantenerse durante su evolución.

Elinain Frontend es la interfaz de gestión agropecuaria del sistema Elinain. Hoy cubre terceros, fincas, contratos, compras, ventas, ciclos y costos de cada contrato, el resumen del dashboard y los reportes de contratos activos e historial de ventas.

El proyecto usa **Next.js 16 (App Router) con React 19 y TypeScript**, y sigue una **arquitectura feature-first** adaptada a Next: cada porción de negocio es autocontenida y la capa transversal no conoce los features.

Este documento **no** documenta requisitos funcionales ni decisiones específicas de una Feature.

---

# Principios

Estas reglas aplican a toda decisión de diseño y deben cumplirse siempre:

- **Feature-first** — todo lo que una feature necesita (componentes, hooks, llamadas a la API, tipos) vive dentro de su propia carpeta. No existen carpetas globales `hooks/`, `services/` o `components/` compartidas entre features de negocio.
- **Dependencia en un solo sentido ("hacia adentro")** — lo genérico no conoce lo específico. `shared/` nunca importa de `features/` ni de `app/`; `features/` nunca importa de `app/`.
- **Aislamiento entre features** — un feature no importa directamente de otro feature. Si una página necesita componer dos features, la composición se realiza en `app/`.
- **Barrel exports controlados** — cada feature expone únicamente su API pública a través de `index.ts`. Lo interno (componentes de detalle, helpers de `api/`) no se exporta.
- **Server state como única fuente de verdad remota** — los datos del backend se gestionan con TanStack Query; no se duplican en stores globales.
- **Simplicidad antes que complejidad** — reutilizar antes que duplicar, y no introducir abstracciones hasta que haya una necesidad real.

---

# Organización del proyecto

El proyecto se organiza en tres capas con raíz en el directorio del repositorio (no se usa `src/`).

```text
app/                          ← Next.js App Router — SOLO rutas, delgadas
├── (auth)/
│   ├── login/page.tsx
│   └── registro/page.tsx
├── (dashboard)/
│   ├── dashboard/page.tsx
│   ├── terceros/page.tsx
│   ├── fincas/               → listado, nueva y [id]/editar
│   ├── contratos/            → listado, nuevo, [id] y [id]/editar
│   ├── ventas/page.tsx
│   └── reportes/             → contratos-activos y historial-ventas
├── api/                      ← BFF: Route Handlers de operaciones autenticadas
│   ├── auth/…
│   ├── terceros/ fincas/ contratos/ compras/ ventas/
│   ├── ciclos/ costos/ geocodificacion/
│   └── reportes/…
├── layout.tsx
└── globals.css

features/                     ← cada carpeta = una porción de negocio autocontenida
├── auth/                      → login, registro y logout
├── terceros/                  → listado, crear/editar y eliminar
├── fincas/                    → listado con mapa, CRUD y geocodificación
├── contratos/                 → listado, filtro, detalle y edición
├── compras/                   → compras de un contrato (sección embebida)
├── ventas/                    → listado global y registro/ventas por contrato
├── ciclos/                    → checkpoints de engorde de un contrato (embebido)
├── costos/                    → costos informativos de un contrato (embebido)
├── dashboard/                 → resumen de reportes del comerciante
└── reportes/                  → contratos activos e historial de ventas

shared/                       ← transversal, sin lógica de negocio
├── api/                       → clientes HTTP (base, BFF y servidor), tipos del OpenAPI, paginación
├── ui/                        → Button, Input, Select, Table, TablePagination, Modal, Toast, Skeleton
├── lib/                       → cn, utilidades de fecha y hooks genéricos
└── config/                    → env.ts: única lectura tipada de variables de entorno
```

## Responsabilidad de cada capa

| Capa | Responsabilidad |
|------|-----------------|
| `app/` | Definir rutas, layouts, route groups y **composición** de features. Sin lógica de negocio. Incluye el BFF en `app/api/`. |
| `features/` | Implementar una porción de negocio completa: UI, hooks, acceso a datos y tipos propios. Cada feature se comunica con el exterior solo por su `index.ts`. |
| `shared/` | Proveer infraestructura transversal sin conocimiento del negocio: cliente HTTP, tipos generados, componentes de UI base, utilidades y configuración. |

## Estructura interna de un feature

| Ruta | Contenido |
|------|-----------|
| `components/` | Componentes de UI del feature. Los internos no se exportan. |
| `api/` | Funciones de acceso a datos del feature (una por operación). No contienen componentes ni hooks. |
| `hooks/` | Hooks que conectan `api/` con TanStack Query y la UI. |
| `types.ts` | Tipos propios del dominio del feature. |
| `index.ts` | Barrel de exportación: **solo** lo que otras capas necesitan consumir. |

Las carpetas que un feature no necesite pueden omitirse; no se crean vacías por simetría.

---

# Flujo general

```text
Usuario
    ↓
app/ (rutas y composición)
    ↓
features/* (components + hooks)
    ↓  TanStack Query (server state, caché e invalidación)
shared/api (cliente HTTP base + tipos del OpenAPI)
    ↓
    ├── Operación autenticada ──→ app/api/* (BFF, adjunta la cookie httpOnly) ──→ backend Elinain
    └── Endpoint público ───────→ backend Elinain (NEXT_PUBLIC_API_URL)
```

Reglas del flujo:

- La UI **nunca** llama directamente a `fetch` ni al cliente HTTP: siempre a través de los hooks del feature.
- Los hooks de un feature usan las funciones de su `api/`, que a su vez usan el cliente HTTP de `shared/api`.
- El token de sesión vive en una **cookie httpOnly**; el navegador nunca lo lee ni lo escribe.
- Las operaciones que requieren sesión pasan por el BFF (`app/api/*`), que es el único que adjunta el token al llamar al backend.

---

# Restricciones arquitectónicas

Estas reglas **nunca** deben romperse:

- `shared/` no importa de `features/` ni de `app/`.
- Un feature no importa de otro feature. La composición entre features ocurre en `app/`.
- `app/` no contiene lógica de negocio ni llamadas directas al backend; solo rutas, layouts y composición.
- No existen carpetas globales de `hooks/`, `services/` o `components/` compartidas entre features de negocio.
- Todo acceso a datos pasa por `shared/api` y se consume vía TanStack Query. No se dispersan llamadas `fetch` por componentes.
- Los secretos y el token de sesión nunca se exponen al cliente: la cookie es `httpOnly` y las variables `NEXT_PUBLIC_*` no contienen datos sensibles.
- `shared/config/env.ts` es el único punto de lectura de `process.env`; ningún otro módulo accede a `process.env` directamente.
- No se introducen dependencias circulares.
- No se duplica lógica de negocio: si algo se necesita en dos features, se resuelve en `shared/` (si es genérico) o se compone en `app/` (si es de negocio).
- Los componentes de `shared/ui` son presentacionales y no conocen el dominio.

---

# Decisiones importantes

| Decisión | Elección | Motivo |
|----------|----------|--------|
| Patrón de arquitectura | Feature-first sobre App Router | Aísla cada dominio de negocio y evita carpetas globales que se convierten en cajón de sastre. |
| Organización de rutas | Route Groups `(auth)` y `(dashboard)` | Agrupar rutas por contexto de acceso sin afectar la URL. |
| Alias de imports | `@/*` → raíz del repo (`@/features/...`, `@/shared/...`, `@/app/...`) | Evita rutas relativas profundas y hace explícita la capa importada. |
| Data fetching / caché | TanStack Query | Caché, revalidación e invalidación consistentes para el server state. |
| Estado global de cliente | Ninguno | El estado remoto lo cubre TanStack Query; la UI usa estado local. No se introduce un store global sin una necesidad concreta. |
| Comunicación con la API | Mixto (BFF + directo) | Las operaciones autenticadas pasan por `app/api/*` para no exponer el token; los endpoints públicos se consumen directo vía `NEXT_PUBLIC_API_URL`. |
| Autenticación | Cookie `httpOnly` + `middleware.ts` | El token nunca toca el JavaScript del cliente; el middleware protege `(dashboard)` y redirige a `/login`. |
| Tipos de la API | Tipos generados desde el OpenAPI del backend, alojados en `shared/api` | Una única fuente de verdad para los contratos del backend. |
| UI | Tailwind v4 + componentes propios en `shared/ui` | Sin dependencia de una librería de componentes; control total del estilo. |
| Formularios | `react-hook-form` + `zod` | Formularios performantes y validación tipada. |
| Mapas | `react-leaflet` (Leaflet / OpenStreetMap) | Sin API keys; suficiente para la visualización de fincas. Debe cargarse con import dinámico y sin SSR. |
| Variables de entorno | `.env.local` en la raíz; lectura tipada vía `shared/config/env.ts` | Separar valores del código y centralizar la validación de entorno. |

---

# Qué NO documentar

Este archivo NO debe contener:

- requisitos funcionales;
- decisiones temporales;
- planificación de Features;
- detalles de implementación concretos;
- cambios específicos de un Work Item.
