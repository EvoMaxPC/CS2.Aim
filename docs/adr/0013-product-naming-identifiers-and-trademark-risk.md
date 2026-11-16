# ADR-0013: Nombre del Producto (`EVO-AIM-CS2`), Identificadores y Mitigación de Marca

- **Estado:** Accepted
- **Fecha:** 2026-11-13
- **Decisores:** Mantenedor Principal (`@EvoMaxPC`)

## Contexto y Problema

Se ha decidido nombrar oficialmente el proyecto **EVO-AIM-CS2**. Necesitamos:

1. Estandarizar todos los identificadores derivados (paquetes npm internos, carpeta de datos multiplataforma, extensión de archivos compartidos, archivo GSI, `appId` y variables de entorno) sin dejar rastros de nombres preliminares descartados ni reclamar dominios DNS de terceros.
2. Gestionar con responsabilidad el riesgo marcario (`R16`) derivado de incluir la sigla `"CS2"` (marca de Valve Corporation) en el nombre público del proyecto.

## Opciones Consideradas

1. **Usar un nombre completamente abstracto sin referencia a CS2:** elimina el roce marcario pero pierde claridad inmediata sobre la especialización 100 % en Counter-Strike 2.
2. **Usar `EVO-AIM-CS2` con mitigaciones legales explícitas, `appId` bajo espacio controlado `io.github.<owner>` y desacoplamiento técnico interno (`@evo-aim/*`, `.evoaim`):** comunica al instante el propósito del proyecto, evita usar `"CS2"` en el scope interno de paquetes, en la extensión de archivos y en el `appId`, y no invade ningún TLD real (`.app`) que no pertenezca al proyecto.

## Decisión

Adoptamos la **Opción 2** con la siguiente tabla canónica de identificadores en todo el repositorio:

| Concepto                             | Identificador oficial                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| Nombre del producto                  | `EVO-AIM-CS2`                                                                          |
| Slug del repositorio                 | `evo-aim-cs2`                                                                          |
| Scope de paquetes internos           | `@evo-aim/core`, `@evo-aim/data`, `@evo-aim/engine`, `@evo-aim/ui`, `@evo-aim/desktop` |
| `appId` Electron                     | `io.github.evomaxpc.evoaim`                                                            |
| Carpeta de datos de usuario          | `EVO-AIM-CS2` dentro de `app.getPath('userData')`                                      |
| Extensión de archivos de intercambio | `.evoaim`                                                                              |
| Archivo de configuración GSI         | `gamestate_integration_evoaim.cfg`                                                     |
| Prefijo de variables de entorno      | `EVOAIM_`                                                                              |

### Justificación del `appId` (`io.github.evomaxpc.evoaim`)

El TLD `.app` es un dominio real gestionado por Google Registry; emplear un identificador inverso sobre un dominio `.app` no registrado por el proyecto arriesga colisiones o suplantación si un tercero registra ese dominio. El espacio de nombres en DNS inverso `io.github.<usuario>.<proyecto>` (`io.github.evomaxpc.evoaim`) está vinculado de forma legítima a la cuenta de GitHub del mantenedor, es el estándar aceptado por catálogos Linux (Flathub / AppStream / freedesktop) y funciona limpiamente en `electron-builder` para Windows (AppUserModelID), Linux y macOS.

### Medidas obligatorias de mitigación de marca (`R16`)

- Incluir aviso visible de **no afiliación con Valve Corporation** en `README.md`, `docs/LEGAL.md`, instaladores y vista "Acerca de".
- Prohibir logotipos, iconos o tipografías que imiten la identidad gráfica oficial de Counter-Strike 2.
- Mantener el nombre comercial de cara al usuario centralizado en constantes de configuración/i18n de modo que, si algún día fuese requerido cambiar `EVO-AIM-CS2` (p. ej. a `EVO-AIM — Trainer for CS2`), los paquetes `@evo-aim/*`, el `appId` `io.github.evomaxpc.evoaim` y el formato `.evoaim` no sufran roturas.

## Consecuencias

- **Positivas:** identidad clara, coherencia total entre código y documentación, ausencia de colisión con dominios `.app` ajenos y coste de contingencia muy bajo ante cualquier requerimiento marcario.
- **Negativas:** si la organización de GitHub cambiase de propietario en el futuro, mantener estabilidad de actualizaciones aconsejaría conservar `io.github.evomaxpc.evoaim` como identificador interno estable.
