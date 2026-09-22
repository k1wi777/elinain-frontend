# Bitácora histórica (append-only)

> Registro histórico de todas las sesiones completadas.
> Nunca modifiques entradas anteriores.
> Siempre añade nuevas entradas al final.

---

## 2026-09-22 — `2026-09-22_01-17__estructura-base-y-env`

- **Work Item:** `2026-09-22_01-17__estructura-base-y-env` — Estructura base del proyecto
  y configuración de entorno (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se creó la estructura base de capas manteniendo `app/` en la raíz
  (sin `src/`): `features/` y `shared/{api,ui,lib}` versionadas con `.gitkeep`, y
  `shared/config/` con `env.ts`. Se corrigió el formato de las variables de entorno
  (formato `KEY=valor`), moviendo los valores locales a `.env.local` y dejando
  `.env.example` como plantilla versionada sin secretos. Se ajustó `.gitignore`
  (`!.env.example` tras `.env*`) y se creó `shared/config/env.ts` como único punto de
  lectura tipada de `process.env` (`API_URL` en servidor/BFF y `NEXT_PUBLIC_API_URL` en
  cliente), con sus tests.
- **Archivos modificados:** creados `features/.gitkeep`, `shared/api/.gitkeep`,
  `shared/ui/.gitkeep`, `shared/lib/.gitkeep`, `shared/config/env.ts` y
  `shared/config/__tests__/env.test.ts`; renombrado `.env` → `.env.local` (reescrito);
  reescrito `.env.example`; modificado `.gitignore`.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (8/8) en verde; `V5` no aplica (cambio estructural y de configuración sin comportamiento
  interactivo). `bash .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_01-38__cliente-http-base`

- **Work Item:** `2026-09-22_01-38__cliente-http-base` — Cliente HTTP base en
  `shared/api` (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó el cliente HTTP base del frontend en `shared/api`
  sobre `axios`, con tres puntos de entrada: `http-client.ts` (núcleo isomorfo con
  cabeceras JSON por defecto, `buildUrl`, `Authorization: Bearer` opcional y normalización
  de rechazos en `ApiError`), `server-client.ts` (server-only; lee la cookie httpOnly vía
  `cookies()` y `getServerEnv()`) y `public-client.ts` (sin token; `getClientEnv()`).
  Se añadieron `request.ts` (helpers puros de cabeceras y URL), `errors.ts` (`ApiError`,
  `mapErrorResponse`, `toApiError`), `session-cookie.ts` (`SESSION_COOKIE_NAME`), `types.ts`
  (`ApiSchemas`) y tests de lógica pura. Se copió el OpenAPI del backend a
  `shared/api/openapi/api-1.json` y se generaron los tipos con `openapi-typescript`
  (`schema.d.ts`), ambos versionados y excluidos de Prettier/ESLint. No se creó barrel
  `shared/api/index.ts` y se eliminó `shared/api/.gitkeep`.
- **Archivos modificados:** creados `shared/api/{types,session-cookie,request,errors,http-client,server-client,public-client}.ts`,
  `shared/api/openapi/{api-1.json,schema.d.ts}`, `shared/api/__tests__/{request,errors}.test.ts`;
  modificados `package.json`, `package-lock.json`, `.prettierignore` y `eslint.config.mjs`;
  eliminado `shared/api/.gitkeep`.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (24/24, 16 nuevos) en verde; `V5` no aplica (módulos headless sin UI ni flujo
  interactivo). `bash .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_01-56__paginacion-y-sistema-de-diseno`

- **Work Item:** `2026-09-22_01-56__paginacion-y-sistema-de-diseno` — Hook genérico de
  paginación y sistema de diseño base (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se entregaron dos piezas base en la capa transversal. (1)
  Paginación en `shared/api`: `pagination.ts` con la aritmética pura (`normalizarLimite`,
  `calcularTotalPaginas`, `calcularPagina`, `calcularOffset`, `normalizarPagina`) y las
  constantes `LIMITE_POR_DEFECTO = 20`/`LIMITE_MINIMO = 1`/`LIMITE_MAXIMO = 100`, más
  `usePagination.ts` (`'use client'`), que guarda `limite`/`offset`, recibe `total` por
  parámetro y deriva en render los indicadores y acciones sin `useEffect`. (2) Sistema de
  diseño en `shared/ui`: `Button` (variantes primario/secundario/peligro), `Input` y
  `Select` (label + `aria-invalid`/`aria-describedby`), `Table` genérica con estados de
  carga/vacío y paginación, `TablePagination` interno (con el tipo estructural
  `PaginacionTabla`), `Modal` sobre `<dialog>` nativo y `Toast` presentacional; barrel
  `shared/ui/index.ts` sin exportar `TablePagination`. Se añadió `cn()` en `shared/lib` y se
  eliminaron `shared/lib/.gitkeep` y `shared/ui/.gitkeep`.
- **Archivos modificados:** creados
  `shared/api/{pagination,usePagination}.ts`, `shared/api/__tests__/pagination.test.ts`,
  `shared/lib/cn.ts`, `shared/lib/__tests__/cn.test.ts`,
  `shared/ui/{Button,Input,Select,Table,TablePagination,Modal,Toast}.tsx` y
  `shared/ui/index.ts`; eliminados `shared/lib/.gitkeep` y `shared/ui/.gitkeep`. Sin cambios
  en dependencias, configuración ni `app/`.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (44/44) en verde; `V5` no aplica (el Work Item solo entrega la base; la validación visual
  e interactiva queda para Work Items posteriores). `bash .rei/init.sh` finaliza con código
  de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_02-28__autenticacion-bff-login-registro-rutas-protegidas`

- **Work Item:** `2026-09-22_02-28__autenticacion-bff-login-registro-rutas-protegidas` —
  Autenticación: BFF, login, registro y rutas protegidas (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó el flujo de autenticación completo alrededor de la
  cookie httpOnly `elinain_session`. (1) BFF en `app/api/auth/*`: `login` (204 + cookie sin
  exponer el token), `registro` con auto-login en servidor (201 + cookie, 409 propagado sin
  cookie) y `logout` (204 + limpieza de cookie), más los helpers internos `_lib/sesion.ts`
  (atributos de cookie: httpOnly, `sameSite: lax`, `secure` por `isProduction`, `path: /` y
  `maxAge` derivado del `exp` del JWT) y `_lib/respuestas.ts` (código HTTP real con mensajes
  en español). (2) Feature `auth`: esquemas zod, alias de DTOs del OpenAPI, mensajes de error
  por estado, `api/auth.ts` sobre `createBffClient`, hooks de mutación (`useLogin`,
  `useRegistro`, `useLogout`) y formularios `LoginForm`/`RegistroForm`/`LogoutButton`. (3)
  Páginas `(auth)/login`, `(auth)/registro` y la landing protegida `(dashboard)/dashboard`,
  más `app/providers.tsx` (TanStack Query) montado en el layout raíz. (4) `middleware.ts` como
  guardia de navegación por vigencia del `exp` del JWT, sin firma ni backend. Piezas
  transversales nuevas: `shared/api/bff-client.ts`, `shared/api/session.ts` y `isProduction`
  en `shared/config/env.ts`. No se añadieron dependencias.
- **Archivos modificados:** creados `shared/api/{bff-client,session}.ts`,
  `shared/api/__tests__/session.test.ts`, `app/api/auth/{login,registro,logout}/route.ts`,
  `app/api/auth/_lib/{sesion,respuestas}.ts`, `features/auth/{types,schemas,mensajes-error,index}.ts`,
  `features/auth/api/auth.ts`, `features/auth/hooks/{useLogin,useRegistro,useLogout}.ts`,
  `features/auth/components/{LoginForm,RegistroForm,LogoutButton}.tsx`,
  `features/auth/__tests__/{schemas,mensajes-error}.test.ts`,
  `app/providers.tsx`, `app/(auth)/{layout.tsx,login/page.tsx,registro/page.tsx}`,
  `app/(dashboard)/{layout.tsx,dashboard/page.tsx}` y `middleware.ts`; modificados
  `app/layout.tsx`, `shared/config/env.ts` y `shared/config/__tests__/env.test.ts`;
  eliminado `features/.gitkeep`.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (8 suites / 75 tests) en verde; `V5` (validación manual de login, registro/409, auto-login,
  rutas protegidas, redirección de autenticados y logout) queda a cargo del usuario con los
  pasos documentados en `impl.md`. `bash .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_03-04__crud-terceros-listado-modal-eliminacion`

- **Work Item:** `2026-09-22_03-04__crud-terceros-listado-modal-eliminacion` — Terceros:
  listado paginado, crear/editar en modal y eliminar con confirmación (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó el CRUD de terceros (socios de participación) sobre
  la infraestructura existente. (1) BFF en `app/api/terceros/*`: `GET` paginado y `POST`
  (crear) en `route.ts`, `PATCH` y `DELETE` en `[id]/route.ts`, con parseo defensivo,
  propagación del código HTTP real (`0` → `502`) y mensajes en español sin exponer el
  `mensaje` crudo; `DELETE` responde `204`. (2) Helper transversal `respuestaError` movido a
  `app/api/_lib/respuestas.ts` (base genérica + `mensajes?` por código), reutilizado por
  `login`/`registro` conservando sus mensajes de `401`/`409`; se eliminó
  `app/api/auth/_lib/respuestas.ts`. (3) Feature `terceros`: alias de DTOs del OpenAPI,
  `esquemaTercero` zod, mensajes de error por estado (incluido el `409` de contratos
  activos), query keys `['terceros', 'list', filtros]`, `api/` sobre `createBffClient`, hooks
  de consulta y mutaciones con invalidación y los componentes `TerceroForm` (crear/editar),
  `EliminarTerceroModal` y `TercerosTable` (tabla, paginación, modal y `Toast`). (4) Ruta
  `(dashboard)/terceros/page.tsx`, enlace en el layout del dashboard y `/terceros` +
  `/terceros/:path*` en `RUTAS_PROTEGIDAS`/matcher de `middleware.ts`. (5) Tests puros de
  esquemas, mensajes de error y query keys.
- **Archivos modificados:** creados `app/api/_lib/respuestas.ts`,
  `app/api/terceros/{route.ts,[id]/route.ts}`, `app/(dashboard)/terceros/page.tsx`,
  `features/terceros/{types,schemas,mensajes-error,query-keys,index}.ts`,
  `features/terceros/api/terceros.ts`,
  `features/terceros/hooks/{useTerceros,useCrearTercero,useActualizarTercero,useEliminarTercero}.ts`,
  `features/terceros/components/{TerceroForm,EliminarTerceroModal,TercerosTable}.tsx` y
  `features/terceros/__tests__/{schemas,mensajes-error,query-keys}.test.ts`; modificados
  `app/api/auth/{login,registro}/route.ts`, `app/(dashboard)/layout.tsx` y `middleware.ts`;
  eliminado `app/api/auth/_lib/respuestas.ts`. Sin cambios en `package.json`,
  `shared/api/openapi/*` ni en los tests/configuración transversales.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos (con `npx next
  typegen` previo) y `V4` tests (11 suites / 93 tests) en verde; `V5` (validación manual de
  listado/vacío, crear, editar, eliminar y `409` de contratos activos) queda a cargo del
  usuario con los pasos documentados en `impl.md`. `bash .rei/init.sh` finaliza con código de
  salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_10-07__fincas-listado-mapa-geocodificacion-y-crud`

- **Work Item:** `2026-09-22_10-07__fincas-listado-mapa-geocodificacion-y-crud` — Fincas:
  listado y mapa de pines, CRUD con ubicación geocodificada y eliminación con 409
  (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó la gestión de fincas sobre la infraestructura
  existente (R1–R52, T1–T15). (1) BFF de fincas en `app/api/fincas/*`: `GET` paginado y
  `POST` en `route.ts`, `GET`/`PATCH`/`DELETE` en `[id]/route.ts`, con parseo defensivo,
  propagación del código HTTP real (red → `502`), el `PATCH` sin `tercero_id` y mensajes en
  español sin exponer el `mensaje` crudo, incluido el `409` de contratos vinculados.
  (2) BFF de geocodificación `app/api/geocodificacion/route.ts` como proxy autenticado a
  Nominatim (guardia `sesionVigente`, `400`/`404`/`502`) con `_lib/nominatim.ts` (User-Agent
  propio, `Accept-Language: es`, caché con límite, cadencia ~1 req/s serializada y
  `parsearRespuestaNominatim` puro). (3) Feature `fincas` autocontenido: alias de DTOs del
  OpenAPI, esquemas zod, mensajes de error, resolución de propietarios, API sobre
  `createBffClient`, hooks de TanStack Query con invalidación y componentes (tabla paginada,
  mapa Leaflet client-only con `dynamic(..., { ssr: false })`, formulario con selector de
  mapa de pin arrastrable/por clic, modales de detalle y borrado). (4) Ampliación mínima de
  `features/terceros` (`listarTodosLosTerceros`, `useTodosLosTerceros`, `clavesTerceros.todos`
  y export de `Tercero`). (5) Composición de propietarios en `app/` mediante wrappers client,
  rutas `/fincas`, `/fincas/nueva` y `/fincas/[id]/editar`, `/fincas` protegido en
  `middleware.ts` y enlace "Fincas" en el layout. (6) Tests de lógica pura (esquemas,
  mensajes incluido el `409`, query keys, propietarios y parseo de Nominatim).
- **Archivos modificados:** creados `app/api/fincas/{route.ts,[id]/route.ts}`,
  `app/api/geocodificacion/{route.ts,_lib/nominatim.ts,_lib/__tests__/nominatim.test.ts}`,
  `features/fincas/**` (tipos, query keys, esquemas, mensajes, propietarios, `api/`, `hooks/`,
  `components/`, `index.ts` y tests), `app/(dashboard)/fincas/**` y
  `features/terceros/hooks/useTodosLosTerceros.ts`; modificados `features/terceros/{api/terceros.ts,
  query-keys.ts,index.ts,__tests__/query-keys.test.ts}`, `middleware.ts` y
  `app/(dashboard)/layout.tsx`. Sin cambios en `package.json`, `shared/api/openapi/*` ni
  `shared/ui`; sin dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos (con `npx next
  typegen` previo) y `V4` tests (16 suites / 133 tests) en verde; `V5` (validación manual de
  listado/vacío, mapa con pines, popup y detalle, crear con geocodificación, editar, eliminar
  y `409`) queda a cargo del usuario con los pasos documentados en `impl.md`. `bash
  .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_11-56__contratos-listado-filtro-detalle-y-edicion`

- **Work Item:** `2026-09-22_11-56__contratos-listado-filtro-detalle-y-edicion` — Contratos:
  listado filtrable, apertura, detalle y edición de campos mutables (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó la gestión de contratos de participación sobre la
  infraestructura existente (R1–R50, T1–T15). (1) BFF de contratos en `app/api/contratos/*`:
  `GET` paginado y `POST` en `route.ts`, `GET` y `PATCH` en `[id]/route.ts`, con parseo
  defensivo, propagación del código HTTP real (red → `502`) y mensajes en español sin exponer
  el cuerpo crudo; sin `DELETE`, y el `PATCH` descartando `tercero_id`, `finca_id`,
  `fecha_apertura` y los porcentajes. (2) Feature `contratos` autocontenido: alias de DTOs del
  OpenAPI, utilidades puras (`fechas` en zona Colombia UTC−5, `participacion`, `filtros` con
  offset acotado, `relaciones`), esquemas zod de crear/editar (suma 100 y acoplamiento
  estado/`fecha_cierre`), mensajes de error, query keys, API sobre `createBffClient` y hooks
  de TanStack Query con invalidación, más los componentes `ContratosListado` (filtro y
  paginación en cliente), `ContratoForm` (un formulario, dos modos), `ContratoCrear`,
  `ContratoEditar` y `ContratoDetalle` (con placeholder de secciones futuras). (3) Ampliación
  mínima de `features/fincas` (`useTodasLasFincas` y tipo `Finca`). (4) Composición en `app/`
  mediante wrappers client, rutas `/contratos`, `/contratos/nuevo`, `/contratos/[id]` y
  `/contratos/[id]/editar`, `/contratos` protegido en `middleware.ts` y enlace "Contratos" en
  el layout. (5) Tests de lógica pura (esquemas, mensajes, query keys, filtros, fechas,
  participación y relaciones).
- **Archivos modificados:** creados `app/api/contratos/{route.ts,[id]/route.ts}`,
  `features/contratos/**` (tipos, query keys, mensajes, `fechas`, `participacion`, `filtros`,
  `relaciones`, `schemas`, `api/`, `hooks/`, `components/`, `index.ts` y tests),
  `app/(dashboard)/contratos/**`; modificados `features/fincas/index.ts`, `middleware.ts` y
  `app/(dashboard)/layout.tsx`. Sin cambios en `package.json`, `shared/api/openapi/*`,
  `shared/ui`, ESLint, Prettier ni Jest; sin dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos (con `npx next
  typegen` previo) y `V4` tests (23 suites / 192 tests; 7 suites y 59 tests nuevos de
  `contratos`) en verde; `V5` (validación manual de listado/filtro, apertura, detalle con
  placeholder, edición con inmutables y acoplamiento de fecha) queda a cargo del usuario con
  los pasos documentados en `impl.md`. `bash .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_12-25__fix-desenvolver-sobre-respuestas-backend`

- **Work Item:** `2026-09-22_12-25__fix-desenvolver-sobre-respuestas-backend` — Fix:
  desenvolver el sobre `{exito, datos}` de las respuestas del backend (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se corrigió el fallo por el que el BFF devolvía `500` en login y
  registro y por el que los listados de terceros, fincas y contratos recibían una forma
  equivocada. El backend envuelve toda respuesta exitosa en `{exito: true, datos}`, pero el
  OpenAPI documenta el payload plano. Se creó el helper puro
  `desenvolverRespuesta` en `shared/api/response.ts`, que desenvuelve solo cuando el cuerpo
  es un objeto no nulo, no array, con `exito === true` (booleano estricto) y propiedad propia
  `datos`, y devuelve el cuerpo tal cual en cualquier otro caso (arrays, primitivos, `null`,
  `undefined`, cuerpos sin sobre, `exito: false`, `{mensaje}` de `204`/BFF). Se aplicó en un
  único punto central —el interceptor de respuesta exitosa de `shared/api/http-client.ts`—,
  sin tocar el interceptor de rechazo ni los cinco métodos. No se modificaron el OpenAPI,
  ningún Route Handler BFF, `errors.ts` ni `session.ts`, y no se añadieron dependencias.
- **Archivos modificados:** creados `shared/api/response.ts` y
  `shared/api/__tests__/response.test.ts`; modificado `shared/api/http-client.ts`.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (24 suites / 205 tests; 13 nuevos de `response.test.ts`) en verde; `V5` reproducido de
  forma independiente por HTTP contra el backend real (registro `201` y login `204` con
  `set-cookie`; login inválido `401` con `{mensaje}`; `/api/terceros`, `/api/fincas` y
  `/api/contratos` con `{elementos,total,limite,offset}`, sin sobre); la validación de UI en
  navegador queda a cargo del usuario. `bash .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_13-39__fincas-mapa-colombia-sugerencias-photon-y-direccion-inversa`

- **Work Item:** `2026-09-22_13-39__fincas-mapa-colombia-sugerencias-photon-y-direccion-inversa`
  — Fincas: mapa acotado a Colombia, sugerencias de dirección con Photon y relleno inverso desde
  el pin (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementaron T1–T10 (R1–R40). (1) BFF de geocodificación migrado por
  completo de Nominatim a Photon: `_lib/photon.ts` (constantes, `User-Agent` propio, cadencia
  ~1 req/s serializada, caché FIFO con claves `b:`/`s:`/`r:`, `bbox` de Colombia y `lang=es`, más
  las funciones puras `extraerCoordenadas`, `formatearDireccion`, `esDeColombia`,
  `parsearRespuestaPhoton`, `mapearSugerenciasPhoton` y `parsearRespuestaInversaPhoton`),
  `_lib/sesion.ts` (guardia `haySesionVigente`) y los endpoints `route.ts`, `sugerencias/route.ts`
  e `inversa/route.ts` (búsqueda `404` sin coincidencia; sugerencias `200` con lista vacía y `400`
  bajo el mínimo; inversa valida `lat`/`lon`, rango y área de Colombia; `502` ante fallo del
  proveedor). (2) Feature `fincas`: `api/geocodificacion.ts` ampliado, hooks
  `useSugerenciasDireccion` (`useQuery` con `enabled`, `staleTime` y `retry:false`) y
  `useGeocodificacionInversa` (`useMutation`), combobox accesible `AutocompletarDireccion`
  (debounce 350 ms, mínimo 3 caracteres, ARIA y teclado), integración en `FincaForm` con relleno
  inverso en clic/`dragend` y contador de solicitud, `mapa.ts` con las constantes de Colombia y
  límites aplicados en `SelectorMapa` y `FincasMapa`. (3) `shared/lib/useValorDebounced.ts` como
  hook genérico de temporizador. (4) Retiro completo de Nominatim (`nominatim.ts` y su test).
- **Archivos modificados:** creados
  `app/api/geocodificacion/{_lib/photon.ts,_lib/sesion.ts,_lib/__tests__/photon.test.ts,sugerencias/route.ts,inversa/route.ts}`,
  `features/fincas/{mapa.ts,hooks/useSugerenciasDireccion.ts,hooks/useGeocodificacionInversa.ts,components/AutocompletarDireccion.tsx}`
  y `shared/lib/useValorDebounced.ts`; modificados `app/api/geocodificacion/route.ts`,
  `features/fincas/{api/geocodificacion.ts,query-keys.ts,mensajes-error.ts}`,
  `features/fincas/components/{FincaForm,SelectorMapa,FincasMapa}.tsx` y
  `features/fincas/__tests__/{mensajes-error,query-keys}.test.ts`; eliminados
  `app/api/geocodificacion/_lib/nominatim.ts` y su test. Sin cambios en `package.json`,
  `shared/api/openapi/*`, `shared/ui`, ESLint, Prettier ni Jest; sin dependencias nuevas.
- **Desviación aprobada:** el hook genérico se implementó como
  `shared/lib/useValorDebounced.ts` (camelCase, convención de hooks) en lugar de
  `use-valor-debounced.ts`, documentado en `impl.md`.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos (con `npx next typegen`
  previo) y `V4` tests (24 suites / 220 tests; 19 de `photon.test.ts`) en verde; se confirmó por
  HTTP que los tres endpoints devuelven `401` sin sesión. `V5` (mapas acotados, sugerencias
  accesibles, selección, relleno inverso en clic/arrastre y manejo de errores) queda a cargo del
  usuario con los pasos documentados en `impl.md`. `bash .rei/init.sh` finaliza con código de
  salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_14-44__fix-photon-quitar-lang-es`

- **Work Item:** `2026-09-22_14-44__fix-photon-quitar-lang-es` — Fix: Photon rechaza
  `lang=es` y rompe búsqueda, sugerencias e inversa (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se eliminó el parámetro `lang=es` de las URLs que el BFF construye
  para Photon, causa del `400` del proveedor (y del `502` del BFF) en las tres operaciones
  de geocodificación. En `_lib/photon.ts`, `crearUrlBusqueda` conserva `q`, `limit` y
  `bbox=BBOX_COLOMBIA` y pasa a exportarse; se extrajo la función pura y exportada
  `crearUrlInversa(latitud, longitud)` con `lon`, `lat` y `limit=1`, reutilizada por
  `geocodificarInversa`. Se añadieron 4 tests de regresión en `photon.test.ts` que verifican
  la ausencia de `lang` y la presencia de `q`/`limit`/`bbox` y `lat`/`lon`/`limit=1`, más el
  host y los paths. No se tocaron proveedor, caché, cadencia, `User-Agent`, mensajes, Route
  Handlers, `_lib/sesion.ts`, la UI, el OpenAPI ni otros BFF.
- **Archivos modificados:** `app/api/geocodificacion/_lib/photon.ts` y
  `app/api/geocodificacion/_lib/__tests__/photon.test.ts`. Sin cambios en `package.json`,
  `shared/api/openapi/*`, `shared/ui`, ESLint, Prettier ni Jest; sin dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (24 suites / 224 tests; 4 nuevos en `photon.test.ts`) en verde; se confirmó por `curl` que
  `/api/` y `/reverse` sin `lang` responden `200` y que con `lang=es` Photon responde `400`.
  `V5` (dev server con sesión: los tres endpoints → `200`; sin cookie → `401`; UI del mapa)
  queda a cargo del usuario con los pasos documentados en `impl.md`. `bash .rei/init.sh`
  finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_14-51__rendimiento-carga-cache-y-skeletons`

- **Work Item:** `2026-09-22_14-51__rendimiento-carga-cache-y-skeletons` — Rendimiento:
  caché por defecto de TanStack Query, skeletons de carga y guía de producción (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** mejoras de percepción de velocidad sin cambios de arquitectura.
  (1) `app/providers.tsx`: constante `OPCIONES_POR_DEFECTO: QueryClientConfig` pasada a
  `new QueryClient(...)`, con solo `defaultOptions.queries` (`staleTime: 60_000`,
  `refetchOnWindowFocus: false`, `retry: 1`); `mutations` conserva sus defaults y las opciones
  propias de cada consulta siguen prevaleciendo. (2) `shared/ui/Skeleton.tsx` presentacional y
  sin dominio (named export, `cn()`, `className` opcional, base
  `animate-pulse rounded-md bg-zinc-200`, `aria-hidden`), exportado en `shared/ui/index.ts`.
  (3) `loading.tsx` del área protegida y de `terceros`, `fincas` y `contratos`, con
  `aria-busy`/`sr-only` y el mismo contenedor/ancho que sus `page.tsx`. (4) Nota en el
  `README.md` para validar el rendimiento en build de producción (`npm run build` + `npm start`).
  Sin `HydrationBoundary`/`dehydrate`, prefetch, streaming/PPR ni cambios en el BFF/OpenAPI/hooks.
- **Archivos modificados:** creados `shared/ui/Skeleton.tsx`,
  `app/(dashboard)/{loading.tsx,terceros/loading.tsx,fincas/loading.tsx,contratos/loading.tsx}`;
  modificados `app/providers.tsx`, `shared/ui/index.ts` y `README.md`. Sin cambios en
  `package.json`/`package-lock.json`, `shared/api/openapi/*`, el BFF ni los hooks; sin
  dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (24 suites / 224 tests) en verde; `npm run build` con salida `0` (21 rutas, incluidas
  `/terceros`, `/fincas` y `/contratos`); `bash .rei/init.sh` finaliza con código de salida `0`.
  `V5` (navegación con caché, feedback inmediato y comparación dev/producción) queda a cargo del
  usuario con los pasos documentados en `impl.md`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_15-12__placeholders-modulos-ventas-ciclos-costos`

- **Work Item:** `2026-09-22_15-12__placeholders-modulos-ventas-ciclos-costos` —
  Preparación de módulos bloqueados por backend: features y páginas "Próximamente" de ventas,
  ciclos y costos (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se dejó preparado el patrón de integración de los módulos bloqueados
  por el backend, sin lógica de negocio ni llamadas a la API. (1) Pieza presentacional
  compartida `shared/ui/Proximamente.tsx` (`titulo`, `descripcion` + aviso "Próximamente."),
  sin dominio y con named export, exportada en `shared/ui/index.ts`. (2) Los features `ventas`,
  `ciclos` y `costos` con su componente `<Modulo>Proximamente` y su barrel de una sola
  exportación con JSDoc. (3) Las páginas `app/(dashboard)/{ventas,ciclos,costos}/page.tsx`
  como Server Components delgados con `metadata` por módulo. (4) Los enlaces "Ventas",
  "Ciclos" y "Costos" en la `<nav>` del layout del área protegida. (5) Las rutas y sus
  `:path*` en `RUTAS_PROTEGIDAS` y el `config.matcher` de `middleware.ts`.
- **Archivos modificados:** creados `shared/ui/Proximamente.tsx`,
  `features/ventas/components/VentasProximamente.tsx`, `features/ciclos/components/CiclosProximamente.tsx`,
  `features/costos/components/CostosProximamente.tsx`, `features/ventas/index.ts`,
  `features/ciclos/index.ts`, `features/costos/index.ts`, `app/(dashboard)/ventas/page.tsx`,
  `app/(dashboard)/ciclos/page.tsx` y `app/(dashboard)/costos/page.tsx`; modificados
  `shared/ui/index.ts`, `app/(dashboard)/layout.tsx` y `middleware.ts`. Sin cambios en
  `package.json`/`package-lock.json`, `shared/api/openapi/*`, el BFF (`app/api/*`) ni los
  features existentes; sin dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (24 suites / 224 tests) en verde; `V5` reejecutada de forma independiente por HTTP contra
  el dev server activo (las tres rutas redirigen a `/login` sin sesión y muestran título,
  descripción y "Próximamente." con sesión). `bash .rei/init.sh` finaliza con código de salida
  `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_15-38__landing-institucional-y-retiro-plantilla-next`

- **Work Item:** `2026-09-22_15-38__landing-institucional-y-retiro-plantilla-next` — Landing
  institucional de Elinain y retiro de la plantilla de Next.js (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se sustituyó la landing plantilla de create-next-app por una landing
  pública e institucional de Elinain. (1) `app/page.tsx` reescrito como Server Component
  presentacional, en español, con `metadata` propio y las ocho secciones del plan (cabecera,
  hero con el `<h1>` y CTAs, problema, capacidades, público objetivo, visión, CTA final y
  pie); estructura semántica `header`/`main`/`footer`/`nav`, un único `<h1>` y un `<h2>` por
  sección, y CTAs con `next/link` hacia `/login` y `/registro` usando las clases visuales de
  las variantes `primario`/`secundario` del sistema de diseño. (2) `git rm` de los cinco
  assets de la plantilla que dejaban de usarse (`public/next.svg`, `vercel.svg`, `file.svg`,
  `globe.svg`, `window.svg`), quedando `public/` vacío. Sin formularios, sin llamadas a la
  API/BFF, sin interactividad y sin dependencias nuevas.
- **Archivos modificados:** modificado `app/page.tsx` (reescritura completa con `metadata`
  propio); eliminados `public/next.svg`, `public/vercel.svg`, `public/file.svg`,
  `public/globe.svg` y `public/window.svg`. Sin cambios en `package.json`/`package-lock.json`,
  `shared/api/openapi/*`, `middleware.ts`, `app/globals.css`, `app/layout.tsx`,
  `app/favicon.ico`, el BFF ni ningún feature.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (24 suites / 224 tests) en verde; `V5` con validación HTTP independiente contra el dev
  server preexistente (`/` → `200` con el `<h1>` y el `title` de la landing, 3 enlaces a
  `/login` y 3 a `/registro`, sin referencias a los assets eliminados; `/login` y `/registro`
  → `200`); `grep` sobre archivos versionados sin referencias a los assets eliminados (solo
  restos generados en `.next/`, gitignored). La navegación real, el recorrido con teclado y la
  revisión de responsive y contraste quedan a cargo del usuario. `bash .rei/init.sh` finaliza
  con código de salida `0`.
- **Estado final:** `done`.
