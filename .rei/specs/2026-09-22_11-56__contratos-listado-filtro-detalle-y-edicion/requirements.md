# Requisitos — Contratos: listado filtrable, apertura, detalle y edición de campos mutables

> Work Item: `2026-09-22_11-56__contratos-listado-filtro-detalle-y-edicion` (`type: feature`)
>
> Qué debe hacer el sistema. No contiene decisiones técnicas de implementación (esas viven en
> `design.md`). Sintaxis EARS; cada requisito tiene identificador estable, una única
> responsabilidad y es verificable.

---

## Contexto

El backend ya expone los contratos de participación bajo `/api/v1/contratos` con autenticación
JWT: `GET /contratos` (200 `PaginaContratosDto`; 401/500), `POST /contratos` (201
`ContratoRespuestaDto`; 400/401/404/500), `GET /contratos/{id}` y `PATCH /contratos/{id}`
(200; 400/401/404/500). **No existe `DELETE` de contratos**: los contratos se cierran, no se
borran. **`GET /contratos` no acepta filtro por estado.** `ContratoRespuestaDto` **no** incluye
el nombre del tercero ni de la finca: solo `tercero_id` y `finca_id`.

Piezas del Work Item (acordadas con el usuario): (1) listado paginado en `/contratos` con fecha
de apertura, tercero, finca, estado y porcentaje de participación, más un filtro simple por
estado; (2) apertura de contrato con selector de tercero, selector de finca filtrada por el
tercero elegido, fecha de apertura y porcentajes con autocompletado del complementario, más
campos opcionales; (3) vista de detalle en ruta propia con todos los datos y un placeholder de
"próximamente"; (4) edición de los campos mutables sin poder tocar porcentajes, tercero, finca
ni fecha de apertura.

Como el backend no filtra por estado, se traen **todos** los contratos del comerciante y el
filtro y la paginación se resuelven en el cliente; el total y las páginas reflejan el filtro.
Los nombres de tercero y finca se resuelven en el frontend cargando sus listas y componiendo en
`app/`.

---

## Requisitos

### BFF de contratos (`app/api/contratos/*`)

#### R1 — Listado paginado en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `GET /api/contratos` que liste los contratos del
comerciante autenticado con paginación `limite`/`offset`.

#### R2 — Creación en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `POST /api/contratos` que abra un contrato y
responda con el contrato creado.

#### R3 — Consulta individual en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `GET /api/contratos/{id}` que devuelva un
contrato concreto.

#### R4 — Actualización parcial en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `PATCH /api/contratos/{id}` que actualice
parcialmente un contrato y responda con el contrato actualizado.

#### R5 — Propagación del código HTTP (Ubicuo)

El BFF DEBE propagar al navegador el mismo código de estado HTTP que devuelve el backend, sin
convertir un error en un éxito.

#### R6 — Errores controlados (Error)

SI el backend no responde o devuelve un fallo, ENTONCES el BFF DEBE responder con un error
controlado y un mensaje claro en español, sin filtrar el detalle técnico ni el cuerpo crudo del
backend.

#### R7 — Sin eliminación de contratos (Ubicuo)

El sistema NO DEBE exponer ninguna operación de eliminación de contratos, porque el backend no
la ofrece: un contrato se cierra cambiando su estado, no se borra.

#### R8 — El PATCH no propaga campos inmutables (Ubicuo)

El BFF de actualización NUNCA DEBE reenviar al backend `tercero_id`, `finca_id`,
`fecha_apertura`, `porcentaje_comerciante` ni `porcentaje_tercero`, aunque el cuerpo de la
petición los incluya.

### Listado de contratos

#### R9 — Ruta del listado (Ubicuo)

El sistema DEBE ofrecer la ruta `/contratos` con el listado de contratos del comerciante.

#### R10 — Columnas del listado (Ubicuo)

El listado DEBE mostrar, por cada contrato, la fecha de apertura, el tercero, la finca, el
estado y la participación, presentando los porcentajes de comerciante y tercero en una sola
columna con el formato `comerciante% / tercero%`.

#### R11 — Carga completa y paginación en el cliente (Ubicuo)

El sistema DEBE cargar todos los contratos del comerciante y resolver la paginación en el
cliente, de modo que el total y el número de páginas correspondan al conjunto filtrado.

#### R12 — Filtro por estado (Evento)

CUANDO el usuario selecciona un estado (`todos`, `activo` o `cerrado`), el sistema DEBE filtrar
el listado en el cliente por ese estado y recalcular el total y las páginas mostradas.

#### R13 — Estado de carga (Estado)

MIENTRAS el listado se está cargando, el sistema DEBE indicar el estado de carga.

#### R14 — Estado vacío (Estado)

MIENTRAS no existan contratos que cumplan el filtro, el sistema DEBE mostrar un estado vacío con
un mensaje claro.

#### R15 — Error de carga (Error)

SI falla la carga del listado, ENTONCES el sistema DEBE mostrar un mensaje de error claro sin
detalle técnico.

#### R16 — Acciones por fila (Ubicuo)

El sistema DEBE ofrecer, por cada contrato del listado, una acción para ver su detalle y una
acción para editarlo.

#### R17 — Resolución de tercero y finca en el frontend (Ubicuo)

El sistema DEBE resolver el nombre del tercero y de la finca en el frontend a partir de
`tercero_id` y `finca_id`, cargando las listas de terceros y fincas, sin depender de campos que
el backend no devuelve.

#### R18 — Nombres desconocidos (Opcional)

DONDE no sea posible resolver el nombre de un tercero o de una finca, el sistema DEBE mostrar un
texto de respaldo en lugar de un valor vacío.

### Abrir contrato

#### R19 — Ruta de apertura (Ubicuo)

El sistema DEBE ofrecer una ruta dedicada `/contratos/nuevo` con el formulario de apertura.

#### R20 — Campos del formulario (Ubicuo)

El formulario DEBE incluir un selector de tercero, un selector de finca, una fecha y hora de
apertura, los porcentajes del comerciante y del tercero, y los campos opcionales raza, peso
promedio actual, cantidad actual y valor por kilo de referencia.

#### R21 — Finca filtrada por tercero (Evento)

CUANDO el usuario elige un tercero, el sistema DEBE limitar las opciones del selector de finca a
las fincas asociadas a ese tercero.

#### R22 — Autocompletado del porcentaje complementario (Evento)

CUANDO el usuario introduce uno de los dos porcentajes, el sistema DEBE autocompletar el otro
con su complemento a 100.

#### R23 — Validación de la suma de porcentajes (Error)

SI la suma de `porcentaje_comerciante` y `porcentaje_tercero` no es exactamente 100, ENTONCES el
sistema DEBE impedir el envío y mostrar el error correspondiente, sin sustituir la validación
del backend.

#### R24 — Fecha de apertura en ISO 8601 (Evento)

CUANDO el usuario captura la fecha y hora de apertura, el sistema DEBE capturarla con un control
de fecha y hora local y convertirla a ISO 8601 antes de enviarla.

#### R25 — Validación de campos (Error)

SI falta el tercero, la finca, la fecha de apertura o alguno de los porcentajes, o SI la fecha
es inválida, o SI un campo opcional numérico no es mayor que cero, ENTONCES el sistema DEBE
impedir el envío y mostrar el error en el campo correspondiente.

#### R26 — Estado de envío (Estado)

MIENTRAS la apertura está en curso, el sistema DEBE impedir envíos duplicados e indicar el
estado de carga.

#### R27 — Apertura exitosa (Evento)

CUANDO la apertura es exitosa, el sistema DEBE confirmar el resultado y navegar a la vista de
detalle del contrato creado.

#### R28 — Error al abrir (Error)

SI la apertura falla, ENTONCES el sistema DEBE mostrar un mensaje claro en español sin exponer
el detalle técnico.

### Detalle del contrato

#### R29 — Ruta de detalle (Ubicuo)

El sistema DEBE ofrecer una ruta dedicada `/contratos/[id]` con la vista de detalle.

#### R30 — Datos mostrados (Ubicuo)

La vista de detalle DEBE mostrar todos los datos del contrato: tercero, finca, fecha de
apertura, estado, fecha de cierre, porcentajes, raza, peso promedio actual, cantidad actual y
valor por kilo de referencia, indicando de forma clara los valores no informados.

#### R31 — Secciones futuras (Ubicuo)

La vista de detalle DEBE mostrar un placeholder visible que anticipe "próximamente: compras,
ventas, ciclos, costos", señalando dónde vivirá esa información.

#### R32 — Acción de edición (Ubicuo)

La vista de detalle DEBE ofrecer una acción para editar el contrato.

#### R33 — Contrato no encontrado (Error)

SI el contrato solicitado no existe, ENTONCES el sistema DEBE mostrar un mensaje claro de error
sin exponer el detalle técnico.

### Editar contrato

#### R34 — Ruta de edición (Ubicuo)

El sistema DEBE ofrecer una ruta dedicada `/contratos/[id]/editar` con el formulario en modo
edición, precargado con los datos actuales del contrato.

#### R35 — Campos mutables (Ubicuo)

En modo edición, el formulario DEBE permitir modificar únicamente el estado, la fecha de cierre,
la raza, el peso promedio actual, la cantidad actual y el valor por kilo de referencia.

#### R36 — Campos inmutables (Ubicuo)

En modo edición, el tercero, la finca, la fecha de apertura y los porcentajes DEBEN mostrarse
deshabilitados o en solo lectura y NO DEBEN poder modificarse desde la interfaz.

#### R37 — Acoplamiento de estado y fecha de cierre (Evento)

CUANDO el usuario cambia el estado a `cerrado`, el sistema DEBE exigir una fecha de cierre y
autocompletarla con la fecha actual si está vacía; CUANDO vuelve a `activo`, el sistema DEBE
limpiar la fecha de cierre.

#### R38 — Envío solo de campos mutables (Ubicuo)

La actualización DEBE enviar únicamente campos mutables, sin incluir porcentajes, tercero, finca
ni fecha de apertura.

#### R39 — Edición exitosa (Evento)

CUANDO la edición es exitosa, el sistema DEBE confirmar el resultado, actualizar el listado y
volver a la vista de detalle del contrato.

#### R40 — Error al editar (Error)

SI la edición falla, ENTONCES el sistema DEBE mostrar un mensaje claro en español sin exponer el
detalle técnico.

### Transversal

#### R41 — Acceso autenticado (Estado)

MIENTRAS no exista una sesión vigente, el sistema DEBE impedir el acceso a `/contratos` y sus
subrutas y redirigir a `/login`.

#### R42 — Navegación (Ubicuo)

El sistema DEBE ofrecer un enlace de navegación hacia `/contratos` desde el layout del área
protegida.

#### R43 — Aislamiento entre features (Ubicuo)

El feature `contratos` NUNCA DEBE importar de `features/terceros` ni de `features/fincas`.

#### R44 — Composición en `app/` (Ubicuo)

El sistema DEBE componer en `app/` las listas de terceros y fincas y pasarlas al feature
`contratos` como props.

#### R45 — API pública de fincas ampliada (Ubicuo)

El sistema DEBE exponer desde `features/fincas` un hook que devuelva todas las fincas y el tipo
`Finca`, para que `app/` pueda resolver el nombre de la finca de cada contrato y el filtrado del
selector de fincas por tercero.

#### R46 — Sin dependencias nuevas (Ubicuo)

El sistema NO DEBE incorporar dependencias nuevas ni actualizar el OpenAPI local.

#### R47 — Separación de capas (Ubicuo)

El sistema DEBE mantener la separación `app/` / `features/` / `shared/`: el BFF en `app/api`, la
lógica de contratos en `features/contratos` y las piezas transversales en `shared/`, sin que
`shared/` importe de `features/` ni de `app/`.

#### R48 — Mensajes en español (Ubicuo)

Todo mensaje visible al usuario DEBE estar en español y no DEBE exponer el detalle técnico del
backend.

#### R49 — Cobertura de lógica pura (Ubicuo)

El sistema DEBE cubrir con tests Jest de lógica pura —sin red ni render— los esquemas de
validación (incluida la suma 100), los mensajes de error, las query keys, el filtrado y la
paginación en el cliente, la conversión y el formateo de fecha ISO y la composición de
porcentajes.

#### R50 — Accesibilidad (Ubicuo)

Los campos del formulario DEBEN tener `<label>` asociado, los errores DEBEN anunciarse y
vincularse con `aria-describedby`, y la interfaz DEBE ser navegable por teclado con foco visible.

---

## Trazabilidad con el alcance acordado

| Requisito | Cubre |
|-----------|-------|
| R1–R8 | BFF de contratos (`app/api/contratos/*`), sin eliminación |
| R9–R18 | Listado en `/contratos` con filtro y paginación en el cliente |
| R19–R28 | Abrir contrato con porcentajes y fecha en ISO 8601 |
| R29–R33 | Vista de detalle con placeholder de secciones futuras |
| R34–R40 | Edición de campos mutables con inmutables deshabilitados |
| R41–R50 | Rutas protegidas, composición, capas, tests y accesibilidad |
