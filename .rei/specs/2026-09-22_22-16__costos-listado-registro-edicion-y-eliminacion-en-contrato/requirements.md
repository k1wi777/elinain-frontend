# Requisitos — Costos: listado, registro, edición y eliminación embebidos en el detalle del contrato

> Work Item: `2026-09-22_22-16__costos-listado-registro-edicion-y-eliminacion-en-contrato` (`type: feature`)
>
> Los costos son **informativos**: no entran en el cálculo de la utilidad real. Este Work Item
> cubre su CRUD dentro del detalle del contrato; el listado global, los reportes y cualquier
> cálculo de rentabilidad quedan fuera de alcance.

## Requisitos

- **R1** El sistema DEBE mostrar una sección de costos dentro de la vista de detalle del contrato, junto a las secciones de compras, ciclos y ventas.

- **R2** CUANDO el usuario abre el detalle de un contrato, el sistema DEBE listar los costos de ese contrato de forma paginada y filtrada por su identificador, mostrando fecha, tipo, monto y descripción de cada costo.

- **R3** MIENTRAS se carga el listado de costos, el sistema DEBE indicar el estado de carga de la tabla.

- **R4** SI falla la carga del listado de costos, ENTONCES el sistema DEBE mostrar un mensaje de error en español sin el detalle técnico del backend.

- **R5** El sistema DEBE mostrar de forma visible, tanto en la sección de costos como en el formulario de registro y edición, que los costos son informativos y NO afectan el cálculo de la utilidad real.

- **R6** CUANDO el usuario pulsa "Agregar costo", el sistema DEBE abrir un formulario modal de registro con los cuatro campos requeridos: `tipo`, `monto`, `fecha` y `descripcion`.

- **R7** DONDE el campo `tipo` es texto libre, el sistema DEBE ofrecer sugerencias de ayuda (por ejemplo, flete, alimentación, medicina, veterinaria) sin restringir el valor a esa lista.

- **R8** El sistema DEBE validar en el formulario que `tipo` y `descripcion` no estén vacíos, que `monto` sea un número estrictamente mayor que cero y que `fecha` sea una fecha válida de un solo día.

- **R9** CUANDO el usuario envía el formulario de registro con datos válidos, el sistema DEBE registrar el costo con el `contrato_id` del contrato actual y con la `fecha` convertida al inicio del día en la zona del negocio en formato ISO 8601, y notificar el éxito.

- **R10** MIENTRAS el contrato está cerrado (`estado === 'cerrado'`), el sistema DEBE mantener deshabilitado el botón "Agregar costo" y explicar que no se pueden registrar costos nuevos.

- **R11** CUANDO el usuario pulsa "Editar" en un costo, el sistema DEBE abrir el mismo formulario precargado con los datos del costo y actualizarlo al enviar.

- **R12** CUANDO el usuario pulsa "Eliminar" en un costo, el sistema DEBE pedir confirmación en un diálogo modal antes de eliminarlo, sin usar `window.confirm`.

- **R13** MIENTRAS el contrato está cerrado, el sistema DEBE mantener disponibles las acciones de editar y eliminar costos.

- **R14** SI el backend responde `400` al crear, editar o eliminar un costo (datos inválidos o contrato cerrado), ENTONCES el sistema DEBE mostrar un mensaje específico en español que indique revisar los datos o el estado del contrato, sin mostrar el mensaje crudo del backend.

- **R15** SI el backend responde `404` al crear, editar o eliminar un costo, ENTONCES el sistema DEBE mostrar un mensaje específico en español según la operación (contrato o costo inexistente), sin mostrar el mensaje crudo del backend.

- **R16** CUANDO se registra, edita o elimina un costo correctamente, el sistema DEBE invalidar las consultas del listado de costos y notificar a la composición para refrescar los datos del contrato.

- **R17** El sistema DEBE exponer y consumir las operaciones de costos a través de Route Handlers del BFF (`/api/costos` y `/api/costos/{id}`) que adjuntan la cookie de sesión, sin exponer el token al cliente.

- **R18** El sistema DEBE presentar el `monto` de cada costo como moneda local en formato es-CO.

- **R19** El sistema NO DEBE exponer una ruta global `/costos` ni su entrada en el menú de navegación del área protegida.

- **R20** El sistema NO DEBE mostrar en el detalle del contrato la sección de contenido pendiente "Próximamente: ciclos y costos".
