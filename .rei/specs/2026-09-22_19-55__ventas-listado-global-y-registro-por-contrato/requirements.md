# Requisitos — Ventas: listado global y por contrato, registro y desglose

Cubre el listado de ventas en dos superficies (sección embebida en el detalle del contrato y
listado global en `/ventas`), el registro de ventas con el desglose completo que devuelve el
backend, y la inmutabilidad de las ventas en la interfaz.

## Listado

- **R1** — MIENTRAS el usuario visualiza el detalle de un contrato, el sistema DEBE mostrar la
  sección de ventas de ese contrato con el listado paginado de sus ventas.
- **R2** — CUANDO el usuario accede a la ruta `/ventas`, el sistema DEBE mostrar el listado
  global paginado de todas las ventas.
- **R3** — DONDE el listado global ofrece un filtro por contrato, el sistema DEBE mostrar las
  ventas del contrato elegido y todas las ventas cuando no se elige ninguno.
- **R4** — MIENTRAS el listado de ventas se está cargando, el sistema DEBE mostrar un estado
  de carga.
- **R5** — SI no hay ventas que mostrar, ENTONCES el sistema DEBE mostrar un estado vacío en
  lugar de una lista sin elementos.
- **R6** — SI falla la carga del listado de ventas, ENTONCES el sistema DEBE mostrar un
  mensaje de error en español sin exponer el detalle técnico del backend.
- **R7** — El sistema DEBE paginar el listado de ventas con `limite`/`offset` y reflejar el
  total reportado por el backend.
- **R8** — CUANDO el usuario cambia el filtro por contrato del listado global, el sistema DEBE
  volver a la primera página.

## Tarjetas de venta

- **R9** — El sistema DEBE mostrar una tarjeta por cada venta del listado.
- **R10** — El sistema DEBE destacar en cada tarjeta el valor bruto, la utilidad total, el
  valor del comerciante, el valor del tercero, el porcentaje de utilidad total y los kilos
  ganados promedio.
- **R11** — El sistema DEBE mostrar además en cada tarjeta la fecha, la cantidad vendida, el
  peso promedio de venta y el precio por kilo de venta.
- **R12** — El sistema DEBE presentar las cifras monetarias, los kilos y los porcentajes con
  un formato numérico consistente en español.
- **R13** — El sistema DEBE distinguir jerárquicamente las cifras de utilidad y participación
  de los datos secundarios de la venta.

## Registro

- **R14** — CUANDO el usuario decide registrar una venta, el sistema DEBE solicitar contrato,
  fecha, cantidad vendida, peso promedio de venta y precio por kilo de venta.
- **R15** — DONDE el registro ocurre en el detalle de un contrato, el sistema DEBE fijar ese
  contrato y no permitir cambiarlo.
- **R16** — DONDE el registro ocurre en el listado global, el sistema DEBE permitir elegir el
  contrato y exigirlo.
- **R17** — SI la cantidad vendida no es un número entero mayor que cero, ENTONCES el sistema
  DEBE impedir el registro y mostrar un mensaje de validación.
- **R18** — SI el peso promedio de venta o el precio por kilo de venta no son números mayores
  que cero, ENTONCES el sistema DEBE impedir el registro y mostrar un mensaje de validación.
- **R19** — SI la fecha no es válida, ENTONCES el sistema DEBE impedir el registro y mostrar
  un mensaje de validación.
- **R20** — SI el registro falla, ENTONCES el sistema DEBE mostrar un mensaje de error claro
  en español y mantener abierto el formulario con los datos ingresados.

## Resultado de la venta

- **R21** — CUANDO el registro de una venta se completa correctamente, el sistema DEBE mostrar
  el desglose completo devuelto por el backend en un modal "Resultado de la venta".
- **R22** — El modal de resultado DEBE mostrar el valor bruto, el precio de compra por animal
  promedio, el peso promedio de compra simple, el costo estimado de compra, la utilidad total,
  el valor del comerciante, el valor del tercero, los kilos ganados promedio, la utilidad real
  y el porcentaje de utilidad total.
- **R23** — CUANDO el registro de una venta se completa correctamente, el sistema DEBE
  refrescar el listado de ventas sin recargar la página.
- **R24** — CUANDO el registro de una venta se completa correctamente, el sistema DEBE
  invalidar los datos del contrato para reflejar sus agregados actualizados sin recargar la
  página.

## Inmutabilidad

- **R25** — El sistema NO DEBE ofrecer acciones de edición ni de eliminación sobre las ventas.
- **R26** — El sistema DEBE presentar la información de cada venta como solo lectura.

## Transversal

- **R27** — El sistema DEBE capturar y presentar la fecha de la venta en la zona horaria de
  Colombia (UTC−5) y enviarla al backend en formato ISO 8601.
- **R28** — El sistema DEBE gestionar las operaciones de ventas únicamente a través de los
  Route Handlers del BFF, sin que el navegador acceda al backend directamente.
- **R29** — El sistema DEBE mantener aislados los features `ventas` y `contratos`,
  componiéndolos únicamente en `app/`.
