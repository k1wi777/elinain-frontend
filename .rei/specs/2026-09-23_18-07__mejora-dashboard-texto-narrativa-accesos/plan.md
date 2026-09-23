Objetivo

Mejorar la pantalla `/dashboard` para que, además de mostrar las cifras del resumen, las explique y oriente al comerciante de baja adopción tecnológica. Se incorporan tres mejoras acordadas: (1) texto introductorio y de apoyo por sección, (2) un resumen narrativo dinámico derivado únicamente de `ResumenDashboardDto` y (3) accesos rápidos a los módulos Fincas, Contratos, Ventas y Socios de participación. Se conservan intactos el encabezado existente, los dos enlaces a reportes, las ocho tarjetas del resumen, el hook `useReporteDashboard`, `api/`, tipos, mensajes y formato. No se añaden ratios derivados ni una sección de contratos activos (descartados por el usuario), ni consultas, endpoints, dependencias o datos inventados.

Archivos

- `app/(dashboard)/dashboard/page.tsx` — párrafo introductorio del encabezado y nueva sección de accesos rápidos.
- `features/dashboard/components/ResumenDashboard.tsx` — textos de apoyo bajo cada sección y render del panel narrativo.
- `features/dashboard/narrativa.ts` (nuevo) — lógica pura `construirNarrativa`.
- `features/dashboard/components/ResumenNarrativo.tsx` (nuevo) — panel presentacional de la narrativa.
- `features/dashboard/__tests__/narrativa.test.ts` (nuevo) — tests de la lógica pura.

No se modifica `features/dashboard/index.ts`, `types.ts`, `formato.ts`, `mensajes-error.ts`, `query-keys.ts` ni `api/`/`hooks/`.

Cambios

**1. Texto explicativo (contenido, sin datos nuevos).**

- En `page.tsx`, sustituir la descripción del encabezado por: «Consulta el rendimiento acumulado de tu operación y accede a los reportes que requieren seguimiento. Las cifras suman todo lo registrado hasta hoy, por lo que reflejan la foto completa de tu negocio.»
- En `ResumenDashboard`, bajo el `h2` de «Resultado financiero», añadir el párrafo: «La utilidad bruta acumulada es la ganancia total de las ventas registradas. De esa ganancia, la utilidad real es la parte que te corresponde como comerciante y la utilidad de terceros es la parte de los socios de participación.»
- Bajo el `h2` de «Resumen operativo», añadir el párrafo: «Resume lo que tienes en movimiento: contratos activos y cerrados, animales en inventario, ventas registradas y costos operativos informativos acumulados. Complementa el resultado financiero; no representa ganancia.»
- Estilo: `text-sm leading-6 text-elinain-muted`, con separación inferior antes de la rejilla correspondiente. No alterar títulos ni tarjetas.

**2. Resumen narrativo dinámico.**

- `features/dashboard/narrativa.ts`: función pura `construirNarrativa(resumen: ResumenDashboard): string[]` que devuelve de 1 a 3 frases cortas en español. Puede apoyarse en `formatearConteo` de `@/features/dashboard/formato` (mismo feature) y en un helper local `pluralizar(cantidad, singular, plural)`.
- Entrada segura: normalizar cada campo con un helper que convierta `null`/`undefined`/no finito a `0` (manejo de valores ausentes).
- Frase de operación (siempre presente): usa `contratos_activos`, `total_animales_actual` y `contratos_cerrados`:
  - activos > 0 y animales > 0 → «Tienes 3 contratos activos y 85 animales en inventario.»
  - activos > 0 y animales = 0 → «Tienes 3 contratos activos, sin animales en inventario por ahora.»
  - activos = 0 y animales > 0 → «No tienes contratos activos, pero hay 85 animales en inventario.»
  - ambos = 0 → «Ahora mismo no tienes contratos activos ni animales en inventario.»
  - Si `contratos_cerrados > 0`, añadir a la misma frase la coletilla «, y hasta hoy se ha cerrado 1 contrato» / «, y hasta hoy se han cerrado 2 contratos».
  - Respetar singular/plural en «contrato(s)», «activo(s)», «animal(es)» y «cerrado(s)».
- Porcentajes: helper `porcentajeSeguro(parte, total)` que devuelve `null` si `total <= 0`, `parte < 0` o `parte > total`; si no, `Math.round(parte / total * 100)`. Nunca se muestra un porcentaje fuera de 0–100 y nunca se divide por cero.
- Frase del comerciante (solo si `porcentajeSeguro(utilidad_real_comerciante_acumulada, utilidad_total_acumulada)` no es `null` y es > 0):
  - 100 → «Toda la utilidad acumulada de las ventas es tuya como comerciante.»
  - 1–99 → «De la utilidad acumulada de las ventas, 60% es tuya como comerciante.»
- Frase de terceros (solo si `porcentajeSeguro(utilidad_terceros_acumulada, utilidad_total_acumulada)` no es `null` y es > 0):
  - 100 → «Toda la utilidad acumulada corresponde a los socios de participación.»
  - 1–99 → «Los socios de participación tienen 40% de la utilidad acumulada de las ventas.»
- Cortar el resultado a 3 frases (`slice(0, 3)`).
- `features/dashboard/components/ResumenNarrativo.tsx`: componente presentacional que recibe `frases: string[]` y no conoce el DTO. Renderiza un `glass-panel` con acento dorado, `rounded-2xl border border-elinain-gold/20 p-5` (panel destacado) con `h2` «Tu operación en resumen» (`aria-labelledby`) y una lista `<ul>` con un `<li>` por frase (`aria-hidden` en viñetas decorativas). Sin lógica de datos.
- `ResumenDashboard`: en la rama de éxito, calcular `construirNarrativa(resumen)` en render y renderizar `<ResumenNarrativo frases={...} />` antes de la sección «Resultado financiero». En carga, mostrar un `Skeleton` con la misma forma del panel para no dar saltos de layout (opcional pero recomendado); en error no se renderiza porque ya existe el `return` temprano. No se altera la consulta ni el cálculo de los indicadores.
- Tests en `features/dashboard/__tests__/narrativa.test.ts`, sin render:
  - datos típicos (p. ej. 3 activos, 2 cerrados, 85 animales, utilidad total 12.500.000, real 7.500.000, terceros 5.000.000) → 3 frases con 60% y 40%;
  - todo en cero → una sola frase de operación sin divisiones;
  - utilidad total en cero con contratos/animales > 0 → solo la frase de operación (sin porcentajes).

**3. Accesos rápidos a módulos.**

- En `page.tsx`, añadir tras `<ResumenDashboard />` una `<section aria-labelledby="accesos-rapidos">` con `h2` «Accesos rápidos» (mismo estilo eyebrow que las secciones del resumen) y una rejilla responsive `grid gap-3 sm:grid-cols-2 lg:grid-cols-4` de cuatro tarjetas con `next/link`, reutilizando el estilo de las tarjetas de reportes actuales y `ESTILOS_ENLACE_FOCUS_DASHBOARD`:
  - Fincas → `/fincas` — «Administra los predios donde se engordan los animales.»
  - Contratos → `/contratos` — «Crea y sigue los ciclos de engorde, propios y en participación.»
  - Ventas → `/ventas` — «Registra y consulta las ventas de ganado.»
  - Socios de participación → `/terceros` — «Gestiona los terceros que participan en tus ciclos.»
- Cada tarjeta conserva la flecha `→` con `aria-hidden` y el mismo tratamiento de foco/hover que los enlaces a reportes.
- Los dos enlaces existentes a reportes (`/reportes/contratos-activos`, `/reportes/historial-ventas`) permanecen en el `nav` del encabezado sin cambios; los accesos rápidos se añaden como sección adicional.

Restricciones

- No modificar `useReporteDashboard`, `api/`, `types.ts`, `query-keys.ts`, `index.ts`, `formato.ts` ni `mensajes-error.ts`; no añadir consultas, endpoints, mutaciones ni tocar el backend.
- No añadir ratios derivados, sección de contratos activos, gráficas, hectáreas, proyecciones, próximos pesajes ni estados inexistentes; ningún dato inventado.
- Todo el texto y la narrativa se derivan solo de `ResumenDashboardDto`; los porcentajes se calculan únicamente con denominador > 0 y dentro de 0–100.
- No añadir dependencias. `app/` solo compone: la lógica de negocio (narrativa) vive en `features/dashboard/narrativa.ts`.
- Mantener accesibilidad (encabezados en orden `h1` → `h2`, `aria-labelledby`, `aria-hidden` en decorativos, foco visible con `ESTILOS_ENLACE_FOCUS_DASHBOARD`) y el tema oscuro existente.
- No cambiar los textos funcionales de error ni los de carga existentes.

Pasos

1. [x] Crear `features/dashboard/narrativa.ts` con `construirNarrativa` (helpers de normalización, pluralización y porcentaje seguro) según las reglas anteriores.
2. [x] Crear `features/dashboard/__tests__/narrativa.test.ts` cubriendo datos típicos, todo en cero y utilidad total cero (sin render); ejecutar `npm run test:related -- features/dashboard/narrativa.ts`.
3. [x] Crear `features/dashboard/components/ResumenNarrativo.tsx` (panel `glass-panel` con acento dorado, `h2` «Tu operación en resumen», lista de frases y `aria-labelledby`).
4. [x] Integrar en `ResumenDashboard.tsx` los textos de apoyo de cada sección, el cálculo `construirNarrativa(resumen)` en render y el panel antes de «Resultado financiero»; añadir el `Skeleton` del panel en carga. No tocar la consulta ni los indicadores.
5. [x] Añadir en `page.tsx` el párrafo introductorio del encabezado y la sección «Accesos rápidos» con las cuatro tarjetas de módulos, conservando los dos enlaces a reportes.
6. [x] Verificar responsive, foco visible y orden de encabezados en la composición resultante.
7. [x] Ejecutar V1 (`npm run format:check`), V2 (`npm run lint`), V3 (`npm run typecheck`) y V4 (`npm test`); documentar el resultado.
8. [x] Preparar V5: validación manual de `/dashboard` por el usuario (ruta protegida) revisando intro, textos de apoyo, panel narrativo con datos reales y con valores en cero, y los cuatro accesos rápidos; no la ejecuta el agente.
