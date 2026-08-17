# 🌍 GeoMundi | Academia Gamificada de Geografía Mundial

GeoMundi es una Single Page Application (SPA) interactiva, moderna y altamente gamificada diseñada para aprender y dominar la geografía mundial: países, banderas, capitales y ubicaciones en el mapa interactivo.

Desarrollada con **React 18 + TypeScript + Vite + Tailwind CSS + react-simple-maps + Framer Motion**, diseñada para ser desplegada en **Vercel** y conectada a **GitHub** sin dependencias de backend complejas (todo el estado, progreso y diagnósticos residen en `localStorage`).

---

## ✨ Características Principales

### 🎮 1. Modalidades de Juego
- **Modo "Click & Find" (Ubicar en el mapa):** Se solicita localizar un país por nombre, bandera SVG o capital. Feedback visual reactivo (verde esmeralda al acierto, ámbar para pistas, rojo coral en fallos).
- **Modo "Escribir" (Input Ortográfico):** El mapa resalta un país y el jugador debe escribir su nombre. Incluye normalización y algoritmo de tolerancia a tildes, diacríticos y pequeñas erratas tipográficas (distancia de Levenshtein).
- **Modo "Match / Emparejar" (Cartas & Mapa):** 5 tarjetas interactivas que deben ser vinculadas con su territorio en el mapa.
- **Modo "Explorador Libre":** Navegación libre para hacer clic en cualquier país e inspeccionar capital, población, subregión, banderas y países fronterizos interactivos.

### 🧠 2. Motor de Estadísticas y "Tutor IA"
- **Radar de Dominio Continental:** Porcentaje de efectividad por continente (Europa, América, Asia, África, Oceanía) con niveles de maestría (*Novato, Aprendiz, Avanzado, Experto, Maestro*).
- **Detección de Puntos Ciegos:** Lista de países con mayor tasa de error o dudas recurrentes.
- **Consejos Inteligentes y Reglas Nemotécnicas:** Recomendaciones contextuales de estudio (desbalances regionales, trucos para los países bálticos, países del Golfo de Guinea, etc.).
- **Botón "Práctica Focalizada":** Genera una partida rápida compuesta exclusivamente por los países débiles del usuario.

### 🔊 3. Audio Procedural y Gamificación
- Sintetizador de audio nativo con **Web Audio API** (0 bytes de archivos de audio externos, latencia ultra baja, arpegios ascendentes en aciertos, chimes en combos y fanfarria de victoria).
- Sistema de vidas (3 corazones), multiplicador de racha/combo (hasta 3.0x), y animaciones de confeti con `canvas-confetti`.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, TypeScript, Vite
- **Estilos & Animaciones:** Tailwind CSS, Framer Motion, Lucide React, Canvas Confetti
- **Mapas:** `react-simple-maps`, `d3-geo`, `topojson-client` (Atlas 110m optimizado y offline)
- **Fuentes de Datos:** Sincronización en tiempo real con `REST Countries API v3.1` + Dataset local offline de respaldo completo en español.
- **Persistencia:** `localStorage`

---

## 🚀 Instalación y Desarrollo Local

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd Web_MAPAMUNDI
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para Producción:**
   ```bash
   npm run build
   ```

---

## 🌐 Despliegue en Vercel

1. Sube tu proyecto a un repositorio en **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: Lanzamiento inicial de GeoMundi SPA"
   git remote add origin https://github.com/tu-usuario/geomundi.git
   git push -u origin main
   ```
2. Entra a [Vercel](https://vercel.com) e importa el repositorio.
3. El framework preset se detectará automáticamente como **Vite**.
4. ¡Haz clic en **Deploy** y tu app estará lista globalmente en segundos!
