# Requisitos — Compras en el detalle de contrato

Cubre el listado, registro, edición y eliminación de compras de un contrato, embebidos en
el detalle del contrato.

## Listado

- **R1** — MIENTRAS el usuario visualiza el detalle de un contrato, el sistema DEBE mostrar
  la sección de compras de ese contrato con el listado paginado de sus compras.
- **R2** — El sistema DEBE mostrar por cada compra su fecha, cantidad, peso promedio, precio
  por kilo, valor total y nota.
- **R3** — MIENTRAS el listado de compras se está cargando, el sistema DEBE mostrar un
  estado de carga.
- **R4** — SI el contrato no tiene compras registradas, ENTONCES el sistema DEBE mostrar un
  estado vacío en lugar de una tabla sin filas.
- **R5** — SI falla la carga del listado de compras, ENTONCES el sistema DEBE mostrar un
  mensaje de error en español sin exponer el detalle técnico del backend.
- **R6** — El sistema DEBE paginar el listado de compras con `limite`/`offset` y reflejar el
  total reportado por el backend.

## Registro

- **R7** — CUANDO el usuario registra una compra, el sistema DEBE solicitar fecha, cantidad,
  peso promedio, precio por kilo y nota, y exigir los cinco campos.
- **R8** — SI la cantidad no es un número entero mayor que cero, ENTONCES el sistema DEBE
  impedir el registro y mostrar un mensaje de validación.
- **R9** — SI el peso promedio o el precio por kilo no son números mayores que cero,
  ENTONCES el sistema DEBE impedir el registro y mostrar un mensaje de validación.
- **R10** — CUANDO el registro de una compra se completa correctamente, el sistema DEBE
  mostrar el valor total devuelto por el backend y refrescar el listado sin recargar la
  página.

## Edición

- **R11** — CUANDO el usuario edita una compra, el sistema DEBE permitir modificar su fecha,
  cantidad, peso promedio, precio por kilo y nota.
- **R12** — El sistema DEBE mantener inmutable el contrato de origen de una compra durante su
  edición.
- **R13** — CUANDO la edición de una compra se completa correctamente, el sistema DEBE
  reflejar el valor total recalculado por el backend y refrescar el listado sin recargar la
  página.
- **R14** — El sistema DEBE ofrecer las acciones de editar y eliminar en cada compra sin
  ocultarlas según el estado del contrato.
- **R15** — SI la edición falla porque el contrato ya tiene ventas registradas (409),
  ENTONCES el sistema DEBE mostrar el mensaje "No se puede modificar la compra: el contrato
  ya tiene ventas registradas." y mantener abierto el formulario con los datos ingresados.
- **R16** — SI la edición falla por otro motivo, ENTONCES el sistema DEBE mostrar un mensaje
  de error claro en español sin cerrar el formulario.

## Eliminación

- **R17** — CUANDO el usuario solicita eliminar una compra, el sistema DEBE pedir confirmación
  previa antes de ejecutar la eliminación.
- **R18** — CUANDO la eliminación de una compra se completa correctamente, el sistema DEBE
  refrescar el listado sin recargar la página.
- **R19** — SI la eliminación falla porque el contrato ya tiene ventas registradas (409),
  ENTONCES el sistema DEBE mostrar el mensaje "No se puede eliminar la compra: el contrato ya
  tiene ventas registradas." y mantener abierto el diálogo de confirmación.
- **R20** — SI la eliminación falla por otro motivo, ENTONCES el sistema DEBE mostrar un
  mensaje de error claro en español y mantener abierto el diálogo de confirmación.

## Transversal

- **R21** — El sistema DEBE capturar y presentar las fechas de las compras en la zona horaria
  de Colombia (UTC−5) y enviarlas al backend en formato ISO 8601.
