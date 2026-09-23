Objetivo

Refinar visualmente el dashboard existente tomando `public/assets/ejemplo1.jpeg` como referencia de composición y densidad, manteniendo el estilo oscuro, minimalista y premium de Elinain. El cambio será exclusivamente visual y conservará las métricas, rutas y estados que ya expone la aplicación.

Archivos

- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/loading.tsx`
- `app/(dashboard)/dashboard-styles.ts`
- `features/dashboard/components/ResumenDashboard.tsx`
- `features/dashboard/components/TarjetaResumen.tsx`

Cambios

- Reordenar y ajustar el espaciado del encabezado y de los accesos a reportes para lograr una composición más compacta y clara, conservando exactamente `/reportes/contratos-activos` y `/reportes/historial-ventas`.
- Dar mayor presencia al bloque financiero: una tarjeta principal para `Utilidad real acumulada` y una agrupación secundaria equilibrada para `Utilidad bruta acumulada` y `Utilidad de terceros acumulada`.
- Refinar el resumen operativo mediante una rejilla responsive más intencional, etiquetas más legibles, cifras con mejor contraste y detalles de interacción discretos cuando corresponda.
- Sustituir fondos degradados o excesivamente translúcidos de las tarjetas por superficies sólidas carbón, con bordes, sombras y acentos dorados sutiles; reservar el glassmorphism para elementos puntuales ya contemplados por el sistema visual.
- Alinear navegación, foco visible, estados hover, skeletons y mensaje de error con la nueva jerarquía sin cambiar su comportamiento ni añadir rutas o acciones.
- Mantener una lectura correcta en móvil, tablet y escritorio, evitando desbordamientos de navegación, tarjetas o valores monetarios.

Restricciones

- No modificar hooks, API, tipos, formateadores, queries, permisos, persistencia, estados de consulta ni lógica de negocio.
- No añadir dependencias ni nuevas funcionalidades.
- Usar únicamente las métricas existentes: contratos activos, contratos cerrados, animales en inventario, ventas registradas, costos informativos, utilidad real, utilidad bruta y utilidad de terceros.
- No inventar contratos, pesos, porcentajes, fechas, perfiles, indicadores, estados adicionales ni datos derivados que el backend no entregue.
- No incorporar secciones de la referencia que requieran datos ausentes; los accesos de reportes existentes pueden presentarse como navegación visual, no como nuevos módulos.
- Mantener semántica, accesibilidad, foco visible y las rutas actuales.

Pasos

1. Ajustar la composición de `page.tsx` y el shell del dashboard para acercar jerarquía, densidad, navegación y responsive a la referencia sin cambiar enlaces ni contenido funcional.
2. Reorganizar visualmente `ResumenDashboard` y `TarjetaResumen`, priorizando el bloque financiero y refinando la rejilla operativa con superficies sólidas.
3. Sincronizar `loading.tsx`, estados de error y utilidades de foco/estilo con la composición final.
4. Verificar que no haya degradados en fondos de tarjetas, que los ocho valores sigan usando sus formateadores actuales y que la navegación y los breakpoints conserven su comportamiento.
5. Ejecutar formato, lint, typecheck y la suite de tests; realizar validación visual manual del dashboard en móvil y escritorio.
