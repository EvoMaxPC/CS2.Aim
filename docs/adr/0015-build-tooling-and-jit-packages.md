# ADR-0015: Herramientas de Build (`electron-vite`), Tailwind v4 y Paquetes Internos "Just-in-Time"

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Infra

## Contexto y Problema

En la Capa 1 inicializamos el monorepo `@evo-aim/*` con cinco paquetes (`core`, `data`, `engine`, `ui`, `desktop`) y cuatro herramientas en `tools/`. Debemos decidir:

1. Cómo compilar y servir los tres subprocesos de Electron (`main`, `preload` compatible con `sandbox: true` y `renderer` React) sin configuraciones frágiles duplicadas.
2. Qué arquitectura de Tailwind CSS adoptar.
3. Cómo consumir los paquetes internos del monorepo (`@evo-aim/core`, `data`, `engine`, `ui`) durante desarrollo, tests y empaquetado.
4. Qué ejecutor TypeScript emplear para los scripts de infraestructura en `tools/`.

## Versiones Estables Fijadas (Consultadas en `registry.npmjs.org` el 2026-11-13)

| Paquete                                   | Versión exacta fijada | Rol                                                                                                                                                                        |
| ----------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm`                                    | `12.18.0`             | Gestor de paquetes (`packageManager` vía Corepack)                                                                                                                         |
| `typescript`                              | `6.0.3`               | Compilador TypeScript (última serie estable compatible con `typescript-eslint@8.72.2`, cuyo peer exige `<6.1.0`; TS `7.0.2` aún no está soportado por `typescript-eslint`) |
| `vite`                                    | `8.3.8`               | Bundler y servidor de desarrollo                                                                                                                                           |
| `@vitejs/plugin-react`                    | `6.3.0`               | Transformación JSX/Fast Refresh para React 19                                                                                                                              |
| `electron-vite`                           | `6.0.0`               | Orquestador Vite específico para Electron (`main` + `preload` + `renderer`)                                                                                                |
| `tailwindcss` / `@tailwindcss/vite`       | `4.3.5`               | Sistema de estilos CSS-first con tokens `@theme`                                                                                                                           |
| `react` / `react-dom`                     | `19.3.1`              | Librería de interfaz de usuario                                                                                                                                            |
| `react-router-dom`                        | `7.18.5`              | Enrutamiento en el renderer (`HashRouter`)                                                                                                                                 |
| `zustand`                                 | `5.1.0`               | Estado ligero de UI                                                                                                                                                        |
| `zod`                                     | `4.6.7`               | Validación de esquemas en runtime (IPC, `DataProvenance`)                                                                                                                  |
| `vitest` / `@vitest/coverage-v8`          | `5.1.0`               | Runner de tests multi-proyecto y cobertura V8                                                                                                                              |
| `happy-dom`                               | `21.0.4`              | Entorno DOM ligero para tests de componentes en `@evo-aim/ui` (sin peer nativo `@napi-rs/canvas`)                                                                          |
| `fast-check`                              | `4.10.2`              | Property-based testing                                                                                                                                                     |
| `@playwright/test` / `playwright`         | `1.65.0`              | Pruebas End-to-End sobre Electron (`_electron.launch`)                                                                                                                     |
| `eslint` / `@eslint/js`                   | `10.14.0` / `10.0.1`  | Linter Flat Config                                                                                                                                                         |
| `typescript-eslint`                       | `8.72.2`              | Reglas TypeScript con información de tipos (`strictTypeChecked`)                                                                                                           |
| `eslint-plugin-react-hooks`               | `7.1.1`               | Verificación de reglas de Hooks en React                                                                                                                                   |
| `prettier` / `eslint-config-prettier`     | `3.10.1` / `10.1.8`   | Formateo determinista de código                                                                                                                                            |
| `dependency-cruiser`                      | `18.7.2`              | Verificación estática del grafo arquitectónico                                                                                                                             |
| `husky` / `lint-staged`                   | `9.1.7` / `17.6.0`    | Hooks Git `pre-commit` y `commit-msg`                                                                                                                                      |
| `@commitlint/cli` / `config-conventional` | `21.2.4`              | Validación de Conventional Commits                                                                                                                                         |
| `tsx`                                     | `4.23.15`             | Ejecución directa de scripts TypeScript en `tools/`                                                                                                                        |

## Opciones Consideradas

### 1. Orquestación Electron + Vite

- **Opción A (`electron-vite@6.0.0`):** gestiona en un solo archivo `electron.vite.config.ts` las tres entradas (`main` Node ESM/CJS externalizando nativos como `better-sqlite3`, `preload` empaquetado como script autónomo compatible con `sandbox: true`, y `renderer` SPA con HMR).
- **Opción B (3 configs manuales de Vite + scripts de vigilancia propios):** mayor mantenimiento manual para sincronizar recarga de `preload`/`main` y externalización de addons nativos.

### 2. Paquetes internos ("Just-in-Time" vs. compilación intermedia a `dist/`)

- **Opción A (Paquetes _Just-in-Time_ apuntando a `./src/index.ts`):** dado que el único artefacto distribuible es la aplicación `@evo-aim/desktop` (no publicamos librerías sueltas en npm), exponer `"exports": { ".": "./src/index.ts" }` junto con alias coherentes en `tsconfig.base.json`, `electron-vite` y `vitest` elimina pasos de compilación intermedios desactualizados (`dist/` obsoleto) y permite navegación instantánea de tipos.
- **Opción B (Build previo `tsc -b` generando `dist/` en cada paquete):** añade orden de compilación frágil antes de correr tests o `pnpm dev`.

## Decisión

1. Adoptar **`electron-vite@6.0.0` sobre `vite@8.3.8`**, empaquetando todos los paquetes internos `@evo-aim/*` dentro de los bundles de `@evo-aim/desktop` y manteniendo externalizado únicamente el addon nativo `better-sqlite3` en `main`.
2. Adoptar **`tailwindcss@4.3.5` con `@tailwindcss/vite@4.3.5`**, definiendo los tokens de diseño (colores competitivos oscuros de alto contraste, tipografía, espaciado y radios) en bloque `@theme` sin archivo `postcss.config` legado.
3. Consumir los paquetes internos `@evo-aim/{core,data,engine,ui}` **en modo Just-in-Time desde `src/`**, validando tipos por paquete con `tsc --noEmit` en `pnpm typecheck` (`isolatedModules: true`, `verbatimModuleSyntax: true`).
4. Adoptar **`tsx@4.23.15`** (licencia MIT, solo devDependency) para ejecutar las herramientas de repositorio en `tools/` (`check-licenses`, `check-dco`, `check-pr-title`, `baseline`) escritas en TypeScript estricto.
5. Mantener el aislamiento por enlaces simbólicos nativo de `pnpm` (sin `node-linker=hoisted` global salvo que `electron-builder` demostrase requerirlo) y declarar explícitamente `allowBuilds` en `pnpm-workspace.yaml` (`pnpm@12.18.0`) para limitar los paquetes con permiso de build (`electron`, `better-sqlite3`, `esbuild`, denegando `electron-winstaller`).

## Consecuencias

- **Positivas:** cero desfase entre código fuente y tests; soporte de `sandbox: true` en `preload` porque `electron-vite` agrupa las dependencias puras (`@evo-aim/core`, `zod`) en un único script de preload sin `require` dinámicos externos; stack 100 % en versiones exactas verificadas contra npm.
- **Negativas:** cuando TypeScript `7.x` sea soportado oficialmente por `typescript-eslint`, se planificará una actualización controlada desde `6.0.3`.
