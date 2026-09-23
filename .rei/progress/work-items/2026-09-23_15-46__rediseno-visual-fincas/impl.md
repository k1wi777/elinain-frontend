# Implementación — Rediseño visual de fincas

## Alcance realizado

Se refinó visualmente la ruta `/fincas` (pestañas Listado y Mapa) con la composición oscura
premium ya usada en socios de participación y el dashboard, sin alterar comportamiento,
rutas, datos ni lógica de negocio. Todo el trabajo se ejecutó sobre los pasos de `plan.md`
(Caso B), en orden.

## Archivos modificados

- `app/(dashboard)/fincas/page.tsx`
- `app/(dashboard)/fincas/loading.tsx`
- `app/(dashboard)/fincas/_components/listado-con-propietarios.tsx`
- `features/fincas/components/FincasTabs.tsx`
- `features/fincas/components/FincasTable.tsx`
- `features/fincas/components/FincasMapa.tsx`
- `features/fincas/components/FincaDetalleModal.tsx`
- `shared/ui/Modal.tsx`
- `app/globals.css`

## Cambios realizados

- **Encabezado y control de vistas** (`page.tsx`, `FincasTabs`): `page.tsx` queda como
  contenedor delgado `mx-auto w-full max-w-7xl`; `FincasTabs` compone el eyebrow dorado, el
  `h1` "Fincas" (con `aria-labelledby`), la descripción y el CTA `Nueva finca`
  (`href="/fincas/nueva"`, estilos del CTA de socios). El `tablist` subrayado se reemplazó
  por un control segmentado tipo píldora `Listado | Mapa`, conservando `role="tab"`,
  `aria-selected`, `aria-controls`, el estado local `vista` y la carga diferida del mapa
  (`dynamic` con `ssr: false`).
- **Resumen real** (`FincasTable`): dos tarjetas `glass-panel` con `total` (fincas
  registradas) y `filas.length` (filas visibles en la página actual), más su texto
  informativo. Muestran `—` durante carga o error. No se añadieron métricas, búsqueda ni
  filtros.
- **Tabla** (`FincasTable`): `Table` con `tema="oscuro"`; columnas intactas
  Nombre/Dirección/Propietario/Acciones, enriquecidas solo en presentación con datos reales:
  avatar de iniciales en Nombre y Propietario, icono de ubicación en Dirección y acciones
  `Editar` (`/fincas/[id]/editar`) y `Eliminar` restilizadas como en socios. La clave de fila
  sigue siendo `finca.id`.
- **Estados** (`listado-con-propietarios.tsx`, `FincasTable`, `FincasMapa`, `loading.tsx`):
  carga y vacío en tono oscuro, error en panel rojo tenue, y `loading.tsx` recompuesto con la
  estructura final (encabezado, CTA, control segmentado, resumen y tabla oscura) para no
  provocar saltos de layout.
- **Mapa** (`FincasMapa`, `FincaDetalleModal`, `globals.css`): contenedor como superficie
  carbón con borde y sombra, popup oscuro acotado mediante la clase `.mapa-fincas` en
  `globals.css`, y detalle como panel oscuro. Se conservan `MapContainer`, `TileLayer`,
  `AjustarVista`, `useTodasLasFincas`, los pines, el `Popup` con "Ver detalle" y
  `FincaDetalleModal`; el detalle solo muestra nombre, propietario, dirección y coordenadas
  con la acción `Editar` existente.
- **Componente compartido** (`shared/ui/Modal.tsx`): se añadió la prop visual opcional
  `tema` (`"claro" | "oscuro"`) con `"claro"` por defecto. No cambia el comportamiento de
  ningún consumidor actual. `Table`/`TablePagination` ya disponían de `tema="oscuro"` y se
  reutilizaron sin cambios.

## Restricciones respetadas

- No se tocaron hooks, API, tipos de dominio, queries, mutaciones, paginación, rutas,
  permisos, toasts ni mensajes funcionales.
- No se alteraron el alta, la edición ni la eliminación, ni las columnas lógicas, el orden de
  datos o las acciones de fila. Se conservan `/fincas/nueva` y `/fincas/[id]/editar`.
- No se añadieron búsqueda, filtros, exportación, pestañas nuevas, dependencias ni métricas
  ausentes del DTO `FincaRespuestaDto`.
- La única información mostrada es `total`, `filas.length`, `nombre`, `direccion`,
  propietario resuelto y `latitud`/`longitud`.
- Se conservó la composición de propietarios que resuelve `app/` y la carga diferida del mapa.

## Verificación

- **V1 — Pasa**: `npm run format:check` → "All matched files use Prettier code style!".
- **V2 — Pasa**: `npm run lint` → sin errores.
- **V3 — Pasa**: `npm run typecheck` (`tsc --noEmit`) → sin errores.
- **V4 — Pasa**: `npm test` → 44 suites y 366 tests en verde. El bloqueo por
  `Could not parse output from TypeScript's --showConfig` observado en el Work Item previo no
  se reprodujo en este entorno.
- **V5 — Pendiente de validación manual del usuario.** No es ejecutable por el agente porque
  `/fincas` está protegida por `middleware.ts` y requiere una sesión válida contra el
  backend. Revisar en el entorno de desarrollo:
  1. `/fincas` pestaña **Listado**: encabezado, CTA `Nueva finca`, control segmentado, resumen
     `total`/`filas.length`, tabla oscura con avatares e icono de ubicación, acciones
     `Editar`/`Eliminar`, paginación, modales y toast.
  2. Pestaña **Mapa**: contenedor oscuro, pines, popup oscuro con "Ver detalle" y panel de
     detalle oscuro con solo nombre/propietario/dirección/coordenadas y acción `Editar`.
  3. Responsive: en móvil el CTA y el control segmentado ocupan el ancho completo y la tabla
     desplaza horizontalmente; en escritorio el encabezado se alinea a los extremos.
  4. Estados: vacío, error de API y carga (`loading.tsx`).

- **`bash .rei/init.sh` — Pasa**: sale con código 0 y reporta `V1`–`V4` en verde.

## Observaciones

- El resumen (`total` y `filas.length`) vive dentro de `FincasTable`, porque son valores
  paginados que solo conoce `useFincas`; por eso se muestra en la pestaña Listado y no en la
  Mapa. No se movió la consulta ni la paginación para no alterar la lógica existente.
- El "panel lateral oscuro" del detalle se implementó como panel `Modal` oscuro centrado,
  conservando el comportamiento accesible nativo de `<dialog>` (foco, `Escape`, `aria-modal`)
  en lugar de reposicionarlo, para no alterar el comportamiento de los modales.

## Estado

Implementación lista para revisión.
