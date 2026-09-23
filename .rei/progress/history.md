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

---

---

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

---

## 2026-09-22 — `2026-09-22_19-13__compras-registro-listado-edicion-y-eliminacion-en-contrato`

- **Work Item:** `2026-09-22_19-13__compras-registro-listado-edicion-y-eliminacion-en-contrato`
  — Compras: listado filtrado por contrato y registro, edición y eliminación embebidos en el
  detalle de contrato (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó la gestión de compras de un contrato (R1–R21, T1–T9).
  (1) Refactor: `features/contratos/fechas.ts` y su test se movieron a `shared/lib/fechas.ts` y
  `shared/lib/__tests__/fechas.test.ts`, actualizando los imports de `features/contratos/schemas.ts`
  y de `ContratoForm`, `ContratoDetalle`, `ContratosListado`, `ContratoCrear` y `ContratoEditar` a
  `@/shared/lib/fechas`. (2) BFF de compras en `app/api/compras/*`: `GET` paginado y filtrado por
  `contrato_id` y `POST` validado en `route.ts`; `GET`/`PATCH` (solo campos mutables, descarta
  `contrato_id` y exige al menos uno) y `DELETE` que responde `200` en `[id]/route.ts`, con
  propagación del código HTTP real (red → `502`) y mensajes en español, incluidos los `409` de
  modificar y eliminar. (3) Feature `compras` autocontenido: alias de DTOs del OpenAPI,
  `api/compras.ts` sobre `createBffClient`, query keys `clavesCompras`, hooks de consulta y
  mutaciones que invalidan `clavesCompras.listas()`, `esquemaCompra` zod (cinco campos, cantidad
  entera `> 0`, peso/precio `> 0`, nota requerida) con la utilidad de fechas, `mensajes-error` con
  los `409` y el `0` de conexión, y componentes `CompraForm` (`datetime-local`, contrato no
  editable), `CompraFormModal` (no se cierra al fallar), `EliminarCompraModal` (confirmación
  previa) y `ComprasSeccion` (tabla paginada en servidor con estados de carga/vacío/error,
  acciones y `Toast`). (4) Composición en `app/`: `detalle-con-relaciones.tsx` renderiza
  `<ComprasSeccion contratoId={id} />` y el placeholder de `ContratoDetalle` pasa a
  "Próximamente: ventas, ciclos y costos.". (5) Tests puros de `schemas`, `mensajes-error` y
  `query-keys`, más el de fechas movido. Sin ruta global `/compras` ni cambios en el contrato del
  backend.
- **Archivos modificados:** creados `app/api/compras/{route.ts,[id]/route.ts}`,
  `features/compras/**` (tipos, query keys, esquema, mensajes, `api/`, `hooks/`, `components/`,
  `index.ts` y tests); movidos `features/contratos/fechas.ts` → `shared/lib/fechas.ts` y
  `features/contratos/__tests__/fechas.test.ts` → `shared/lib/__tests__/fechas.test.ts`;
  modificados `features/contratos/schemas.ts`,
  `features/contratos/components/{ContratoForm,ContratoDetalle,ContratosListado,ContratoCrear,ContratoEditar}.tsx`
  y `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`. Sin cambios en
  `package.json`/`package-lock.json`, `shared/api/openapi/*`, `shared/ui`, ESLint, Prettier ni
  Jest; sin dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (27 suites / 248 tests) en verde; comprobación HTTP independiente del BFF (`GET /api/compras`
  sin sesión → `401`). `V5` (registro, edición, eliminación y `409` de contrato con ventas, además
  de accesibilidad) queda a cargo del usuario con los pasos documentados en `impl.md`.
  `bash .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_19-55__ventas-listado-global-y-registro-por-contrato`

- **Work Item:** `2026-09-22_19-55__ventas-listado-global-y-registro-por-contrato` —
  Ventas: listado global y por contrato, registro y desglose de solo lectura
  (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó la gestión de ventas (R1–R29, T1–T11). (1) BFF de
  ventas en `app/api/ventas/*`: `GET` paginado con `limite`/`offset` y `contrato_id`
  opcional, `POST` con validación defensiva (`CrearVentaDto`) → `201`, mensajes en español y
  propagación del código real (red → `502`); `[id]/route.ts` solo expone `GET`
  (`params: Promise<...>`) y no exporta `PATCH`/`PUT`/`DELETE`. (2) Feature `features/ventas`
  autocontenido: aliases del OpenAPI más `FiltrosVentas` y `ContratoVenta`, `api/ventas.ts`
  (`listarVentas`, `crearVenta`, sin `obtenerVenta`), `clavesVentas`, `useVentas`
  (`keepPreviousData`) y `useCrearVenta` (invalida `clavesVentas.listas()`), `esquemaVenta`
  con `fechaLocalAIso`, `mensajes-error.ts`, `formatos.ts` (`Intl.NumberFormat('es-CO')`) y
  componentes `VentaCard` (seis cifras destacadas + datos secundarios), `VentasLista`
  (carga/vacío/error y `TablePagination`), `VentaForm`/`VentaFormModal`,
  `ResultadoVentaModal` (desglose completo) y contenedores `VentasSeccion` (embebido) y
  `VentasListado` (global, filtro que reinicia paginación). Sin edición/eliminación ni
  manejo de `405`/`403`. (3) Cambios de soporte: `shared/ui` exporta `TablePagination` con
  JSDoc actualizado; `features/contratos` exporta `useContratos` y `Contrato`; se elimina
  `VentasProximamente` conservando `shared/ui/Proximamente`; `ContratoDetalle` pasa a
  "Próximamente: ciclos y costos.". (4) Composición en `app/`: `detalle-con-relaciones.tsx`
  añade `<VentasSeccion>` con `onCambio` que invalida `clavesContratos.todas`, y la ruta
  `/ventas` compone `listado-con-contratos.tsx` con `useContratos` proyectado a
  `ContratoVenta`. (5) Tests puros de `schemas`, `mensajes-error`, `query-keys` y `formatos`.
- **Archivos modificados:** creados `app/api/ventas/{route.ts,[id]/route.ts}`,
  `app/(dashboard)/ventas/_components/listado-con-contratos.tsx`, `features/ventas/**`
  (tipos, `api/`, `query-keys.ts`, `hooks/`, `schemas.ts`, `mensajes-error.ts`, `formatos.ts`,
  `components/`, `index.ts` y `__tests__/`); modificados `shared/ui/{index.ts,TablePagination.tsx}`,
  `features/contratos/{index.ts,components/ContratoDetalle.tsx}`,
  `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`,
  `app/(dashboard)/ventas/page.tsx` y `features/ventas/index.ts`; eliminado
  `features/ventas/components/VentasProximamente.tsx`. Sin cambios en
  `package.json`/`package-lock.json`, `shared/api/openapi/*`, ESLint, Prettier ni Jest; sin
  dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (31 suites / 274 tests) en verde; `npx next typegen` correcto; `bash .rei/init.sh` finaliza
  con código de salida `0`. `V5` (registro y desglose en ambas superficies) queda a cargo del
  usuario con los pasos documentados en `impl.md`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_21-20__ciclos-listado-registro-edicion-y-eliminacion-en-contrato`

- **Work Item:** `2026-09-22_21-20__ciclos-listado-registro-edicion-y-eliminacion-en-contrato`
  — Ciclos: listado, registro, edición y eliminación embebidos en el detalle del contrato
  (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó el CRUD de ciclos (checkpoints de engorde) dentro del
  detalle del contrato, replicando los patrones de `compras` (R1–R26, T1–T18). (1) Helpers
  solo-día en `shared/lib/fechas.ts` (`fechaDiaAIso`, `isoAFechaDia`, `formatearFechaDia`) en
  zona del negocio (Colombia, UTC−5). (2) Feature `ciclos` autocontenido: alias de DTOs del
  OpenAPI, `clavesCiclos`, `api/ciclos.ts` sobre `createBffClient`, hooks de consulta
  (`useCiclos` con `keepPreviousData`) y mutaciones que invalidan `clavesCiclos.listas()`,
  `esquemaCiclo` zod, `mensajes-error` por estado HTTP y componentes `CiclosSeccion`,
  `CicloForm`, `CicloFormModal` y `EliminarCicloModal` (confirmación con `Modal`, sin
  `window.confirm`). (3) BFF `app/api/ciclos/{route.ts,[id]/route.ts}` para listar, crear,
  consultar, actualizar y eliminar, con validación defensiva, código HTTP real (red → `502`)
  y mensajes en español sin exponer el cuerpo crudo. (4) `useContrato` exportado desde
  `features/contratos` y `CiclosSeccion` compuesta en `detalle-con-relaciones.tsx`, pasando
  `contratoId`, `contratoEstado` y `onCambio` (invalida `clavesContratos.todas`); el registro
  se deshabilita con el contrato cerrado y editar/eliminar permanecen disponibles. (5)
  Retirada de la ruta global `/ciclos`, su enlace de menú y el placeholder
  `CiclosProximamente` (R26). (6) Tests puros de `schemas`, `mensajes-error`, `query-keys` y
  fechas. (7) Corrección posterior a la primera revisión: se eliminó la configuración residual
  de `/ciclos` en `middleware.ts` (`RUTAS_PROTEGIDAS` y `config.matcher`), conservando
  `/ventas` y `/costos`.
- **Archivos modificados:** creados `features/ciclos/**` (tipos, `api/`, `query-keys.ts`,
  `hooks/`, `schemas.ts`, `mensajes-error.ts`, `components/`, `index.ts` y `__tests__/`) y
  `app/api/ciclos/{route.ts,[id]/route.ts}`; modificados `shared/lib/fechas.ts` y su test,
  `features/ciclos/index.ts`, `features/contratos/index.ts`,
  `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`,
  `app/(dashboard)/layout.tsx` y `middleware.ts`; eliminados `app/(dashboard)/ciclos/page.tsx`
  y `features/ciclos/components/CiclosProximamente.tsx`. Sin cambios en
  `package.json`/`package-lock.json`, `shared/api/openapi/*`, `shared/ui`, ESLint, Prettier
  ni Jest; sin dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (34 suites / 304 tests) en verde; `bash .rei/init.sh` finaliza con código de salida `0`.
  `V5` (listado, registro con contrato activo/cerrado, edición, eliminación y errores) queda
  a cargo del usuario con los pasos documentados en `impl.md`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_22-16__costos-listado-registro-edicion-y-eliminacion-en-contrato`

- **Work Item:** `2026-09-22_22-16__costos-listado-registro-edicion-y-eliminacion-en-contrato`
  — Costos: listado, registro, edición y eliminación embebidos en el detalle del contrato
  (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó el CRUD de costos informativos dentro del detalle del
  contrato, replicando los patrones de `compras` y `ciclos` (R1–R20, T1–T21). (1) Feature
  `costos` autocontenido: alias de DTOs del OpenAPI (`Costo`, `PaginaCostos`, `CrearCosto`,
  `ActualizarCosto`) más `FiltrosCostos`, `clavesCostos`, `api/costos.ts` sobre
  `createBffClient`, hooks de consulta (`useCostos` con `keepPreviousData`) y mutaciones que
  invalidan `clavesCostos.listas()`, `esquemaCosto` zod (cuatro campos requeridos, monto > 0,
  fecha solo-día con `fechaDiaAIso`), `mensajes-error` por estado HTTP (400/404/0/resto) y
  componentes `CostosSeccion`, `CostoForm` (con `datalist` de sugerencias y aviso
  informativo), `CostoFormModal` y `EliminarCostoModal` (confirmación con `Modal`, sin
  `window.confirm`). (2) BFF `app/api/costos/{route.ts,[id]/route.ts}` para listar, crear,
  consultar, actualizar y eliminar, con validación defensiva, código HTTP real (red → `502`)
  y mensajes en español sin exponer el cuerpo crudo. (3) `CostosSeccion` compuesta en
  `detalle-con-relaciones.tsx` con `contratoId`, `contratoEstado` (desde `useContrato`) y
  `onCambio` (invalida `clavesContratos.todas`); el registro se deshabilita con el contrato
  cerrado y editar/eliminar permanecen disponibles. (4) La sección y el formulario muestran
  de forma visible que los costos son informativos y no afectan el cálculo de la utilidad
  real; el monto se presenta como moneda es-CO. (5) Retirada la ruta global `/costos`, su
  enlace de menú, su protección de middleware y el placeholder `CostosProximamente`; se
  eliminó también `shared/ui/Proximamente.tsx` (sin consumidores) y la sección
  "Próximamente: ciclos y costos" de `ContratoDetalle`. (6) Tests puros de `schemas`,
  `mensajes-error` y `query-keys`.
- **Archivos modificados:** creados `features/costos/**` (tipos, `query-keys.ts`,
  `schemas.ts`, `mensajes-error.ts`, `api/`, `hooks/`, `components/`, `index.ts` y
  `__tests__/`) y `app/api/costos/{route.ts,[id]/route.ts}`; modificados
  `features/costos/index.ts`, `features/contratos/components/ContratoDetalle.tsx`,
  `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`,
  `app/(dashboard)/layout.tsx`, `middleware.ts` y `shared/ui/index.ts`; eliminados
  `features/costos/components/CostosProximamente.tsx`, `app/(dashboard)/costos/page.tsx` y
  `shared/ui/Proximamente.tsx`. Sin cambios en `package.json`/`package-lock.json`,
  `shared/api/openapi/*`, ESLint, Prettier ni Jest; sin dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (37 suites / 330 tests) en verde; `bash .rei/init.sh` finaliza con código de salida `0`.
  `V5` (listado, registro con contrato activo/cerrado, edición, eliminación, aviso
  informativo y errores) queda a cargo del usuario con los pasos documentados en `impl.md`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_22-45__dashboard-reportes-vista-principal`

- **Work Item:** `2026-09-22_22-45__dashboard-reportes-vista-principal` — Dashboard: vista
  principal de reportes con tarjetas resumen (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó la vista principal de `/dashboard` como un feature
  `dashboard` autocontenido (R1–R13, T1–T13) que consume `GET /api/v1/reportes/dashboard` a
  través de un Route Handler BFF y muestra las ocho cifras del `ResumenDashboardDto` en
  tarjetas con la jerarquía tipográfica de `design.md`. (1) Fundaciones del feature:
  `types.ts` (alias `ResumenDashboard`/`ReporteDashboard` derivados del OpenAPI),
  `query-keys.ts`, `formato.ts` (`Intl.NumberFormat` es-CO: COP sin decimales y conteo con
  separador de miles), `mensajes-error.ts`, `api/dashboard.ts` sobre `createBffClient` y
  `hooks/useReporteDashboard.ts` (`useQuery`). (2) BFF `app/api/reportes/dashboard/route.ts`
  con `createServerClient`, `NextResponse.json(reporte)` y propagación del código HTTP real
  vía `respuestaError`. (3) UI: `TarjetaResumen` presentacional (`titulo`, `valor`, `nivel`)
  y `ResumenDashboard` cliente con `Skeleton` en `isPending`, `<p role="alert">` en error y
  las ocho tarjetas en éxito; la cifra protagonista es la utilidad real del comerciante
  (verde, `text-4xl font-bold`), secundarias la utilidad bruta y de terceros (`text-3xl`),
  y menores los cuatro conteos y los costos informativos (`text-2xl`). (4) Integración en
  `app/(dashboard)/dashboard/page.tsx` dentro de `mx-auto w-full max-w-4xl`, conservando
  `metadata` y un `<h1>Panel</h1>`. (5) Tests puros de `formato`, `mensajes-error` y
  `query-keys`. Sin recálculo en el cliente, sin dependencias nuevas ni cambios en el
  OpenAPI local.
- **Archivos modificados:** creados `features/dashboard/**` (tipos, `query-keys.ts`,
  `formato.ts`, `mensajes-error.ts`, `api/`, `hooks/`, `components/`, `index.ts` y
  `__tests__/`) y `app/api/reportes/dashboard/route.ts`; modificado
  `app/(dashboard)/dashboard/page.tsx`. Sin cambios en `package.json`/`package-lock.json`,
  `shared/api/openapi/*`, `shared/ui`, ESLint, Prettier ni Jest; sin dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (40 suites / 340 tests) en verde; `bash .rei/init.sh` finaliza con código de salida `0`.
  `V5` (ocho cifras, jerarquía visual, formato es-CO, skeleton y mensaje de error) queda a
  cargo del usuario con los pasos documentados en `impl.md`.
- **Estado final:** `done`.

---

## 2026-09-22 — `2026-09-22_23-02__reportes-contratos-activos-e-historial-ventas`

- **Work Item:** `2026-09-22_23-02__reportes-contratos-activos-e-historial-ventas` —
  Reportes: contratos activos con métricas e historial de ventas (`type: feature`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se implementó el feature nuevo `features/reportes` con las dos
  vistas de reportes del comerciante (R1–R19, T1–T20). (1) Fundaciones del feature:
  `types.ts` (alias `ReporteContratosActivos`, `ContratoActivoDetalle`, `ReporteHistorialVentas`,
  `ResumenHistorialVentas`, `VentaHistorialItem` desde `ApiSchemas`), `query-keys.ts`
  (`clavesReportes`), `formatos.ts` (`Intl.NumberFormat` es-CO: moneda COP, conteo, número y
  porcentaje), `mensajes-error.ts` (conexión `0` y genérico en español), `orden.ts`
  (`LIMITE_VENTAS_VISIBLES = 50`, `ordenarContratosPorUtilidadDescendente`,
  `ordenarVentasPorFechaDescendente` y `recortarVentas`), `api/reportes.ts` sobre
  `createBffClient` y los dos hooks `useQuery`. (2) BFF `app/api/reportes/{contratos-activos,
  historial-ventas}/route.ts` con `createServerClient`, `NextResponse.json(reporte)` y
  propagación del código HTTP real vía `respuestaError`. (3) UI: `TarjetaIndicador`
  presentacional, `ContratosActivosReporte` (tabla ordenada por utilidad descendente) e
  `HistorialVentasReporte` (resumen de siete campos, detalle venta por venta y toggle
  "Ver todo"/"Ver menos" con estado local), con `Skeleton` en carga y `<p role="alert">` en
  error. (4) Páginas dedicadas en `app/(dashboard)/reportes/{contratos-activos,historial-ventas}/page.tsx`,
  enlaces desde la página del dashboard sin tocar `ResumenDashboard`, y `/reportes` añadido a
  `RUTAS_PROTEGIDAS` y al `config.matcher` de `middleware.ts`. (5) Sin entradas en el menú
  lateral (decisión explícita del usuario). (6) Tests puros de `formatos`, `mensajes-error`,
  `query-keys` y `orden`. Sin recálculo en el cliente, sin dependencias nuevas ni cambios en el
  OpenAPI local.
- **Archivos modificados:** creados `features/reportes/**` (tipos, `query-keys.ts`,
  `formatos.ts`, `mensajes-error.ts`, `orden.ts`, `api/`, `hooks/`, `components/`, `index.ts` y
  `__tests__/`), `app/api/reportes/{contratos-activos,historial-ventas}/route.ts`,
  `app/(dashboard)/reportes/{contratos-activos,historial-ventas}/page.tsx`; modificados
  `middleware.ts` y `app/(dashboard)/dashboard/page.tsx`. Sin cambios en
  `package.json`/`package-lock.json`, `shared/api/openapi/*`, `shared/ui`, ESLint, Prettier,
  Jest ni `app/(dashboard)/layout.tsx`; sin dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests
  (44 suites / 366 tests; 4 suites / 26 tests nuevos de `reportes`) en verde; `bash .rei/init.sh`
  finaliza con código de salida `0`. `V5` (enlaces del dashboard, orden descendente, formato
  es-CO, resumen completo, toggle, skeleton y error) queda a cargo del usuario con los pasos
  documentados en `impl.md`.
- **Estado final:** `done`.

---

## 2026-09-23 — `2026-09-23_01-48__docs-contexto-y-public-assets`

- **Work Item:** `2026-09-23_01-48__docs-contexto-y-public-assets` — Documentación de
  contexto en `docs/` y carpeta `public/assets` para imágenes (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se dejó utilizable la documentación de contexto agregada en `docs/`
  y se preparó la carpeta de estáticos de Next.js `public/assets/` para alojar imágenes. Se
  añadió `docs/` a `.prettierignore` (sección «Documentación de contexto», tras el bloque
  `# Estáticos`) para excluir la documentación del checkpoint `V1` sin reformatearla, y se
  creó `public/assets/.gitkeep` (vacío) para versionar la carpeta (`public/` ya estaba
  ignorado por Prettier). No se modificó código fuente, dependencias, OpenAPI local ni BFF.
- **Archivos modificados:** modificado `.prettierignore`; creado `public/assets/.gitkeep`.
  `docs/01-contextualizacion-elinain.md` conservado sin cambios (mtime anterior al Work Item).
  Sin cambios en `.rei/init.sh` ni en las plantillas del arnés.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests en verde
  (revisión independiente); `V5` no aplica (sin comportamiento de UI ni flujos interactivos).
  `bash .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done`.

---

## 2026-09-23 — `2026-09-23_02-45__rediseño-visual-pantalla-inicio-sesion`

> Entrada reconstruida: el Work Item quedó en `done` pero su reviewer no lo registró en su
> momento; se añade al detectarse durante el Work Item siguiente. No se modifica ninguna
> entrada anterior.

- **Work Item:** `2026-09-23_02-45__rediseño-visual-pantalla-inicio-sesion` — Rediseño visual
  de la pantalla de inicio de sesión (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se refinó la presentación visual de `/login` con una composición de
  dos columnas (formulario y aside con imagen), acento ámbar y estilos oscuros en el
  formulario. Se crearon `features/auth/auth-styles.ts` y
  `features/auth/components/AuthField.tsx`, y se añadió `LoginShell` al barrel del feature.
- **Archivos modificados:** `app/(auth)/login/page.tsx`, `app/globals.css`,
  `features/auth/components/LoginForm.tsx`, `features/auth/index.ts`, y creados
  `features/auth/auth-styles.ts`, `features/auth/components/AuthField.tsx` y
  `features/auth/components/LoginShell.tsx`.
- **Resultado de la verificación:** `V1`–`V4` en verde; `V5` ejecutada parcialmente con Chrome
  headless en desktop y móvil, sin certificar todos los estados interactivos.
  `bash .rei/init.sh` finaliza con código de salida `0`.
- **Estado final:** `done` (el resultado visual quedó incompleto; corregido en el Work Item
  `2026-09-23_03-18__correccion-visual-pantalla-inicio-sesion`).

---

## 2026-09-23 — `2026-09-23_03-18__correccion-visual-pantalla-inicio-sesion`

- **Work Item:** `2026-09-23_03-18__correccion-visual-pantalla-inicio-sesion` — Corrección
  visual de la pantalla de inicio de sesión (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre). La delegación vía subagente no estuvo disponible por saldo insuficiente
  del modelo del subagente; la ejecución se llevó a cabo en el agente principal manteniendo los
  artefactos del arnés.
- **Trabajo realizado:** se corrigió el resultado visual incompleto del rediseño de `/login`.
  (1) Causa raíz: el layout `(auth)` imponía fondo claro y centrado (`bg-zinc-50 px-4 py-12`) y
  `LoginShell` solo superponía un degradado transparente, dejando el texto blanco invisible
  sobre el blanco del `body`. (2) `app/(auth)/layout.tsx` pasa a ser neutro (solo renderiza
  `children`). (3) `app/(auth)/registro/page.tsx` asume el envoltorio claro y centrado para
  conservar su apariencia idéntica. (4) `LoginShell` pinta fondo oscuro a pantalla completa
  (`min-h-dvh bg-elinain-bg` + acento radial dorado), con badge real, contraste corregido y un
  aside con `glass-panel` etiquetado "Vista de ejemplo" con indicadores en `—` (sin cifras) y
  conceptos reales del producto. (5) Ajustes de contraste en `LoginForm` y `auth-styles`, sin
  cambios funcionales.
- **Archivos modificados:** `app/(auth)/layout.tsx`, `app/(auth)/registro/page.tsx`,
  `features/auth/components/LoginShell.tsx`, `features/auth/components/LoginForm.tsx`,
  `features/auth/auth-styles.ts`. Sin cambios en hooks, `api/`, esquemas, navegación ni flujo de
  autenticación; sin dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests en verde;
  `bash .rei/init.sh` finaliza con código de salida `0`. `V5` ejecutada parcialmente con Chrome
  headless (login 1440x900 y 390x844, registro 1440x900) con resultados correctos; la
  confirmación explícita del usuario y los estados interactivos quedan pendientes.
- **Estado final:** `done`.

---

## 2026-09-23 — `2026-09-23_10-13__rediseno-visual-pantalla-registro`

- **Work Item:** `2026-09-23_10-13__rediseno-visual-pantalla-registro` — Rediseño visual de la
  pantalla de registro (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre). La delegación vía subagente no estuvo disponible por saldo insuficiente
  del modelo del subagente; la ejecución se llevó a cabo en el agente principal manteniendo los
  artefactos del arnés.
- **Trabajo realizado:** se aplicó a `/registro` el lenguaje visual oscuro de `/login` sin tocar
  su funcionalidad. (1) Se extrajeron los iconos compartidos a `AuthIcons.tsx`
  (`IconoCorreo`, `IconoCandado`, `IconoUsuario`, `BotonVisibilidad`). (2) Se creó
  `AuthShell.tsx`, shell compartido con fondo oscuro a pantalla completa, columna izquierda
  (marca, insignia, título, descripción y formulario) y aside de imagen con pill y panel lateral.
  (3) `LoginShell` pasó a usar `AuthShell` sin cambios visuales (captura idéntica por `md5sum`).
  (4) Se creó `RegistroShell` con copy de registro y un panel rotulado "Vista de ejemplo" con
  cifras de ejemplo y conceptos reales del producto. (5) `RegistroForm` se reestilizó en oscuro
  con `AuthField`, CTA y error del tema, conservando los tres campos y su validación. (6) La
  página de registro y el barrel `@/features/auth` se actualizaron.
- **Archivos modificados:** creados `features/auth/components/{AuthShell,AuthIcons,RegistroShell}.tsx`;
  modificados `features/auth/components/{LoginShell,LoginForm,RegistroForm}.tsx`,
  `app/(auth)/registro/page.tsx` y `features/auth/index.ts`. Sin cambios en hooks, `api/`,
  esquemas, navegación, `middleware.ts`, `app/(auth)/layout.tsx` ni `app/globals.css`; sin
  dependencias nuevas.
- **Resultado de la verificación:** `V1` formato, `V2` lint, `V3` tipos y `V4` tests en verde;
  `bash .rei/init.sh` finaliza con código de salida `0`. `V5` ejecutada parcialmente con Chrome
  headless (login 1440x900 idéntico por `md5sum`; registro 1440x900 y 390x844 correctos); la
  confirmación explícita del usuario y los estados interactivos quedan pendientes.
- **Estado final:** `done`.

---

## 2026-09-23 — `2026-09-23_10-56__rediseno-visual-dashboard`

- **Work Item:** `2026-09-23_10-56__rediseno-visual-dashboard` — Rediseño visual del dashboard (`type: feature`).
- **Agente:** `reviewer`.
- **Trabajo realizado:** revisión final del rediseño visual del área protegida. Se confirmó la corrección arquitectónica que elimina los imports directos del dashboard hacia `features/auth/auth-styles.ts`, conservando la utilidad de foco en `app/(dashboard)/dashboard-styles.ts`. Se verificó que la composición, navegación, consulta, formateadores, estados, rutas y cierre de sesión cumplen la planificación.
- **Archivos modificados:** `app/(dashboard)/layout.tsx`, `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/dashboard-styles.ts`, `app/(dashboard)/loading.tsx`, componentes de `features/dashboard`, y documentación del Work Item.
- **Resultado de la verificación:** `V1` formato, `V2` lint y `V3` tipos pasan. `V4` aceptada con la evidencia del usuario: `npm test -- --runInBand`, 44 suites y 366 tests pasando. La ejecución local reproduce el error de `next/jest` antes de ejecutar tests. `V5` queda pendiente de validación visual manual del usuario.
- **Estado final:** `done`.

---

## 2026-09-23 — `2026-09-23_12-24__ajustes-sutiles-dashboard-referencia-visual`

- **Work Item:** `2026-09-23_12-24__ajustes-sutiles-dashboard-referencia-visual` — Ajustes
  sutiles del dashboard según referencia visual (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se refinó exclusivamente la composición visual del dashboard:
  jerarquía financiera, rejilla operativa, navegación, loading, error, foco visible,
  responsive y superficies sólidas carbón para las tarjetas. Se conservaron las ocho
  métricas, las rutas existentes y toda la lógica de datos.
- **Archivos modificados:** `app/(dashboard)/dashboard/page.tsx`,
  `app/(dashboard)/layout.tsx`, `app/(dashboard)/loading.tsx`,
  `app/(dashboard)/dashboard-styles.ts`,
  `features/dashboard/components/ResumenDashboard.tsx` y
  `features/dashboard/components/TarjetaResumen.tsx`.
- **Resultado de la verificación:** V1, V2 y V3 pasan. V4 se acepta con la evidencia
  explícita del usuario de 44 suites y 366 tests exitosos. V5 queda pendiente de
  validación manual en móvil y escritorio.
- **Estado final:** `done`.

---

## 2026-09-23 — `2026-09-23_14-29__rediseno-visual-socios-participacion`

- **Work Item:** `2026-09-23_14-29__rediseno-visual-socios-participacion` — Rediseño
  visual de socios de participación (`type: task`).
- **Agente:** `reviewer`.
- **Trabajo realizado:** se revisó el rediseño visual de `/terceros`, confirmando que el
  resumen usa únicamente `total` y `filas.length`, con superficies oscuras sólidas,
  estados de carga/vacío/error y una variante visual opcional para la tabla y paginación.
- **Archivos revisados:** `app/(dashboard)/terceros/page.tsx`,
  `app/(dashboard)/terceros/loading.tsx`, `features/terceros/components/TercerosTable.tsx`,
  `shared/ui/Table.tsx` y `shared/ui/TablePagination.tsx`.
- **Resultado de la verificación:** V1, V2 y V3 pasan. V4 se acepta con la evidencia
  explícita del usuario de 44 suites y 366 tests exitosos; la ejecución local reproduce
  el error previo de `next/jest` antes de iniciar Jest. V5 queda pendiente de validación
  manual del usuario en `/terceros`.
- **Estado final:** `done`.

---

## 2026-09-23 — `2026-09-23_15-46__rediseno-visual-fincas`

- **Work Item:** `2026-09-23_15-46__rediseno-visual-fincas` — Rediseño visual de fincas
  (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se refinó visualmente la ruta `/fincas` (pestañas Listado y Mapa) con
  la composición oscura premium del dashboard y el rediseño de socios, sin alterar
  comportamiento, rutas, datos ni lógica de negocio. (1) `page.tsx` queda como contenedor
  delgado `max-w-7xl`; `FincasTabs` compone el encabezado (eyebrow dorado, `h1` con
  `aria-labelledby`, descripción), el CTA `Nueva finca` (`/fincas/nueva`) y el control
  segmentado tipo píldora `Listado | Mapa`, conservando `role="tab"`, `aria-selected`,
  `aria-controls`, el estado local `vista` y la carga diferida del mapa (`dynamic` con
  `ssr: false`). (2) `FincasTable` añade dos tarjetas `glass-panel` con `total` y `filas.length`
  (`—` en carga/error), usa `Table tema="oscuro"` con las columnas intactas
  `Nombre`/`Dirección`/`Propietario`/`Acciones`, avatares de iniciales, icono de ubicación y
  acciones `Editar`/`Eliminar` restilizadas. (3) `FincasMapa` usa superficie carbón, estados
  oscuros y popup oscuro acotado por `.mapa-fincas` en `globals.css`; `FincaDetalleModal` pasa a
  panel oscuro con `Modal tema="oscuro"` mostrando solo nombre, propietario, dirección y
  coordenadas. (4) `loading.tsx` reproduce la estructura final sin saltos de layout. (5)
  `shared/ui/Modal.tsx` añade la prop visual opcional `tema` (`"claro"` por defecto); sin
  cambios de comportamiento para los consumidores actuales.
- **Archivos modificados:** `app/(dashboard)/fincas/page.tsx`,
  `app/(dashboard)/fincas/loading.tsx`,
  `app/(dashboard)/fincas/_components/listado-con-propietarios.tsx`,
  `features/fincas/components/{FincasTabs,FincasTable,FincasMapa,FincaDetalleModal}.tsx`,
  `shared/ui/Modal.tsx` y `app/globals.css`. Sin cambios en hooks, `api/`, tipos, queries,
  mutaciones, paginación, rutas, permisos, toasts ni mensajes funcionales; sin cambios en
  `package.json`/`package-lock.json`; sin dependencias nuevas.
- **Resultado de la verificación:** V1 (`format:check`), V2 (`lint`), V3 (`typecheck`) y V4
  (`test`, 44 suites / 366 tests) en verde, ejecutados por el Reviewer; `bash .rei/init.sh`
  finaliza con código de salida `0`. V5 (validación manual de ambas pestañas, estados y
  responsive) queda a cargo del usuario con los pasos documentados en `impl.md`.
- **Estado final:** `done`.

---

## 2026-09-23 — `2026-09-23_16-01__mejora-visual-tabla-fincas`

- **Work Item:** `2026-09-23_16-01__mejora-visual-tabla-fincas` — Mejora visual de la tabla
  de fincas (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se refinó la tabla del listado de `/fincas` (pestaña Listado) con
  filas tipo tarjeta rica, usando solo datos reales del DTO `FincaRespuestaDto`. (1) Columna
  `Nombre`: icono de predio `svg` inline (sin dependencias) con acento dorado sobre
  `bg-white/[0.08]`, `finca.nombre` en blanco y debajo `ID: {finca.id}` en texto pequeño
  tenue truncado con CSS; `obtenerIniciales` se conserva solo para el avatar del propietario.
  (2) Columna `Dirección`: pin existente más una segunda línea con `latitud, longitud` reales.
  (3) Densidad tipo tarjeta: `Table` gana la prop visual opcional `paddingFilas` (por defecto
  sin efecto) y `FincasTable` la usa con `py-6`. (4) Acciones: `Editar` y `Eliminar` con
  `shrink-0`/`whitespace-nowrap` y paleta oscura, conservando rutas y comportamiento; el
  esqueleto de `loading.tsx` pasa a `py-6` para acompañar la densidad.
- **Archivos modificados:** `features/fincas/components/FincasTable.tsx`,
  `shared/ui/Table.tsx` y `app/(dashboard)/fincas/loading.tsx`. Sin cambios en hooks, `api/`,
  tipos, queries, mutaciones, paginación, rutas, modales, toasts ni mensajes funcionales; sin
  cambios en `package.json`/`package-lock.json`; sin dependencias nuevas.
- **Resultado de la verificación:** V1 (`format:check`), V2 (`lint`), V3 (`typecheck`) y V4
  (`test`, 44 suites / 366 tests) en verde, ejecutados por el Reviewer; `bash .rei/init.sh`
  finaliza con código de salida `0`. V5 (validación manual sobre `/fincas`, pestaña Listado)
  queda a cargo del usuario con los pasos documentados en `impl.md`.
- **Estado final:** `done`.

---

## 2026-09-23 — `2026-09-23_16-29__rediseno-visual-listado-contratos`

- **Work Item:** `2026-09-23_16-29__rediseno-visual-listado-contratos` — Rediseño visual del
  listado de contratos (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se refinó visualmente la ruta `/contratos` (página de listado, no el
  detalle) con la composición oscura premium del shell, conservando comportamiento, rutas,
  paginación, queries, mensajes y acciones. (1) `page.tsx` queda como contenedor delgado
  `mx-auto w-full max-w-7xl`; `ContratosListado` compone el encabezado (eyebrow dorado, `h1`
  "Contratos" con `aria-labelledby`, descripción) y el CTA `Nuevo contrato`
  (`/contratos/nuevo`). (2) Lógica pura nueva `features/contratos/resumen.ts`
  (`calcularResumenContratos`: contratos activos, cabezas en pie, peso promedio y split
  promedio, ignorando nulos y redondeando a entero) consumida por cuatro tarjetas
  `glass-panel` con `—` en carga/error y `aria-live="polite"`. (3) Chips de filtro con
  contador (`Todos`/`Activos`/`Cerrados`) que reemplazan al `Select` y reinician la
  paginación. (4) Tabla `tema="oscuro"` con las columnas Código/Apertura, Tercero (avatar de
  iniciales), Finca/Predio, Estatus (badge + fecha de cierre), Participación (texto + barra),
  Lote & Peso prom. (cabezas, kg y raza) y Acciones (`Ver detalle`/`Editar`), usando solo
  campos reales de `ContratoRespuestaDto` y las proyecciones `TerceroContrato`/`FincaContrato`.
  (5) Estados de carga, error y vacío adaptados al tema oscuro y `loading.tsx` sincronizado.
  Sin buscador, menú kebab, «Ajustes Lotes», proyección de ganancia ni métricas derivadas de
  multiplicaciones.
- **Archivos modificados:** `app/(dashboard)/contratos/{page.tsx,loading.tsx,_components/listado-con-relaciones.tsx}`,
  `features/contratos/components/ContratosListado.tsx`; creados
  `features/contratos/resumen.ts` y `features/contratos/__tests__/resumen.test.ts`. Sin
  cambios en hooks, `api/`, tipos, queries, mutaciones, paginación, rutas, `shared/ui` ni el
  detalle del contrato; sin dependencias nuevas.
- **Resultado de la verificación:** V1 (`format:check`), V2 (`lint`), V3 (`typecheck`) y V4
  (`test`, 45 suites / 374 tests, incluidos los 8 nuevos de `resumen.test.ts`) en verde,
  ejecutados por el Reviewer; `bash .rei/init.sh` finaliza con código de salida `0`. V5
  (validación manual sobre `/contratos`, ruta protegida) queda a cargo del usuario con los
  pasos documentados en `impl.md`.
- **Estado final:** `done`.

---

## 2026-09-23 — `2026-09-23_17-28__rediseno-visual-detalle-contrato`

- **Work Item:** `2026-09-23_17-28__rediseno-visual-detalle-contrato` — Rediseño visual del
  detalle de contrato (`type: task`).
- **Agentes:** `spec_author` (planificación), `implementer` (implementación), `reviewer`
  (revisión y cierre).
- **Trabajo realizado:** se rediseñó visualmente `/contratos/[id]` al tema oscuro del shell
  conservando comportamiento, rutas, queries, mutaciones, paginación, permisos, modales,
  toasts y mensajes. (1) `ContratoDetalle` con enlace "Volver a Contratos", encabezado oscuro
  (título, código truncado, badges de reparto y estado, subtítulo con finca/raza/vigencia),
  ficha `glass-panel` "Ficha técnica & balance de custodia" con campos reales de
  `ContratoRespuestaDto` y barra de reparto, y única acción "Editar contrato". (2) Las cuatro
  secciones (compras, ciclos, costos y ventas) se convirtieron en pestañas accesibles
  (`tablist`/`tab`/`tabpanel`, siempre montadas y las inactivas `hidden`) con contador
  alimentado por la prop opcional `onTotal` (callback estable del contenedor). (3) Cada
  pestaña rediseñada con `Table tema="oscuro"`: compras con totales de volumen e inversión
  (`calcularTotalesCompras`), ciclos con evolución frente al pesaje previo y aviso del último
  delta (`calcularEvolucionPesajes`), costos con nota fiduciaria oscura y ventas con tarjeta
  de liquidación (`calcularDistribucionLiquidacion`) más la prop visual `tema` en
  `VentaCard`/`VentasLista` con `"claro"` por defecto. Se conservan "Registrar compra/ciclo",
  "Agregar costo" y "Registrar venta" con sus modales; no se añadieron acciones nuevas.
- **Archivos modificados:** `app/(dashboard)/contratos/_components/detalle-con-relaciones.tsx`,
  `features/contratos/components/ContratoDetalle.tsx`,
  `features/compras/components/ComprasSeccion.tsx`,
  `features/ciclos/components/CiclosSeccion.tsx`,
  `features/costos/components/CostosSeccion.tsx`,
  `features/ventas/components/{VentasSeccion,VentasLista,VentaCard}.tsx`; creados
  `features/{compras/totales,ciclos/evolucion,ventas/liquidacion}.ts` y sus
  `__tests__/*.test.ts`. Sin cambios en hooks, `api/`, tipos, queries, mutaciones, paginación,
  rutas, permisos, modales, toasts, mensajes, `shared/ui`, `ContratosListado` ni el listado
  global de ventas; sin dependencias nuevas.
- **Resultado de la verificación:** V1 (`format:check`), V2 (`lint`), V3 (`typecheck`) y V4
  (`test`, 48 suites / 387 tests) en verde, ejecutados por el Reviewer; `bash .rei/init.sh`
  finaliza con código de salida `0`. V5 (validación manual sobre `/contratos/[id]`, ruta
  protegida) queda a cargo del usuario con los pasos documentados en `impl.md`; no se marca
  como superada.
- **Estado final:** `done`.
