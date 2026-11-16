# VERIFY_ON_WINDOWS.md — Protocolo de Verificación Manual en Windows 10/11 y GitHub Actions

- **Propósito:** Enumerar con precisión reproducible todas las comprobaciones de la **Capa 1** que no pueden ejecutarse dentro de un contenedor Linux sin pantalla física ni acceso de red a `objects.githubusercontent.com`, para que el propietario las valide en su equipo **Windows 10/11 x64 (Tier 1)** y en la primera ejecución de **GitHub Actions CI**.
- **Fecha:** 2026-11-13
- **Estado:** Pendiente de ejecución por el propietario tras abrir el PR de Capa 1

---

## 1. Por Qué Existe Este Checklist (Honestidad de Entorno)

Durante la construcción de la Capa 1 en el entorno Linux aislado:

- **Sí se ejecutó y verificó al 100 %:** instalación real con `pnpm@12.18.0` (`564` paquetes desde `registry.npmjs.org`), `pnpm lint` (0 errores, 0 warnings), `pnpm format:check`, `pnpm typecheck` (`tsc` 6.0.3 estricto en los 5 paquetes + `tools` + `e2e`), `pnpm deps:check` (`76` módulos, 0 violaciones + test de violación sintética), `pnpm test:coverage` (`15` suites, `46` tests, `100 %` en `@evo-aim/core`, `95.23 %` líneas global, incluyendo carga real en memoria de `better-sqlite3@13.1.1`), `pnpm licenses:check` (`502` entradas auditadas, 0 prohibidas), `pnpm build` (`electron-vite` produciendo `main`, `preload` y `renderer`) y `pnpm dco:check`.
- **No pudo ejecutarse localmente en el contenedor:** la descarga del binario `electron-v45.3.2-*.zip` desde `objects.githubusercontent.com` (host bloqueado por el firewall del sandbox) ni pruebas visuales sobre Windows 10/11 con escalado DPI real.

Nada de lo listado abajo se ha marcado como validado en `PROGRESS.md` ni en `BASELINE.md` hasta completar estos pasos.

---

## 2. Verificación en GitHub Actions (Automática al Subir la Rama / Abrir PR)

Al hacer push de la rama y abrir el Pull Request con título `feat(infra): layer 1 skeleton and tooling`:

- [ ] **Job `Verify (ubuntu-latest)` y `Verify (windows-latest)`:** terminan en verde (`pnpm install --frozen-lockfile`, `pnpm build`, `pnpm verify`).
- [ ] **Job `DCO & PR Title Gate`:** termina en verde validando el título Conventional Commits y las firmas `Signed-off-by:` de todos los commits del PR.
- [ ] **Job `Playwright Electron E2E (ubuntu-latest)` y `(windows-latest)`:** lanzan el binario real de Electron `45.3.2` parametrizado en **`1280x720@1`, `1920x1080@1.5` y `3840x2160@2`**, ejecutan navegación completa solo con teclado (`Tab`/`Enter`), validan `prefers-reduced-motion: reduce`, verifican en `Ajustes` que `app:getInfo` devuelve `io.github.evomaxpc.evoaim` y que `diag:nativeModules` (`SPIKE-4`) muestra `OK`, y auditan en vivo `app://evoaim`, `sandbox: true`, `contextIsolation: true`, bloqueo de `<script>` inline por CSP y bloqueo de `window.open`.
- [ ] **Job `Unpacked Package Smoke (windows-latest)` y `(ubuntu-latest)`:** ejecutan `pnpm package` (`electron-builder --dir`) aplicando el hook `apps/desktop/scripts/after-pack-fuses.cjs` (`@electron/fuses`) y desempaquetando `better-sqlite3` en `app.asar.unpacked`.
- [ ] **Job `Baseline Metrics Snapshot` y `Dependency Security Audit`:** terminan en verde y adjuntan el artefacto `baseline-metrics-ubuntu`.

---

## 3. Verificación Local en PC Windows 10/11 x64 (PowerShell)

Ejecutar en una terminal PowerShell estándar (sin permisos de Administrador) sobre Windows 10 (22H2+) o Windows 11:

```powershell
# 1. Clonar y activar pnpm 12.18.0
corepack enable
corepack prepare pnpm@12.18.0 --activate

# 2. Instalar dependencias completas (incluyendo binario Electron 45.3.2 para win32-x64)
pnpm install --frozen-lockfile

# 3. Ejecutar puerta completa de calidad y tests unitarios en Windows
pnpm verify

# 4. Compilar y ejecutar la suite E2E de Playwright lanzando la ventana real en Windows
pnpm build
pnpm e2e

# 5. Generar paquete desempaquetado con Electron Fuses y probar el .exe resultante
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
pnpm package
.\apps\desktop\release\win-unpacked\EVO-AIM-CS2.exe
```

### Checklist Visual y Funcional en Windows (`EVO-AIM-CS2.exe`)

- [ ] **Arranque limpio (< 3 s en SSD):** la ventana oscura (`#090d16`) abre sin parpadeo blanco ni errores de consola/diálogo y muestra la barra lateral con las 7 secciones en español (`Inicio`, `Entrenar`, `Rutinas`, `Estadísticas`, `Ciencia`, `Calibración`, `Ajustes`).
- [ ] **Verificación `SPIKE-4` en binario empaquetado (`win-unpacked`):** abrir **Ajustes** y comprobar:
  - `Identificador (appId)`: `io.github.evomaxpc.evoaim`
  - `Plataforma / Arquitectura`: `win32 (x64)`
  - `Estado better-sqlite3`: `OK — Addon cargado y consulta en memoria verificada` + versión `3.x.y` visible.
- [ ] **Verificación de `Electron Fuses` aplicados:** al intentar ejecutar `EVO-AIM-CS2.exe` con `ELECTRON_RUN_AS_NODE=1`, el proceso **no** debe comportarse como un REPL de Node.js (`RunAsNode` desactivado por `after-pack-fuses.cjs`).
- [ ] **Instancia única (`requestSingleInstanceLock`):** con `EVO-AIM-CS2.exe` abierto, lanzar una segunda instancia enfoca la ventana ya abierta y cierra la segunda inmediatamente.
- [ ] **Rutas y logs sanitizados en `%APPDATA%`:**
  - Comprobar que existe `%APPDATA%\EVO-AIM-CS2\logs\evoaim-main.jsonl`.
  - Abrir el archivo `.jsonl` y confirmar que **no** aparece tu nombre de usuario de Windows (`C:\Users\<TuNombre>`), sino `<USER_HOME>`.
- [ ] **Escalado DPI de Windows (100 % vs. 125 % / 150 %):** cambiar la escala de pantalla en Configuración de Windows y comprobar que la tipografía, bordes de foco (`Tab`) y barra lateral contraída (`«` / `»`) se ven nítidos sin recortes.
- [ ] **Instalador NSIS + Portable (`pnpm package:installer`):**
  - Ejecutar `pnpm package:installer` y anotar el peso exacto (`.exe` NSIS, `.exe` Portable y carpeta `win-unpacked`), tiempo de arranque en frío y consumo de RAM en el Administrador de tareas dentro de `docs/BASELINE.md`.
