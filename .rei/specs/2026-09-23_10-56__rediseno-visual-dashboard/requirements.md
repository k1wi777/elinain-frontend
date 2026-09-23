# Requisitos

## R1 — Lenguaje visual del área protegida

El dashboard DEBE utilizar el lenguaje visual ya establecido en landing, login y registro: fondo casi negro, superficies carbón, acento dorado/ámbar único, tipografía Inter para interfaz y tipografía de display para cifras destacadas, con glassmorphism limitado a las tarjetas de resumen.

## R2 — Composición del layout autenticado

El layout protegido DEBE presentar una cabecera y un área de contenido coherentes con el tema oscuro, conservar los enlaces actuales de navegación y conservar el acceso actual al cierre de sesión.

## R3 — Jerarquía informativa del resumen

CUANDO el resumen se cargue correctamente, el dashboard DEBE organizar las métricas existentes en una jerarquía visual clara: utilidad real del comerciante como indicador protagonista, utilidades acumuladas como resultado financiero secundario y conteos/costos como información operativa complementaria.

## R4 — Navegación de reportes

El dashboard DEBE mostrar los accesos existentes a contratos activos e historial de ventas como acciones visualmente distinguibles, manteniendo sus destinos y comportamiento de navegación actuales.

## R5 — Estado de carga

MIENTRAS se carga el resumen, el dashboard DEBE mostrar un skeleton oscuro que anticipe la misma composición visual de encabezado, indicador protagonista y grupos de tarjetas, sin alterar la consulta ni introducir contenido funcional nuevo.

## R6 — Estado de error

SI la consulta del resumen falla, ENTONCES el dashboard DEBE mostrar el mensaje de error existente dentro de una superficie coherente con el tema oscuro y mediante una alerta accesible, sin exponer detalles técnicos ni cambiar el manejo de la consulta.

## R7 — Adaptabilidad y accesibilidad visual

El dashboard DEBE conservar una lectura usable en móvil y escritorio, jerarquía semántica de encabezados y navegación, foco visible en enlaces y controles, y contraste suficiente entre texto, cifras y superficies.

## R8 — Conservación del comportamiento

El rediseño DEBE conservar el hook, los datos, los formateadores, los estados de consulta, las rutas, los destinos de navegación y el cierre de sesión existentes; no DEBE crear endpoints, dependencias ni funcionalidades nuevas.
