# Implementación — Contratos: listado filtrable, apertura, detalle y edición de campos mutables

> Work Item: `2026-09-22_11-56__contratos-listado-filtro-detalle-y-edicion` (`type: feature`)
> Agente: Implementer · Fecha: 2026-09-22

---

## Resumen

Se implementó el alcance completo de la especificación (R1–R50, D1–D13, T1–T15):
BFF de contratos, feature `contratos` autocontenido (tipos, utilidades puras, esquemas,
API, hooks y componentes), ampliación mínima de `features/fincas`, composición y páginas
en `app/`, rutas protegidas y navegación, y tests Jest de lógica pura. No se añadieron
dependencias ni se tocó el OpenAPI, `shared/ui`, ESLint, Prettier ni Jest.

## Archivos

### Nuevos

- `app/api/contratos/route.ts` — `GET` (paginado) y `POST`.
- `app/api/contratos/[id]/route.ts` — `GET` y `PATCH` (sin `DELETE`).
- `features/contratos/types.ts`
- `features/contratos/query-keys.ts`
- `features/contratos/mensajes-error.ts`
- `features/contratos/fechas.ts`
- `features/contratos/participacion.ts`
- `features/contratos/filtros.ts`
- `features/contratos/relaciones.ts`
- `features/contratos/schemas.ts`
- `features/contratos/api/contratos.ts`
- `features/contratos/hooks/{useContratos,useContrato,useCrearContrato,useActualizarContrato}.ts`
- `features/contratos/components/{ContratosListado,ContratoForm,ContratoCrear,ContratoEditar,ContratoDetalle}.tsx`
- `features/contratos/index.ts`
- `features/contratos/__tests__/{query-keys,mensajes-error,filtros,participacion,relaciones,fechas,schemas}.test.ts`
- `app/(dashboard)/contratos/page.tsx`
- `app/(dashboard)/contratos/nuevo/page.tsx`
- `app/(dashboard)/contratos/[id]/page.tsx`
- `app/(dashboard)/contratos/[id]/editar/page.tsx`
- `app/(dashboard)/contratos/_components/{listado,nuevo,detalle,editar}-con-relaciones.tsx`

### Modificados

- `features/fincas/index.ts` — exporta `useTodasLasFincas` y el tipo `Finca` (R45).
- `middleware.ts` — `/contratos` en `RUTAS_PROTEGIDAS` y matcher (R41).
- `app/(dashboard)/layout.tsx` — enlace "Contratos" (R42).

## Decisiones relevantes

- **BFF sin duplicar la suma 100.** El `POST` valida tipos y rangos pero la regla de
  negocio de la suma vive solo en el esquema zod del feature (espejo del backend) y en
  el backend mismo.
- **PATCH solo con mutables.** El BFF descarta `tercero_id`, `finca_id`,
  `fecha_apertura` y los porcentajes, y exige al menos un campo mutable. El feature
  tampoco los envía (defensa en profundidad, D9). No se exporta `DELETE` (D11).
- **Filtro y paginación en el cliente.** `useContratos` carga todos los contratos con
  `LIMITE_MAXIMO`; `filtrarContratosPorEstado` y `paginarContratos` resuelven el visible.
- **Zona horaria del negocio (D13).** `fechas.ts` interpreta y presenta en Colombia
  (UTC−5 fijo) usando getters UTC sobre un instante desplazado, por lo que no depende de
  la zona horaria del sistema. Los tests usan entradas/salidas absolutas.
- **Un formulario, dos esquemas.** `ContratoForm` usa `esquemaCrearContrato` o
  `esquemaEditarContrato` según `modo`; el resolver se unifica con una aserción tipada
  justificada (formulario único con campos de ambos modos, D5). El formulario no usa
  `any` ni `@ts-ignore`.
- **Composición en `app/`.** `features/contratos` no importa de `features/terceros` ni de
  `features/fincas`; los cuatro wrappers client construyen `TerceroContrato[]` y
  `FincaContrato[]` y los pasan por props.

## Verificación

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format` + `npm run format:check` | Pasa — "All matched files use Prettier code style!" |
| `V2` | `npm run lint` | Pasa — sin errores de ESLint |
| `V3` | `npx next typegen` + `npm run typecheck` | Pasa — `tsc --noEmit` sin errores |
| `V4` | `npm test` | Pasa — 23 suites, 192 tests (7 suites / 59 tests nuevos de `contratos`) |
| `V5` | Validación manual | Pendiente del usuario (backend puede estar caído) |

Además, `bash .rei/init.sh` termina con código de salida `0` y los cuatro checkpoints en
`[OK]`.

### V5 — Pasos de reproducción (validación manual)

1. Levantar el backend Elinain y `npm run dev`; iniciar sesión en `/login`.
2. **Listado** (`/contratos`): comprobar columnas Fecha de apertura, Tercero, Finca,
   Estado y Participación (`comerciante% / tercero%`); con base vacía, estado vacío.
3. **Filtro**: cambiar "Filtrar por estado" a Activos/Cerrados/Todos y verificar que el
   total y las páginas se recalculan y la tabla vuelve a la página 1.
4. **Abrir** (`/contratos/nuevo`): elegir socio, comprobar que la finca se filtra por el
   socio; escribir un porcentaje y ver el autocompletado del complemento a 100; probar
   suma distinta de 100 (debe impedir el envío); completar opcionales y abrir; debe
   navegar al detalle del contrato creado.
5. **Detalle** (`/contratos/[id]`): verificar todos los datos, los `—` en no informados y
   el placeholder "Próximamente: compras, ventas, ciclos y costos".
6. **Editar** (`/contratos/[id]/editar`): confirmar que socio, finca, fecha de apertura y
   porcentajes están deshabilitados; cambiar estado a Cerrado (debe exigir y autocompletar
   la fecha de cierre) y a Activo (debe limpiarla); guardar y volver al detalle.
7. **Guardia**: abrir `/contratos` sin sesión debe redirigir a `/login`; el layout muestra
   el enlace "Contratos".
8. **Accesibilidad**: navegar el formulario y el listado con teclado, con foco visible y
   errores anunciados.

## Observaciones

- `V5` queda pendiente de confirmación del usuario: depende de un backend operativo, que
  puede estar caído. No bloquea el cierre del Work Item.
- No se modificaron `package.json`, `shared/api/openapi/*`, `shared/ui`, ESLint, Prettier
  ni la configuración de Jest.
