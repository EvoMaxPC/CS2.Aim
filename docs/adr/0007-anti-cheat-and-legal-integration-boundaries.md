# ADR-0007: Límites Legales y de Seguridad Anti-Cheat en Integraciones CS2

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Mantenedor Principal / Seguridad

## Contexto y Problema

Los jugadores de CS2 protegen celosamente la integridad de sus cuentas de Steam (VAC) y plataformas de terceros (FACEIT Anti-Cheat, etc.). Cualquier herramienta externa que inspeccione procesos, lea memoria, inyecte overlays en DirectX/Vulkan o simule eventos de ratón/teclado supone un riesgo inaceptable (`R7`). Asimismo, redistribuir assets extraídos de archivos `.vpk` de CS2 vulnera derechos de autor de Valve.

## Opciones Consideradas

1. **Lectura de memoria / hooks gráficos para capturar estadísticas en vivo o superponer mirillas:** descartado rotundamente por riesgo de baneo y violación de términos de servicio.
2. **Integración estrictamente pasiva por canales oficiales de Valve + cero assets propietarios:** lectura consentida de archivos de texto `.cfg` y recepción HTTP local en `127.0.0.1` mediante _Game State Integration_ (`gamestate_integration_evoaim.cfg`).

## Decisión

Restringir de forma permanente e innegociable toda interacción con Counter-Strike 2 a:

1. Lectura (solo lectura por defecto) de parámetros públicos de configuración (`.cfg`) autorizada por el usuario.
2. Recepción local opt-in de _Game State Integration_ (GSI) oficial de Valve en loopback `127.0.0.1`.
3. Prohibición absoluta de leer/escribir memoria, enumerar módulos de `cs2.exe`, inyectar código, simular input global o incluir assets con copyright de Valve (`docs/LEGAL.md`).

## Consecuencias

- **Positivas:** riesgo cero para el estado anti-cheat del usuario; limpieza legal completa para distribución open source.
- **Negativas:** GSI tiene limitaciones deliberadas impuestas por Valve (p. ej. retrasos o campos restringidos en partidas competitivas para evitar ventajas injustas), por lo que el entrenamiento y la analítica de precisión viven dentro del motor propio de EVO-AIM-CS2.
