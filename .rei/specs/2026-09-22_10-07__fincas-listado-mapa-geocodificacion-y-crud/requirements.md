# Requisitos — Fincas: listado y mapa de pines, CRUD con ubicación geocodificada y eliminación con 409

> Work Item: `2026-09-22_10-07__fincas-listado-mapa-geocodificacion-y-crud` (`type: feature`)
>
> Qué debe hacer el sistema. No contiene decisiones técnicas de implementación (esas viven en
> `design.md`). Sintaxis EARS; cada requisito tiene identificador estable, una única
> responsabilidad y es verificable.

---

## Contexto

El backend ya expone el CRUD de fincas bajo `/api/v1/fincas` con autenticación JWT:
`GET /fincas` (200 `PaginaFincasDto`; 401/500), `POST /fincas` (201 `FincaRespuestaDto`;
400/401/404/500), `GET|PATCH|DELETE /fincas/{id}` (200/200/204; 400/401/404/500 y **409** al
eliminar una finca con contratos vinculados). `latitud` ∈ [-90, 90] y `longitud` ∈ [-180, 180].
`FincaRespuestaDto` **no** incluye el nombre del propietario: solo `tercero_id`.

Piezas del Work Item (acordadas con el usuario): (1) listado paginado en `/fincas`;
(2) mapa de todas las fincas con pines y modal de detalle; (3) crear finca con selector de
tercero, nombre, dirección y pin geolocalizado; (4) editar reutilizando el formulario;
(5) eliminar con confirmación y manejo del `409`. El propietario se resuelve en el frontend
mapeando `tercero_id → nombre`; la dirección solo centra el mapa por geocodificación y la
fuente de verdad es el pin; la geocodificación se hace por un BFF proxy a Nominatim.

---

## Requisitos

### BFF de fincas (`app/api/fincas/*`)

#### R1 — Listado paginado en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `GET /api/fincas` que liste las fincas del
comerciante autenticado con paginación `limite`/`offset`.

#### R2 — Creación en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `POST /api/fincas` que cree una finca y
responda con la finca creada.

#### R3 — Consulta individual en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `GET /api/fincas/{id}` que devuelva una finca
concreta.

#### R4 — Actualización en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `PATCH /api/fincas/{id}` que actualice
parcialmente una finca y responda con la finca actualizada.

#### R5 — Eliminación en el BFF (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `DELETE /api/fincas/{id}` que elimine una finca
y responda sin cuerpo.

#### R6 — Propagación del código HTTP (Ubicuo)

El BFF DEBE propagar al navegador el mismo código de estado HTTP que devuelve el backend, sin
convertir un error en un éxito.

#### R7 — Errores controlados (Error)

SI el backend no responde o devuelve un fallo, ENTONCES el BFF DEBE responder con un error
controlado y un mensaje claro en español, sin filtrar el detalle técnico ni el cuerpo crudo del
backend.

#### R8 — Conflicto al eliminar (Error)

SI el backend responde `409` al eliminar una finca, ENTONCES el BFF DEBE propagar el `409`.

### Geocodificación (BFF proxy a Nominatim)

#### R9 — Proxy de geocodificación (Ubicuo)

El sistema DEBE exponer un Route Handler BFF en `GET /api/geocodificacion` que, a partir de un
texto de dirección, devuelva las coordenadas correspondientes obtenidas de Nominatim
(OpenStreetMap) consultado desde el servidor.

#### R10 — El navegador no llama a Nominatim (Ubicuo)

El navegador NUNCA DEBE llamar directamente a Nominatim; todas las consultas de geocodificación
DEBEN pasar por el BFF.

#### R11 — Proxy autenticado (Estado)

MIENTRAS no exista una sesión vigente, el BFF de geocodificación DEBE rechazar la consulta con
`401` y NO DEBE llamar a Nominatim.

#### R12 — Política de uso (Ubicuo)

El BFF DEBE identificar la aplicación ante Nominatim con un `User-Agent` propio, aplicar una
cadencia máxima de aproximadamente una petición por segundo y cachear los resultados para no
repetir consultas idénticas.

#### R13 — Resultado de geocodificación (Evento)

CUANDO Nominatim devuelve una coincidencia, el BFF DEBE responder con la latitud y la longitud
de la primera coincidencia y una etiqueta descriptiva.

#### R14 — Sin coincidencias o consulta inválida (Error)

SI falta el texto de búsqueda, ENTONCES el BFF DEBE responder `400`; SI no hay coincidencias,
ENTONCES DEBE responder `404`; SI el servicio externo falla, ENTONCES DEBE responder un error
controlado. En todos los casos con un mensaje claro en español.

### Listado de fincas

#### R15 — Ruta única con pestañas (Ubicuo)

El sistema DEBE ofrecer la ruta `/fincas` con dos vistas conmutables: "Listado" y "Mapa".

#### R16 — Listado paginado (Ubicuo)

El sistema DEBE mostrar el listado de fincas paginado con el nombre de la finca, la dirección y
el nombre del tercero propietario.

#### R17 — Estado de carga (Estado)

MIENTRAS el listado se está cargando, el sistema DEBE indicar el estado de carga.

#### R18 — Estado vacío (Estado)

MIENTRAS no existan fincas, el sistema DEBE mostrar un estado vacío con un mensaje claro.

#### R19 — Error de carga (Error)

SI falla la carga del listado, ENTONCES el sistema DEBE mostrar un mensaje de error claro sin
detalle técnico.

#### R20 — Acciones por fila (Ubicuo)

El sistema DEBE ofrecer, por cada finca del listado, una acción para editarla y una acción para
eliminarla.

#### R21 — Propietario desconocido (Opcional)

DONDE no sea posible resolver el nombre de un tercero propietario, el sistema DEBE mostrar un
texto de respaldo en lugar de un valor vacío.

### Mapa de fincas

#### R22 — Un pin por finca (Ubicuo)

El sistema DEBE mostrar en el mapa un pin por cada finca del comerciante, incluidas las que no
pertenecen a la página actual del listado.

#### R23 — Popup de la finca (Evento)

CUANDO el usuario selecciona un pin, el sistema DEBE mostrar un popup con el nombre, el
propietario y la dirección de la finca y una acción "Ver detalle".

#### R24 — Modal de detalle (Evento)

CUANDO el usuario activa "Ver detalle", el sistema DEBE abrir un modal con la información
general de la finca, sin navegar a otra ruta.

#### R25 — Carga del mapa sin SSR (Ubicuo)

El mapa DEBE cargarse en el cliente sin renderizado en servidor y DEBE mostrar la atribución de
OpenStreetMap.

#### R26 — Error del mapa (Error)

SI el mapa o las fincas no pueden mostrarse, ENTONCES el sistema DEBE mostrar un estado de
error o de carga claro sin detalle técnico.

### Crear finca

#### R27 — Ruta de creación (Ubicuo)

El sistema DEBE ofrecer una ruta dedicada `/fincas/nueva` con el formulario de creación.

#### R28 — Campos del formulario (Ubicuo)

El formulario DEBE incluir un selector de tercero propietario, un campo de nombre, un campo de
dirección y un mapa interactivo para ubicar la finca.

#### R29 — La dirección solo centra el mapa (Ubicuo)

La dirección DEBE usarse únicamente para centrar el mapa mediante geocodificación; las
coordenadas que se guardan DEBEN ser siempre las de la posición del pin.

#### R30 — Pin ajustable (Evento)

CUANDO el usuario interactúa con el mapa, el sistema DEBE permitir ajustar la posición del pin
(arrastrándolo o haciendo clic en el mapa) y DEBE reflejar la nueva posición.

#### R31 — Validación del rango geográfico (Error)

SI la latitud no está entre -90 y 90 o la longitud no está entre -180 y 180, ENTONCES el sistema
DEBE impedir el envío y mostrar el error correspondiente.

#### R32 — Validación de campos obligatorios (Error)

SI el usuario envía el formulario sin propietario, sin nombre, sin dirección o sin ubicación en
el mapa, ENTONCES el sistema DEBE impedir el envío y mostrar el error en el campo correspondiente.

#### R33 — Estado de envío (Estado)

MIENTRAS la creación está en curso, el sistema DEBE impedir envíos duplicados e indicar el
estado de carga.

#### R34 — Creación exitosa (Evento)

CUANDO la creación es exitosa, el sistema DEBE confirmar el resultado y volver al listado de
fincas.

#### R35 — Error al crear (Error)

SI la creación falla, ENTONCES el sistema DEBE mostrar un mensaje claro en español sin exponer
el detalle técnico.

### Editar finca

#### R36 — Ruta de edición (Ubicuo)

El sistema DEBE ofrecer una ruta dedicada `/fincas/[id]/editar` con el mismo formulario en modo
edición, precargado con los datos actuales de la finca.

#### R37 — Propietario no editable (Ubicuo)

En modo edición, el propietario NO DEBE ser modificable desde el formulario de finca.

#### R38 — Edición exitosa (Evento)

CUANDO la edición es exitosa, el sistema DEBE confirmar el resultado, actualizar el listado y el
mapa, y volver al listado de fincas.

#### R39 — Finca inexistente (Error)

SI la finca a editar no existe, ENTONCES el sistema DEBE mostrar un mensaje claro de error sin
exponer el detalle técnico.

### Eliminar finca

#### R40 — Confirmación de borrado (Evento)

CUANDO el usuario solicita eliminar una finca, el sistema DEBE pedir confirmación antes de
borrarla.

#### R41 — Conflicto al eliminar en la interfaz (Error)

SI la eliminación devuelve `409`, ENTONCES el sistema DEBE mostrar un mensaje claro que indique
que la finca tiene contratos vinculados y NO DEBE cerrar la confirmación como si hubiera
eliminado.

#### R42 — Eliminación exitosa (Evento)

CUANDO la eliminación es exitosa, el sistema DEBE confirmar el resultado y actualizar el listado
y el mapa sin recargar la página.

#### R43 — Otros errores al eliminar (Error)

SI la eliminación falla por un motivo distinto a `409`, ENTONCES el sistema DEBE mostrar un
mensaje claro en español sin detalle técnico.

### Transversal

#### R44 — Resolución del propietario en el frontend (Ubicuo)

El sistema DEBE resolver el nombre del tercero propietario en el frontend a partir de
`tercero_id`, cargando la lista de terceros y mapeando `tercero_id → nombre`, sin depender de un
campo que el backend no devuelve.

#### R45 — Composición en `app/` (Ubicuo)

El sistema DEBE componer la lista de terceros en `app/` y pasarla al feature `fincas` como prop,
sin que `features/fincas` importe de `features/terceros`.

#### R46 — Acceso autenticado (Estado)

MIENTRAS no exista una sesión vigente, el sistema DEBE impedir el acceso a `/fincas` y sus
subrutas y redirigir a `/login`.

#### R47 — Navegación (Ubicuo)

El sistema DEBE ofrecer un enlace de navegación hacia `/fincas` desde el layout del área
protegida.

#### R48 — Sin dependencias nuevas (Ubicuo)

El sistema NO DEBE incorporar dependencias nuevas: los mapas se construyen sobre `leaflet` y
`react-leaflet`, ya instalados.

#### R49 — Separación de capas (Ubicuo)

El sistema DEBE mantener la separación `app/` / `features/` / `shared/`: el BFF en `app/api`,
la lógica de fincas en `features/fincas` y las piezas transversales en `shared/`, sin que
`shared/` importe de `features/` ni de `app/`, ni un feature importe de otro.

#### R50 — Mensajes en español (Ubicuo)

Todo mensaje visible al usuario DEBE estar en español y no DEBE exponer el detalle técnico del
backend.

#### R51 — Cobertura de lógica pura (Ubicuo)

El sistema DEBE cubrir con tests Jest de lógica pura —sin red ni render— los esquemas de
validación, los mensajes de error, las query keys y las transformaciones/parseos puros nuevos.

#### R52 — Accesibilidad (Ubicuo)

Los campos del formulario DEBEN tener `<label>` asociado, los modales DEBEN gestionar foco y
cierre con `Escape`, y la interfaz DEBE ser navegable por teclado.

---

## Trazabilidad con el alcance acordado

| Requisito | Cubre |
|-----------|-------|
| R1–R8 | BFF de fincas (`app/api/fincas/*`) |
| R9–R14 | Geocodificación por proxy BFF a Nominatim |
| R15–R21 | Listado paginado en `/fincas` con pestañas |
| R22–R26 | Mapa de todas las fincas, popup y modal de detalle |
| R27–R35 | Crear finca con pin geolocalizado |
| R36–R39 | Editar finca reutilizando el formulario |
| R40–R43 | Eliminar con confirmación y manejo del `409` |
| R44–R52 | Propietario, composición en `app/`, rutas protegidas, capas, tests y accesibilidad |
