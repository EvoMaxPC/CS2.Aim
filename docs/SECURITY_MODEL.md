# SECURITY_MODEL.md — Modelo de Seguridad y Privacidad Técnica

- **Propósito:** Documentar la superficie de ataque, activos protegidos, modelo de amenazas (STRIDE simplificado) y controles defensivos de EVO-AIM-CS2.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Principios de Seguridad y Privacidad

1. **Mínimo privilegio por diseño:** una aplicación de entrenamiento de puntería **no necesita permisos de administrador/root**, no necesita drivers de kernel, no necesita acceso a Internet general para entrenar y no necesita inspeccionar otros procesos del sistema.
2. **Aislamiento estricto del Renderer:** asumimos defensa en profundidad: aunque la interfaz carga únicamente código empaquetado local, el proceso `renderer` corre completamente aislado en sandbox sin acceso directo al sistema operativo.
3. **Cero telemetría por defecto (`ADR-0014`):** la aplicación realiza **0 conexiones salientes de telemetría o analítica** en su configuración predeterminada.

---

## 2. Activos a Proteger

- Integridad del sistema del usuario (impedir ejecución arbitraria de código o escritura fuera de carpetas permitidas).
- Base de datos local de entrenamiento (`<userData>/EVO-AIM-CS2/data/evoaim.sqlite`) e historial del jugador.
- Archivos de configuración legítimos de Counter-Strike 2 cuando el usuario autoriza la sincronización en Capa 16.
- Privacidad del usuario (rutas del sistema, identificadores locales de cuenta de Steam en `userdata`, métricas personales).

---

## 3. Modelo de Amenazas y Mitigaciones por Superficie

### Amenaza 1: Archivos `.evoaim` maliciosos compartidos por terceros (Capa 14)

Un atacante distribuye en foros o Discord un escenario, rutina o replay `.evoaim` manipulado intentando provocar ejecución de código (XSS/RCE en Electron), denegación de servicio (_zip bomb_ / agotamiento de RAM) o _path traversal_.

- **Controles obligatorios:**
  - Los archivos `.evoaim` son exclusivamente **datos estructurados declarativos** (JSON/binario compacto de trazas numéricas); **jamás contienen código ejecutable, scripts JS, shaders arbitrarios ni HTML crudo**.
  - Límite estricto de tamaño de lectura antes de descomprimir/parsear (p. ej. máx. 10 MB por archivo y ratio máximo de descompresión controlado).
  - Validación estricta con esquemas **Zod** (`strict()`, rechazo de claves desconocidas, protección contra _prototype pollution_, cotas numéricas finitas en número de entidades/spawners para proteger equipos Tier L).
  - Cualquier texto descriptivo (título/autor del escenario) se renderiza como texto plano en React (nunca `dangerouslySetInnerHTML`).

### Amenaza 2: Abuso del puente IPC (`Renderer` $\rightarrow$ `Main`)

Si ocurriese un fallo lógico en el `renderer`, un atacante podría intentar invocar canales IPC para leer o escribir archivos arbitrarios del disco.

- **Controles obligatorios (`QB-12`):**
  - `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`.
  - `preload` expone métodos específicos de alto nivel (`saveRun`, `importScenarioViaDialog`), **nunca** `ipcRenderer.invoke(arbitraryChannel)` ni rutas de archivo arbitrarias elegidas silenciosamente por el renderer (la apertura/guardado externo usa diálogos nativos controlados por `main`).
  - Validación de `event.senderFrame` en `ipcMain` asegurando que solo el frame principal legítimo de la app puede invocar canales.
  - Validación de entrada con Zod en `main` para el 100 % de los canales.

### Amenaza 3: Receptor local de _Game State Integration_ (GSI) en Capa 16

Cuando el usuario activa voluntariamente la integración GSI con CS2, EVO-AIM-CS2 levanta un pequeño servidor HTTP para recibir los estados enviados por el cliente local de CS2.

- **Controles obligatorios:**
  - **Desactivado por defecto** hasta que el usuario lo habilite explícitamente.
  - Bind exclusivo a la interfaz loopback **`127.0.0.1`** (jamás `0.0.0.0`), inaccesible desde la red local (LAN/Wi-Fi).
  - Token secreto aleatorio de alta entropía generado localmente en `gamestate_integration_evoaim.cfg` (`auth.token`) y verificado en tiempo constante en cada petición POST.
  - Límite estricto de tamaño de cuerpo HTTP (`<= 64 KB`), _rate limiting_ local, solo método `POST` y rechazo de cabeceras de navegador sospechosas si procede, parseando únicamente campos esperados con Zod.

### Amenaza 4: Acceso a rutas de Steam y archivos `.cfg` de CS2 (Capa 16)

Riesgo de corromper la configuración del usuario en CS2 o escribir en ubicaciones indebidas.

- **Controles obligatorios:**
  - Por defecto la lectura de sensibilidad/crosshair es **100 % solo lectura**.
  - La única escritura permitida en el directorio `cfg` de CS2 es la creación/eliminación del archivo aislado `gamestate_integration_evoaim.cfg` (o exportación explícita a un archivo `.cfg` nuevo elegido por el usuario), siempre previa confirmación con vista previa exacta del contenido que se escribirá y copia de respaldo si ya existía.
  - Normalización canónica de rutas (`path.resolve`) dentro de `PlatformAdapter` impidiendo enlaces simbólicos maliciosos o _path traversal_.

### Amenaza 5: Actualizaciones automáticas y cadena de suministro (Capa 1 y 17)

Riesgo de dependencias npm comprometidas o descarga insegura de actualizaciones.

- **Controles obligatorios:**
  - `pnpm-lock.yaml` bloqueado en el repositorio, Dependabot semanal (`.github/dependabot.yml`), `pnpm audit` en CI y política de versiones mínimas de madurez cuando sea viable.
  - Descarga de actualizaciones únicamente por **HTTPS** desde los **GitHub Releases oficiales** del repositorio, verificando hashes criptográficos SHA-256 (`latest.yml` / `latest-linux.yml`) y firma binaria cuando esté disponible (`R17`).

### Amenaza 6: Telemetría y filtración de datos personales

- **Controles obligatorios:**
  - **Cero telemetría por defecto.** Ningún SDK de analítica comercial (Google Analytics, Mixpanel, Sentry cloud activo por defecto, etc.) se incluye haciendo llamadas silenciosas.
  - En la Capa 17 se ratificará si la app mantiene únicamente exportación local de informes de diagnóstico generados por el propio usuario para adjuntar manualmente en GitHub Issues (con rutas personales anonimizadas `<USER_HOME>`). Cualquier eventual mecanismo futuro de reporte de errores deberá ser **estrictamente opt-in**, desactivado por defecto, documentado y 100 % auditable en el código fuente.
