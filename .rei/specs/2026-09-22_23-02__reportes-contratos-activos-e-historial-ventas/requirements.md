# Requisitos — Reportes: contratos activos con métricas e historial de ventas

> Work Item: `2026-09-22_23-02__reportes-contratos-activos-e-historial-ventas` (`type: feature`)
>
> Alcance: dos vistas de reportes del comerciante (`/reportes/contratos-activos` y
> `/reportes/historial-ventas`), enlazadas desde el dashboard y servidas por BFF propio. Las
> gráficas, los filtros por rango de fechas, la exportación y cualquier cálculo nuevo en el
> cliente quedan fuera de alcance.

## Requisitos

- **R1** El sistema DEBE exponer una página dedicada de reporte de contratos activos en la ruta `/reportes/contratos-activos`.

- **R2** El sistema DEBE exponer una página dedicada de historial de ventas en la ruta `/reportes/historial-ventas`.

- **R3** CUANDO el usuario abre `/reportes/contratos-activos`, el sistema DEBE obtener y mostrar el reporte de contratos activos del comerciante.

- **R4** El sistema DEBE mostrar, por cada contrato activo, una fila de tabla con tercero, finca, cantidad actual, total de compras, total de ventas y utilidad generada por el comerciante.

- **R5** El sistema DEBE ordenar los contratos activos por utilidad generada por el comerciante de forma descendente.

- **R6** CUANDO el usuario abre `/reportes/historial-ventas`, el sistema DEBE obtener y mostrar el historial de ventas del comerciante.

- **R7** El sistema DEBE mostrar el resumen agregado del historial con todos los campos disponibles: total de ventas, animales vendidos, valor bruto acumulado, costo estimado acumulado, utilidad total acumulada, utilidad acumulada del comerciante y utilidad acumulada de terceros.

- **R8** El sistema DEBE mostrar el detalle venta por venta con fecha, cantidad, peso promedio, precio por kilo, valor bruto, costo estimado, utilidad total, valor del comerciante, valor del tercero, kilos ganados promedio y porcentaje de utilidad.

- **R9** MIENTRAS el historial no esté expandido, el sistema DEBE mostrar las 50 ventas más recientes ordenadas por fecha de forma descendente.

- **R10** El sistema DEBE ofrecer un control "Ver todo" / "Ver menos" que expanda o colapse las ventas restantes, visible solo cuando existan más de 50 ventas.

- **R11** El sistema DEBE formatear las cifras monetarias como moneda es-CO (COP), los conteos con separadores de miles es-CO y los porcentajes con hasta dos decimales.

- **R12** El sistema DEBE mostrar las cifras tal como las entrega el backend, SIN recalcularlas ni transformarlas en el cliente.

- **R13** MIENTRAS se carga un reporte, el sistema DEBE mostrar un estado de carga basado en `Skeleton`.

- **R14** SI falla la carga de un reporte, ENTONCES el sistema DEBE mostrar un mensaje de error en español sin exponer el detalle técnico del backend.

- **R15** El sistema DEBE obtener ambos reportes a través de Route Handlers del BFF que adjuntan la cookie de sesión, sin exponer el token al cliente.

- **R16** El sistema DEBE enlazar las dos vistas de reportes desde el dashboard.

- **R17** El sistema NO DEBE añadir entradas de los nuevos reportes en el menú lateral.

- **R18** El sistema DEBE proteger las rutas `/reportes` mediante `middleware.ts`.

- **R19** El sistema NO DEBE incluir gráficas, filtros por rango de fechas, exportación ni cálculos nuevos en el cliente.
