# Soporte y Ayuda (SUPPORT)

- **Propósito:** Indicar a usuarios y contribuyentes dónde obtener ayuda, cómo reportar problemas y qué queda fuera del alcance de soporte de EVO-AIM-CS2.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Antes de abrir una consulta

1. Revisa la documentación en [`/docs`](./docs), especialmente:
   - [`docs/PLATFORM_SUPPORT.md`](./docs/PLATFORM_SUPPORT.md) para requisitos de sistema operativo (Windows, Linux, macOS).
   - [`docs/HARDWARE_TIERS.md`](./docs/HARDWARE_TIERS.md) para rendimiento, presets gráficos y equipos de gama baja.
   - [`docs/GLOSSARY.md`](./docs/GLOSSARY.md) para dudas sobre `eDPI`, `cm/360`, `FOV` o terminología.
2. Busca en los **Issues** abiertos y cerrados del repositorio por si tu duda o problema ya fue respondido.

---

## 2. Canales oficiales de soporte comunitario

EVO-AIM-CS2 es un proyecto open source mantenido sin garantías comerciales (véase la sección 7 de [`LICENSE`](./LICENSE)). El soporte se ofrece de forma voluntaria a través de GitHub:

| Necesidad                                                         | Canal adecuado                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Preguntas de uso, configuración de sensibilidad o ideas abiertas  | **GitHub Discussions** (cuando esté habilitado en el repo)                                              |
| Fallos reproducibles de la aplicación                             | **GitHub Issues** → plantilla _Bug Report_                                                              |
| Corrección de estadísticas de armas, fórmulas o citas científicas | **GitHub Issues** → plantilla _Data Correction_ (con fuente obligatoria)                                |
| Propuesta de nueva funcionalidad o ejercicio                      | **GitHub Issues** → plantilla _Feature Request_                                                         |
| Vulnerabilidades de seguridad                                     | **GitHub Private Vulnerability Reporting** (NO abrir issue público; ver [`SECURITY.md`](./SECURITY.md)) |

Al pedir ayuda técnica incluye siempre: sistema operativo y versión (y si usas Linux, X11 o Wayland), CPU/GPU, tasa de refresco del monitor, DPI/polling rate del ratón y pasos para reproducir el problema.

---

## 3. Qué NO se soporta

1. **Sistemas operativos fuera de soporte:** Windows 7, 8, 8.1 o arquitecturas de 32 bits (sujeto a los límites de Electron; ver [`docs/PLATFORM_SUPPORT.md`](./docs/PLATFORM_SUPPORT.md)), ni equipos cuya GPU/driver no soporte **WebGL2**.
2. **Plataformas Tier 3 (macOS y Windows ARM64) con garantías de producción:** el soporte en Tier 3 es _best-effort_ impulsado por la comunidad; además, Counter-Strike 2 no tiene cliente oficial nativo moderno en macOS, por lo que las integraciones locales con CS2 no aplican allí.
3. **Soporte técnico de Counter-Strike 2, Steam o hardware de terceros:** no resolvemos cierres de CS2, problemas de drivers de ratón propietarios ni cuentas de Steam.
4. **Cualquier consulta relacionada con trampas, scripts de automatización de disparo/recoil en CS2, macros externas o modificaciones prohibidas:** EVO-AIM-CS2 es estrictamente una herramienta de entrenamiento externo; cualquier solicitud de este tipo será cerrada y moderada según [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
5. **Builds modificados por terceros o forks no oficiales:** solo podemos diagnosticar versiones compiladas desde este repositorio oficial o publicadas en nuestros GitHub Releases.
