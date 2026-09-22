# AGENTS.md — REI Harness

> Este archivo es el **punto de entrada universal** para cualquier agente de IA que trabaje en este repositorio.
>
> Su objetivo es proporcionar únicamente el contexto esencial para orientarse dentro del proyecto y saber dónde encontrar información adicional. **No debe contener toda la documentación del proyecto.**
>Carga únicamente el contexto necesario para la tarea actual.
> Las responsabilidades específicas de cada rol se encuentran en `.rei/agents/`.

**No ignores estas reglas.**

---

# 1. Antes de comenzar

Antes de realizar cualquier modificación en el proyecto:

1. Ejecuta `bash .rei/init.sh`.
2. Si falla, DETENTE e informa el problema.
3. Carga únicamente la documentación necesaria para la tarea actual siguiendo el orden de la Sección 8.

No continúes hasta completar estos pasos.

---

# 2. Propósito del proyecto

## Qué construimos

**Elinain** es una plataforma SaaS de gestión integral para el negocio de **compra, engorde y comercialización de ganado bovino**. Centraliza inventario, compras y ventas, costos operativos, sanidad animal, **ganado en participación** con terceros y facturación, reemplazando libretas físicas y hojas de cálculo por trazabilidad y métricas reales de rentabilidad.

Este repositorio es el **frontend web** de la plataforma: la interfaz de gestión. Consume la API REST del backend (tipos generados desde su OpenAPI) y no gestiona persistencia propia.

## Para quién

- **Comerciantes ganaderos** — personas o pymes que compran animales, los engordan (propios o de terceros) y los venden. Usuario principal.
- No está dirigido a **productores/criadores** de ganado en el sentido tradicional.

## Principios

*Todas las decisiones deben respetar estos principios.*

- **Decisiones basadas en datos** — el producto existe para dar visibilidad real de la rentabilidad (costo por animal, utilidad por ciclo). Registrar datos es el medio; calcular y mostrar indicadores es el fin.
- **El dominio manda** — el modelo y la interfaz reflejan el negocio real del engorde bovino (ciclos, fincas, participación, pesos, tiempos y costos), no un esquema genérico adaptado.
- **Trazabilidad y confianza** — todo cálculo que afecte dinero, y en especial el reparto de utilidad con terceros, debe partir de registros confiables y ser auditable.
- **Simplicidad de uso** — el usuario objetivo tiene baja adopción tecnológica; la interfaz debe ser clara, directa y sin fricción.
- **Feature-first** — cada porción de negocio es autocontenida y desacoplada del resto. Ver `.rei/docs/project/architecture.md`.

## Qué NO es

*Acota explícitamente el alcance del proyecto para evitar feature creep.*

- No es una herramienta de **cría, reproducción o producción agrícola**; el foco es la compra, el engorde y la comercialización de bovinos.
- No es un **marketplace** ni un canal de subastas: no conecta compradores con vendedores.
- No es un **sistema contable ni fiscal completo**; la facturación se limita al momento de la venta.
- No es un **ERP genérico** configurable para cualquier negocio agropecuario.
- No incluye **analítica avanzada ni IA** en el alcance actual; son diferenciadores de fases posteriores sobre un modelo freemium.

---

# 3. Stack técnico

## Tecnologías principales

- **Lenguaje:** TypeScript en `strict`, sin `any`.
- **Framework:** Next.js 16 (App Router) + React 19.
- **Estilos y UI:** Tailwind CSS v4, componentes propios en `shared/ui` y helper `cn()` con `clsx` + `tailwind-merge`.
- **Datos y estado:** TanStack Query v5 para server state; sin store global de cliente.
- **Formularios y validación:** react-hook-form + zod, conectados con `@hookform/resolvers`.
- **Mapas:** react-leaflet v5 sobre Leaflet y OpenStreetMap.
- **Acceso a la API:** cliente HTTP propio sobre la API REST del backend, con tipos generados desde su OpenAPI.
- **Testing:** Jest, sobre lógica pura; sin tests de render por ahora.
- **Calidad de código:** ESLint + Prettier.
- **Persistencia:** ninguna en este repositorio; la gestiona el backend.
- **Despliegue:** *pendiente de definir*.

> El detalle de las decisiones y su justificación está en `.rei/docs/project/architecture.md`; las reglas de escritura del código, en `.rei/docs/project/conventions.md`.

## Comandos principales

*Comandos que cualquier agente utilizará con frecuencia.*

- `bash .rei/init.sh` — Inicializa el arnés y ejecuta los checkpoints de verificación (`V1`–`V4`).
- `npm install` — Instala dependencias.
- `npm run dev` — Servidor de desarrollo.
- `npm run build` — Build de producción. **No es checkpoint de Work Item.**
- `npm run lint` — ESLint (checkpoint `V2`).
- `npm run typecheck` — Chequeo de tipos con `tsc --noEmit` (checkpoint `V3`).
- `npm run format` / `npm run format:check` — Formatea / comprueba el formato (checkpoint `V1`).
- `npm test` — Suite completa de Jest (checkpoint `V4`).
- `npm run test:related -- <archivos>` — Tests relacionados, para el loop de desarrollo.

> Los checkpoints y la evidencia exigida están definidos en `.rei/docs/project/verification.md`.

---

# 4. Estructura del repositorio

*Utiliza este mapa para orientarte dentro del proyecto.*

| Ruta | Propósito |
|------|-----------|
| `app/` | Rutas de Next.js (App Router) y BFF en `app/api/`. Solo rutas y composición. |
| `features/` | Cada porción de negocio autocontenida (componentes, `api/`, `hooks/`, tipos). |
| `shared/` | Código transversal sin dominio: `api/`, `ui/`, `lib/`, `config/`. |
| `public/` | Recursos estáticos. |
| `eslint.config.mjs` | Configuración de ESLint. |
| `.prettierrc.json` / `.prettierignore` | Configuración de formato. |
| `jest.config.mjs` | Configuración de Jest. |
| `.rei/specs/` | Work Items y planificación del REI Harness. |
| `.rei/progress/` | Estado actual (`current.md`), historial general (`history.md`) y detalle de Work Items. |
| `.rei/progress/work-items/` | Registros detallados de cada Work Item, organizados cronológicamente. |
| `.rei/docs/harness/` | Documentación del arnés (workflow, specs, progreso). |
| `.rei/docs/project/` | Documentación específica del proyecto. |
| `.rei/agents/` | Roles y comportamiento de los subagentes. |

> La organización detallada y las reglas de dependencia entre capas están en `.rei/docs/project/architecture.md`.

---

# 5. Workflow

Todo Work Item debe seguir el workflow definido por el proyecto.

Antes de comenzar cualquier trabajo consulta:

`.rei/docs/harness/workflow.md`

**No omitas ninguna etapa del workflow.**

---

# 6. Rol del agente principal

El agente que recibe directamente las solicitudes del usuario actúa siempre como **Leader**.

Antes de comenzar cualquier tarea DEBE consultar:

`.rei/agents/leader.md`

El Leader es el único responsable de:

- comprender la solicitud del usuario;
- seleccionar el workflow adecuado;
- coordinar a los demás subagentes.

Ningún otro agente debe asumir estas responsabilidades.

---

# 7. Documentación

Consulta únicamente la documentación necesaria para la tarea actual.

## Documentación de REI Harness

Define cómo funciona el arnés. No requiere personalización por proyecto.

| Si necesitas... | Consulta... |
|-----------------|-------------|
| Workflow | `.rei/docs/harness/workflow.md` |
| Spec Driven Development | `.rei/docs/harness/specs.md` |
| Sistema de progreso | `.rei/docs/harness/progress.md` |
| Estructura de `meta.json` | `.rei/docs/harness/meta.md` |
| El comportamiento de un agente | `.rei/agents/<role>.md` |

## Documentación del proyecto

Describe las reglas de **este repositorio**. Debe personalizarse al implementar REI Harness.

| Si necesitas... | Consulta... |
|-----------------|-------------|
| Arquitectura | `.rei/docs/project/architecture.md` |
| Convenciones | `.rei/docs/project/conventions.md` |
| Verificación | `.rei/docs/project/verification.md` |

## Work Items

| Si necesitas... | Consulta... |
|-----------------|-------------|
| Un Work Item concreto | `.rei/specs/<work-item-id>/` |
| El comportamiento de un agente | `.rei/agents/<role>.md` |
No cargues documentación que no aporte contexto a la tarea actual.

---

# 8. Carga de contexto

Prioriza siempre la carga de información en el siguiente orden:

1. `AGENTS.md`
2. `.rei/agents/<role>.md`
3. `docs/...`
4. `.rei/specs/<work-item-id>/`

Carga únicamente el contexto necesario para completar la tarea actual.

---

# 9. Principios generales

Estas reglas aplican a cualquier agente del repositorio.

- La documentación es la fuente de verdad.
- Trabaja sobre un único Work Item por sesión.
- No omitas etapas del workflow.
- Consulta la documentación antes de asumir comportamientos no especificados.
- Si encuentras documentación contradictoria, DETENTE y repórtala.
- En caso de conflicto entre documentos, prevalece el orden inverso de la Sección 8:
  `.rei/specs/<work-item-id>/` > `.rei/docs/...` > `.rei/agents/<role>.md` > `AGENTS.md`.
