# Elinain — Frontend

Frontend web de **Elinain**, una plataforma SaaS para la gestión integral del negocio de **compra, engorde y comercialización de ganado bovino**: inventario, compras y ventas, costos operativos, sanidad animal, ganado en participación con terceros y facturación, con métricas reales de rentabilidad.

Este repositorio contiene únicamente la **interfaz web**. Consume la API REST del backend y no gestiona persistencia propia.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) en modo `strict`
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query) para server state
- [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/) para formularios y validación
- [react-leaflet](https://react-leaflet.js.org/) para mapas
- [Jest](https://jestjs.io/) para tests

## Requisitos

- Node.js 20.9 o superior
- npm

## Puesta en marcha

```bash
git clone <url-del-repositorio>
cd elinain-frontend
npm install
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Las variables viven en un archivo `.env.local` en la raíz del proyecto y **no se versionan**. Cuando se integre la API se usará `NEXT_PUBLIC_API_URL` para las peticiones directas al backend; el resto de operaciones pasan por el BFF en `app/api/`.

## Scripts

| Comando                              | Qué hace                                                |
| ------------------------------------ | ------------------------------------------------------- |
| `npm run dev`                        | Servidor de desarrollo.                                 |
| `npm run build`                      | Build de producción.                                    |
| `npm start`                          | Sirve el build de producción.                           |
| `npm run lint`                       | ESLint.                                                 |
| `npm run typecheck`                  | Chequeo de tipos (`tsc --noEmit`).                      |
| `npm run format`                     | Formatea el código con Prettier.                        |
| `npm run format:check`               | Comprueba el formato sin modificarlo.                   |
| `npm test`                           | Suite completa de Jest.                                 |
| `npm run test:related -- <archivos>` | Solo los tests relacionados con los archivos indicados. |

> **Rendimiento:** valida el rendimiento percibido con `npm run build` + `npm start`. `npm run dev` compila cada ruta on-demand en la primera visita y añade segundos que no existen en la build de producción, que es la experiencia real.

## Estructura

```text
app/          Rutas de Next.js (App Router) y BFF en app/api/
features/     Porciones de negocio autocontenidas
shared/       Código transversal sin dominio (api, ui, lib, config)
public/       Recursos estáticos
.rei/         Arnés de REI: workflow, specs y documentación del proyecto
```

La organización detallada y las reglas de dependencia entre capas están en [`.rei/docs/project/architecture.md`](.rei/docs/project/architecture.md).

## Documentación del proyecto

| Tema                        | Dónde                                                                    |
| --------------------------- | ------------------------------------------------------------------------ |
| Arquitectura                | [`.rei/docs/project/architecture.md`](.rei/docs/project/architecture.md) |
| Convenciones de código      | [`.rei/docs/project/conventions.md`](.rei/docs/project/conventions.md)   |
| Verificación y checkpoints  | [`.rei/docs/project/verification.md`](.rei/docs/project/verification.md) |
| Contexto para agentes de IA | [`AGENTS.md`](AGENTS.md)                                                 |

Antes de trabajar en el repositorio, ejecuta el arnés de verificación:

```bash
bash .rei/init.sh
```

## Convenciones de contribución

- Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/) y se escriben **en inglés** en modo imperativo (por ejemplo `feat: add terceros table`).
- El código se formatea con Prettier; no se discute el formato a mano (`npm run format`).
