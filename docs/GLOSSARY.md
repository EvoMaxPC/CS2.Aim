# GLOSSARY.md — Glosario Técnico de Aim Training, Motor 3D y Fórmulas CS2

- **Propósito:** Unificar la terminología matemática, biomecánica, de renderizado y de Counter-Strike 2 empleada en EVO-AIM-CS2, presentando las fórmulas base propuestas para su verificación formal en la Capa 2.
- **Fecha:** 2026-11-13
- **Versión:** 1.0.0
- **Estado:** Accepted

---

## 1. Conceptos de Entrada, Sensibilidad y Cámara

- **Count (Mouse Count / Mickey):** unidad mínima discreta de desplazamiento relativo reportada por el sensor óptico del ratón al subsistema HID $(\Delta x, \Delta y \in \mathbb{Z})$.
- **DPI / CPI (_Dots / Counts Per Inch_):** cantidad nominal de _counts_ que el sensor del ratón emite al desplazarse físicamente 1 pulgada ($2.54\text{ cm}$) sobre la superficie. _(Nota: el DPI real físico de un sensor puede desviarse ligeramente del nominal declarado por el fabricante, razón por la cual existe el calibrador físico 360° en la Capa 9)._
- **Polling Rate (Tasa de sondeo, Hz):** frecuencia con la que el ratón envía informes HID al sistema operativo (p. ej. $125\text{ Hz} \rightarrow 8\text{ ms}$, $1000\text{ Hz} \rightarrow 1\text{ ms}$, $4000\text{ Hz} \rightarrow 0.25\text{ ms}$, $8000\text{ Hz} \rightarrow 0.125\text{ ms}$).
- **Raw Input / `unadjustedMovement`:** lectura directa de los _counts_ emitidos por el ratón omitiendo curvas de aceleración balística ("Mejorar la precisión del puntero"), suavizado o factores de escala del escritorio del SO.
- **Yaw ($\psi$, guiñada) y Pitch ($\theta$, cabeceo):** ángulos de rotación horizontal (`yawDeg`, alrededor del eje vertical del mundo) y vertical (`pitchDeg`, acotado típicamente a $[-89^\circ, +89^\circ]$ para evitar _gimbal flip_) de la cámara en primera persona.
- **`m_yaw` y `m_pitch`:** constantes de escala angular del motor Source / Source 2 que determinan cuántos grados gira la cámara por cada _count_ a sensibilidad $1.0$.
- **eDPI (_Effective DPI_):** producto escalar entre el `DPI` del ratón y el multiplicador de sensibilidad dentro de CS2. Permite comparar sensibilidades entre jugadores únicamente si ambos usan el mismo `m_yaw`.
- **`cm/360` (Centímetros por vuelta completa):** distancia física lineal en centímetros que debe recorrer el ratón en línea recta para completar una rotación horizontal exacta de $360^\circ$. Es la métrica universal física independiente del juego.
- **FOV (_Field of View_ — Campo de visión):** ángulo del cono visible proyectado en pantalla, expresado como **hFOV** (horizontal) y **vFOV** (vertical).
- **Escalado `Hor+` (_Horizontal Plus_):** método de proyección usado por CS2 donde el FOV vertical se mantiene fijo y el FOV horizontal se expande o contrae en función de la relación de aspecto ($W/H$) respecto a la base histórica $4:3$.
- **4:3 Stretched (Estirado):** configuración habitual en CS2 donde el juego renderiza internamente un cono `4:3` ($\text{hFOV} = 90^\circ$) pero el monitor estira esa imagen a `16:9`. El `cm/360` físico **no cambia**, pero la velocidad aparente en pantalla sobre el eje horizontal se percibe mayor que sobre el vertical.

---

## 2. Conceptos Biomecánicos, de Entrenamiento y Analítica

- **Flick (Movimiento balístico + correctivo):** desplazamiento angular rápido desde la posición inicial de la mira hasta un objetivo distante. Según el modelo clásico de dos fases (Woodworth / Meyer), combina un **impulso primario balístico** rápido y al menos un **submovimiento secundario de micro-corrección** guiado visualmente.
- **Micro-adjustment / Micro-flick:** corrección angular pequeña (típicamente $< 2^\circ\text{–}3^\circ$, ejecutada principalmente con dedos/muñeca) para alinear la mira sobre una cabeza a media o larga distancia.
- **Undershoot (Sub-alcance):** el impulso primario del _flick_ se detiene antes de alcanzar el objetivo, requiriendo un submovimiento adicional en la misma dirección.
- **Overshoot (Sobre-alcance):** el impulso primario sobrepasa el centro/borde del objetivo, obligando a invertir el sentido del movimiento para regresar al blanco (penalizando el TTK).
- **Tracking (Seguimiento):** mantenimiento continuo de la mira dentro del volumen de un objetivo en movimiento (reactivo ante cambios bruscos de dirección o suave/_smooth_ ante trayectorias continuas).
- **Target Switching (Cambio de objetivo):** secuencia encadenada de eliminación de un objetivo con vida $> 1$ disparo (o ráfaga) seguida de transición inmediata al siguiente blanco minimizando el tiempo muerto post-baja.
- **TTK (_Time to Kill_ / Tiempo de adquisición):** intervalo en milisegundos desde que el objetivo aparece (o queda elegible tras eliminar el anterior) hasta que recibe el impacto letal.
- **Índice de Dificultad de Fitts ($ID$) y _Throughput_ ($TP$ / $IP$):** en tareas de apuntado de amplitud angular $A$ hacia un blanco de anchura efectiva $W$, la formulación de Shannon de la Ley de Fitts define $ID = \log_2\left(\frac{A}{W} + 1\right)$ (en bits) y el rendimiento de información como $TP = \frac{ID}{MT}$ ($\text{bits/s}$), donde $MT$ es el tiempo de movimiento. _(Se documentará con su cita académica primaria verificada en Capa 10)._

---

## 3. Conceptos Específicos de CS2 y del Motor de Simulación

- **Hitscan:** modelo balístico instantáneo donde, en el instante del disparo, se traza un rayo geométrico matemático desde el origen de cámara/cañón en la dirección del disparo (más ángulos de _recoil_ e imprecisión) sin tiempo de vuelo de proyectil físico.
- **Counter-Strafing (Frenado por contramarcha):** técnica esencial de CS2 consistente en soltar la tecla de desplazamiento lateral (p. ej. `A`) y pulsar brevemente la opuesta (`D`) para llevar la velocidad horizontal del jugador por debajo del umbral de precisión de primera bala mucho más rápido que dejando actuar solo la fricción del suelo.
- **Spread / Inaccuracy (Imprecisión / Dispersión aleatoria):** desviación angular estocástica alrededor del vector de puntería dependiente del arma, postura, cadencia de disparo y velocidad de movimiento.
- **Recoil / Spray Pattern (Retroceso / Patrón de spray):** secuencia determinista o cuasi-determinista de desplazamiento angular ascendente y lateral del disparo sostenido de cada arma en CS2, compensable moviendo el ratón en el sentido opuesto.
- **Aim Punch:** perturbación brusca del ángulo de vista al recibir impacto enemigo (especialmente sin chaleco/casco).
- **Fixed Timestep (Paso de simulación fijo):** actualización de la física y lógica del mundo en incrementos constantes de tiempo ($\Delta t = 1/240\text{ s}$ por defecto) desacoplada de la duración variable de cada frame renderizado (`frameTime`).
- **Sub-frame Hit Registration:** evaluación del disparo usando la orientación exacta acumulada de los eventos de ratón hasta el `timeStamp` del clic dentro del frame, garantizando invarianza de precisión entre 60 Hz y 360 Hz (`QB-06`).
- **GSI (_Game State Integration_):** sistema oficial de Valve mediante el cual el propio cliente de CS2 envía periódicamente estados JSON por HTTP local según un archivo `gamestate_integration_*.cfg`.

---

## 4. Fórmulas Base de CS2 (PROPUESTAS A VERIFICAR EN CAPA 2)

> **Aviso obligatorio (`DATA_POLICY.md`):** Las siguientes expresiones matemáticas se registran en Capa 0 como **propuestas de diseño pendientes de verificación empírica y tests de referencia en la Capa 2 (`verified: false` hasta cerrar Capa 2 / Capa 6)**.

### 4.1 Rotación angular por count y `m_yaw` / `m_pitch` _(Propuesta a verificar en Capa 2)_

En la familia de motores Quake / GoldSrc / Source / Source 2, el factor angular estándar sin zoom es:
$$m_{\text{yaw}} = m_{\text{pitch}} = 0.022^\circ / \text{count} \quad (\text{a sensibilidad } 1.0)$$
Por tanto, para una sensibilidad configurada $\text{sens} > 0$, el cambio de guiñada para $\Delta x$ _counts_ es:
$$\Delta \text{yawDeg} = \Delta x \cdot \text{sens} \cdot m_{\text{yaw}}$$

### 4.2 Sensibilidad efectiva (`eDPI`) _(Propuesta a verificar en Capa 2)_

$$\text{eDPI} = \text{DPI} \times \text{sens}$$

### 4.3 Distancia física de giro completo (`cm/360`) _(Propuesta a verificar en Capa 2)_

**Derivación dimensional:**

1. El número total de _counts_ necesarios para girar $360^\circ$ es:
   $$\text{countsPer360} = \frac{360^\circ}{\text{sens} \times m_{\text{yaw}}}$$
2. A una resolución del sensor de $\text{DPI}$ (_counts_ por pulgada), las pulgadas recorridas son $\text{inPer360} = \frac{\text{countsPer360}}{\text{DPI}}$.
3. Multiplicando por la definición internacional exacta de la pulgada ($1\text{ in} = 2.54\text{ cm}$):
   $$\text{cm/360} = \frac{360 \times 2.54}{\text{DPI} \times \text{sens} \times 0.022} = \frac{914.4}{\text{eDPI} \times 0.022} \approx \frac{41563.63636\dots}{\text{eDPI}}$$
   _(Ejemplo de control: para $\text{DPI} = 800, \text{sens} = 1.0 \Rightarrow \text{eDPI} = 800 \Rightarrow \text{cm/360} = 51.954545\dots\text{ cm}$)._

### 4.4 Campo de Visión Horizontal y Vertical (`Hor+`) _(Propuesta a verificar en Capa 2)_

En modo competitivo estándar de CS2 (`fov_cs_debug 0`), la base de referencia histórica en relación de aspecto $4:3$ es un FOV horizontal de $90^\circ$:

1. En $4:3$, dado $\text{hFOV}_{4:3} = 90^\circ$ ($\tan(45^\circ) = 1$), el FOV vertical fijo resultante cumple:
   $$\tan\left(\frac{\text{vFOV}}{2}\right) = \frac{\tan(45^\circ)}{4/3} = \frac{3}{4} = 0.75 \implies \text{vFOV} = 2 \cdot \arctan(0.75) \approx 73.739795^\circ$$
2. Para cualquier relación de aspecto $\text{aspect} = W / H$ bajo escalado `Hor+`:
   $$\text{hFOV}(\text{aspect}) = 2 \cdot \arctan\left(\tan(45^\circ) \cdot \frac{\text{aspect}}{4/3}\right) = 2 \cdot \arctan\left(0.75 \cdot \text{aspect}\right)$$
   - En **$4:3$** ($\text{aspect} = 1.333\dots$): $\text{hFOV} = 90.00^\circ$.
   - En **$16:10$** ($\text{aspect} = 1.6$): $\text{hFOV} = 2 \cdot \arctan(1.2) \approx 100.39^\circ$.
   - En **$16:9$** ($\text{aspect} = 1.777\dots$): $\text{hFOV} = 2 \cdot \arctan(4/3) \approx \mathbf{106.260205^\circ}$.
   - En **$21:9$** ($2560 \times 1080$, $\text{aspect} \approx 2.3704$): $\text{hFOV} \approx 121.28^\circ$.

_(Nota para Three.js: `THREE.PerspectiveCamera` recibe por parámetro el **FOV vertical en grados** $\text{vFOV} \approx 73.739795^\circ$ junto con `aspect = width / height`, lo que reproduce de forma nativa la proyección `Hor+` anterior)._

### 4.5 Sensibilidad con Zoom (`zoom_sensitivity_ratio`) — `verified: false`

> **Estado explícito:** **`verified: false` (Pendiente de verificación empírica en Capa 2 / Capa 6; riesgo `R5`).**
>
> En CS2, el escalado exacto de sensibilidad al apuntar con mira telescópica (primer y segundo nivel de zoom en AWP / SSG 08, y zoom de AUG / SG 553) involucra el convar `zoom_sensitivity_ratio` (en CS:GO llamado `zoom_sensitivity_ratio_mouse`), el FOV efectivo del nivel de zoom y un escalado tipo _Monitor Distance / focal length_ heredado de Source. **Prohibido asumir o codificar una constante cerrada de zoom sin ejecutar y documentar antes la medición empírica reproducible en CS2 local en la Capa 2 / Capa 6.**
