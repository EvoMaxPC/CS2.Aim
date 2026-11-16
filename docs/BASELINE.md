# BASELINE.md — Línea Base Técnica de Capa 1 (`QB-07`, `QB-08`, `QB-09`)

- **Propósito:** Registrar con honestidad estricta de ingeniería las mediciones reales obtenidas al cierre de la **Capa 1 (Esqueleto y Tooling)** y delimitar qué métricas de binario empaquetado / arranque de ventana requieren ejecutarse en GitHub Actions CI y en las máquinas físicas de referencia del propietario (`VERIFY_ON_WINDOWS.md`).
- **Fecha de captura:** 2026-11-13
- **Herramienta reproducible:** `pnpm build && pnpm baseline [ruta-json]` (`tools/baseline/cli.ts`)
- **Estado:** Línea base parcial verificada en contenedor Linux x64; métricas de instalador NSIS/AppImage y ventana viva Electron pendientes de runner CI / máquina física (`VERIFY_ON_WINDOWS.md`).

---

## 1. Entorno Real de Medición (Contenedor de Desarrollo Linux x64)

Datos capturados empíricamente mediante `pnpm baseline`:

| Parámetro                             | Valor Medido                                                    |
| ------------------------------------- | --------------------------------------------------------------- |
| **Sistema Operativo / Kernel**        | `linux-x64` (`6.1.158+`)                                        |
| **CPU**                               | `Intel(R) Xeon(R) Processor @ 2.60GHz` (`2` hilos lógicos)      |
| **RAM total del entorno**             | `~8 GiB`                                                        |
| **Node.js (tooling host)**            | `v22.22.3`                                                      |
| **pnpm**                              | `12.18.0`                                                       |
| **Electron fijado en lockfile**       | `45.3.2` (Chromium `156.0.8078.100`, Node `24.22.2`, `ABI 150`) |
| **better-sqlite3 fijado en lockfile** | `13.1.1` (`N-API v10` precompilado)                             |

---

## 2. Tamaño Real de Bundles Compilados (`electron-vite build`)

Medición exacta tras `pnpm build` (Vite `8.3.8` + `electron-vite@6.0.0`):

| Artefacto                                | Ruta                                 |                                                   Archivos |                   Tamaño Exacto |
| ---------------------------------------- | ------------------------------------ | ---------------------------------------------------------: | ------------------------------: |
| **Main Process Bundle**                  | `apps/desktop/out/main/index.cjs`    |                                                          1 |       `186.98 kB` (`182.6 KiB`) |
| **Sandboxed Preload Bundle**             | `apps/desktop/out/preload/index.cjs` |                                                          1 |       `164.24 kB` (`160.4 KiB`) |
| **Renderer HTML + CSS + JS**             | `apps/desktop/out/renderer/**`       | 3 (`index.html` `0.81 kB`, CSS `13.10 kB`, JS `674.91 kB`) |       `688.82 kB` (`672.7 KiB`) |
| **Total código de aplicación compilado** | `apps/desktop/out/`                  |                                                      **5** | **`1 040.04 kB` (`~1.02 MiB`)** |

> **Observación arquitectónica:** El código completo de `main`, `preload` (con esquemas Zod compartidos) y `renderer` (React 19 + Router 7 + Zustand 5 + Tailwind v4 + `@evo-aim/ui`) ocupa apenas **`~1.02 MiB`** sin comprimir antes de empaquetarse en `app.asar`.

---

## 3. Verificación Empírica de `SPIKE-4` (`better-sqlite3@13.1.1`)

- **En proceso Node `v22.22.3` (`linux-x64`):**
  - `pnpm baseline` y la suite Vitest `apps/desktop/src/main/ipc/handlers.test.ts` cargan el binario nativo `better-sqlite3/prebuilds/linux-x64/node.napi.node` (`NAPI_VERSION=10`) y ejecutan `CREATE TABLE`, `INSERT` y `SELECT` en `:memory:` devolviendo `ok: true` y versión del motor SQLite `3.50.x` en `< 30 ms`.
- **Independencia de ABI respecto a Electron `45.3.2` (`ADR-0016`):**
  - Al compilarse contra `Node-API v10` estable en lugar de `NODE_MODULE_VERSION` específico de V8, el mismo prebuild `.node` es compatible con el runtime Node `24.22.2` integrado en Electron `45.3.2` sin requerir toolchain C++ en el sistema del usuario, desempaquetándose fuera de `app.asar` mediante `asarUnpack` en `apps/desktop/electron-builder.yml`.
- **Pendiente de cierre empírico fuera del sandbox restringido:**
  - Ejecución del binario desempaquetado (`pnpm package` + `pnpm e2e`) en GitHub Actions (`windows-latest` y `ubuntu-latest`) y en el PC Windows 10/11 del propietario (véase [`docs/VERIFY_ON_WINDOWS.md`](./VERIFY_ON_WINDOWS.md)).

---

## 4. Métricas Pendientes de Captura en CI / Hardware Físico (`QB-07`, `QB-08`, `QB-09`)

Debido a que el entorno de ejecución actual tiene restringido el acceso de red a `objects.githubusercontent.com` (donde GitHub aloja los archivos `.zip` del binario `electron-v45.3.2-*`), **no se inventa ni extrapola ningún número** para las métricas dependientes del ejecutable binario de Electron. La tabla siguiente queda lista para completarse con la salida del artefacto `baseline-metrics-ubuntu` / job `package-smoke` de `.github/workflows/ci.yml` y la verificación local en Windows:

| Métrica (`QUALITY_BARS.md`)                                              | Windows 10/11 x64 (Tier 1)           | Linux x64 Ubuntu LTS (Tier 2)    | Presupuesto Objetivo                           |
| ------------------------------------------------------------------------ | ------------------------------------ | -------------------------------- | ---------------------------------------------- |
| **Tamaño directorio desempaquetado (`win-unpacked` / `linux-unpacked`)** | _Pendiente (`VERIFY_ON_WINDOWS.md`)_ | _Pendiente (CI `package-smoke`)_ | Línea base `QB-09` (alerta si sube `> 10 %`)   |
| **Tamaño instalador NSIS `.exe` / `AppImage`**                           | _Pendiente (`VERIFY_ON_WINDOWS.md`)_ | _Pendiente (CI / Capa 17)_       | Línea base `QB-09`                             |
| **Tiempo de arranque en frío (`Cold Start` hasta `app-shell-ready`)**    | _Pendiente (`VERIFY_ON_WINDOWS.md`)_ | _Pendiente (CI `e2e`)_           | `< 3.0 s` Tier M/H, `< 5.0 s` Tier L (`QB-07`) |
| **RAM RSS total en reposo (ventana en `Inicio` tras 10 s)**              | _Pendiente (`VERIFY_ON_WINDOWS.md`)_ | _Pendiente (CI `e2e`)_           | Línea base `QB-08` / `QB-09`                   |
