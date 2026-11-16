# VISION.md — Visión del Producto EVO-AIM-CS2

- **Propósito:** Definir la propuesta de valor, segmentos de usuario, diferenciadores competitivos, principios de diseño, personas, historias de usuario y no-objetivos explícitos de EVO-AIM-CS2.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Misión y Propuesta de Valor

**EVO-AIM-CS2** es una plataforma de escritorio de código abierto (_Apache-2.0_) diseñada desde cero para **mejorar de forma medible, explicable y transferible el rendimiento mecánico en Counter-Strike 2**, accesible para cualquier PC capaz de ejecutar WebGL2 (desde portátiles de entrada a 60 Hz hasta equipos competitivos de 360 Hz en Windows y Linux).

Mientras que los _aim trainers_ genéricos entrenan la coordinación ojo-mano abstracta en motores ajenos o premian hacer clic rápido sobre esferas gigantes sin reglas de movimiento ni dispersión táctica, **EVO-AIM-CS2** modela las restricciones mecánicas reales de CS2: conversión exacta de sensibilidad (`eDPI`, `cm/360`, `FOV Hor+`), desaceleración de movimiento (_counter-strafing_), cadencia y recuperación de dispersión por arma, control de _spray_ / _recoil transfer_ y lectura biomecánica honesta de errores (sub-alcance, _overshoot_, temblor terminal, anticipación de disparo).

---

## 2. Público Objetivo Segmentado

| Segmento competitivo en CS2               | Rango orientativo (Premier / FACEIT)                                   | Dolor principal actual                                                                                                                                                               | Qué necesita de EVO-AIM-CS2                                                                                                                                                                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S1 — Iniciación e Intermedio Bajo**     | Silver / Gold Nova · Premier < 10 000 · FACEIT 1–3                     | Sensibilidades extremas mal configuradas, disparo en movimiento, pánico al controlar las primeras 8 balas, confusión ante consejos contradictorios en redes.                         | Onboarding guiado de `DPI` + sensibilidad real (`cm/360`), calibración física de 360°, ejercicios básicos de _first-bullet accuracy_, parada limpia (_counter-strafe_) y rutinas cortas de 15 min sin sobrecarga cognitiva.                             |
| **S2 — Competitivo Intermedio-Alto**      | Master Guardian / Legendary Eagle · Premier 10 000–19 999 · FACEIT 4–7 | Estancamiento (_plateau_): buen aim estático en calentamientos pero baja conversión en duelos reales de ángulo corto, _micro-flicks_ inconsistentes y _spray transfers_ deficientes. | Diagnóstico analítico que separe tiempo de reacción, velocidad inicial de _flick_ y fase de micro-corrección; escenarios con tamaños angulares equivalentes a cabezas de CS2 a distancias típicas; planificador adaptativo que ataque su eslabón débil. |
| **S3 — Avanzado y Semiprofesional**       | Premier 20 000+ · FACEIT 8–10+                                         | Desconfianza hacia _aim trainers_ por diferencias sutiles de FOV/input lag, métricas opacas o irrelevantes, y pérdida de tiempo en ejercicios que no transfieren al servidor.        | Fidelidad matemática auditable (< 0.1 % error en giro), cero pérdida de _counts_ hasta 8000 Hz, determinismo con semillas reproducibles para _benchmarks_ serios, modo ligero de latencia mínima y telemetría local exportable.                         |
| **S4 — Jugadores con PC modesto o Linux** | Transversal a todos los rangos                                         | Entrenadores pesados basados en motores 3D generalistas que tardan minutos en abrir, consumen decenas de GB o sufren caídas de FPS que alteran la sensación del ratón.               | Arranque en pocos segundos, peso reducido, soporte nativo de primera clase en Windows y soporte real en Linux, e **invarianza total de la fidelidad de aim respecto a los FPS** incluso en gráficos integrados a 60 Hz.                                 |

---

## 3. Problemas que Resuelve

1. **Brecha de transferencia al juego (_Transfer Gap_):** obtener puntuaciones altas en grillas estáticas genéricas no garantiza ganar duelos en CS2 donde el primer disparo exige velocidad horizontal cercana a cero y precisión de pocos minutos de arco.
2. **Cajas negras estadísticas:** la mayoría de entrenadores muestran un "Score" arbitrario y un "% de precisión" global que mezcla errores de amplitud, errores angulares, disparos prematuros antes de frenar y fallos por cadencia excesiva (_tapping_ demasiado rápido).
3. **Mitos y pseudociencia en la comunidad:** proliferan fórmulas mal copiadas, "sensibilidades mágicas" y afirmaciones neurocientíficas inventadas. EVO-AIM-CS2 separa hechos medibles y literatura revisada por pares (Ley de Fitts, control motor en dos fases de Woodworth/Meyer, variabilidad neuromotora) de las hipótesis no verificadas.
4. **Dependencia del hardware para medir habilidad:** en muchos motores mal desacoplados, jugar a 60 FPS pierde eventos sub-frame o cuantiza el disparo al frame visualizado, penalizando injustamente a quien tiene menos hardware.

---

## 4. Diferenciadores frente a Alternativas

| Dimensión                          | Aim Lab / Entrenadores comerciales pesados                | Kovaak's                                              | Aim Trainers Web                        | **EVO-AIM-CS2**                                                                                           |
| ---------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Especialización CS2**            | Genérico multi-juego; modos CS superficiales              | Gran catálogo comunitario pero física/armas genéricas | Muy básica                              | **100 % diseñado alrededor de mecánicas de CS2** (_counter-strafe_, cadencia/recoil, ángulos tácticos)    |
| **Transparencia y Código Abierto** | Propietario, telemetría comercial y monetización invasiva | Propietario                                           | Variable                                | **Open source (Apache-2.0), auditable, 0 telemetría por defecto, 100 % offline**                          |
| **Invarianza FPS / Hardware**      | Pesado en disco y RAM (motor generalista)                 | Ligero-medio (UE4 antiguo), solo Windows nativo       | Limitado por pestaña del navegador y GC | **Simulación sub-frame invariante a FPS**; corre fluido desde iGPU 60 Hz hasta 360 Hz                     |
| **Rigor de Datos y Ciencia**       | Marketing gamificado sin fuentes primarias                | Sin módulo científico estructurado                    | Nulo                                    | **Política estricta `DATA_POLICY.md`**: todo dato lleva fuente verificable o aviso explícito              |
| **Analítica Explicativa**          | Resúmenes genéricos o tras muros de pago                  | CSV básico + gráficas simples                         | Mínima                                  | **Descomposición cinemática local en SQLite** (fase balística vs. correctiva, _overshoot_, TTK, Fitts IP) |

---

## 5. No-Objetivos Explícitos (Qué NO es EVO-AIM-CS2)

Para proteger la integridad legal, la seguridad anti-cheat y el foco de ingeniería (`R7`, `R11`), quedan **permanentemente fuera de alcance**:

1. **NO es un cheat, macro, asistente externo ni overlay inyectado:** jamás leerá ni escribirá memoria de `cs2.exe`, no interceptará paquetes de red del juego, no inyectará DLLs ni simulará pulsaciones de ratón/teclado dentro de CS2.
2. **NO utiliza ni redistribuye assets con copyright de Valve:** cero modelos `.vmdl`, mapas `.vpk`, sonidos originales, iconos o texturas extraídos de Counter-Strike 2. Toda geometría y audio en EVO-AIM-CS2 es procedural o de creación propia/licencia abierta compatible.
3. **NO replica geometría exacta de mapas comerciales de Valve** (_Mirage_, _Inferno_, _Dust II_, etc.): los ejercicios tácticos utilizan geometría abstracta parametrizada (_greybox_ limpio de alto contraste) que reproduce **relaciones angulares, alturas de cabeza y distancias métricas genéricas**, nunca diseños propietarios.
4. **NO es un juego multijugador ni red social online en v1:** no habrá cuentas en la nube obligatorias, _matchmaking_ ni _leaderboards_ centralizados vulnerables a trampas en v1; el intercambio entre usuarios se realiza mediante archivos firmados/validados `.evoaim` y semillas deterministas.
5. **NO promete resultados milagrosos ni rangos garantizados:** las recomendaciones del planificador adaptativo y del _Sensitivity Finder_ se presentan con intervalos de confianza y explicaciones transparentes, nunca como verdades absolutas.

---

## 6. Principios de Producto

1. **Precisión mecánica antes que espectáculo visual:** un escenario limpio, legible a cualquier resolución y con _frame pacing_ de roca vale más que sombras complejas o post-procesado que añada latencia.
2. **La fidelidad del aim es un derecho independiente del bolsillo:** el cálculo del impacto y los _counts_ del ratón nunca dependen de la tasa de refresco ni del preset gráfico (`ADR-0012`).
3. **Honestidad estadística y científica:** si una métrica tiene tamaño muestral insuficiente ($N < 30$ ensayos válidos) o un dato de zoom no tiene confirmación oficial (`verified: false`), la interfaz lo declara abiertamente.
4. **Soberanía de los datos del jugador:** todos los runs, perfiles y métricas viven localmente en la carpeta `EVO-AIM-CS2` del usuario en SQLite documentado, exportable y sin bloqueo propietario.
5. **Adaptativo por diseño (`ADR-0018`):** EVO-AIM-CS2 jamás asume la sensibilidad, resolución, relación de aspecto (`4:3` a `21:9`), escalado de pantalla (`100 %`–`300 %`), disposición de teclado (`QWERTY`, `AZERTY`, `60 %`), capacidad sensorial/motora ni nivel competitivo de su creador. Todo cálculo, interfaz y escenario se valida contra una matriz de personas 100 % sintéticas ([`docs/PERSONAS_MATRIX.md`](./PERSONAS_MATRIX.md)), evalúa la progresión respecto al propio historial del jugador (usando cualquier rango declarado solo como _prior_ inicial débil) y trata la accesibilidad (`rem`, `reduced-motion`, `forced-colors`, estados no dependientes solo del color y navegación por teclado) como requisito de primera clase.

---

## 7. Personas Representativas

### Persona 1 — Martín ("El Competitivo Estancado en PC Modesto")

- **Perfil:** 20 años, estudiante universitario, juega CS2 en un portátil con GPU integrada y pantalla externa de 75 Hz en Windows 11 (Tier L/M), Premier 11 500, ratón de 1000 Hz a 800 DPI / sens 1.25.
- **Frustración:** Los entrenadores grandes tardan demasiado en cargar y le dan tirones (_stuttering_); siente que su sensibilidad cambia entre el entrenador y CS2, y no entiende por qué falla el primer tiro al asomar (_peek_).
- **Meta:** Entrenar 20 minutos diarios antes de jugar competitivo con carga instantánea, misma sensación exacta de giro que en CS2 y ejercicios guiados de _counter-strafe + micro-flick_.

### Persona 2 — Elena ("La Analítica de Rango Alto")

- **Perfil:** 25 años, ingeniera, FACEIT Nivel 9, PC de escritorio con GPU dedicada y monitor 240 Hz + ratón 4000 Hz (Tier H), alterna entre Windows 11 y Linux (Ubuntu x64).
- **Frustración:** Ya domina los escenarios básicos; necesita pulir micro-correcciones horizontales bajo presión de tiempo y transferencia de _spray_ entre dos objetivos, además de comparar si bajar su `eDPI` de 880 a 760 reduce su _overshoot_ real sin empeorar su tiempo de giro de 180°.
- **Meta:** Mediciones cinemáticas rigurosas, cero pérdida de _counts_ a 4000 Hz, determinismo por semilla para comparar dos sensibilidades en igualdad exacta de condiciones y compatibilidad en Linux.

### Persona 3 — Diego ("El Coach / Creador de Rutinas Open Source")

- **Perfil:** 29 años, entrenador de equipo amateur de CS2.
- **Frustración:** Quiere diseñar rutinas específicas de calentamiento y evaluación para sus 5 jugadores con PCs muy distintos, compartirlas en un archivo ligero sin obligarles a registrarse en cuentas llenas de anuncios y auditar las métricas de cada jugador tras la semana.
- **Meta:** Crear rutinas y escenarios reproducibles exportados como `.evoaim`, pedir a sus jugadores que le envíen sus resultados/replays `.evoaim` y comparar progreso real sin sesgo de FPS entre los PCs del equipo.

---

## 8. Cinco Historias de Usuario Clave y Criterios de Éxito

### HU-01: Sincronización y verificación física de sensibilidad CS2

> _Como jugador de CS2 (Martín), quiero introducir mi `DPI` y sensibilidad de CS2 (o importarla de mi config) y verificar con una prueba física guiada de 360° sobre mi alfombrilla que el giro coincide exactamente con la teoría, para confiar al 100 % en que no estoy alterando mi memoria muscular._

- **Criterio de éxito medible:** Cálculo exacto de `eDPI` y `cm/360`; discrepancia entre el giro teórico y la herramienta de calibración 360° $\le 0.1\%$ en pruebas controladas (`QB-01`); detección y alerta visible si la aceleración del SO o la falta de `unadjustedMovement` afectan la entrada.

### HU-02: Entrenamiento justo en hardware de entrada (Invarianza FPS)

> _Como jugador con portátil de gráficos integrados a 60 Hz (Martín), quiero ejecutar el mismo escenario y semilla que un compañero con PC de 360 Hz sabiendo que mis disparos e impactos se evalúan con la misma precisión angular sub-frame._

- **Criterio de éxito medible:** Auto-selección del preset "Bajo" manteniendo 60 FPS estables (`p99 <= 25 ms` en Tier L) y superación del test automatizado de invarianza donde un mismo _stream_ sintético de eventos de ratón/disparo produce idénticos impactos y puntuación a 30, 60, 144 y 360 FPS (`QB-06`).

### HU-03: Diagnóstico explicativo de fallos de puntería

> _Como jugadora avanzada (Elena), quiero ver al terminar una serie por qué fallé mis disparos (cuántos fueron por disparar antes de completar el frenado, cuántos por quedarme corta en el flick inicial y cuántos por pasarme de largo en micro-corrección), para corregir el hábito concreto en la siguiente serie._

- **Criterio de éxito medible:** Al finalizar un run de 60 s, generación en $< 150\text{ ms}$ de desglose cuantitativo con clasificación de errores angulares, sesgo direccional (izquierda/derecha/arriba/abajo), curva velocidad-precisión y recomendación accionable vinculada al planificador.

### HU-04: Búsqueda empírica de sensibilidad (_Sensitivity Finder_) sin sesgos

> _Como jugador indeciso con mi sensibilidad, quiero realizar un protocolo A/B ciego o semi-ciego con semillas emparejadas evaluando flicks largos, micro-ajustes y tracking horizontal, para elegir un rango de `eDPI` respaldado por mis propios datos y no por copiar a un profesional._

- **Criterio de éxito medible:** Protocolo reproducible en $\le 15\text{ min}$ que evalúa al menos 3 candidatos de sensibilidad sobre tareas ortogonales, calcula métricas compuestas (incluyendo _Throughput_ de Fitts en bits/s y tasa de _overshoot_) e informa un intervalo recomendado junto con su margen de incertidumbre estadística.

### HU-05: Creación e intercambio seguro de rutinas `.evoaim`

> _Como entrenador (Diego), quiero empaquetar una rutina de 5 escenarios personalizados en un archivo `.evoaim` y compartirlo con mi equipo sabiendo que es seguro, ligero y reproducible bit a bit._

- **Criterio de éxito medible:** Exportación/importación de archivos `.evoaim` validados estrictamente mediante esquemas Zod y límites de tamaño/complejidad (`SECURITY_MODEL.md`), rechazando cualquier archivo corrupto o malicioso sin bloquear la aplicación y reproduciendo exactamente la secuencia de objetivos para una misma semilla (`QB-05`).
