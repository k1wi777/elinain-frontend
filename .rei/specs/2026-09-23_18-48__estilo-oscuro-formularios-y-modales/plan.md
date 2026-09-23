Objetivo

Alinear visualmente todos los formularios y modales con la estética oscura premium del shell y añadir glassmorphism a los modales, centralizando el cambio en los controles compartidos de `shared/ui`: `Input`, `Select` y `Modal` pasan a oscuro por defecto y el `Button` `secundario` (Cancelar) se vuelve legible sobre el tema oscuro. Después se corrigen únicamente los textos, tarjetas y desplegables que aún usan colores claros en los flujos de terceros, fincas, contratos, compras, ciclos, costos y ventas. Se conservan intactos la lógica de formularios, las validaciones zod, `react-hook-form`, hooks, `api/`, `schemas.ts`, queries, mutaciones, rutas, mensajes, textos funcionales y accesibilidad.

Archivos

- `shared/ui/Input.tsx`, `shared/ui/Select.tsx`, `shared/ui/Modal.tsx`, `shared/ui/Button.tsx`.
- `features/fincas/components/FincaDetalleModal.tsx` (solo para retirar `tema="oscuro"` si se elimina la prop `tema`).
- Terceros: `features/terceros/components/TerceroForm.tsx`, `EliminarTerceroModal.tsx`.
- Fincas: `features/fincas/components/FincaForm.tsx`, `FincaCrear.tsx`, `FincaEditar.tsx`, `EliminarFincaModal.tsx`, `AutocompletarDireccion.tsx`, `SelectorMapa.tsx`.
- Contratos: `features/contratos/components/ContratoForm.tsx`, `ContratoCrear.tsx`, `ContratoEditar.tsx`.
- Compras: `features/compras/components/CompraForm.tsx`, `EliminarCompraModal.tsx` (`CompraFormModal.tsx` solo se verifica).
- Ciclos: `features/ciclos/components/CicloForm.tsx`, `EliminarCicloModal.tsx` (`CicloFormModal.tsx` solo se verifica).
- Costos: `features/costos/components/CostoForm.tsx`, `EliminarCostoModal.tsx` (`CostoFormModal.tsx` solo se verifica).
- Ventas: `features/ventas/components/VentaForm.tsx`, `ResultadoVentaModal.tsx` (`VentaFormModal.tsx` solo se verifica).
- Wrappers de página con estilos claros: `app/(dashboard)/fincas/_components/nueva-con-propietarios.tsx`, `app/(dashboard)/fincas/_components/editar-con-propietarios.tsx`, `app/(dashboard)/contratos/_components/nuevo-con-relaciones.tsx`, `app/(dashboard)/contratos/_components/editar-con-relaciones.tsx`.
- `app/(dashboard)/fincas/nueva/page.tsx`, `.../fincas/[id]/editar/page.tsx`, `.../contratos/nuevo/page.tsx`, `.../contratos/[id]/editar/page.tsx`: son Server Components delgados; no se prevén cambios, solo verificar que el contenedor siga correcto.

Cambios

1. `shared/ui/Input.tsx` — base oscura por defecto. `label` a `text-zinc-300`; control `rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-elinain-gold focus:ring-2 focus:ring-elinain-gold/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`; error `border-red-500/60 focus:border-red-500 focus:ring-red-500/40` y mensaje `text-sm text-red-400`. Añadir `[color-scheme:dark]` para que el picker nativo de `date`/`datetime-local` y el autofill de Chrome se vean oscuros, y neutralizar el autofill con `[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_var(--elinain-surface)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]` (documentado como parte del control). Mantener exactamente `useId`, `aria-invalid`, `aria-describedby` y la firma pública. No añadir dependencias.
2. `shared/ui/Select.tsx` — misma base oscura que `Input` y mismos estados de error; añadir `[&>option]:bg-elinain-surface [&>option]:text-white` y `[color-scheme:dark]` para oscurecer las `option` nativas. Mantener `useId`, `aria-invalid`, `aria-describedby` y la firma pública.
3. `shared/ui/Modal.tsx` — tema oscuro con glassmorphism por defecto. Retirar la prop `tema` y su variante clara porque, tras revisar los consumidores, el único que la usa explícitamente es `FincaDetalleModal` (`tema="oscuro"`) y no queda ningún consumidor de la variante clara; esto simplifica la API pública. Aplicar `glass-panel rounded-2xl` sobre `text-zinc-200` (la utilidad `glass-panel` de `app/globals.css` ya aporta borde `white/6`, fondo semitransparente, sombra y `backdrop-blur`); cabecera y pie con `border-white/8`; título `text-white`; botón "Cerrar" `border-white/8 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08] hover:text-white focus-visible:ring-elinain-gold`; backdrop `backdrop:bg-black/60 backdrop:backdrop-blur-sm`. Si se prefiere no retirar la prop, conservarla con default `"oscuro"`; no dejar ambas variantes con default claro. No romper el comportamiento nativo de `<dialog>` (`showModal`, foco atrapado, `Escape`, `aria-modal`, restauración de foco).
4. `shared/ui/Button.tsx` — variante `secundario` oscura por defecto: `border border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08] focus-visible:ring-elinain-gold`. `primario` y `peligro` se conservan; los overrides oscuros que ya pasan algunos consumidores pueden quedar (tailwind-merge los resuelve).
5. Formularios y páginas — sustituir textos/tarjetas claros por equivalentes oscuros conservando estructura, textos en español, `noValidate`, orden de campos y los `role="alert"` existentes: títulos `text-white`; descripciones y notas `text-zinc-400`; errores generales `text-red-400`; contenedores `border-white/8 bg-white/[0.03]` (nota informativa de `CostoForm`, placeholder de carga del mapa en `FincaForm`, borde de `SelectorMapa`). En `AutocompletarDireccion`, el desplegable de sugerencias pasa a superficie oscura (`rounded-md border border-white/10 bg-elinain-surface shadow-2xl`), opciones `text-zinc-200` y opción activa `bg-elinain-gold/15 text-white`; conservar roles y comportamiento de teclado. En `ResultadoVentaModal`, `text-zinc-900` → `text-white`.
6. Modales de eliminación (socio, finca, compra, ciclo, costo) — adaptar los párrafos a `text-zinc-300` y los errores a `text-red-400`; conservar el botón "Eliminar" en `peligro` y las advertencias.
7. `FincaDetalleModal` — si se retira la prop `tema`, eliminar el `tema="oscuro"` y comprobar que el detalle sigue correcto (ya usa clases oscuras propias).

Restricciones

- No cambiar lógica de formularios, validaciones zod, `react-hook-form`, props públicas de los formularios, hooks, `api/`, `schemas.ts`, queries, mutaciones, rutas, mensajes ni textos funcionales (salvo color).
- Mantener accesibilidad: `<label>` asociado, `aria-invalid`/`aria-describedby`, foco visible, cierre con `Escape`, foco atrapado y `aria-modal` en los modales.
- No añadir dependencias ni tocar el backend.
- No modificar los flujos ya rediseñados (auth, listados, detalle, dashboard, reportes) salvo lo imprescindible para que los controles compartidos no rompan su apariencia; verificar que `FincaDetalleModal` y el filtro de `VentasListado` (que ya pasa overrides oscuros y `[&>option]`) sigan correctos.
- No tocar `features/auth/*` (usa su propio `AuthField`).
- `CompraFormModal`, `CicloFormModal`, `CostoFormModal` y `VentaFormModal` no contienen estilos claros propios: con el `Modal` oscuro por defecto quedan alineados; solo verificar.

Pasos

1. [x] Actualizar `shared/ui/Input.tsx` (base oscura, label, error y autofill de Chrome) manteniendo accesibilidad y firma.
2. [x] Actualizar `shared/ui/Select.tsx` (base oscura, `option` y `color-scheme` nativos) manteniendo accesibilidad y firma.
3. [x] Actualizar `shared/ui/Modal.tsx` a tema oscuro con glassmorphism y retirar la prop `tema` y su variante clara; ajustar `FincaDetalleModal` en consecuencia.
4. [x] Actualizar la variante `secundario` de `shared/ui/Button.tsx`.
5. [x] Alinear `TerceroForm` y `EliminarTerceroModal` al tema oscuro.
6. [x] Alinear `FincaForm`, `FincaCrear`, `FincaEditar`, `EliminarFincaModal`, `AutocompletarDireccion` y `SelectorMapa` al tema oscuro.
7. [x] Alinear `ContratoForm`, `ContratoCrear` y `ContratoEditar` al tema oscuro.
8. [x] Alinear `CompraForm`, `CicloForm` y `CostoForm` y sus modales de eliminación al tema oscuro.
9. [x] Alinear `VentaForm` y `ResultadoVentaModal` al tema oscuro; verificar `VentaFormModal`.
10. [x] Alinear los wrappers `_components` de fincas y contratos (`text-red-600` y textos de carga) al tema oscuro.
11. [x] Ejecutar V1 (`npm run format:check`), V2 (`npm run lint`), V3 (`npm run typecheck`) y V4 (`npm test`), y documentar el resultado en `impl.md`.
12. [ ] Completar V5 (validación manual del usuario) sobre `/terceros`, `/fincas/nueva`, `/fincas/[id]/editar`, `/contratos/nuevo`, `/contratos/[id]/editar` y las pestañas del detalle de contrato (compras, ciclos, costos, ventas), comprobando formularios en modales, botones Cancelar/Guardar/Eliminar, desplegables, mensajes de error y cierre con `Escape`; rutas protegidas, no las ejecuta el agente.
