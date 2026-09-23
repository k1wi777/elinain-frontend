# Plan — Documentación de contexto en docs/ y public/assets

## Objetivo

Dejar utilizable la documentación de contexto agregada en `docs/` y preparar la carpeta de estáticos de Next.js (`public/assets/`) para alojar imágenes, de modo que `bash .rei/init.sh` finalice con salida 0 (V1–V4 en verde).

## Archivos

- `.prettierignore` — modificar.
- `public/assets/.gitkeep` — crear.

## Cambios

- Añadir `docs/` a `.prettierignore` para excluir la documentación de contexto del checkpoint V1 de Prettier (`public/` ya está ignorado).
- Crear `public/assets/` versionada mediante un `.gitkeep`.

## Restricciones

- Conservar `docs/01-contextualizacion-elinain.md` tal cual, sin reformatearlo.
- No modificar código fuente, dependencias, OpenAPI local ni BFF.
- No modificar `.rei/init.sh` ni las plantillas del arnés.

## Pasos

1. [x] Añadir la entrada `docs/` a `.prettierignore`, junto al bloque de estáticos existente.
2. [x] Crear el archivo `public/assets/.gitkeep` (el directorio se crea automáticamente).
3. [x] Verificar que `npm run format:check` pasa y que `bash .rei/init.sh` finaliza con salida 0.
