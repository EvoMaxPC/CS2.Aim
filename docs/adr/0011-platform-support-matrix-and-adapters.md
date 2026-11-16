# ADR-0011: Matriz de Soporte de Plataformas y Adaptadores de Plataforma (`PlatformAdapter`)

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Arquitectura / Platform

## Contexto y Problema

El objetivo de producto **"Para todas las PCs"** abarca el eje de sistema operativo: aunque Windows 10/11 concentra a la mayoría de jugadores de CS2, Counter-Strike 2 corre oficialmente en Linux y muchos contribuyentes open source usan Linux o macOS. Si esparcimos llamadas al Registro de Windows, separadores `\\` o rutas como `C:\Program Files (x86)\Steam` por el código, romperemos la portabilidad y acoplaremos el dominio al SO (`R13`, `R14`).

## Opciones Consideradas

1. **Soportar exclusivamente Windows:** más simple a corto plazo, pero excluye jugadores de Linux (SteamOS/Ubuntu/Fedora) y dificulta contribuciones open source desde otros sistemas.
2. **Prometer paridad absoluta e idéntica en Windows, Linux, macOS y versiones obsoletas (Win 7/8):** poco realista para un equipo pequeño e inviable donde Electron moderno ya no soporta SO antiguos o donde CS2 no existe (macOS).
3. **Matriz escalonada honesta (Tiers 1, 2 y 3) + aislamiento estricto detrás de `PlatformAdapter`:** soporte completo bloqueante en Windows 10/11 x64 (Tier 1), soporte oficial con CI en Linux x64 (Tier 2), soporte comunitario _best-effort_ sin bloquear releases en macOS / Windows ARM64 (Tier 3) y encapsulación total del SO.

## Decisión

Adoptamos la **Opción 3** documentada en [`docs/PLATFORM_SUPPORT.md`](../PLATFORM_SUPPORT.md):

1. **Confinamiento del código dependiente del SO:** todo acceso específico a Windows, Linux o macOS vivirá **exclusivamente** en `apps/desktop/src/main/platform/{win32,linux,darwin}` implementando la interfaz `PlatformAdapter`.
2. **Rutas agnósticas:** toda carpeta de datos de usuario se obtiene mediante `app.getPath('userData')` (`EVO-AIM-CS2`) y `node:path`. Prohibidas las rutas absolutas fijas en cualquier lugar del repositorio.
3. **Degradación elegante:** si el SO no dispone de CS2/Steam (p. ej. macOS o PC limpio) o no soporta una característica específica de plataforma, la funcionalidad afectada se desactiva limpiamente informando al usuario y el resto del entrenador funciona con normalidad.

## Consecuencias

- **Positivas:** arquitectura limpia y testeable mediante _mocks_ de `PlatformAdapter`; CI multiplataforma desde la Capa 1 (`windows-latest`, `ubuntu-latest`, `macos-latest` no bloqueante); expectativas honestas con los usuarios.
- **Negativas:** exige ejecutar `SPIKE-6` para documentar las diferencias reales de `unadjustedMovement` entre Windows, Linux X11, Linux Wayland y macOS.
