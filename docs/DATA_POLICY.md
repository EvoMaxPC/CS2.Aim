# DATA_POLICY.md — Política de Verificación y Procedencia de Datos

- **Propósito:** Impedir cualquier dato inventado o alucinación estadística/científica en EVO-AIM-CS2 mediante metadatos obligatorios de procedencia, jerarquía de fuentes y flujo de corrección pública.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Regla de Oro: Cero Datos Inventados

En **EVO-AIM-CS2** ningún número que describa el comportamiento de Counter-Strike 2 (cadencia, daño, velocidad, imprecisión, patrón de _recoil_, escala de FOV/zoom), ninguna afirmación sobre soporte de sistemas operativos/Electron y ninguna referencia científica o biomecánica puede añadirse de memoria ni generarse mediante IA sin contraste documental directo (`R4`, `R5`, `R6`, `QB-13`).

- Si un dato tiene fuente primaria comprobada $\rightarrow$ se registra con `verified: true` y su referencia reproducible.
- Si un dato es una aproximación provisional o está pendiente de medición empírica $\rightarrow$ **DEBE** marcarse con `verified: false` (o `"por verificar"` en documentación en prosa) y la interfaz de usuario mostrará un aviso visual explícito.

---

## 2. Esquema Obligatorio de Metadatos de Procedencia (`DataProvenance`)

Todo registro externo almacenado en `@evo-aim/data` (armas, patrones de spray, constantes del motor CS2, fichas científicas) incluirá un bloque `provenance` validado en CI.

Representación conceptual del esquema (pseudo-código documental; el código real se creará en Capa 1/2):

```text
interface DataProvenance {
  source: string;          // URL oficial, DOI (https://doi.org/...) o referencia técnica exacta
  sourceTier: 'official' | 'empirical-reproducible' | 'peer-reviewed' | 'community-traceable';
  retrievedAt: string;     // Fecha ISO 8601 (ej. "2026-11-13T00:00:00Z")
  verified: boolean;       // true SOLO tras verificación humana/experimental contra fuente primaria
  verifiedBy?: string;     // Handle de GitHub de quien ejecutó la verificación (opcional)
  cs2PatchOrVersion?: string; // Versión/fecha de build de CS2 cuando aplique a datos del juego
  notes: string;           // Método exacto de obtención, supuestos o limitaciones
}
```

Un test automatizado en CI recorrerá el 100 % de los catálogos de `@evo-aim/data` rechazando cualquier PR donde falte `source`, `retrievedAt` no sea ISO 8601 válido o `notes` esté vacío (`QB-13`).

---

## 3. Jerarquía de Fuentes Aceptables vs. Prohibidas

### 3.1 Fuentes Aceptadas (en orden de prelación)

1. **Nivel 1 — Documentación y especificaciones oficiales (`official`):** documentación pública de Valve Developer Community (p. ej. protocolo oficial _Game State Integration_), especificaciones W3C/WHATWG (Pointer Lock, WebGL2) y documentación oficial de Electron/Chromium/Node.js.
2. **Nivel 2 — Mediciones empíricas propias 100 % reproducibles (`empirical-reproducible`):** experimentos realizados sobre una instancia local limpia de CS2 usando comandos de consola legítimos (`cl_showpos 1`, servidores locales de práctica sin tocar memoria) o scripts matemáticos deterministas cuyos pasos exactos queden escritos en `notes` para que cualquier tercero obtenga el mismo número.
3. **Nivel 3 — Literatura científica revisada por pares (`peer-reviewed`):** artículos publicados en revistas o actas académicas identificables mediante **DOI válido** o URL institucional permanente (PubMed, IEEE, ACM, APA, etc.).
4. **Nivel 4 — Fuentes técnicas comunitarias con metodología trazable (`community-traceable`):** hojas de cálculo o repositorios técnicos reconocidos de la comunidad de CS2 **únicamente si** documentan cómo extrajeron o midieron el dato. Si no hemos replicado aún su medición localmente, entra inicialmente como `verified: false` hasta nuestra propia verificación.

### 3.2 Fuentes Prohibidas

- Salidas directas de LLMs / asistentes de IA sin fuente primaria contrastada.
- Posts de foros, vídeos, TikToks o guías de opinión sin metodología ni datos brutos reproducibles.
- Wikis desactualizadas de versiones antiguas (_CS:GO_ 2012–2022) asumidas sin verificar en **CS2**.
- Extracción y redistribución de archivos binarios propietarios de CS2 con copyright (`LEGAL.md`).

---

## 4. Reglas Específicas para Estudios Científicos (Capa 10)

1. **DOI o URL académica permanente obligatoria:** queda terminantemente prohibido citar "un estudio de Stanford demostró..." o inventar combinaciones de autores y años.
2. **Fidelidad de alcance (No extrapolación abusiva):** si un artículo clásico de control motor (p. ej. Fitts, 1954 o Meyer et al., 1988) midió movimientos de estilete o rotación de muñeca en laboratorio, la ficha en EVO-AIM-CS2 debe distinguir con honestidad entre **qué demostró exactamente el estudio** y **cómo se aplica como modelo práctico al entrenamiento con ratón en CS2**.
3. **Límite no médico:** cualquier contenido sobre fatiga visual, descanso, sueño o postura incluirá un aviso claro indicando que es divulgación ergonómica general y **no sustituye diagnóstico ni consejo médico o fisioterapéutico profesional**.

---

## 5. Presentación en la UI de Datos `verified: false`

Cuando el usuario consulte o entrene con un parámetro cuyo `provenance.verified` sea `false` (por ejemplo, una fórmula de conversión con zoom pendiente de validación empírica en el último parche de CS2):

- La interfaz mostrará un **icono de advertencia (`Pendiente de verificación`)** con un _tooltip_ accesible que expone `provenance.source` y `provenance.notes`.
- Los benchmarks oficiales certificados (Capa 12) solo utilizarán escenarios y parámetros con `verified: true`.

---

## 6. Proceso de Auditoría y Corrección Comunitaria

Si cualquier usuario o contribuyente detecta un valor desactualizado tras un parche de CS2 o una imprecisión matemática:

1. Abre un Issue con la plantilla obligatoria [`.github/ISSUE_TEMPLATE/data_correction.yml`](../.github/ISSUE_TEMPLATE/data_correction.yml) adjuntando la fuente verificable y los pasos de reproducción.
2. Un mantenedor reproduce la medición, actualiza el catálogo con la nueva fecha `retrievedAt`, versión de CS2 y `verifiedBy`, y añade un caso de test de regresión.

---

## 7. Licencia de los Datos en `/packages/data` (`CC BY 4.0` — Estado `PROPUESTA`, `DT-03`)

De conformidad con `ADR-0008` y `ADR-0014`, EVO-AIM-CS2 separa el licenciamiento del código ejecutable de software del licenciamiento de los catálogos curados de datos:

1. **Estado actual (`PROPUESTA` — pendiente de confirmación explícita del mantenedor en `DT-03`):** se propone licenciar los catálogos verificados de armas, escenarios declarativos y fichas científicas de `/packages/data` bajo **Creative Commons Attribution 4.0 International (`CC BY 4.0`)** (frente a la alternativa de dominio público `CC0 1.0`).
2. **Reglas de atribución bajo `CC BY 4.0`:**
   - Cualquier redistribución o adaptación sustancial de los catálogos curados de `/packages/data` debe conservar el crédito a `"EVO-AIM-CS2 contributors"`, un enlace al repositorio (`https://github.com/EvoMaxPC/evo-aim-cs2`), un enlace a `https://creativecommons.org/licenses/by/4.0/` y una nota indicando si se realizaron modificaciones.
   - Los hechos físicos o matemáticos puros (p. ej. una cadencia en RPM o una relación trigonométrica) no reclaman monopolio autoral en sí mismos; `CC BY 4.0` protege y acredita el trabajo de verificación reproducible, curación documental, estructuración y redacción original de las notas y fichas científicas.
3. **Compatibilidad con `Apache-2.0`:**
   - Todo el código fuente ejecutable (`.ts`/`.tsx`), incluidos los validadores Zod e interfaces de `/packages/data`, permanece bajo **`Apache-2.0`** ([`LICENSE`](../LICENSE)).
   - `CC BY 4.0` y `Apache-2.0` coexisten limpiamente en una misma aplicación de escritorio siempre que los datos se consuman como recursos estructurados separados del código ejecutable y `THIRD_PARTY_NOTICES.md` / la sección "Acerca de" mantengan los avisos de atribución correspondientes.
4. **Incorporación del texto legal en Capa 6:** dado que entre las Capas 1 y 5 `/packages/data` es únicamente un paquete esqueleto sin catálogos publicados, **el archivo con el texto íntegro de la licencia de datos (`packages/data/LICENSE-DATA`) se incorporará en la Capa 6** junto con los primeros catálogos reales tras la confirmación de `DT-03`.

---

## 8. Procedimiento de Medición Propia Reproducible (`ADR-0019`)

Conforme a [`ADR-0019`](./adr/0019-validated-means-reproducible-measurement.md), **ningún parámetro empírico de CS2 puede pasar a `verified: true` ("Validated") por memoria, por estimación de IA ni copiando wikis o tablas secundarias sin replicación local**. Todo parámetro marcado con `sourceTier: 'empirical-reproducible'` debe superar el siguiente protocolo paso a paso:

### 8.1 Pasos obligatorios sin violar límites anti-cheat (`ADR-0007`)

1. **Entorno limpio y auditable:**
   - Iniciar una instancia local estándar de Counter-Strike 2 desde Steam en modo **Práctica local sin conexión / servidor local vacío** (jamás servidores comunitarios modificados).
   - **Prohibición estricta:** cero lectura de memoria de `cs2.exe`, cero DLLs, cero hooks y cero extracción de binarios con copyright. Solo se emplean comandos legítimos de consola del motor (`status`, `version`, `sensitivity`, `m_yaw`, `zoom_sensitivity_ratio`, `cl_showpos 1`, servidor local con `sv_cheats 1` cuando el comando diagnóstico lo requiera) o captura externa de vídeo/traza HID del propio sistema operativo en laboratorio.
2. **Registro exacto de versión del juego y configuración:**
   - Ejecutar `version` / `status` en la consola de CS2 y anotar número de build, fecha del parche de CS2, sistema operativo, resolución, relación de aspecto (`4:3`, `16:9`, `16:10`, `21:9`) y convars relevantes.
3. **Ejecución repetida ($N \ge 10$ repeticiones independientes cuando haya componente humana o temporal):**
   - Para **ángulos y zoom (`yaw`, `FOV`, `zoom_sensitivity_ratio`):** enviar desplazamientos discretos conocidos de _counts_ o comparar referencias geométricas en pantalla con `cl_showpos 1`, anotando ángulo inicial, ángulo final y $\Delta\text{yaw}$ / $\Delta\text{pitch}$ en cada repetición.
   - Para **cadencia, velocidad y frenado (`counter-strafe`):** grabar vídeo local a alta tasa de refresco ($\ge 120\text{–}240\text{ fps}$) con `cl_showpos 1` visible o marcas de tiempo de consola, midiendo intervalos entre disparos o caída de velocidad horizontal `vel`.
   - Para **patrones de _recoil_ / dispersión:** disparar ráfagas completas contra un plano perpendicular a distancia fija documentada en servidor local de práctica, midiendo coordenadas angulares de cada impacto respecto al origen de puntería en múltiples series para separar el patrón determinista de la dispersión aleatoria.
4. **Cálculo estadístico e incertidumbre:**
   - Calcular media, desviación típica y cota de error de medición (p. ej. resolución angular de `cl_showpos` o $\pm 1\text{ frame}$ de cámara). Si la incertidumbre excede la tolerancia del `Quality Bar` aplicable (`QB-17`, `QB-18`, `QB-19`), el dato permanece como `verified: false` indicando la cota observada.
5. **Revisión cruzada en PR:**
   - Adjuntar el bloque completo de registro de medición en la descripción del PR (o archivo de notas de evidencia enlazado en `provenance.notes`) para que cualquier revisor pueda repetir los pasos en $< 15\text{ min}$ y obtener el mismo resultado dentro de la tolerancia declarada.

### 8.2 Plantilla Obligatoria de Registro de Medición Reproducible

```markdown
### Registro de Medición Reproducible — `<id_parametro_o_arma>`

- **Parámetro(s) medido(s):** `<ej. m_yaw base / vFOV 4:3 / cadencia AK-47>`
- **Estado resultante:** `verified: true` | `verified: false (por verificar)`
- **Fecha UTC (`retrievedAt`):** `YYYY-MM-DDTHH:mm:ssZ`
- **Autor de la medición (`verifiedBy`):** `@<github-handle>`
- **Versión / Build de CS2 (`cs2PatchOrVersion`):** `<salida literal de 'version' en consola de CS2>`
- **Entorno de prueba:** `<SO + versión, resolución, aspect ratio, Hz, método de entrada>`
- **Convars exactos fijados:** `<ej. sensitivity 1.0; m_yaw 0.022; zoom_sensitivity_ratio 1.0; cl_showpos 1>`
- **Procedimiento paso a paso (100 % reproducible sin herramientas prohibidas):**
  1. `<paso 1>`
  2. `<paso 2>`
  3. `<paso 3>`
- **Datos brutos observados ($N$ ensayos):**
  - Ensayo 1: `<valor>` | Ensayo 2: `<valor>` | ... | Ensayo N: `<valor>`
- **Valor consolidado e incertidumbre:** `<media ± desviación / margen de error>`
- **Comparación contra tolerancia (`QB-17` / `QB-18` / `QB-19`):** `<cumple / no cumple>`
- **Limitaciones o supuestos abiertos:** `<notas honestas>`
```
