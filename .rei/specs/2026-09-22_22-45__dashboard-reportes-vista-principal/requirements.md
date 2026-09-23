# Requisitos — Dashboard: vista principal de reportes con tarjetas resumen

> Work Item: `2026-09-22_22-45__dashboard-reportes-vista-principal` (`type: feature`)
>
> Alcance: la vista principal de `/dashboard` consume `GET /api/v1/reportes/dashboard` y muestra
> las ocho cifras del `ResumenDashboardDto`. Los demás reportes, las gráficas, los filtros por
> fecha y cualquier cálculo nuevo en el cliente quedan fuera de alcance.

## Requisitos

- **R1** El sistema DEBE sustituir el contenido de bienvenida actual de `/dashboard` por la vista principal de reportes del comerciante.

- **R2** CUANDO el usuario abre `/dashboard`, el sistema DEBE obtener y mostrar el resumen consolidado de su actividad.

- **R3** El sistema DEBE mostrar los ocho indicadores del resumen: contratos activos, contratos cerrados, animales en inventario, utilidad bruta acumulada, utilidad real acumulada del comerciante, utilidad acumulada de terceros, total de costos informativos y ventas registradas.

- **R4** El sistema DEBE etiquetar cada indicador con un texto en español que describa su significado.

- **R5** El sistema DEBE presentar la utilidad real acumulada del comerciante como la cifra protagonista de la vista, con el mayor tamaño, peso y realce cromático.

- **R6** El sistema DEBE presentar la utilidad bruta acumulada y la utilidad acumulada de terceros en un segundo nivel tipográfico, subordinado a la cifra protagonista.

- **R7** El sistema DEBE presentar los conteos (contratos activos, contratos cerrados, animales en inventario y ventas registradas) y el total de costos informativos en un nivel tipográfico menor que las cifras de utilidad.

- **R8** El sistema DEBE formatear las cifras monetarias como moneda es-CO (COP) y los conteos con separadores de miles es-CO.

- **R9** MIENTRAS se carga el resumen, el sistema DEBE mostrar un estado de carga basado en `Skeleton`.

- **R10** SI falla la carga del resumen, ENTONCES el sistema DEBE mostrar un mensaje de error en español sin exponer el detalle técnico del backend.

- **R11** El sistema DEBE obtener el resumen a través de un Route Handler del BFF que adjunta la cookie de sesión, sin exponer el token al cliente.

- **R12** El sistema DEBE mostrar las cifras tal como las entrega el backend, SIN recalcularlas ni transformarlas en el cliente.

- **R13** El sistema NO DEBE mostrar gráficas, filtros por rango de fechas ni los demás reportes (`contratos-activos` e `historial-ventas`) en esta vista.
