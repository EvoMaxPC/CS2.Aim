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
