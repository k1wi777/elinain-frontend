# Revisión — Contratos: listado filtrable, apertura, detalle y edición de campos mutables

> Work Item: `2026-09-22_11-56__contratos-listado-filtro-detalle-y-edicion` (`type: feature`)
> Agente: Reviewer · Fecha: 2026-09-22

---

## Resultado

**Aprobado.** La implementación cumple R1–R50, respeta D1–D13 y completa T1–T15, sin
alcance extra y sin desviaciones respecto a la planificación.

## Verificaciones realizadas

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format:check` | Pasa — "All matched files use Prettier code style!" |
| `V2` | `npm run lint` | Pasa — sin errores de ESLint |
| `V3` | `npx next typegen` + `npm run typecheck` | Pasa — tipos generados y `tsc --noEmit` sin errores |
| `V4` | `npm test` | Pasa — 23 suites / 192 tests (7 suites y 59 tests nuevos de `contratos`) |
| `V5` | Validación manual | Pendiente del usuario (backend puede estar caído; no bloquea) |

`bash .rei/init.sh` finaliza con código de salida `0` con los cuatro checkpoints en `[OK]`.

## Comprobaciones

- **Requisitos:** R1–R50 cubiertos. BFF `app/api/contratos/*` (`GET`/`POST` y `GET`/`PATCH`)
  propaga el código HTTP real (red → `502`) con mensajes en español y sin cuerpo crudo;
  sin `DELETE`. El `PATCH` solo transporta campos mutables y descarta `tercero_id`,
  `finca_id`, `fecha_apertura` y porcentajes, exigiendo al menos uno. Listado con Fecha de
  apertura / Tercero / Finca / Estado / Participación (`60% / 40%`) y acciones; filtro por
  estado y paginación en cliente sobre el conjunto filtrado con offset acotado; estados de
  carga/vacío/error; apertura con selector de tercero, finca filtrada por tercero,
  `datetime-local` → ISO 8601 en zona Colombia (UTC−5), autocompletado del complemento y
  suma exactamente 100; detalle con todos los datos, `—` en no informados y placeholder
  "Próximamente: compras, ventas, ciclos y costos"; edición solo de mutables con inmutables
  deshabilitados y acoplamiento estado/`fecha_cierre`; navegación al detalle tras crear y
  editar; guardia de `/contratos` y enlace en el layout; ampliación mínima de
  `features/fincas`.
- **Arquitectura y convenciones:** reutiliza `createBffClient`, `createServerClient`,
  `ApiError`, `usePagination`, `shared/ui` y `respuestaError`. `shared/` no importa de
  `features/` ni de `app/`; `features/contratos` no importa de `features/terceros` ni de
  `features/fincas` (composición en `app/`). Sin `any`/`@ts-ignore`, con named exports,
  `'use client'` en el nodo más bajo, sin `fetch` en componentes ni `useEffect` para datos,
  sin dependencias nuevas y textos en español. `git status` confirma que no se tocaron
  `package.json`, `shared/api/openapi/*` ni `shared/ui`.
- **Tests de lógica pura:** cubren esquemas (suma 100 y acoplamiento estado/fecha), mensajes
  de error, query keys, filtros/paginación, fechas (sin depender de la zona del sistema),
  participación y relaciones.
- **Tareas:** T1–T15 marcadas `[x]` y verificadas contra los archivos entregados.

## Observaciones

- `V5` de validación manual (flujo real contra el backend, interacción y accesibilidad
  percibida) queda a cargo del usuario con los pasos de `impl.md`; depende de un backend
  operativo y no bloquea el cierre.
- El formulario unifica los dos modos con una aserción tipada de resolver, justificada en
  comentario; no usa `any` ni `@ts-ignore`.
