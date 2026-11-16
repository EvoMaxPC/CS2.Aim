# ADR-0010: Gestor de Paquetes `pnpm` y Alineación de Versión de Node.js

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Infra

## Contexto y Problema

En un monorepo TypeScript con cinco paquetes internos y un addon nativo C++ (`better-sqlite3`), las diferencias de resolución de dependencias (_phantom dependencies_) de `npm`/yarn clásico o la desalineación entre la versión de Node del desarrollador y la embebida en Electron provocan fallos difíciles de depurar (`R10`).

## Opciones Consideradas

1. **`npm` workspaces:** resolución plana propensa a importar paquetes no declarados en el `package.json` de cada subpaquete y mayor uso de disco.
2. **`yarn` Berry (PnP):** fricción frecuente con `electron-builder` y módulos nativos desempaquetados (`asarUnpack`).
3. **`pnpm` workspaces:** aislamiento estricto por enlaces simbólicos (impide _phantom dependencies_), rápido, eficiente en disco y bien soportado por `electron-builder` configurando adecuadamente las opciones de empaquetado en Capa 1.

## Decisión

1. Usar **`pnpm`** (fijado mediante campo `"packageManager"` / Corepack en la Capa 1) como único gestor de paquetes permitido en el repositorio (`frozen-lockfile` obligatorio en CI).
2. Fijar en la **Capa 1** (mediante `.nvmrc` / `engines` en raíz) la versión **Node.js Active LTS** que coincida o sea directamente compatible con el runtime de Node integrado en la versión estable de Electron elegida en la Capa 1.

## Consecuencias

- **Positivas:** garantías reales de que `@evo-aim/core` no puede importar accidentalmente `three` o `electron` porque `pnpm` ni siquiera los expone en su `node_modules` local; builds reproducibles entre Windows, Linux y CI.
- **Negativas:** requiere validar en `SPIKE-4` (Capa 1) la configuración exacta de `electron-builder` con el layout de `node_modules` de `pnpm` para `better-sqlite3`.
