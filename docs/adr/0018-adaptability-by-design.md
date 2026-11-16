# ADR-0018: Adaptabilidad por Diseño y Matriz Obligatoria de Personas Sintéticas

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Core / UI / Engine

## Contexto y Problema

Un riesgo estructural frecuente en proyectos de entrenamiento de puntería nacidos de un jugador o equipo reducido es construir inadvertidamente el producto alrededor del hardware, la sensibilidad, el monitor, el sistema operativo, la disposición de teclado y el rango competitivo del propio autor (p. ej. asumir `800 DPI`, `16:9 @ 1080p`, escala de Windows al `100 %`, teclado QWERTY ANSI en inglés/español, visión tricromática normal o un nivel intermedio-alto previo).

Cuando esos supuestos implícitos se filtran como valores por defecto mágicos, constantes de layout o umbrales fijos de dificultad:

1. Jugadores en los extremos legítimos del espectro (sensibilidades ultra-bajas de brazo o ultra-altas de muñeca, ratones de oficina de `125 Hz` o competitivos de `8000 Hz`, monitores `4:3` estirados o `21:9` ultrawide, escalado del SO al `150 %`–`300 %`, teclados `AZERTY` o `60 %`, gráficos integrados `Tier L`, baja visión, daltonismo o principiantes absolutos) sufren recortes de interfaz, divisiones extremas mal redondeadas, ejercicios físicamente imposibles para su alfombrilla o recomendaciones sesgadas.
2. Se corre además el riesgo de filtrar preferencias o valores identificables del entorno personal del mantenedor en un repositorio público de código abierto.

## Opciones Consideradas

1. **Diseñar para el "caso medio" (`1080p`, `100 %` escala, `800 eDPI`, `QWERTY`) y corregir casos extremos bajo demanda mediante Issues:** barato a corto plazo, pero acumula deuda arquitectónica profunda en UI, matemáticas y motor cuando aparecen usuarios reales diversos.
2. **Probar manualmente con 2–3 perfiles informales:** insuficiente para cubrir combinaciones ortogonales de periféricos, pantalla, accesibilidad, idioma/teclado y hardware.
3. **Adaptabilidad por Diseño gobernada por 4 reglas vinculantes + Matriz canónica de $\ge 14$ Personas Sintéticas (`PERSONAS_MATRIX.md`) y rangos soportados explícitos (`SUPPORTED_RANGES.md`):** convierte la diversidad de usuarios y equipos en contratos verificables automáticamente en cada capa.

## Decisión

Adoptamos la **Opción 3 (Adaptabilidad por Diseño)** mediante **cuatro reglas vinculantes** obligatorias desde la Capa 0.1 en adelante (`QB-14`, `QB-15`, `QB-16`):

### Regla R1 — Cero valores personales del propietario como _default_ ni como _fixture_

Ningún valor procedente de la configuración personal del propietario o de un contribuyente (su `DPI` personal, su sensibilidad, su resolución, su ruta local, su monitor o su rutina privada) puede codificarse como valor por defecto silencioso del producto ni como único caso de prueba. Los valores iniciales antes del onboarding deben ser neutros y explícitamente etiquetados como plantillas genéricas hasta que el usuario complete su calibración/perfil, y todo dato fuera de [`docs/SUPPORTED_RANGES.md`](../SUPPORTED_RANGES.md) debe degradar con elegancia o devolver un error tipado claro.

### Regla R2 — Validación obligatoria contra una Matriz de Personas Sintéticas

Todo cálculo matemático (`@evo-aim/core`), esquema de catálogo (`@evo-aim/data`), simulación/escenario (`@evo-aim/engine`) y vista de interfaz (`@evo-aim/ui`, `@evo-aim/desktop`) debe validarse contra la matriz canónica de personas sintéticas definida en [`docs/PERSONAS_MATRIX.md`](../PERSONAS_MATRIX.md) (`P01`..`P20`, 100 % sintéticas y diseñadas para cubrir los extremos de cada eje técnico y humano).

### Regla R3 — Niveles de habilidad relativos al historial propio; rango declarado solo como _prior_ débil

Las puntuaciones, zonas de desafío óptimo y recomendaciones del planificador adaptativo (Capa 8) y de los benchmarks (Capa 12) se calculan siempre respecto a la **propia línea base histórica y varianza medida del usuario**. Si el usuario declara opcionalmente un rango orientativo de CS2 (Premier / FACEIT / Competitivo) o "Principiante absoluto" durante el onboarding, dicho dato actúa **únicamente como un _prior_ inicial débil para los primeros runs de calibración ($N < 5$)** y queda rápidamente desplazado por su telemetría empírica real. Jamás se bloquean ejercicios ni se emiten diagnósticos estáticos basados en etiquetas de rango.

### Regla R4 — Accesibilidad y escalado como requisitos de primera clase

La accesibilidad visual, motora y cognitiva no es un añadido cosmético de última hora, sino una restricción arquitectónica transversal desde el esqueleto:

- Tipografía y espaciado relativos en `rem` gobernados por `--text-scale`, soportando escalados del sistema operativo del `100 %` al `300 %` sin pérdida de funcionalidad ni desbordamiento horizontal en ventanas soportadas.
- Respeto estricto a `@media (prefers-reduced-motion: reduce)`, `@media (forced-colors: active)` y `@media (prefers-color-scheme: light | dark)`.
- **Ningún estado funcional se comunica únicamente mediante el color** (siempre acompañado de glifo, icono, patrón o etiqueta textual explícita, además de atributos ARIA semánticos).
- Operabilidad completa de menús, ajustes, calculadoras, biblioteca científica y tablas de estadísticas fuera del canvas 3D exclusivamente con teclado (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`) y con lectores de pantalla (`NVDA`/`Narrator`, `VoiceOver`, `Orca`, mientras el canvas visual 3D declara explícitamente su frontera fuera de rango por `aria-live` sin atrapar el foco; `P19`), ausencia de límites de tiempo en UI y alternativas de conmutación (_toggle_) para motricidad fina reducida/temblor (`P18`, manteniendo separados los runs con `assistedMode: true`) e independencia respecto a la disposición física de teclas (`KeyboardEvent.code` / reasignación completa para `QWERTY`, `AZERTY`, `QWERTZ`, `60 %` / `TKL` sin bloque numérico).

## Cómo se Hace Cumplir (Enforcement)

1. **Capa 0.1 (esta entrega documental):** establecimiento de [`docs/PERSONAS_MATRIX.md`](../PERSONAS_MATRIX.md), [`docs/SUPPORTED_RANGES.md`](../SUPPORTED_RANGES.md), los presupuestos medibles `QB-14`, `QB-15` y `QB-16` en [`docs/QUALITY_BARS.md`](../QUALITY_BARS.md), criterios de adaptabilidad por capa en [`docs/ROADMAP.md`](../ROADMAP.md) y casilla obligatoria en [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md).
2. **Herramienta estática `tools/check-no-owner-values` (activa en `pnpm verify` desde Capa 1 y ampliada en Capa 1.1):** bloquea rutas de usuario reales, IPs privadas de LAN, tokens/secretos e identificadores legados, ampliándose en la **Capa 1.1** para vigilar literales sospechosos no parametrizados fuera de fixtures sintéticos autorizados.
3. **Capa 1.1 (infraestructura de código de adaptabilidad):** implementación en `@evo-aim/core/testing` del tipo `PersonaFixture`, el catálogo tipado de las personas sintéticas `P01`..`P20`, el helper parametrizado `forEachPersona(...)`, el test automático de cobertura de ejes de la matriz y la parametrización de suites unitarias y E2E por persona (véase [`docs/TESTING_STRATEGY.md`](../TESTING_STRATEGY.md)).

## Consecuencias

- **Positivas:** EVO-AIM-CS2 sirve desde el primer día a principiantes absolutos, jugadores zurdos o en `AZERTY`, usuarios con baja visión/daltonismo, portátiles modestos con escala del 150 %–300 % y profesionales de `360 Hz` / `8000 Hz` sin reescrituras traumáticas en la Capa 13.
- **Negativas:** incrementa ligeramente el número de casos parametrizados en Vitest y Playwright, mitigado agrupando tests rápidos en memoria con `forEachPersona` para todas las personas y seleccionando subconjuntos ortogonales representativos en suites E2E pesadas de ventana Electron.
