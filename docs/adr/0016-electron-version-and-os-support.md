# ADR-0016: Versión de Electron (`45.3.2`), Node.js de Tooling vs. Runtime y Soporte de SO Resultante

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Platform / Infra

## Contexto y Problema

Debemos fijar la versión exacta de Electron, distinguir claramente entre la versión de Node.js usada por el desarrollador/CI para tooling y la embebida dentro de Electron, verificar la compatibilidad real con `better-sqlite3@13.1.1` y contrastar con la fuente primaria oficial de Electron qué sistemas operativos soporta realmente (`R10`, `R14`).

## Verificación contra Fuentes Oficiales (2026-11-13)

Consultados directamente el registro oficial `registry.npmjs.org` y el repositorio oficial `electron/electron` en el tag **`v45.3.2`** (`DEPS`, `README.md`, `package.json`, `abi_version`) y `WiseLibs/better-sqlite3` en **`v13.1.1`**:

| Componente                                 | Valor verificado                                                                                                                                      | Fuente primaria verificada (2026-11-13)                                                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Electron estable elegida**               | **`45.3.2`** (`MODULE_VERSION` / ABI `150`)                                                                                                           | `npm view electron version` y `github.com/electron/electron` tag `v45.3.2`                                                                 |
| **Chromium embebido en Electron `45.3.2`** | **`156.0.8078.100`**                                                                                                                                  | Archivo `DEPS` en `electron/electron@v45.3.2`                                                                                              |
| **Node.js embebido en Electron `45.3.2`**  | **`v24.22.2`**                                                                                                                                        | Archivo `DEPS` en `electron/electron@v45.3.2`                                                                                              |
| **Node.js de Tooling (host/CI)**           | **`22.22.3`** (`.nvmrc`: `22.22.3`, `engines.node`: `>=22.22.1`)                                                                                      | Entorno LTS verificado (`node -v`); satisface `lint-staged@17.6.0` (`>=22.22.1`), `jsdom`/`vitest@5.1.0` y `electron@45.3.2` (`>=22.12.0`) |
| **Compatibilidad `better-sqlite3@13.1.1`** | **N-API (`NAPI_VERSION=10`) con prebuilds multi-OS incluidos en el tarball npm** (`prebuilds/{linux-x64,win32-x64,darwin-x64,darwin-arm64,...}.node`) | `WiseLibs/better-sqlite3@v13.1.1` (`binding.gyp` y `lib/binding.js`)                                                                       |
| **`electron-builder` y `@electron/fuses`** | **`26.18.0`** y **`2.1.3`**                                                                                                                           | `registry.npmjs.org`                                                                                                                       |

### Hallazgo clave sobre `better-sqlite3@13.1.1` + Electron `45.3.2`

A diferencia de series antiguas de `better-sqlite3` que se acoplaban al `NODE_MODULE_VERSION` específico de V8 (exigiendo `@electron/rebuild` en cada parche de Electron), `better-sqlite3@13.1.1` compila contra **Node-API estable (`NAPI_VERSION=10`)** e incluye directamente dentro del paquete npm publicado los binarios precompilados `prebuilds/linux-x64.node`, `prebuilds/win32-x64.node`, `prebuilds/darwin-x64.node` y `prebuilds/darwin-arm64.node`. Dado que Node v24.22.2 embebido en Electron `45.3.2` soporta Node-API v10, el addon es ABI-estable entre el Node de tooling (`22.22.3`) y Electron (`45.3.2`), manteniendo además `@electron/rebuild@4.2.1` disponible si alguna arquitectura requiriese compilación desde código fuente. _(Validación empírica del binario empaquetado de Electron delegada a `package-smoke` en CI Windows/Linux — `SPIKE-4`)._

### Matriz de Soporte de SO Resultante para Electron `45.3.2`

1. **Verificado contra `electron/electron@v45.3.2/README.md` (`Platform support`):**
   - **Windows:** **Windows 10 y superior** (`x64` y `arm64`). Queda **confirmado oficialmente** que **Windows 7, Windows 8, Windows 8.1 y sistemas Windows/Linux de 32 bits (`ia32`) NO están soportados** por Electron `45.3.2`.
   - **Linux:** binarios oficiales `x64` y `arm64` para distribuciones modernas aún soportadas por su fabricante y por Chromium (Ubuntu LTS, Fedora, Debian Bookworm+).
   - **macOS:** **macOS 13 Ventura y superior** (`x64` Intel y `arm64` Apple Silicon).
2. **Aún marcado `"por verificar"` empíricamente (Capas 1 CI y 4 `SPIKE-1`/`SPIKE-6`):**
   - Comportamiento real de `unadjustedMovement: true` en Chromium `156` sobre Windows 10/11 con escalado 125 %/150 % y sobre Linux Wayland/X11.
   - Versión mínima exacta de `glibc` requerida por el binario precompilado de Electron `45.3.2` fuera de Ubuntu LTS / Debian 12.

## Decisión

1. Fijar **`electron@45.3.2`** y **`better-sqlite3@13.1.1`**.
2. Separar explícitamente en documentación y configuración:
   - **Node de Tooling (CLI, Vite, Vitest, scripts `tools/`):** serie LTS `22.22.3` en `.nvmrc` y `engines.node: ">=22.22.1"` (compatible también con Node 24 LTS).
   - **Node embebido en Electron (`main` runtime):** `v24.22.2` provisto internamente por el binario de Electron `45.3.2` (para tipado conservador y compatible en `@evo-aim/desktop` fijamos `@types/node@22.20.5`).
3. Actualizar `docs/PLATFORM_SUPPORT.md` reflejando como hecho verificado los requisitos mínimos de SO de Electron `45.3.2` (Windows 10+, macOS 13 Ventura+, solo 64 bits).

## Consecuencias

- **Positivas:** usamos la rama estable más actual de Electron y Chromium 156 con soporte N-API limpio en `better-sqlite3@13.1.1`; eliminamos incertidumbre sobre Windows 7/8/32-bit con evidencia oficial directa.
- **Negativas:** en entornos sandbox sin acceso al CDN `objects.githubusercontent.com`, la descarga del binario zip de Electron debe diferirse a CI/máquina local con red abierta (`VERIFY_ON_WINDOWS.md`).
- **Nota sobre determinismo y doble motor V8 (`ADR-0005`):** al separar el **Node 22 (`22.22.3`)** de tooling/Vitest del runtime de **Electron `45.3.2` (Chromium `156` / Node `24.22.2`)**, los tests unitarios de determinismo se ejecutan en una versión de **V8** distinta a la que ejecuta la simulación y los replays en Electron. Para evitar divergencias de `1 ULP` en funciones trascendentales entre ambos V8, la **Capa 4 (`SPIKE-3`)** empleará tablas/polinomios trigonométricos deterministas en `@evo-aim/core` o fijará la paridad exacta de versiones verificadas en CI.
