# LEGAL.md — Marco Legal, Marcas, Anti-Cheat, Licencias y Privacidad

- **Propósito:** Establecer las directrices legales, de marcas registradas, cumplimiento anti-cheat, propiedad intelectual de código/datos y privacidad de EVO-AIM-CS2.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

> _Nota aclaratoria: Este documento recoge las políticas internas de cumplimiento y gestión de riesgos legales del proyecto open source EVO-AIM-CS2 y no constituye asesoramiento jurídico formal._

---

## 1. No Afiliación y Uso Descriptivo de Marcas de Terceros (`R16`)

1. **Declaración obligatoria de no afiliación:** **EVO-AIM-CS2** es un software independiente de código abierto desarrollado por su comunidad y **no está afiliado, patrocinado, autorizado, respaldado ni vinculado oficialmente con Valve Corporation**.
2. **Marcas registradas:** _Counter-Strike_, _Counter-Strike 2_, _CS2_, _CS:GO_, _Steam_ y el logotipo de Valve/CS2 son marcas comerciales o marcas registradas de **Valve Corporation**.
3. **Uso nominativo/descriptivo y mitigación de riesgo (`ADR-0013`):**
   - El sufijo `-CS2` en `EVO-AIM-CS2` se utiliza únicamente para describir la finalidad técnica de la herramienta (entrenamiento de puntería parametrizado para Counter-Strike 2).
   - **Prohibido** utilizar logotipos oficiales de CS2/Valve, tipografías corporativas clonadas de Valve o composiciones visuales que induzcan a pensar que es un producto oficial de Valve.
   - Este aviso aparecerá de forma clara en `README.md`, sitio/documentación, instalador y pantalla "Acerca de" (_About_) de la aplicación.
   - Todos los identificadores técnicos están centralizados (`CONVENTIONS.md`, `ADR-0013`) de modo que, si Valve solicitase en algún momento retirar la sigla `CS2` del título del proyecto, el renombrado pueda ejecutarse de forma inmediata, amistosa y con coste técnico mínimo.

---

## 2. Prohibición Absoluta de Assets con Copyright de Valve o Terceros (`R7`)

Queda terminantemente prohibido incorporar en este repositorio o en los binarios distribuidos:

- Modelos 3D, animaciones, esqueletos o hitboxes binarias extraídas de archivos `.vpk` de Counter-Strike 2.
- Texturas, materiales, iconos de armas del HUD oficial o efectos de sonido de disparos extraídos de juegos de Valve u otros títulos comerciales.
- Geometría copiada o portada de mapas oficiales o de la Workshop (_Mirage_, _Inferno_, _Dust II_, _Nuke_, _Ancient_, _Anubis_, _Vertigo_, etc.).

**Qué utilizamos en su lugar:**

- Geometría 3D limpia generada proceduralmente o modelada desde cero por los contribuyentes bajo licencia libre compatible (_greybox_ paramétrico abstracto para ángulos y distancias).
- Síntesis de audio por Web Audio API o muestras originales/CC0 debidamente atribuidas en `THIRD_PARTY_NOTICES.md`.
- Hechos matemáticos/físicos no sujetos a copyright de expresión artística (como relaciones angulares o mediciones empíricas documentadas según `DATA_POLICY.md`).

---

## 3. Cumplimiento Estricto Anti-Cheat (`ADR-0007`)

Para proteger al 100 % las cuentas de Steam/FACEIT/plataformas competitivas de nuestros usuarios, EVO-AIM-CS2 respeta una frontera técnica infranqueable:

| Práctica                                                                                                               | Estado en EVO-AIM-CS2                                           |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Leer o escribir memoria de `cs2.exe` (`ReadProcessMemory`, `/proc/<pid>/mem`, etc.)                                    | **TERMINANTEMENTE PROHIBIDO**                                   |
| Inyectar DLLs, hooks gráficos (DirectX/Vulkan overlays sobre CS2) o drivers                                            | **TERMINANTEMENTE PROHIBIDO**                                   |
| Simular entrada de ratón/teclado (`SendInput`, `uinput`) mientras corre CS2 (macros/no-recoil)                         | **TERMINANTEMENTE PROHIBIDO**                                   |
| Interceptar o modificar tráfico de red del juego                                                                       | **TERMINANTEMENTE PROHIBIDO**                                   |
| Leer archivos de texto `.cfg` con consentimiento del usuario                                                           | **Permitido (solo lectura por defecto)**                        |
| Recibir telemetría local oficial mediante _Game State Integration_ (`gamestate_integration_evoaim.cfg`) en `127.0.0.1` | **Permitido (mecanismo oficial documentado por Valve, opt-in)** |

Además, EVO-AIM-CS2 recomienda suspender automáticamente su escena 3D activa si detecta mediante GSI (o cuando el usuario minimiza la ventana) que está entrando a una partida de CS2, evitando consumir GPU/CPU en segundo plano.

---

## 4. Licenciamiento de Código, Datos y Dependencias (`ADR-0008`, `ADR-0014`)

1. **Código fuente:** licenciado bajo **Apache License 2.0** ([`LICENSE`](../LICENSE)), titularidad colectiva `"EVO-AIM-CS2 contributors"`, con contribuciones certificadas mediante **DCO 1.1** (`Signed-off-by`).
2. **Catálogos de datos (`/packages/data`):** se registra **`CC BY 4.0` (Creative Commons Attribution 4.0 International)** con estado **`PROPUESTA`**, pendiente de confirmación explícita del mantenedor (`DT-03`, `ADR-0014`, `docs/DATA_POLICY.md`) antes de la **Capa 6** (alternativa: `CC0 1.0`). El código ejecutable permanece bajo `Apache-2.0` y el texto íntegro de la licencia de datos se incorporará junto con los catálogos de `/packages/data` en la **Capa 6** (actualmente `/packages/data` es solo un esqueleto).
3. **Dependencias de terceros:** únicamente licencias permisivas compatibles con Apache-2.0 (`MIT`, `BSD`, `ISC`, `Apache-2.0`, `OFL-1.1`, `CC0`/`CC-BY-4.0` con atribución). Prohibidas dependencias `GPL`, `AGPL` o `SSPL`. Todas las atribuciones requeridas por la cláusula 4 de Apache-2.0 y licencias de terceros se consolidarán en [`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md) en la Capa 17.

---

## 5. Política de Privacidad (Borrador Base — Cero Telemetría)

1. **Almacenamiento 100 % local:** todos tus perfiles, configuraciones de sensibilidad, resultados de ejercicios, métricas biomecánicas y replays se guardan exclusivamente en tu propio ordenador dentro de la carpeta de usuario `EVO-AIM-CS2` (`app.getPath('userData')`).
2. **Cero recolección remota por defecto:** EVO-AIM-CS2 **no envía datos de uso, métricas de entrenamiento, identificadores de hardware ni direcciones IP a ningún servidor propio ni de terceros por defecto**.
3. **Únicas conexiones de red previstas (Capa 17):** comprobación periódica opcional (desactivable en Ajustes) contra **GitHub Releases** para consultar si existe una versión nueva de la aplicación (sujeta a la política de privacidad pública de GitHub al realizar una petición HTTPS estándar).
4. **Reportes de error:** cualquier futuro sistema de diagnóstico será estrictamente local (generación de archivo `.zip`/`.json` sanitizado para que el usuario lo revise antes de subirlo voluntariamente a un Issue) o **100 % opt-in desactivado por defecto**, sin servicios opacos de terceros (decisión final a ratificar en la Capa 17).
