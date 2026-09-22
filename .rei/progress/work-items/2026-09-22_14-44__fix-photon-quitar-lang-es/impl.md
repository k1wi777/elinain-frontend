# Implementación — Fix: Photon rechaza `lang=es` y rompe búsqueda, sugerencias e inversa

> Work Item: `2026-09-22_14-44__fix-photon-quitar-lang-es` (`type: task`)
> Agente: Implementer · Fecha: 2026-09-22

---

## Resumen

Se implementó el plan completo: se eliminó el parámetro `lang=es` de las URLs que el BFF
construye para Photon, causa del `400` del proveedor (y por tanto del `502` del BFF) en las
tres operaciones de geocodificación. La construcción de la URL inversa se extrajo a una
función pura `crearUrlInversa` y `crearUrlBusqueda` pasó a exportarse, de modo que ambas se
prueban sin red. Se añadieron cuatro tests de regresión que verifican la ausencia de `lang`
y la presencia de `q`, `limit`, `bbox`/`lon`/`lat`. No se tocaron Route Handlers,
`_lib/sesion.ts`, UI, OpenAPI ni otros BFF, y no se añadieron dependencias.

## Archivos

### Modificados

- `app/api/geocodificacion/_lib/photon.ts`
  - `crearUrlBusqueda`: eliminado `url.searchParams.set("lang", "es")`; se conservan `q`,
    `limit` y `bbox` (`BBOX_COLOMBIA`). Pasa de privada a **exportada**. Se añadió JSDoc
    explicando por qué no se envía `lang`.
  - Nueva función pura **exportada** `crearUrlInversa(latitud, longitud): URL` con `lon`,
    `lat` y `limit=1`, sin `lang`, apuntando a `https://photon.komoot.io/reverse`.
  - `geocodificarInversa`: reemplaza la construcción inline de la URL por
    `crearUrlInversa(latitud, longitud)`. Se conservan clave de caché, cadencia y parseo.
- `app/api/geocodificacion/_lib/__tests__/photon.test.ts`
  - Importa `BBOX_COLOMBIA`, `crearUrlBusqueda` y `crearUrlInversa`.
  - Nuevos `describe` `crearUrlBusqueda` y `crearUrlInversa` (4 tests).

### No modificados (fuera de alcance)

`app/api/geocodificacion/route.ts`, `.../sugerencias/route.ts`, `.../inversa/route.ts`,
`app/api/geocodificacion/_lib/sesion.ts`, la UI de fincas, el OpenAPI, `package.json`,
ESLint/Prettier/Jest y el resto de BFF.

## Cambios realizados

- Se quitó `lang=es` en las dos construcciones de URL (búsqueda e inversa). Photon solo
  soporta `default, de, en, fr`; los nombres locales ya llegan en español desde
  OpenStreetMap con su idioma por defecto.
- Se extrajo/exportó la construcción pura de ambas URLs para poder testearlas sin red.
- Se mantienen intactos `User-Agent`, `Accept-Language`, caché, cadencia, `BBOX_COLOMBIA`
  (`-79.0,-4.2,-66.8,12.6`), `LIMITE_SUGERENCIAS` y los mensajes de error.

## Verificación

| ID | Comando | Resultado |
|----|---------|-----------|
| `V1` | `npm run format` + `npm run format:check` | Pasa — "All matched files use Prettier code style!" |
| `V2` | `npm run lint` | Pasa — ESLint sin errores |
| `V3` | `npm run typecheck` | Pasa — `tsc --noEmit` sin errores |
| `V4` | `npm test` | Pasa — 24 suites, 224 tests (4 nuevos en `photon.test.ts`) |
| `V5` | Validación manual (curl a Photon + dev server) | Parcial — API de Photon verificada; `npm run dev` con sesión queda para el usuario |

`bash .rei/init.sh` termina con salida `0` y los cuatro checkpoints en `[OK]`.

### Loop de desarrollo

`npm run test:related -- app/api/geocodificacion/_lib/photon.ts` → 1 suite, 23 tests, verde.

### V5 — Evidencia disponible

**Verificación directa contra la API pública de Photon** (sin `lang`), desde terminal:

```text
HTTP 200  https://photon.komoot.io/api/?q=Bogota&limit=1&bbox=-79.0,-4.2,-66.8,12.6
HTTP 200  https://photon.komoot.io/reverse?lon=-74.1&lat=4.7&limit=1
HTTP 400  https://photon.komoot.io/api/?q=Bogota&limit=1&bbox=...&lang=es
          {"lang":[{"message":"Language is not supported. Supported are: default, de, en, fr","args":{},"value":"es"}]}
```

Confirma la causa (con `lang=es` → `400`) y que las URLs que ahora construye el BFF
responden `200`. La inversa devuelve `Carrera 83, La Granja, Localidad Engativá, Bogotá,
Bogotá, Distrito Capital, Colombia`, en español.

**Pendiente para el usuario (`V5` completo)**, con sesión iniciada y `npm run dev`:

1. `GET /api/geocodificacion?consulta=Carrera 83, Bogotá` → `200` con
   `{ latitud, longitud, etiqueta }` en español (antes `502`).
2. `GET /api/geocodificacion/sugerencias?consulta=Bogota` → `200` con lista de sugerencias
   en español (antes `502`).
3. `GET /api/geocodificacion/inversa?lat=4.7&lon=-74.1` → `200` con dirección en español
   (antes `502`).
4. Sin cookie de sesión: los tres endpoints → `401`.
5. UI del mapa de fincas: buscar, autocompletar y seleccionar un punto rellenan la
   dirección sin el mensaje genérico de error.

## Observaciones

- Sin dependencias nuevas; sin `any`; todo tipado en `strict`.
- Prettier no reportó cambios pendientes: el código editado ya cumple el formato.
- La verificación con sesión contra `npm run dev` requiere el backend y credenciales, por lo
  que se deja indicada como paso de `V5` para el usuario.
- Fuera de alcance (no abordado): mejoras de rendimiento y cualquier cambio de proveedor.
