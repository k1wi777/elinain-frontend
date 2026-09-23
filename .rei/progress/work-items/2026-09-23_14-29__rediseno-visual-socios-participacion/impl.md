# Implementación — Rediseño visual de socios de participación

## Alcance realizado

- Se reorganizó `/terceros` con encabezado, descripción y jerarquía visual del shell oscuro.
- Se conservó el CTA `Nuevo socio de participación` y todas sus operaciones existentes.
- Se añadieron únicamente los resúmenes derivados del estado actual: `total` y `filas.length`.
- Se adaptaron tabla, filas, acciones, paginación, carga, vacío y error a superficies carbón sólidas y responsive.
- Se añadió una variante visual opcional `tema="oscuro"` en `Table`/`TablePagination`; el valor por defecto claro de los demás consumidores no cambia.
- No se modificaron hooks, API, tipos de dominio, queries, mutaciones, rutas, modales, toasts, mensajes ni columnas.

## Verificación

- `V1` — Pasa: `npm run format:check`.
- `V2` — Pasa: `npm run lint`.
- `V3` — Pasa: `npm run typecheck`.
- `V4` — Bloqueado por el entorno: `npm test -- --runInBand` y `bash .rei/init.sh` fallan antes de ejecutar Jest con `Could not parse output from TypeScript's --showConfig`, dentro de `next/jest`. No se detectaron fallos de tests porque la suite no llega a iniciarse.
- `V5` — Pendiente de validación manual del usuario en `/terceros`, especialmente ancho móvil, scroll horizontal de la tabla, estados vacío/error y apertura de los modales CRUD.

## Estado

Implementación lista para revisión.
