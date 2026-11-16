# HARDWARE_TIERS.md — Escalabilidad de Hardware ("Para Todas las PCs", Eje Rendimiento)

- **Propósito:** Garantizar que EVO-AIM-CS2 funcione con fluidez desde portátiles modestos con gráficos integrados (60 Hz) hasta equipos entusiastas (360 Hz), manteniendo **invarianza absoluta en la fidelidad del aim**.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Principio Rector: Invarianza de la Fidelidad de Aim

En Counter-Strike y en el entrenamiento serio de puntería, **el hardware nunca debe adulterar la física del disparo**:

1. **Misma sensibilidad física (`cm/360`):** la conversión de _counts_ crudos de ratón a grados de rotación (`yawDeg`, `pitchDeg`) es una función matemática pura independiente de `deltaTime` y de los FPS.
2. **Resolución de impactos en el instante exacto del disparo (_Sub-frame Hit Registration_):** cuando el jugador pulsa el botón de disparo en el instante $t_{\text{shot}}$ (entre el frame $k-1$ y el frame $k$), el motor integra todos los eventos de movimiento de ratón con $t \le t_{\text{shot}}$ e interpola/evalúa las posiciones deterministas de los objetivos en $t_{\text{shot}}$. Un jugador a 60 FPS no sufre cuantización espacial de su mira de $16.67\text{ ms}$ respecto a uno de 360 FPS.
3. **Misma puntuación base y determinismo:** reproducir la misma traza de eventos de entrada con una misma semilla a **30, 60, 144 y 360 FPS** produce exactamente los mismos impactos y puntuación (`QB-06`).
4. **Lo único que cambia entre Tiers es la presentación visual** (resolución interna de renderizado, antialiasing, luces, sombras, partículas decorativas y fluidez visual del monitor).

---

## 2. Definición de los 3 Tiers de Hardware de Referencia

> **Importante:** Todas las cifras siguientes son **OBJETIVOS de ingeniería (`Target, a validar`)**, no hechos consumados. Los presupuestos numéricos exactos de memoria RAM e instalador se fijarán empíricamente tras medir la línea base real en la **Capa 1** y optimizar en la **Capa 15** (cero cifras inventadas).

| Atributo                                 | **Tier L (Entrada / Low-End)**                                                                                                                                     | **Tier M (Medio / Mainstream)**                                                                                                   | **Tier H (Alto / Competitivo Entusiasta)**                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Perfil típico de PC**                  | Portátil de estudio/oficina o PC de escritorio antiguo con GPU integrada (Intel UHD / Iris Xe / AMD Vega integrada) o GPU dedicada antigua de gama baja; 8 GB RAM. | PC gamer estándar de gama media con GPU dedicada básica/media (gama GTX 16xx / RTX 3050–3060 / RX 6600 o equivalente); 16 GB RAM. | PC competitivo actual con CPU rápida y GPU moderna dedicada; 16–32 GB RAM.                                                    |
| **Monitor objetivo**                     | **60 Hz – 75 Hz** (1080p o 768p)                                                                                                                                   | **120 Hz – 165 Hz** (1080p / 1440p)                                                                                               | **240 Hz – 360+ Hz** (1080p / 1440p)                                                                                          |
| **Preset por defecto**                   | **Bajo** (o **Modo Ahorro** si se detecta cuello de botella severo) + escalado dinámico activo (`0.65x`–`1.0x`)                                                    | **Medio** (escala `1.0x`, MSAA ligero o FXAA)                                                                                     | **Alto** (escala `1.0x` nativa, MSAA, iluminación completa limpia; sombras/efectos desactivables por preferencia competitiva) |
| **Objetivo de FPS estables**             | $\ge 60\text{ FPS}$ sostenidos (igualar refresco del monitor) (`Target, a validar` en `SPIKE-5`)                                                                   | $\ge 144\text{ FPS}$ sostenidos (`Target, a validar` en `SPIKE-2`)                                                                | $\ge 240\text{–}360\text{ FPS}$ sostenidos (`Target, a validar` en `SPIKE-2`)                                                 |
| **Criterio de _Frame Pacing_ (`QB-04`)** | $p_{99}(\text{frameTime}) \le 25.0\text{ ms}$ ($1.5 \times 16.67\text{ ms}$)                                                                                       | $p_{99}(\text{frameTime}) \le 10.42\text{ ms}$ ($1.5 \times 6.94\text{ ms}$ a 144 Hz)                                             | $p_{99}(\text{frameTime}) \le 6.25\text{ ms}$ (240 Hz) / $\le 4.17\text{ ms}$ (360 Hz)                                        |
| **Objetivo de Arranque (`QB-07`)**       | $< 5.0\text{ s}$ en SSD (`Target, a validar`)                                                                                                                      | $< 3.0\text{ s}$ en SSD (`Target, a validar`)                                                                                     | $< 2.5\text{ s}$ en NVMe (`Target, a validar`)                                                                                |
| **Presupuesto de RAM (reposo / en run)** | _Pendiente de fijar tras línea base de Capa 1 y perfilado de Capa 15; sin crecimiento $> 1\text{ MB/min}$ en runs de 10 min (`QB-08`)._                            | _Pendiente de fijar tras línea base de Capa 1; sin fugas (`QB-08`)._                                                              | _Pendiente de fijar tras línea base de Capa 1; cero pausas GC perceptibles en hot path (`QB-08`)._                            |

### 2.1 Plantillas de Equipos Reales de Referencia (A rellenar por el propietario / colaboradores)

> Recuerda (`CONVENTIONS.md`): incluir solo especificaciones técnicas de hardware/SO, nunca identificadores personales. Si solo se dispone de un equipo ahora, rellenar el Tier correspondiente y mantener los otros como `Pendiente` (buscando validación comunitaria con etiqueta `perf:low-end` / `help wanted`).

- **Equipo Real Tier L:** `Pendiente de rellenar (CPU / iGPU / RAM / SO / Monitor Hz)`
- **Equipo Real Tier M:** `Pendiente de rellenar (CPU / GPU / RAM / SO / Monitor Hz)`
- **Equipo Real Tier H:** `Pendiente de rellenar (CPU / GPU / RAM / SO / Monitor Hz)`

---

## 3. Método de Medición y Simulación de Hardware Limitado

### 3.1 Protocolo de medición reproducible

Cada medición de Tier (ejecutada en `SPIKE-2`, `SPIKE-5` y automatizada en Capa 15) registrará durante un escenario estándar de 60 s (tras 5 s de _warm-up_ de compilación de shaders WebGL2):

- Distribución completa de `frameTime` ($p_{50}, p_{95}, p_{99}, p_{99.9}$, máximo y porcentaje de frames dentro del intervalo del monitor).
- Tiempo de simulación por tick (`simStepUs`) y tiempo de envío de comandos de render (`renderSubmitUs`).
- Uso de memoria del proceso (`app.getAppMetrics()` en Electron) y contadores `renderer.info.memory` / `renderer.info.render.calls` de Three.js (objetivo en escena típica: $< 50$ _draw calls_ mediante `InstancedMesh`).

### 3.2 Cómo simular hardware limitado durante el desarrollo

Para detectar regresiones antes de probar en portátiles antiguos, los desarrolladores emplearán:

1. **CPU Throttling en Chromium DevTools (`4x` y `6x` slowdown):** útil para verificar que el bucle de simulación y la UI no asignan basura ni sufren _spiral of death_ cuando la CPU es lenta.
2. **Limitación forzada de resolución/fill-rate y cap de FPS artificial (30 / 60 FPS):** para validar el escalador dinámico de resolución y la invarianza `QB-06`.
3. **Ejecución en iGPU real (forzando GPU de ahorro de energía en ajustes gráficos de Windows/Linux `DRI_PRIME=0`) o máquina virtual con aceleración limitada.**

> **Advertencia metodológica:** El _throttling_ sintético de DevTools o una VM **NO sustituye las pruebas en hardware real Tier L** (donde los cuellos de botella reales suelen estar en ancho de banda de memoria compartida DDR4, drivers antiguos Intel/Mesa y límites térmicos). `SPIKE-5` exige validación explícita en una iGPU real antes de cerrar la arquitectura gráfica definitiva.

---

## 4. Diseño de Escalabilidad Gráfica y Detección de Capacidades

### 4.1 Presets Gráficos y Modo Ahorro

| Característica                               | **Modo Ahorro (Ultra-Low)**                                                                                                   | **Preset Bajo**                                                    | **Preset Medio**                          | **Preset Alto**                                               | **Personalizado**             |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------- | ----------------------------- |
| **Escala de resolución base (`pixelRatio`)** | `0.50x` – `0.75x` (tope DPR 1.0)                                                                                              | `0.75x` – `1.0x` (tope DPR 1.0)                                    | `1.0x` nativo                             | Nativo (hasta DPR del monitor)                                | Configurable (`0.5x`–`1.0x`+) |
| **Escalado dinámico de resolución (DRS)**    | Activo agresivo                                                                                                               | Activo por defecto                                                 | Opcional                                  | Desactivado por defecto                                       | Configurable                  |
| **Antialiasing**                             | Desactivado                                                                                                                   | Desactivado                                                        | FXAA / MSAA 2x                            | MSAA 4x                                                       | Off / FXAA / MSAA 2x/4x       |
| **Sombras y Post-procesado**                 | Desactivados                                                                                                                  | Desactivados                                                       | Sombras estáticas simples, 0 post-proceso | Iluminación limpia con sombras ligeras; 0 motion blur siempre | Granular                      |
| **Geometría de objetivos y arena**           | Subdivisión mínima (_low-poly_ limpio + `InstancedMesh`), materiales `MeshBasicMaterial` / `MeshLambertMaterial` sin reflejos | Subdivisión baja + `InstancedMesh`, iluminación direccional simple | Subdivisión estándar suave                | Subdivisión alta sin bordes facetados visibles                | Granular                      |
| **Impact decals / trazadoras**               | Solo marcador mínimo instantáneo                                                                                              | Pool reducido (máx. 16 decals)                                     | Pool estándar (máx. 64 decals)            | Pool completo (máx. 128 decals)                               | Configurable                  |
| **Límite de FPS en menús 2D**                | 30 FPS (pausa render 3D al minimizar)                                                                                         | 60 FPS en menús                                                    | 60 FPS en menús                           | 120 FPS en menús                                              | Configurable                  |

_(Nota competitiva: efectos que ensucian la lectura visual o añaden latencia como **Motion Blur**, **Depth of Field** o **Chromatic Aberration** no existirán en ningún preset de EVO-AIM-CS2)._

### 4.2 Escalado Dinámico de Resolución (DRS)

Un controlador con histéresis monitoriza la media móvil de `frameTime` cada 500 ms fuera del hot path:

- Si `frameTime` supera el $90\%$ del presupuesto objetivo durante varias ventanas consecutivas, reduce `renderer.setPixelRatio()` en pasos discretos (`1.0 -> 0.85 -> 0.75 -> 0.65 -> 0.50`) sin recrear la escena ni alterar el FOV ni la proyección angular de la mira (la retícula/crosshair se dibuja en capa nítida a resolución nativa).
- Si sobra margen amplio ($< 60\%$ del presupuesto durante $> 3\text{ s}$), recupera gradualmente un escalón para evitar oscilaciones.

### 4.3 Detección de Capacidades GPU y Onboarding de 10 Segundos

En el arranque y durante el primer inicio (_Onboarding_, Capa 13 y Capa 15):

1. **Comprobación de WebGL2:** verifica creación de contexto `webgl2`. Si falla, muestra pantalla diagnóstica amigable con pasos para actualizar drivers o activar aceleración por hardware.
2. **Inspección de `WEBGL_debug_renderer_info` (cuando esté disponible):** detecta renderizadores por software (`SwiftShader`, `llvmpipe`, `Microsoft Basic Render Driver`) y muestra una **alerta inmediata** avisando de que la aceleración por GPU no está activa y activando automáticamente el **Modo Ahorro**.
3. **Micro-benchmark de 10 segundos en el Onboarding:** renderiza en segundo plano una escena sintética representativa midiendo `frameTime` real y selecciona automáticamente el preset óptimo (`Modo Ahorro`, `Bajo`, `Medio` o `Alto`), permitiendo siempre al usuario **bloquear manualmente** el preset elegido o fijar un límite de FPS (`FPS Cap` opcional: ilimitado, refresco del monitor, 60, 120, 144, 240, 360).

---

## 5. Control de Peso de la Aplicación

Electron incluye Chromium y Node.js, lo que impone un suelo de tamaño en disco y memoria (`R12`). Para mantenerlo bajo control estricto:

- **Requisito Capa 1 (`QB-09`):** medir y publicar en el repositorio la línea base real de (a) tamaño de instalador comprimido y descomprimido, (b) RAM RSS total en reposo en el menú principal y (c) RAM RSS total durante una escena 3D básica.
- **Seguimiento continuo en CI:** cualquier nueva dependencia o asset pesado se audita frente a esa línea base; los sonidos se generan proceduralmente con Web Audio API o usan clips ultra-cortos comprimidos (`.ogg`/`.opus` con licencia CC0/propia) y los escenarios son definiciones JSON de pocos kilobytes en lugar de mallas 3D gigantes.
- **Plan B documentado (`SPIKE-5`):** si Electron + WebGL2 no logra cumplir `QB-04` en equipos Tier L reales pese al Modo Ahorro, el aislamiento de `@evo-aim/core` y `@evo-aim/data` permite ofrecer un modo ultraligero o migrar el shell/renderer a Rust + `wgpu` / Tauri reutilizando toda la matemática y los catálogos.

---

## 6. Accesibilidad de Periféricos y Pantallas

EVO-AIM-CS2 no asume periféricos de gama entusiasta:

- **Ratones:** compatible desde ratones básicos de oficina de **125 Hz / 400–1000 DPI** hasta ratones competitivos de **4000 Hz y 8000 Hz** (`QB-02`).
- **Alfombrillas pequeñas:** los escenarios y el _Sensitivity Finder_ informan el desplazamiento físico requerido en centímetros para advertir si un ejercicio de giros amplios excede el espacio físico declarado por el usuario.
- **Teclados de cualquier formato:** soporte completo para teclados **60 %, 65 %, TKL, ISO (ES/LatAm) y ANSI (US)**; ningún atajo obligatorio dependerá del bloque numérico (_numpad_) y todas las teclas de acción serán reasignables.
- **Relaciones de aspecto variadas:** soporte matemático explícito para **16:9, 16:10, 21:9 ultrawide y 4:3** (incluyendo simulación opcional de FOV 4:3 para jugadores que usan _4:3 stretched_ o _black bars_ en CS2, documentado y sujeto a verificación geométrica en Capa 2/4).
