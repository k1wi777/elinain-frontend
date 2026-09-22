# Requisitos — Hook genérico de paginación y sistema de diseño base

> Work Item: `2026-09-22_01-56__paginacion-y-sistema-de-diseno` (`type: feature`)
>
> Qué debe hacer el sistema. No contiene decisiones técnicas de implementación (esas viven
> en `design.md`). Sintaxis EARS; cada requisito tiene identificador estable, una única
> responsabilidad y es verificable.

---

## Contexto

El frontend necesita dos piezas base antes de construir las pantallas de negocio:

1. **Paginación genérica** para los listados paginados del backend
   (`GET /terceros`, `GET /fincas`, `GET /contratos`), cuyo contrato es
   `{ elementos, total, limite, offset }` con `limite` entre 1 y 100 (ejemplo 20) y
   `offset` desde 0.
2. **Sistema de diseño base** para no repetir estilos ni patrones de interacción:
   `Button`, `Input`, `Select`, `Table` (con paginación), `Modal` y `Toast`.

Ambas piezas deben funcionar igual para terceros, fincas y contratos sin modificaciones, y
no deben conocer el dominio del negocio.

---

## Requisitos

### R1 — Lógica de paginación genérica y transversal (Ubicuo)

El sistema DEBE ofrecer una lógica de paginación pura, genérica y sin conocimiento del
dominio, alojada en la capa transversal.

### R2 — Modelo `limite`/`offset` alineado al backend (Ubicuo)

El sistema DEBE expresar la paginación mediante `limite` y `offset`, usando exactamente
esos nombres y semántica, para enviarlos como query params de los listados.

### R3 — Cálculo de página actual y total de páginas (Evento)

CUANDO el consumidor proporciona el `total` de registros de la respuesta, el sistema DEBE
calcular la página actual y el total de páginas a partir de `limite` y `offset`.

### R4 — Navegación entre páginas (Ubicuo)

El sistema DEBE permitir navegar a la página anterior, a la página siguiente y a una
página concreta.

### R5 — Reinicio al cambiar el tamaño de página (Evento)

CUANDO el consumidor cambia el `limite`, el sistema DEBE volver a la primera página.

### R6 — Listado vacío (Estado)

MIENTRAS no existan registros (`total` igual a 0), el sistema DEBE reportar una única
página y deshabilitar la navegación a la página anterior y a la siguiente.

### R7 — Página siempre dentro del rango válido (Ubicuo)

El sistema DEBE mantener la página calculada dentro del rango entre 1 y el total de
páginas, incluso si el `total` se reduce tras una nueva consulta.

### R8 — Normalización del `limite` al rango del backend (Opcional)

DONDE el backend restringe el `limite` al rango 1–100, el sistema DEBE normalizar el
`limite` recibido a ese rango antes de usarlo.

### R9 — Límite por defecto (Ubicuo)

El sistema DEBE exponer 20 como límite de página por defecto y DEBE reutilizarlo cuando no
se indique uno.

### R10 — Reutilización sin cambios entre features (Ubicuo)

El sistema DEBE permitir paginar terceros, fincas y contratos con la misma pieza, sin
ramificaciones por recurso ni modificaciones entre features.

### R11 — Cálculos puros separados del estado de React (Ubicuo)

El sistema DEBE separar los cálculos de paginación del estado de React, de modo que los
cálculos puedan comprobarse sin renderizar componentes.

### R12 — Indicadores de navegación disponibles (Ubicuo)

El sistema DEBE exponer indicadores de disponibilidad de página anterior y de página
siguiente para que la interfaz pueda deshabilitar los controles correspondientes.

### R13 — Componentes base en la capa transversal de UI (Ubicuo)

El sistema DEBE proveer los componentes base `Button`, `Input`, `Select`, `Table`, `Modal`
y `Toast` en la capa transversal de UI, sin lógica de negocio.

### R14 — API pública tipada de los componentes (Ubicuo)

El sistema DEBE exponer los componentes de UI mediante exportaciones nombradas, con props
genéricas y tipadas, sin `any`.

### R15 — Variantes del botón (Ubicuo)

El componente `Button` DEBE soportar al menos las variantes primaria, secundaria y peligro,
y DEBE respetar el estado deshabilitado nativo.

### R16 — Campos accesibles (Ubicuo)

Los componentes `Input` y `Select` DEBEN asociar un `<label>` a su control y DEBEN vincular
su mensaje de error mediante `aria-describedby`, marcando el control como inválido.

### R17 — Tabla con estados de carga y vacío (Ubicuo)

El componente `Table` DEBE renderizar encabezados y filas, DEBE mostrar un estado de carga
y un estado vacío, y DEBE permitir definir cómo se representa el contenido de cada celda.

### R18 — Tabla con paginación (Evento)

CUANDO el componente `Table` recibe datos de paginación, DEBE renderizar controles de
página anterior y página siguiente junto con un indicador de página actual sobre el total.

### R19 — Modal accesible (Evento)

CUANDO se abre el componente `Modal`, el sistema DEBE presentarlo como un diálogo modal
accesible con título asociado, DEBE permitir cerrarlo con `Escape` y DEBE devolver el foco
al elemento que lo abrió cuando se cierra.

### R20 — Notificación de éxito o error (Evento)

CUANDO se muestra el componente `Toast`, el sistema DEBE anunciar el mensaje con el rol
accesible correspondiente a éxito o error y DEBE ofrecer un control para cerrarlo.

### R21 — Navegación por teclado y foco visible (Ubicuo)

El sistema DEBE garantizar que todos los componentes interactivos sean navegables por
teclado y muestren un indicador de foco visible.

### R22 — Helper de clases condicionales (Ubicuo)

El sistema DEBE ofrecer un helper transversal para componer clases condicionales de
Tailwind, evitando concatenaciones largas con ternarios.

### R23 — Cobertura de la lógica pura (Ubicuo)

El sistema DEBE cubrir con tests Jest de lógica pura —sin red ni render— los cálculos de
paginación y el helper de clases condicionales.

### R24 — Sin dependencias nuevas de interfaz (Ubicuo)

El sistema NO DEBE incorporar dependencias nuevas de interfaz; los componentes se
construyen sobre Tailwind y las utilidades ya instaladas.

### R25 — Aislamiento de capas (Ubicuo)

El sistema DEBE mantener la paginación y los componentes dentro de `shared/`, sin que
`shared/` importe de `features/` ni de `app/`.

---

## Trazabilidad con el alcance acordado

| Requisito | Cubre |
|-----------|-------|
| R1–R12 | Hook genérico de paginación (`limite`/`offset`, `total`, página y total de páginas) |
| R10 | Reutilizable para terceros, fincas y contratos sin modificaciones |
| R11, R23 | Checkpoint `V4`: Jest solo de lógica pura |
| R13–R22, R24 | Sistema de diseño base en `shared/ui` + `cn()` en `shared/lib` |
| R19–R21 | Accesibilidad (foco, teclado, `Escape`, `aria-*`) |
| R25 | `architecture.md`: `shared/` no importa de `features/` ni de `app/` |
