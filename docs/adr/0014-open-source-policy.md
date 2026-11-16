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
4. **Licencia de Datos separada y acotada:**
   - El licenciamiento de los catálogos de `/packages/data` queda registrado como decisión abierta obligatoria (`CC BY 4.0` vs `CC0 1.0`) a cerrar antes de iniciar la **Capa 6**.

## Consecuencias

- **Positivas:** máxima confianza por parte de jugadores preocupados por su privacidad y por parte de distribuciones/comunidades Linux; protección legal continua y automatizada del repositorio.
- **Negativas:** descartamos librerías útiles si solo existen bajo GPL; obliga a todos los contribuyentes (humanos y agentes) a usar `git commit -s`.
