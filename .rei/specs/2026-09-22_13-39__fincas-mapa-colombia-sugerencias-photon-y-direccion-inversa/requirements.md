# Requisitos — Fincas: mapa acotado a Colombia, sugerencias de dirección con Photon y relleno inverso desde el pin

> Work Item: `2026-09-22_13-39__fincas-mapa-colombia-sugerencias-photon-y-direccion-inversa` (`type: feature`)
>
> Qué debe hacer el sistema. No contiene decisiones técnicas de implementación (esas viven en
> `design.md`). Sintaxis EARS; cada requisito tiene identificador estable, una única
> responsabilidad y es verificable.

---

## Contexto

La feature `fincas` ya existe (listado, mapa general, CRUD y formulario con selector Leaflet) y
su geocodificación pasa por un proxy BFF autenticado a Nominatim. La política de uso de Nominatim
prohíbe el auto-complete search, por lo que toda la geocodificación se migra a **Photon**
(`photon.komoot.io`, OpenStreetMap, sin API key) y se retira la integración con Nominatim.

Piezas acordadas con el usuario: (1) acotar los dos mapas a Colombia; (2) rellenar el campo
Dirección con la dirección del punto elegido (clic y fin de arrastre del pin) mediante
geocodificación inversa; (3) ofrecer sugerencias al escribir y, al elegirlas, centrar el mapa y
fijar el pin; (4) filtrar y formatear las direcciones para Colombia. Se mantiene la búsqueda por
botón. El pin sigue siendo la fuente de verdad de las coordenadas.

Fuera de alcance: Google Places, autoalojar Photon/Nominatim y cambios en el contrato del backend
o en el OpenAPI local.

---

## Requisitos

### Mapas acotados a Colombia

#### R1 — Área del mapa del formulario (Ubicuo)

El mapa del formulario de finca DEBE limitar su vista a Colombia, de modo que no sea posible
desplazarse ni alejarse fuera del territorio nacional.

#### R2 — Área del mapa general (Ubicuo)

El mapa general de la pestaña "Mapa" de `/fincas` DEBE limitar su vista a Colombia con el mismo
criterio que el mapa del formulario.

#### R3 — Centro y zoom por defecto (Ubicuo)

Ambos mapas DEBEN iniciarse centrados en Colombia con un zoom por defecto acorde y DEBEN impedir
un alejamiento que desborde el área permitida.

#### R4 — Desplazamiento acotado (Evento)

CUANDO el usuario arrastra el mapa, el sistema DEBE impedir que la vista abandone el área de
Colombia.

#### R5 — Centrado dentro del área (Evento)

CUANDO el sistema centra el mapa en una ubicación (por sugerencia elegida o por búsqueda de
dirección), la vista resultante DEBE mantenerse dentro del área de Colombia.

### Proveedor de geocodificación (Photon vía BFF)

#### R6 — Búsqueda de direcciones por el BFF (Ubicuo)

El sistema DEBE exponer un endpoint BFF de búsqueda que, a partir de un texto, devuelva las
coordenadas y una etiqueta descriptiva obtenidas de Photon desde el servidor.

#### R7 — Sugerencias por el BFF (Ubicuo)

El sistema DEBE exponer un endpoint BFF de sugerencias que, a partir de un texto, devuelva una
lista de coincidencias de direcciones o lugares reconocidos.

#### R8 — Geocodificación inversa por el BFF (Ubicuo)

El sistema DEBE exponer un endpoint BFF de geocodificación inversa que, a partir de una latitud y
una longitud, devuelva la etiqueta de dirección correspondiente al punto.

#### R9 — El navegador no llama a Photon (Ubicuo)

El navegador NUNCA DEBE llamar directamente a Photon; todas las consultas DEBEN pasar por el BFF.

#### R10 — Proxy autenticado (Estado)

MIENTRAS no exista una sesión vigente, los endpoints BFF de geocodificación DEBEN rechazar la
consulta con `401` y NO DEBEN llamar a Photon.

#### R11 — Uso justo del proveedor (Ubicuo)

El BFF DEBE identificar la aplicación ante Photon con un `User-Agent` propio, aplicar una cadencia
de peticiones controlada y cachear los resultados para no repetir consultas idénticas.

#### R12 — Filtro por país (Ubicuo)

El sistema DEBE restringir las búsquedas y sugerencias a Colombia y DEBE descartar coincidencias
cuyo país reconocido no sea Colombia.

#### R13 — Direcciones útiles para Colombia (Ubicuo)

La etiqueta de dirección DEBE formarse a partir de los componentes reconocidos por Photon
(calle/número, barrio/distrito, ciudad, departamento y país), omitiendo con criterio los
componentes ausentes y evitando repetir componentes idénticos.

#### R14 — Resultado de la búsqueda (Evento)

CUANDO Photon devuelve una coincidencia para una búsqueda, el BFF DEBE responder con su latitud,
su longitud y la etiqueta de dirección formateada.

#### R15 — Sugerencias sin resultados (Evento)

CUANDO Photon no devuelve coincidencias para una consulta de sugerencias, el BFF DEBE responder
con una lista vacía.

#### R16 — Consulta inválida (Error)

SI falta el texto de búsqueda o de sugerencias, o el texto no alcanza el mínimo de caracteres
exigido, ENTONCES el BFF DEBE responder `400` con un mensaje claro en español.

#### R17 — Coordenadas inválidas (Error)

SI en la geocodificación inversa faltan la latitud o la longitud, no son numéricas, están fuera
de rango o caen fuera de Colombia, ENTONCES el BFF DEBE responder `400` con un mensaje claro en
español.

#### R18 — Sin coincidencia (Error)

SI una búsqueda o una geocodificación inversa no encuentra coincidencia, ENTONCES el BFF DEBE
responder `404` con un mensaje claro en español.

#### R19 — Fallo del proveedor (Error)

SI Photon falla o no responde, ENTONCES el BFF DEBE responder con un error controlado y un
mensaje claro en español, sin exponer el detalle técnico.

### Sugerencias al escribir

#### R20 — Sugerencias con espera mínima (Evento)

MIENTRAS el usuario escribe en el campo Dirección, el sistema DEBE pedir sugerencias solo tras un
breve intervalo sin tecleo y a partir de un mínimo de caracteres, de modo que no se emita una
petición por cada pulsación.

#### R21 — Estado de carga de sugerencias (Estado)

MIENTRAS se están obteniendo las sugerencias, el sistema DEBE indicar el estado de carga.

#### R22 — Estado vacío de sugerencias (Estado)

MIENTRAS la consulta alcanza el mínimo de caracteres y no hay coincidencias, el sistema DEBE
mostrar un estado vacío claro que invite a ubicar el pin manualmente.

#### R23 — Error de sugerencias (Error)

SI falla la obtención de sugerencias, ENTONCES el sistema DEBE mostrar un mensaje claro sin
impedir que el usuario escriba la dirección o ubique el pin manualmente.

#### R24 — Sugerencias navegables por teclado (Ubicuo)

La lista de sugerencias DEBE exponerse como un combobox accesible: el campo DEBE anunciar si la
lista está abierta y qué opción está activa, y el usuario DEBE poder recorrer las opciones con
las flechas, elegir con `Enter` y cerrar la lista con `Escape`.

#### R25 — Selección de una sugerencia (Evento)

CUANDO el usuario elige una sugerencia, el sistema DEBE escribir la etiqueta en el campo
Dirección, centrar el mapa en esas coordenadas y colocar el pin en ellas.

#### R26 — Reutilización de consultas (Ubicuo)

El sistema NO DEBE repetir consultas de sugerencias idénticas ya resueltas.

### Relleno inverso desde el pin

#### R27 — Relleno inverso al hacer clic (Evento)

CUANDO el usuario hace clic en el mapa, el sistema DEBE consultar la geocodificación inversa de
ese punto y escribir la dirección obtenida en el campo Dirección, sobrescribiendo el texto previo.

#### R28 — Relleno inverso al soltar el pin (Evento)

CUANDO el usuario suelta el pin tras arrastrarlo, el sistema DEBE consultar la geocodificación
inversa de la nueva posición y actualizar el campo Dirección con el resultado.

#### R29 — El pin es la fuente de verdad (Ubicuo)

La posición del pin DEBE seguir determinando la latitud y la longitud que se guardan; el relleno
inverso DEBE afectar únicamente al campo Dirección.

#### R30 — Fallo del relleno inverso (Error)

SI el relleno inverso no encuentra dirección o falla, ENTONCES el sistema DEBE conservar la
dirección previa, mostrar un mensaje claro y NO DEBE impedir el guardado por ese motivo.

#### R31 — Interacciones rápidas (Evento)

CUANDO ocurren varias solicitudes de relleno inverso seguidas, el sistema DEBE aplicar únicamente
el resultado de la interacción más reciente.

#### R32 — Aviso al usuario (Ubicuo)

La interfaz del formulario DEBE informar en español que la dirección puede completarse desde el
mapa y que las coordenadas guardadas son siempre las del pin.

### Migración y retiro de Nominatim

#### R33 — Único proveedor (Ubicuo)

Toda la geocodificación (búsqueda por botón, sugerencias e inversa) DEBE usar Photon; el sistema
NO DEBE consultar Nominatim.

#### R34 — Retiro de la integración anterior (Ubicuo)

El sistema NO DEBE conservar el cliente ni los tests de la integración con Nominatim.

### Transversal

#### R35 — Sin dependencias nuevas (Ubicuo)

El sistema NO DEBE incorporar dependencias npm nuevas: Photon es un servicio externo y los mapas
usan `leaflet` y `react-leaflet`, ya instalados.

#### R36 — Separación de capas (Ubicuo)

El sistema DEBE mantener la separación `app/` / `features/` / `shared/`: el BFF en `app/api`, la
lógica de fincas en `features/fincas` y las piezas genéricas en `shared/`, sin que `shared/`
importe de `features/` ni de `app/`.

#### R37 — Mensajes en español (Ubicuo)

Todo mensaje visible al usuario DEBE estar en español y NO DEBE exponer el detalle técnico del
proveedor.

#### R38 — Accesibilidad (Ubicuo)

El campo Dirección y su lista de sugerencias DEBEN ser navegables por teclado, tener foco visible
y exponer los roles y estados ARIA correspondientes; los errores DEBEN anunciarse.

#### R39 — Validación del formulario (Error)

SI el usuario envía el formulario sin dirección o sin ubicación en el mapa, ENTONCES el sistema
DEBE impedir el envío y mostrar el error en el campo correspondiente.

#### R40 — Cobertura de lógica pura (Ubicuo)

El sistema DEBE cubrir con tests Jest de lógica pura —sin red ni render— el parseo de respuestas
de Photon, el formateo de direcciones, el mapeo de sugerencias, la extracción de coordenadas y
los mensajes de error de geocodificación.

---

## Trazabilidad con el alcance acordado

| Requisito | Cubre |
|-----------|-------|
| R1–R5 | Mapas acotados a Colombia (formulario y general) |
| R6–R19 | Búsqueda, sugerencias e inversa por el BFF con Photon (sesión, uso justo, filtro de país, errores) |
| R20–R26 | Autocompletado accesible con espera mínima, estados y selección |
| R27–R32 | Relleno inverso en clic y arrastre, con el pin como fuente de verdad y manejo de error |
| R33–R34 | Migración completa a Photon y retiro de Nominatim |
| R35–R40 | Dependencias, capas, español, accesibilidad, validación y tests |
