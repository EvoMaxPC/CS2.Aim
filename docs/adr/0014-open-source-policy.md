# ADR-0014: Política Integral Open Source (DCO, Dependencias, Telemetría Cero y Datos)

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Mantenedor Principal / Arquitectura

## Contexto y Problema

Publicar EVO-AIM-CS2 como software libre bajo Apache-2.0 (`ADR-0008`) exige reglas operativas claras para evitar cuatro problemas clásicos en repositorios open source modernos (`R15`):

1. Fricción de contribución (CLA pesado vs. incertidumbre de origen de parches, especialmente con asistentes de IA).
2. Introducción accidental de dependencias con licencias copyleft incompatibles (`GPL`/`AGPL`/`SSPL`).
3. Desconfianza de la comunidad ante telemetría oculta o SDKs de terceros.
4. Ambigüedad sobre la licencia de catálogos de datos frente al código fuente.

## Decisión

Establecemos las cuatro columnas de gobierno open source de EVO-AIM-CS2:

1. **Certificación de aportes mediante DCO 1.1 (Sin CLA):**
   - Todo commit requiere trailer `Signed-off-by:` (`git commit -s`).
   - En `CONTRIBUTING.md` se establece explícitamente que quien envía código asistido por IA es el único responsable de verificar su licencia, exactitud y cumplimiento de `DATA_POLICY.md`.
2. **Lista blanca de licencias de dependencias verificada en CI:**
   - **Permitidas:** `MIT`, `BSD-2-Clause`, `BSD-3-Clause`, `ISC`, `Apache-2.0`, `0BSD`, `Unlicense`; `MPL-2.0` solo sin modificar sus archivos y tras revisión; `OFL-1.1` para fuentes; `CC0-1.0` / `CC-BY-4.0` con atribución para audio/recursos.
   - **Prohibidas:** `GPL-*`, `AGPL-*`, `SSPL`, propietarias o sin licencia.
   - En la **Capa 1** se automatizará esta auditoría en GitHub Actions y en la **Capa 17** se generará automáticamente `THIRD_PARTY_NOTICES.md`.
3. **Política de CERO Telemetría por Defecto:**
   - La aplicación se distribuye con **cero telemetría y cero analítica remota**.
   - Cualquier futuro mecanismo de reporte de fallos (a ratificar en la **Capa 17**) será estrictamente **opt-in**, desactivado por defecto, auditable en código abierto y sin servicios opacos de terceros por defecto.
4. **Licencia de Datos separada para `/packages/data` (`CC BY 4.0` — Estado `PROPUESTA`, `DT-03`):**
   - **Propuesta registrada:** **Creative Commons Attribution 4.0 International (`CC BY 4.0`)** para los catálogos curados, escenarios declarativos y fichas científicas de `/packages/data`, con estado **`PROPUESTA`** pendiente de confirmación explícita del mantenedor (`DT-03`) antes de la **Capa 6** (alternativa evaluada: `CC0 1.0`).
   - **Atribución requerida bajo `CC BY 4.0`:** quien redistribuya o adapte sustancialmente los catálogos curados deberá conservar el crédito a `"EVO-AIM-CS2 contributors"`, un enlace al repositorio oficial (`https://github.com/EvoMaxPC/evo-aim-cs2`), el enlace a `https://creativecommons.org/licenses/by/4.0/` e indicación de si se realizaron cambios (los meros hechos físicos/matemáticos puros no reclaman copyright más allá de la selección, estructura y notas verificadas).
   - **Compatibilidad con `Apache-2.0`:** el código ejecutable TypeScript del monorepo (incluidos validadores y tipos) permanece 100 % bajo **`Apache-2.0`**, mientras que `CC BY 4.0` aplica únicamente a los artefactos de datos/documentación cargados como contenido; ambas licencias son permisivas y coexistentes en una misma distribución sin contaminación copyleft (`THIRD_PARTY_NOTICES.md` y la pantalla "Acerca de" satisfacen la atribución).
   - **Calendario del archivo de licencia de datos:** dado que en Capas 1–5 `/packages/data` es únicamente un paquete esqueleto sin catálogos publicados, **el texto completo de la licencia de datos (`packages/data/LICENSE-DATA`) se añadirá junto con los catálogos reales en la Capa 6** una vez ratificado `DT-03`.

## Consecuencias

- **Positivas:** máxima confianza por parte de jugadores preocupados por su privacidad y por parte de distribuciones/comunidades Linux; protección legal continua y automatizada del repositorio.
- **Negativas:** descartamos librerías útiles si solo existen bajo GPL; obliga a todos los contribuyentes (humanos y agentes) a usar `git commit -s`.
