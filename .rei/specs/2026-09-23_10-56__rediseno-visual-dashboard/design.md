# Diseño

## Estrategia

Aplicar los tokens visuales ya disponibles (`elinain-bg`, `elinain-surface`, `elinain-muted`, `elinain-gold`), `glass-panel` y las fuentes cargadas por el layout raíz. La composición se mantiene dentro del layout protegido, la página del dashboard y los componentes de su feature; no se modifica el contrato de datos ni la consulta.

## Archivos y componentes afectados

- `app/(dashboard)/layout.tsx`: adaptar cabecera, navegación y fondo del área protegida al tema oscuro. Se conservan todos los `href` y `LogoutButton`.
- `app/(dashboard)/dashboard/page.tsx`: establecer el encabezado de la página, una introducción breve y una composición visual para los enlaces de reportes existentes.
- `app/(dashboard)/loading.tsx`: alinear el fallback de ruta con el ancho, espaciado y superficies oscuras del dashboard.
- `features/dashboard/components/ResumenDashboard.tsx`: conservar `useReporteDashboard`, formateadores y ramas de consulta; agrupar visualmente las métricas existentes en resultado financiero y operación, y adaptar carga/error al nuevo lenguaje.
- `features/dashboard/components/TarjetaResumen.tsx`: reemplazar las clases claras por variantes oscuras con jerarquía tipográfica consistente, usando dorado con moderación y glassmorphism solo donde corresponda.

`shared/ui/Skeleton.tsx` no debe cambiar globalmente: sus usos fuera del dashboard podrían pertenecer a pantallas claras. En el dashboard se deben sobrescribir sus clases mediante `className` o resolver el contraste localmente.

## Decisiones de diseño

- La utilidad real mantiene el mayor peso visual, con cifra en `font-display`, color dorado y superficie elevada.
- Las utilidades bruta y de terceros se presentan juntas como resultado financiero secundario.
- Contratos, animales, ventas y costos se presentan como resumen operativo, sin convertir sus valores en nuevos indicadores calculados.
- Los textos de sección y apoyo son estáticos y descriptivos; no representan datos adicionales ni requieren cambios de API.
- Los enlaces de reportes se mantienen como enlaces semánticos con foco visible y estados hover/focus en dorado; no se convierten en botones ni se añade interacción nueva.
- El glassmorphism se limita al bloque protagonista o a superficies puntuales del resumen. Las tarjetas operativas usan superficies carbón opacas para preservar legibilidad.
- La navegación se mantiene en la cabecera actual y se adapta con flex-wrap/overflow y espaciado responsive; no se introduce menú móvil ni estado de cliente nuevo.
- No se añade una librería de iconos, gráficos, fuente ni componentes externos: el alcance es visual y se resuelve con Tailwind y componentes existentes.

## Restricciones

- No cambiar hooks, API, tipos, query keys, formateadores, mensajes de error ni lógica de estados.
- No añadir métricas derivadas, gráficos funcionales, filtros, acciones, endpoints o persistencia.
- Mantener la arquitectura feature-first y las reglas de accesibilidad del proyecto.
