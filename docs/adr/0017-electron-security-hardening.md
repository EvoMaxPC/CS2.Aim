# ADR-0017: Endurecimiento (Hardening) de Seguridad en Electron: Protocolo `app://`, CSP y Fuses

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Seguridad / Desktop

## Contexto y Problema

Conforme a `QB-12` y `docs/SECURITY_MODEL.md`, el esqueleto de `@evo-aim/desktop` debe nacer endurecido por defecto para que las capas futuras (importación de archivos `.evoaim` en Capa 14, receptor GSI local en Capa 16) operen sobre una base donde un eventual fallo en el `renderer` no derive en acceso al sistema de archivos ni ejecución remota de código.

## Opciones Consideradas

1. **Cargar archivos en producción con `loadFile()` (`file://`) y fuses por defecto de Electron:** expone semántica amplia del esquema `file://`, dificulta inyectar cabeceras HTTP de respuesta CSP y deja abiertos vectores clásicos como `ELECTRON_RUN_AS_NODE=1`.
2. **Protocolo privilegiado propio `app://evoaim/` + CSP estricta por cabecera y `<meta>` + bloqueo total de navegación/permisos + `@electron/fuses` en `afterPack`:** aísla el origen del renderer, impide _path traversal_ y desactiva vectores de abuso del binario Electron.

## Decisión

Implementamos la **Opción 2** con cinco capas defensivas verificables por tests automatizados:

1. **Aislamiento estricto de `BrowserWindow`:**
   - `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, `webSecurity: true`, `allowRunningInsecureContent: false`, `webviewTag: false`.
   - `preload` compilado en un único archivo autónomo que expone únicamente `window.evoaim` con métodos explícitos (`getAppInfo`, `checkNativeModules`), jamás `ipcRenderer` genérico.
2. **Protocolo personalizado seguro `app://` en producción (`file://` prohibido):**
   - Se registra `protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: false } }])` antes de `app.whenReady()`.
   - El resolver `resolveSafeProtocolPath(rootDir, requestUrl)` decodifica URI, rechaza caracteres nulos, backslashes codificados (`%5c`), rutas relativas `..` (`%2e%2e`) y verifica con `path.relative` que el archivo final reside estrictamente dentro del directorio `renderer` empaquetado.
   - El enrutamiento interno de React usa **`HashRouter`** (`#/`, `#/train`, `#/settings`, etc.) para que todas las rutas recarguen limpiamente sobre `app://evoaim/index.html` sin requerir reescrituras comodín de servidor.
3. **Content Security Policy (CSP) sin `unsafe-eval` ni `unsafe-inline`:**
   - Gracias a Tailwind CSS v4 compilado en un archivo `.css` estático por Vite y a que nuestros componentes React no inyectan etiquetas `<style>` dinámicas en runtime, **no necesitamos siquiera `'unsafe-inline'` en `style-src` en producción**:
     `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'`
   - Aplicada en producción exclusivamente mediante cabecera HTTP de respuesta `Content-Security-Policy` en el manejador `app://` y en `session.defaultSession.webRequest.onHeadersReceived` (evitando etiquetas `<meta>` con `'unsafe-inline'` residual en `index.html`). Un test estático automatizado en `security.test.ts` verifica además que **ningún archivo del renderer ni de `@evo-aim/ui` usa atributos `style=` ni etiquetas `<style>` inline** (`0` excepciones en Capa 1).
   - Únicamente cuando `isDev === true` (variable controlada por el proceso `main` al usar `ELECTRON_RENDERER_URL` de Vite) se habilitan `ws:`/`http://localhost:*` y `'unsafe-inline'` de estilos requeridos por el cliente HMR de Vite.
4. **Bloqueo de navegación, ventanas emergentes, permisos y validación de `senderFrame`:**
   - `will-navigate` y `setWindowOpenHandler` bloquean toda navegación externa; los enlaces externos permitidos pasan exclusivamente por un validador HTTPS con lista blanca explícita (`https://github.com/EvoMaxPC/evo-aim-cs2`).
   - `setPermissionRequestHandler` y `setPermissionCheckHandler` deniegan el 100 % de permisos en la Capa 1 (cuando en la Capa 4 se incorpore captura Pointer Lock se habilitará únicamente ese permiso específico para el origen `app://evoaim`).
   - Cada handler `ipcMain.handle` verifica que `event.senderFrame` sea el frame principal de origen autorizado (`app://evoaim` en prod o el servidor dev local en dev) y valida entrada y salida con esquemas Zod compartidos desde `@evo-aim/core`.
5. **Electron Fuses (`@electron/fuses@2.1.3`) en hook `afterPack` de `electron-builder`:**
   - **Desactivados siempre (`false`):** `RunAsNode`, `EnableNodeOptionsEnvironmentVariable`, `EnableNodeCliInspectArguments`, `LoadBrowserProcessSpecificV8Snapshot`.
   - **`OnlyLoadAppFromAsar: true`:** activado (los addons nativos como `better-sqlite3` se extraen vía `asarUnpack` a `app.asar.unpacked`, soportado por Electron con este fuse).
   - **`EnableEmbeddedAsarIntegrityValidation`:** en macOS/Windows sin firma de código (`CSC_LINK` vacío en Capa 1) o en Linux (donde el soporte de validación de integridad ASAR embebida en binarios ELF sin firmar varía por plataforma/versión), el script `afterPack` aplica los fuses verificando compatibilidad por plataforma y documenta el estado exacto en CI (`DT-06` para ratificar `EnableEmbeddedAsarIntegrityValidation: true` junto con la estrategia de firma en Capa 17).

## Consecuencias

- **Positivas:** postura de seguridad verificable con tests unitarios y E2E desde el día 1; cero `unsafe-eval` y cero `unsafe-inline` en producción; protección contra abuso del ejecutable Electron como intérprete Node arbitrario (`RunAsNode: false`).
- **Negativas:** cualquier futuro estilo dinámico en la Capa 4/7 (p. ej. posición de marcadores en gráficas) deberá aplicarse vía clases CSS o propiedades DOM/Canvas en lugar de inyectar etiquetas `<style>` inline, o documentar una revisión de este ADR.
