# Design — Ciclos embebidos en el detalle del contrato

## Estrategia

Se replica la estructura del feature `compras`, que ya resuelve una sección embebida en el
detalle del contrato con listado paginado, alta/edición en modal, borrado confirmado y BFF
con cookie httpOnly. El feature `ciclos` es autocontenido: declara sus tipos, `api/`,
`hooks/`, `schemas.ts`, `mensajes-error.ts`, `query-keys.ts` y componentes. La composición
ocurre en `app/`, y el estado del contrato llega como prop para que `features/ciclos` no
importe de `features/contratos`.

## Archivos nuevos

| Archivo | Propósito |
|---------|-----------|
| `features/ciclos/types.ts` | Alias de DTOs (`Ciclo`, `PaginaCiclos`, `CrearCiclo`, `ActualizarCiclo`) y `FiltrosCiclos`. |
| `features/ciclos/api/ciclos.ts` | `listarCiclos`, `crearCiclo`, `actualizarCiclo`, `eliminarCiclo` sobre `createBffClient`. |
| `features/ciclos/query-keys.ts` | `clavesCiclos` con patrón `['ciclos', 'list', filtros]`. |
| `features/ciclos/hooks/useCiclos.ts` | Consulta paginada con `keepPreviousData`. |
| `features/ciclos/hooks/useCrearCiclo.ts` | Mutación de registro; invalida `clavesCiclos.listas()`. |
| `features/ciclos/hooks/useActualizarCiclo.ts` | Mutación de edición con `{ id, datos }`. |
| `features/ciclos/hooks/useEliminarCiclo.ts` | Mutación de eliminación por `id`. |
| `features/ciclos/schemas.ts` | `esquemaCiclo` y `DatosFormularioCiclo`. |
| `features/ciclos/mensajes-error.ts` | Traducción de estado HTTP a mensajes en español. |
| `features/ciclos/components/CiclosSeccion.tsx` | Sección embebida: listado, modales y toasts. |
| `features/ciclos/components/CicloForm.tsx` | Formulario reusable de registro/edición. |
| `features/ciclos/components/CicloFormModal.tsx` | `Modal` + `CicloForm`. |
| `features/ciclos/components/EliminarCicloModal.tsx` | Confirmación de borrado con `Modal`. |
| `app/api/ciclos/route.ts` | BFF: GET (listar) y POST (crear). |
| `app/api/ciclos/[id]/route.ts` | BFF: GET, PATCH y DELETE. |
| `features/ciclos/__tests__/schemas.test.ts` | Tests de `esquemaCiclo`. |
| `features/ciclos/__tests__/mensajes-error.test.ts` | Tests de los mensajes por estado. |
| `features/ciclos/__tests__/query-keys.test.ts` | Tests de `clavesCiclos`. |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `shared/lib/fechas.ts` | Añadir `fechaDiaAIso`, `isoAFechaDia` y `formatearFechaDia` (solo día). |
| `shared/lib/__tests__/fechas.test.ts` | Tests de los tres helpers nuevos. |
| `features/ciclos/index.ts` | Exportar `CiclosSeccion`; retirar `CiclosProximamente`. |
| `features/contratos/index.ts` | Exportar `useContrato` para que `app/` obtenga el estado del contrato. |
| `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx` | Componer `CiclosSeccion` con `contratoEstado` y `onCambio`. |
| `app/(dashboard)/layout.tsx` | Eliminar el enlace `/ciclos` del menú. |

## Archivos eliminados

- `app/(dashboard)/ciclos/page.tsx` — ruta global fuera de alcance (R26).
- `features/ciclos/components/CiclosProximamente.tsx` — placeholder que queda huérfano.

## Decisiones de diseño

1. **Helpers de fecha solo-día en `shared/lib/fechas.ts`.** Son genéricos y sin dominio, por
   lo que siguen la convención de utilidades transversales y se reutilizan desde cualquier
   listado de días. Se fija la zona del negocio (Colombia, UTC−5) igual que los helpers
   existentes:
   - `fechaDiaAIso("2026-09-21")` → `"2026-09-21T05:00:00.000Z"` (inicio del día en
     Colombia); `""` si el valor no es `YYYY-MM-DD` o no es una fecha real.
   - `isoAFechaDia("2026-09-22T02:00:00.000Z")` → `"2026-09-21"`; `""` si el ISO es inválido.
   - `formatearFechaDia(iso)` → `"DD/MM/AAAA"` en zona Colombia; `""` si el ISO es inválido.

2. **Contrato de `CiclosSeccion`.** `type Props = { contratoId: string; contratoEstado?: "activo" | "cerrado"; onCambio?: () => void }`. El botón de registrar se
   deshabilita solo con `contratoEstado === "cerrado"` (R8). Editar y eliminar nunca se
   deshabilitan (R16, R20). El feature no importa `features/contratos`.

3. **Origen del estado en `app/`.** `DetalleConRelaciones` usa `useContrato(id)` y pasa
   `contratoEstado={contrato.data?.estado}`. Como `ContratoDetalle` ya consulta
   `clavesContratos.detalle(id)`, TanStack Query deduplica la petición. Por eso se exporta
   `useContrato` desde el barrel de `contratos`.

4. **Invalidación.** Las mutaciones de ciclos invalidan `clavesCiclos.listas()`. Tras el
   éxito, la sección invoca `onCambio?.()`, y `app/` invalida `clavesContratos.todas` para
   refrescar los derivados del contrato (R15, R18, R21), igual que compras y ventas.

5. **Formulario único.** `CicloForm` sirve a ambos modos. `fecha` con `type="date"`; al
   enviar se convierte con `fechaDiaAIso`; al precargar se convierte con `isoAFechaDia`.
   `peso_observado` opcional se omite del payload si queda vacío; `notas` vacío se envía como
   `null` y con texto se recorta. No se añade `textarea`: se reutiliza `Input` de
   `shared/ui`.

6. **Paginación.** Se reutilizan `usePagination`, `calcularTotalPaginas`, `calcularPagina` y
   `normalizarPagina` de `shared/api`, con `TOTAL_PROVISIONAL` como en compras.

7. **Errores.** `mensajes-error.ts` mapea por estado HTTP (nunca el cuerpo del backend):
   - Listar: `0` → conexión; resto → "No se pudo cargar el listado de ciclos. Inténtalo de
     nuevo.".
   - Guardar: `400` → "No se pudo guardar el ciclo: revisa los datos o verifica que el
     contrato no esté cerrado."; `404` → "El ciclo no existe."; `0` → conexión; resto →
     "No se pudo guardar el ciclo. Inténtalo de nuevo.".
   - Eliminar: `400` → "No se pudo eliminar el ciclo: revisa la solicitud o verifica el
     estado del contrato."; `404` → "El ciclo no existe."; `0` → conexión; resto →
     "No se pudo eliminar el ciclo. Inténtalo de nuevo.".
   Los Route Handlers devuelven mensajes controlados en español vía `respuestaError`.

8. **BFF.** Se copia el patrón de `app/api/compras`: `GET` normaliza `limite`/`offset` con
   `normalizarLimite` y añade `contrato_id` solo si llega; `POST` valida de forma defensiva
   `contrato_id`, `fecha`, `peso_observado` (positivo si viene) y `notas` (texto o `null`);
   `[id]/route.ts` valida los campos opcionales mutables y exige al menos uno en `PATCH`.
   `GET` y `DELETE` conservan el código real del backend.

## Alternativas descartadas

- **Listado global `/ciclos`**: fuera de alcance; el ciclo solo tiene sentido dentro de un
  contrato (R26).
- **Que `features/ciclos` consulte `features/contratos`** para leer el estado: rompe el
  aislamiento entre features; el estado se compone en `app/`.
- **`window.confirm`**: descartado por accesibilidad y coherencia de UI; se reutiliza `Modal`.
- **`datetime-local` para la fecha**: el checkpoint es diario; el alcance pide solo día.
- **Duplicar conversiones de fecha dentro del feature**: son genéricas y van en `shared/lib`.

## Fuera de alcance

- Listado global de ciclos, módulo de costos y cualquier cálculo de rentabilidad.
- Actualización del OpenAPI local: los DTOs de ciclos ya existen.
- Tests de componentes o hooks con render (`V5`, validación manual).
