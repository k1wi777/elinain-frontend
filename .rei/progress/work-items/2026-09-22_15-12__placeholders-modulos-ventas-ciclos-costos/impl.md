# Implementación — Preparación de módulos bloqueados: ventas, ciclos y costos

> Work Item: `2026-09-22_15-12__placeholders-modulos-ventas-ciclos-costos` (`type: task`)
> Agente: `implementer`

## Resumen

Implementado íntegramente el `plan.md`: pieza presentacional compartida `Proximamente`, los tres
features (`ventas`, `ciclos`, `costos`) con su marcador de posición y barrel, las tres páginas
protegidas con su `metadata`, los enlaces de navegación y la protección de rutas en
`middleware.ts`. Sin lógica de negocio, sin llamadas a la API, sin dependencias nuevas y sin
lógica pura nueva (no se añaden tests).

## Archivos creados

| Archivo | Contenido |
|---------|-----------|
| `shared/ui/Proximamente.tsx` | Componente presentacional sin dominio (`titulo`, `descripcion` + aviso "Próximamente."). |
| `features/ventas/components/VentasProximamente.tsx` | Marcador de posición de ventas. |
| `features/ciclos/components/CiclosProximamente.tsx` | Marcador de posición de ciclos. |
| `features/costos/components/CostosProximamente.tsx` | Marcador de posición de costos. |
| `features/ventas/index.ts` | Barrel de una sola exportación. |
| `features/ciclos/index.ts` | Barrel de una sola exportación. |
| `features/costos/index.ts` | Barrel de una sola exportación. |
| `app/(dashboard)/ventas/page.tsx` | Server Component + `metadata.title = "Ventas | Elinain"`. |
| `app/(dashboard)/ciclos/page.tsx` | Server Component + `metadata.title = "Ciclos | Elinain"`. |
| `app/(dashboard)/costos/page.tsx` | Server Component + `metadata.title = "Costos | Elinain"`. |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `shared/ui/index.ts` | Exportado `Proximamente` en el barrel. |
| `app/(dashboard)/layout.tsx` | Añadidos los enlaces `/ventas`, `/ciclos` y `/costos` tras "Contratos", con el estilo existente. |
| `middleware.ts` | Añadidas `"/ventas"`, `"/ciclos"` y `"/costos"` a `RUTAS_PROTEGIDAS`; añadidas cada una y su `:path*` al `config.matcher`. |

No se tocó `shared/api/openapi/*`, el BFF, los features existentes ni `package.json`.

## Verificación

| ID | Comando | Resultado | Observaciones |
|----|---------|-----------|---------------|
| `V1` | `npm run format` + `npm run format:check` | pasa (exit `0`) | Prettier reescribió sin cambios; `All matched files use Prettier code style!`. |
| `V2` | `npm run lint` | pasa (exit `0`) | ESLint sin errores. |
| `V3` | `npm run typecheck` | pasa (exit `0`) | `tsc --noEmit` sin errores. |
| `V4` | `npm test` | pasa (exit `0`) | 24 suites / 224 tests en verde. Sin tests nuevos (no hay lógica pura). |
| `V5` | Validación manual (HTTP contra `npm run dev`) | parcial: rutas, contenido y redirección comprobados por HTTP | Falta la confirmación visual del usuario. |

Además, `bash .rei/init.sh` finaliza con salida `0` (`V1`–`V4` en verde; el `WARN` de sesión
registrada es esperado mientras el Work Item está en curso).

### Evidencia de `V5` (validación por HTTP)

Servidor de desarrollo en `http://localhost:3000` (servidor `next dev` ya activo en el
repositorio; no se dejó ningún proceso adicional).

1. **Rutas existen y redirigen sin sesión** — `curl` sin cookie:

   ```text
   /ventas -> status=307 location=http://localhost:3000/login
   /ciclos -> status=307 location=http://localhost:3000/login
   /costos -> status=307 location=http://localhost:3000/login
   login   -> status=200
   ```

2. **Contenido con sesión** — `curl` con una cookie `elinain_session` con `exp` vigente (el
   middleware solo valida presencia y vigencia del `exp`; no hay llamada al backend):

   ```text
   /ventas -> <title>Ventas | Elinain</title> · <h1>Ventas</h1> · "Próximamente." · descripción del módulo
   /ciclos -> <title>Ciclos | Elinain</title> · <h1>Ciclos</h1> · "Próximamente." · descripción del módulo
   /costos -> <title>Costos | Elinain</title> · <h1>Costos</h1> · "Próximamente." · descripción del módulo
   ```

3. **Navegación** — el HTML de las tres rutas incluye los enlaces `href="/ventas"`,
   `href="/ciclos"` y `href="/costos"` en la cabecera del área protegida.

## Pasos de `V5` para el usuario

1. Con sesión iniciada, comprobar en la cabecera los enlaces "Ventas", "Ciclos" y "Costos"
   junto a los existentes.
2. Visitar `/ventas`, `/ciclos` y `/costos`: cada ruta muestra su título, la descripción y el
   aviso "Próximamente.".
3. Navegar entre las tres rutas con los enlaces de la cabecera.
4. Sin sesión (o con cookie caducada), visitar las tres rutas: el middleware redirige a
   `/login`.

## Observaciones

- El `WARN` "Existe una sesión registrada en `.rei/progress/current.md`" de `init.sh` es el
  aviso esperado del harness mientras el Work Item sigue activo; no es un fallo.
- La validación por HTTP se hizo contra el `next dev` ya activo en el repositorio
  (`http://localhost:3000`); el intento de levantar un segundo server en otro puerto fue
  rechazado por Next ("Another next dev server is already running"), por lo que no quedó
  ningún proceso huérfano.
- El placeholder previo de `ContratoDetalle` ("Próximamente: compras, ventas, ciclos y
  costos.") se mantuvo sin cambios, según el plan.
