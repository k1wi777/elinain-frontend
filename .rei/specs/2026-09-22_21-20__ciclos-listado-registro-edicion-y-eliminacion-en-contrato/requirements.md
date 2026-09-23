# Requirements — Ciclos embebidos en el detalle del contrato

Alcance: gestión (listado, registro, edición y eliminación) de los ciclos —checkpoints de
engorde— de un contrato, desde la vista de detalle del contrato. No incluye listado global,
costos ni cálculos de rentabilidad.

## Listado

- **R1** CUANDO se muestra el detalle de un contrato, el sistema DEBE mostrar una sección de
  ciclos con el listado de los ciclos de ese contrato.
- **R2** El listado DEBE mostrar de cada ciclo su fecha, su peso observado y sus notas.
- **R3** DONDE un ciclo no tenga peso observado o notas, el listado DEBE indicar el valor no
  informado sin dejar la celda vacía.
- **R4** CUANDO el contrato tenga más ciclos que el tamaño de página, el sistema DEBE
  permitir navegar entre páginas.
- **R5** MIENTRAS el contrato no tenga ciclos, el sistema DEBE mostrar un mensaje de listado
  vacío.
- **R6** SI falla la carga del listado, ENTONCES el sistema DEBE mostrar un mensaje en
  español sin exponer el detalle técnico del backend.

## Registro

- **R7** MIENTRAS el contrato esté activo, el sistema DEBE ofrecer la acción de registrar un
  ciclo.
- **R8** MIENTRAS el contrato esté cerrado, la acción de registrar un ciclo DEBE estar
  deshabilitada.
- **R9** CUANDO se abre el registro, el sistema DEBE mostrar un formulario en modal con los
  campos fecha, peso observado y notas.
- **R10** El formulario DEBE solicitar la fecha como día (sin hora) y DEBE exigirla.
- **R11** CUANDO se envía la fecha, el sistema DEBE convertirla a ISO 8601 correspondiente al
  inicio del día en la zona del negocio.
- **R12** DONDE se informe peso observado, el sistema DEBE exigir un número mayor que cero; si
  no se informa, DEBE aceptarlo como ausente.
- **R13** El sistema DEBE aceptar notas de texto libre opcionales.
- **R14** SI el formulario tiene datos inválidos, ENTONCES el sistema DEBE impedir el envío y
  mostrar los mensajes de validación en español junto a los campos.
- **R15** CUANDO el registro se completa, el sistema DEBE cerrar el modal, mostrar una
  confirmación y refrescar el listado y los datos derivados del contrato (por ejemplo
  `peso_promedio_actual`).

## Edición

- **R16** El sistema DEBE ofrecer la acción de editar cada ciclo, también cuando el contrato
  esté cerrado.
- **R17** CUANDO se abre la edición, el formulario DEBE precargar la fecha del ciclo como
  día, su peso observado y sus notas.
- **R18** CUANDO la edición se completa, el sistema DEBE cerrar el modal, mostrar una
  confirmación y refrescar el listado y los datos derivados del contrato.

## Eliminación

- **R19** CUANDO se solicita eliminar un ciclo, el sistema DEBE pedir confirmación previa en
  un modal, sin usar `window.confirm`.
- **R20** El sistema DEBE ofrecer la acción de eliminar cada ciclo, también cuando el
  contrato esté cerrado.
- **R21** CUANDO la eliminación se confirma y completa, el sistema DEBE cerrar el modal,
  mostrar una confirmación y refrescar el listado y los datos derivados del contrato.

## Errores

- **R22** SI el backend responde `400` en el registro, la edición o la eliminación, ENTONCES
  el sistema DEBE mostrar un mensaje en español que indique revisar los datos o que el
  contrato está cerrado, sin mostrar el mensaje crudo del backend.
- **R23** SI el backend responde `404`, ENTONCES el sistema DEBE mostrar que el ciclo no
  existe.
- **R24** SI falla la conexión con el servidor, ENTONCES el sistema DEBE mostrar un mensaje
  de conexión en español.
- **R25** SI ocurre un error no contemplado, ENTONCES el sistema DEBE mostrar un mensaje
  genérico en español, nunca el mensaje crudo del backend.

## Alcance de navegación

- **R26** El sistema DEBE gestionar los ciclos únicamente desde el detalle del contrato y NO
  DEBE exponer una ruta global ni una entrada de menú para ciclos.
