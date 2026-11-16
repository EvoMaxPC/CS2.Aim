# DEVELOPMENT.md — Guía de Desarrollo Local y Flujo de Trabajo

- **Propósito:** Documentar el entorno de desarrollo, requisitos de sistema por plataforma (Windows, Linux, macOS), scripts del monorepo, arquitectura de verificación y resolución de problemas habituales de **EVO-AIM-CS2**.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted (Capa 1)

---

## 1. Requisitos Previos

| Herramienta | Versión Fijada / Requerida                              | Fuente en el Repositorio         |
| ----------- | ------------------------------------------------------- | -------------------------------- |
| **Node.js** | `>= 22.22.1` (desarrollo y CI fijados en `22.22.3` LTS) | `.nvmrc`, `package.json#engines` |
| **pnpm**    | `12.18.0` exacto (vía Corepack)                         | `package.json#packageManager`    |
| **Git**     | `>= 2.35` (con soporte `commit -s` para DCO)            | `CONTRIBUTING.md`                |

### 1.1 Dependencias del Sistema por Plataforma

- **Windows 10/11 x64 (Tier 1):**
  - No requiere Visual Studio Build Tools para instalar `better-sqlite3@13.1.1` en uso estándar gracias a los binarios precompilados `N-API v10` incluidos en el paquete (`prebuilds/win32-x64/node.napi.node`, véase `ADR-0016`).
  - Solo si necesitas recompilar módulos nativos desde código fuente C++20 (`@electron/rebuild`), instala _Desktop development with C++_ (MSVC v143 + Windows 10/11 SDK) y Python 3.11+.
- **Linux x64 (Tier 2 — Ubuntu 22.04/24.04 LTS, Debian 12+, Fedora 40+, Arch):**
  - Bibliotecas compartidas estándar de escritorio requeridas por el binario de Electron/Chromium: `libgtk-3-0`, `libnotify4`, `libnss3`, `libxss1`, `libxtst6`, `xdg-utils`, `libatspi2.0-0`, `libdrm2`, `libgbm1`, `libasound2`.
  - Para ejecutar Playwright Electron E2E en servidores o terminales sin sesión gráfica activa: `xvfb` (`xvfb-run --auto-servernum pnpm e2e`).
- **macOS 13+ arm64 / x64 (Tier 3 best-effort):**
  - Xcode Command Line Tools (`xcode-select --install`).

---

## 2. Puesta en Marcha Rápida

```bash
# 1. Activar la versión exacta de pnpm declarada en package.json
corepack enable
corepack prepare pnpm@12.18.0 --activate

# 2. Instalar dependencias respetando el lockfile inmutable
pnpm install --frozen-lockfile

# 3. Arrancar la aplicación Electron en modo desarrollo con HMR
pnpm dev
```

> **Entornos CI o contenedores sin acceso a descargas binarias de GitHub Releases (`objects.githubusercontent.com`):**
> Si trabajas en un sandbox restringido donde solo necesitas compilar TypeScript/Vite y ejecutar linters, tests unitarios/integración y verificación de licencias:
>
> ```bash
> ELECTRON_SKIP_BINARY_DOWNLOAD=1 pnpm install --frozen-lockfile
> pnpm build
> pnpm verify
> ```

---

## 3. Referencia Completa de Scripts Raíz (`package.json`)

| Comando                          | Descripción                                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                       | Inicia `@evo-aim/desktop` con `electron-vite dev` (recarga en caliente en renderer + reinicio de main/preload).                                            |
| `pnpm build`                     | Compila y empaqueta los tres bundles de producción de Electron (`out/main/index.cjs`, `out/preload/index.cjs`, `out/renderer/`).                           |
| `pnpm test`                      | Ejecuta las 7 suites multi-proyecto de Vitest (`core`, `data`, `engine`, `ui`, `desktop-main`, `desktop-renderer`, `tools`).                               |
| `pnpm test:coverage`             | Ejecuta Vitest con cobertura V8 exigiendo umbrales bloqueantes (`>= 95 %` en `@evo-aim/core`, `>= 80 %` global).                                           |
| `pnpm lint`                      | Ejecuta ESLint 10 flat config con `typescript-eslint` type-aware y `--max-warnings 0`.                                                                     |
| `pnpm format`                    | Formatea todos los archivos del repositorio con Prettier.                                                                                                  |
| `pnpm format:check`              | Comprueba formato sin modificar archivos.                                                                                                                  |
| `pnpm typecheck`                 | Ejecuta `tsc --noEmit` en todos los paquetes del workspace más `tsconfig.tools.json`.                                                                      |
| `pnpm deps:check`                | Valida con `dependency-cruiser` el grafo acíclico (DAG) entre paquetes, aislamiento del renderer y encapsulación de `PlatformAdapter`.                     |
| `pnpm licenses:check`            | Audita todas las dependencias instaladas (`pnpm licenses list --json`) contra la lista blanca permisiva de `ADR-0014`.                                     |
| `pnpm dco:check [rango]`         | Verifica que todos los commits no-merge y no-bot del rango lleven trailer `Signed-off-by:` coincidente con el autor.                                       |
| `pnpm pr-title:check "<título>"` | Valida que el título de un Pull Request cumpla Conventional Commits y los scopes permitidos.                                                               |
| `pnpm e2e`                       | Ejecuta la suite end-to-end de Playwright (`e2e/app.spec.ts`) lanzando la ventana real de Electron.                                                        |
| `pnpm package`                   | Compila y genera el paquete desempaquetado (`--dir`) con `electron-builder` aplicando `@electron/fuses` en `afterPack`.                                    |
| `pnpm package:installer`         | Genera los instaladores completos para el sistema operativo anfitrión (`NSIS`/Portable en Windows, `AppImage`/`deb` en Linux, `dmg` en macOS).             |
| `pnpm baseline [archivo.json]`   | Mide tamaños reales de bundles/artefactos, RSS del proceso Node y sonda en memoria de `better-sqlite3`.                                                    |
| `pnpm no-owner:check`            | Escanea archivos de texto bloqueando rutas personales (`C:\Users\<TuNombre>`, `/home/<usuario>`), IPs privadas de LAN, secretos y nombres legados.         |
| `pnpm verify`                    | **Puerta integral de calidad pre-push:** encadena `lint`, `format:check`, `typecheck`, `deps:check`, `test:coverage`, `licenses:check` y `no-owner:check`. |

---

## 4. Reglas Arquitectónicas y Hooks Locales

1. **Commits firmados con DCO y Conventional Commits:**
   - Usa siempre `git commit -s -m "<tipo>(<scope>): <descripción>"`.
   - Husky ejecuta automáticamente `lint-staged` en `pre-commit` y `commitlint` en `commit-msg`.
   - Tipos permitidos: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`.
   - Scopes permitidos: `core`, `data`, `engine`, `ui`, `desktop`, `platform`, `infra`, `docs`.
2. **Fronteras estrictas del monorepo (verificadas por `pnpm deps:check`):**
   - `@evo-aim/core` no puede importar ningún otro paquete del workspace ni APIs de Node/DOM/Electron, ni usar `Math.random()` o `Date.now()`.
   - `@evo-aim/engine` y `@evo-aim/ui` jamás se importan mutuamente.
   - Ningún archivo fuera de `apps/desktop/src/main/platform/index.ts` puede importar directamente `win32/`, `linux/` o `darwin/`.
3. **Encabezados SPDX:**
   - Todo archivo `.ts`, `.tsx`, `.mjs` y `.cjs` de código propio comienza con `// SPDX-License-Identifier: Apache-2.0`.

---

## 5. Registros Locales (Logging) y Privacidad

Durante la ejecución de `@evo-aim/desktop`, los logs estructurados JSONL se escriben en:

- **Windows:** `%APPDATA%\EVO-AIM-CS2\logs\evoaim-main.jsonl`
- **Linux:** `${XDG_CONFIG_HOME:-~/.config}/EVO-AIM-CS2/logs/evoaim-main.jsonl`
- **macOS:** `~/Library/Application Support/EVO-AIM-CS2/logs/evoaim-main.jsonl`

El logger rota automáticamente al alcanzar `1 MiB` (`evoaim-main.jsonl.1`) y sanitiza rutas de usuario (`<USER_HOME>`) y credenciales (`<REDACTED_TOKEN>` / `<REDACTED_SECRET>`). Puedes activar trazas detalladas exportando `EVOAIM_LOG_LEVEL=debug`.
