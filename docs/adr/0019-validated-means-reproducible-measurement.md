# ADR-0019: "Validated" (`verified: true`) Significa Exclusivamente Medición Reproducible

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Data / Core / Mantenedor Principal

## Contexto y Problema

Al construir un entrenador especializado en Counter-Strike 2 existen decenas de constantes críticas: `m_yaw`, proyección `Hor+`, `zoom_sensitivity_ratio` en mira telescópica, velocidades máximas por arma, tiempos de desaceleración en _counter-strafing_, cadencias en RPM, recuperación de dispersión, patrones de _recoil_ de 30 disparos y dimensiones angulares de hitboxes (`R4`, `R5`, `R6`).

En muchos proyectos comunitarios —y muy especialmente cuando intervienen asistentes de IA— se cometen tres errores graves de integridad epistémica:

1. Asumir de memoria valores heredados de _CS:GO_ (Source 1) como si estuvieran confirmados en _CS2_ (Source 2) tras sus actualizaciones continuas.
2. Copiar números de wikis, foros, vídeos o repositorios de terceros sin metodología trazable y etiquetarlos como "oficiales" o "exactos".
3. Mezclar identidades puramente matemáticas (como $1\text{ in} = 2.54\text{ cm}$) con parámetros empíricos del motor del juego sin distinguir qué parte está demostrada y qué parte sigue pendiente de comprobación experimental.

## Opciones Consideradas

1. **Confiar en tablas populares de la comunidad de CS2 y marcar los datos como definitivos salvo que alguien reporte un bug:** rápido, pero viola el principio fundacional de cero datos inventados y destruye la credibilidad técnica del proyecto ante jugadores avanzados.
2. **Extraer valores desensamblando binarios o leyendo memoria de `cs2.exe`:** inaceptable legalmente y contrario a nuestras fronteras anti-cheat (`ADR-0007`, `LEGAL.md`).
3. **Exigir medición empírica propia y 100 % reproducible (o especificación oficial primaria de Valve/W3C) como requisito único para el estado `"Validated"` (`verified: true`):** cualquier cifra que aún no cuente con registro reproducible completo permanece explícitamente como `"por verificar"` (`verified: false`).

## Decisión

Adoptamos la **Opción 3** como regla vinculante en toda la documentación, código y catálogos de EVO-AIM-CS2 (`QB-13`, `QB-17`, `QB-18`, `QB-19`):

1. **Definición estricta de `"Validated"` (`verified: true`):**
   Un parámetro empírico de CS2 o del sistema solo puede marcarse como `"Validated"` (`verified: true` en `@evo-aim/data` o `Validado` en tablas técnicas) cuando exista en el repositorio (o en el registro enlazado en `provenance.notes`) un **registro de medición reproducible** que incluya obligatoriamente los **cinco elementos**:
   - **Método paso a paso** ejecutable por un tercero usando únicamente mecanismos legítimos (`ADR-0007`: consola local de práctica, `cl_showpos 1`, vídeo de alta velocidad, trazas HID propias o documentación primaria oficial).
   - **Datos brutos observados** ($N$ ensayos y margen de incertidumbre/resolución).
   - **Fecha exacta UTC** (`retrievedAt` en formato ISO 8601).
   - **Versión / build exacta de CS2** (`cs2PatchOrVersion`, obtenida con `version` en consola cuando aplique al juego).
   - **Identificador de quién ejecutó y verificó la medición** (`verifiedBy`).
2. **Prohibición absoluta de validación por memoria o fuentes secundarias:**
   - Queda **terminantemente prohibido** marcar un parámetro como `"Validated"` (`verified: true`) basándose en recuerdos del desarrollador, salidas de modelos de lenguaje (LLMs), wikis comunitarias, hojas de cálculo de terceros no replicadas localmente o datos antiguos de CS:GO.
   - Las fuentes comunitarias con metodología trazable (`sourceTier: 'community-traceable'`) pueden registrarse como referencia inicial, pero **siempre con `verified: false` ("por verificar")** hasta que el equipo o un contribuyente ejecute y documente la medición propia reproducible conforme a la Sección 8 de [`docs/DATA_POLICY.md`](../DATA_POLICY.md).
3. **Distinción para definiciones puramente matemáticas:**
   - Las identidades geométricas o dimensionales puras independientes de Valve (p. ej. conversión grados $\leftrightarrow$ radianes, $1\text{ in} = 2.54\text{ cm}$ exacta, intersección analítica rayo-esfera o formulación matemática de proyección perspectiva `Hor+` dada una base declarada) se documentan como **`"fórmula propuesta, a verificar en Capa 2"`** hasta que superen sus tablas de verdad independientes y tests de propiedades (`fast-check`) en `@evo-aim/core`, separándolas claramente de la hipótesis empírica sobre qué constante usa internamente CS2 (`m_yaw`, `fov_cs_debug`, `zoom_sensitivity_ratio`).
4. **Visibilidad obligatoria en producto:**
   - Mientras un parámetro tenga `verified: false`, la interfaz de usuario mostrará el indicador accesible `Pendiente de verificación` (no solo por color, conforme a `ADR-0018` R4) y quedará excluido de los benchmarks competitivos certificados de la Capa 12.

## Consecuencias

- **Positivas:** inmuniza a EVO-AIM-CS2 contra alucinaciones de IA y mitos heredados de CS:GO; permite auditar rápidamente qué parámetros deben re-medirse cuando Valve publica un parche de equilibrio en CS2; refuerza el valor científico y educativo del proyecto.
- **Negativas:** requiere trabajo experimental disciplinado en CS2 local antes de promocionar armas o fórmulas de zoom a `verified: true` en las Capas 2, 6 y 11; en fases tempranas habrá parámetros honestamente etiquetados como `"por verificar"`.
