# Implementación — Costos embebidos en el detalle del contrato

> Work Item: `2026-09-22_22-16__costos-listado-registro-edicion-y-eliminacion-en-contrato` (`type: feature`)
>
> Estado: **implementado**, pendiente de revisión.

## Resumen

Se implementó el CRUD de costos informativos de un contrato replicando el patrón de
`features/ciclos` y `features/compras`: feature autocontenido (`types`, `schemas`,
`mensajes-error`, `query-keys`, `api/`, `hooks/`, `components/`), BFF propio con la cookie
httpOnly, sección embebida compuesta en `app/` y tests puros. Se ejecutaron las 21 tareas
`T1`–`T21` de `tasks.md` sin modificar la planificación.

Los costos se presentan con un aviso visible de que son informativos y no afectan el
cálculo de la utilidad real, tanto en la sección como en el formulario. El formulario cubre
`tipo` (texto libre con `datalist` de sugerencias), `monto` (numérico > 0, mostrado como
moneda es-CO), `fecha` (solo día, con los helpers de `shared/lib/fechas.ts`) y
`descripcion`. Con el contrato cerrado se deshabilita solo "Agregar costo"; editar y
eliminar permanecen disponibles. Se retiró la ruta global `/costos`, su enlace de menú, su
protección de middleware, el placeholder `CostosProximamente` y la sección "Próximamente:
ciclos y costos" de `ContratoDetalle`.

## Archivos creados

| Archivo | Contenido |
|---------|-----------|
| `features/costos/types.ts` | Alias `Costo`, `PaginaCostos`, `CrearCosto`, `ActualizarCosto` y `FiltrosCostos`. |
| `features/costos/query-keys.ts` | `clavesCostos` (`todas`, `listas()`, `lista(filtros)`). |
| `features/costos/schemas.ts` | `esquemaCosto` (cuatro campos requeridos) y `DatosFormularioCosto`. |
| `features/costos/mensajes-error.ts` | Mensajes de listar, crear, editar y eliminar. |
| `features/costos/api/costos.ts` | `listarCostos`, `crearCosto`, `actualizarCosto`, `eliminarCosto` sobre `createBffClient`. |
| `features/costos/hooks/useCostos.ts` | Consulta paginada con `keepPreviousData`. |
| `features/costos/hooks/useCrearCosto.ts` | Mutación de registro; invalida `clavesCostos.listas()`. |
| `features/costos/hooks/useActualizarCosto.ts` | Mutación de edición; invalida `clavesCostos.listas()`. |
| `features/costos/hooks/useEliminarCosto.ts` | Mutación de borrado; invalida `clavesCostos.listas()`. |
| `features/costos/components/CostoForm.tsx` | Formulario reusable con `datalist` de `tipo`, monto a número, fecha solo-día y aviso informativo. |
| `features/costos/components/CostoFormModal.tsx` | `Modal` + `CostoForm` con títulos de crear/editar. |
| `features/costos/components/EliminarCostoModal.tsx` | Confirmación de borrado en `Modal` (sin `window.confirm`). |
| `features/costos/components/CostosSeccion.tsx` | Sección con aviso, listado paginado, botón deshabilitado, modales y Toast. |
| `features/costos/__tests__/schemas.test.ts` | Tests puros de `esquemaCosto`. |
| `features/costos/__tests__/mensajes-error.test.ts` | Tests puros de los mensajes. |
| `features/costos/__tests__/query-keys.test.ts` | Tests puros de las claves. |
| `app/api/costos/route.ts` | BFF: `GET` listar (con `contrato_id`) y `POST` crear con validación defensiva. |
| `app/api/costos/[id]/route.ts` | BFF: `GET`, `PATCH` (solo campos mutables) y `DELETE`. |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `features/costos/index.ts` | Exporta `CostosSeccion`; se retiró `CostosProximamente`. |
| `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx` | Compone `CostosSeccion` con `contratoId`, `contratoEstado` y `onCambio`. |
| `features/contratos/components/ContratoDetalle.tsx` | Retirada la sección "Próximamente: ciclos y costos" y actualizado el JSDoc. |
| `app/(dashboard)/layout.tsx` | Retirado el enlace "Costos". |
| `middleware.ts` | Retirado `"/costos"` de `RUTAS_PROTEGIDAS` y del `matcher`. |
| `shared/ui/index.ts` | Retirado el export de `Proximamente`. |

## Archivos eliminados

| Archivo | Motivo |
|---------|--------|
| `features/costos/components/CostosProximamente.tsx` | Sustituido por la sección real. |
| `app/(dashboard)/costos/page.tsx` | La ruta global `/costos` sale del alcance. |
| `shared/ui/Proximamente.tsx` | Queda sin consumidores al retirar el último placeholder. |

## Decisiones de implementación relevantes

- **Mensajes de crear y editar separados.** `mensajeErrorCrearCosto` mapea el `404` a
  "El contrato no existe." y `mensajeErrorEditarCosto` a "El costo no existe."; la sección
  elige el mensaje según haya costo en edición. El `400` de ambos explica revisar los datos
  o el estado del contrato. Nunca se muestra el mensaje crudo del backend.
- **BFF del listado sin mensaje específico.** El `GET /api/costos` propaga el código real y
  usa los mensajes base en español de `respuestaError`; la UI de todas formas traduce con
  `mensajeErrorListarCostos`. El `POST` sí lleva el mensaje específico de creación.
- **`monto` con `Intl.NumberFormat` local del feature** (`es-CO`, `COP`,
  `maximumFractionDigits: 0`), sin reutilizar el formateador de `features/ventas` para no
  romper el aislamiento entre features.
- **`tipo` con `datalist`** (`list="tipos-costo"`) y sugerencias flete, alimentación,
  medicina y veterinaria, sin restringir el valor.

## Verificación

Evidencia ejecutada sobre el árbol final.

| Checkpoint | Comando | Resultado | Observaciones |
|------------|---------|-----------|---------------|
| `V1` | `npm run format:check` | Pasa | "All matched files use Prettier code style!". Antes se ejecutó `npm run format` para normalizar. |
| `V2` | `npm run lint` | Pasa | ESLint sin salida, código de salida 0. |
| `V3` | `npm run typecheck` | Pasa | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | Pasa | 37 suites, 330 tests, 0 fallos. Incluye los 3 archivos de test nuevos del feature. |
| `V5` | Validación manual | Pendiente (usuario) | Guion abajo. |

`bash .rei/init.sh` se ejecutó en verde en los cuatro checkpoints y con código de salida 0.

### Nota sobre `V3`

El primer `typecheck` falló por un artefacto **generado** obsoleto:
`.next/types/validator.ts` todavía importaba `app/(dashboard)/costos/page.js`, la ruta
eliminada en `T14`. No era un error de código fuente. Se retiró el directorio generado
`.next/types` y el servidor de desarrollo regeneró `.next/dev/types` a partir de las rutas
actuales (incluidas las nuevas `app/api/costos/*`); con ello `tsc --noEmit` pasa. No se
modificó ningún archivo fuente para resolverlo.

### Guion de `V5` (validación manual)

Con el entorno de desarrollo (`npm run dev`) y sesión iniciada:

1. Abrir `/contratos` y entrar al detalle de un contrato **activo**.
2. **Listar:** la sección "Costos" aparece junto a compras, ciclos y ventas, con el aviso
   "Los costos son informativos y no afectan el cálculo de la utilidad real." y la tabla con
   fecha, tipo, monto (moneda es-CO) y descripción.
3. **Registrar:** pulsar "Agregar costo"; el modal pide tipo (con sugerencias al enfocar),
   monto, fecha y descripción. Enviar vacío y comprobar los mensajes de validación en
   español. Enviar datos válidos y confirmar el Toast "Costo registrado." y la aparición de
   la fila.
4. **Editar:** pulsar "Editar" en una fila, comprobar la precarga (fecha en formato día),
   cambiar datos y guardar; verificar el Toast "Costo actualizado.".
5. **Eliminar:** pulsar "Eliminar", confirmar en el modal (no debe abrirse `window.confirm`)
   y verificar el Toast "Costo eliminado.".
6. **Contrato cerrado:** en un contrato `cerrado`, comprobar que "Agregar costo" está
   deshabilitado con el aviso correspondiente y que "Editar" y "Eliminar" siguen
   disponibles.
7. **Errores:** forzar un `400`/`404` (por ejemplo, cerrando el contrato desde otra sesión
   antes de guardar) y verificar que se muestra el mensaje en español, sin texto crudo del
   backend.
8. **Ruta retirada:** confirmar que `/costos` ya no existe, no aparece en el menú y que el
   detalle del contrato no muestra "Próximamente: ciclos y costos".

## Observaciones

- Sin dependencias nuevas y sin cambios en `shared/api/openapi/schema.d.ts`: los DTOs de
  costos ya estaban generados.
- `features/costos` no importa de otros features; la composición de `CostosSeccion` ocurre
  en `app/`.
- No queda código muerto: `Proximamente` se eliminó junto con su export al no tener más
  consumidores.
