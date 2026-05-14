# 🎵 SpotifyOsu — Documentación del Proyecto

> Extensión de Spicetify que convierte Spotify en un aim trainer rítmico al estilo osu!, con mapas creados por la comunidad y leaderboards por canción.

---

## 1. Visión General

**SpotifyOsu** es una extensión de Spicetify que muestra un popup flotante (similar al mini player de Spotify) con un minijuego de targets al ritmo de la canción que estás escuchando. Los targets son generados por mapas creados por la comunidad, o aleatoriamente si no existe un mapa para esa canción.

### Diferenciadores clave
- Discreto: popup pequeño, no invasivo, ideal para usar en segundo plano
- Comunidad de mappers: los usuarios crean y votan mapas, como osu!
- Selección automática del mejor mapa al iniciar una canción
- Leaderboard por canción y por mapa

---

## 2. Tipo de Proyecto en Spicetify

**Extensión** (no Custom App), porque:
- Las extensiones pueden inyectar elementos HTML/CSS directamente al DOM de Spotify
- El popup flotante se logra con un `<div>` de posición fija, igual que el mini player nativo
- No necesita una página propia en la sidebar
- Menor fricción para el usuario (siempre disponible, no hay que navegar a ningún lado)

---

## 3. Stack Tecnológico

| Capa | Tecnología | Por qué |
|---|---|---|
| Extensión | TypeScript + esbuild | Tipado, bundling rápido |
| Juego | Canvas API (HTML5) | Control total del rendering de targets |
| Tempo detection | `Spicetify.Player` | Acceso nativo al BPM y posición de la canción |
| Backend | Supabase | PostgreSQL real, auth, leaderboards, open source |
| Auth usuarios | Supabase Auth (Discord OAuth) | Fácil para la comunidad gamer |
| Hosting | Supabase (gratis) | Sin costos iniciales, escalable |

---

## 4. Arquitectura

```
spicetify-extension/
├── src/
│   ├── index.ts              # Entry point, registra la extensión
│   ├── popup/
│   │   ├── Popup.ts          # Manejo del popup flotante (DOM)
│   │   └── popup.css         # Estilos del popup
│   ├── game/
│   │   ├── GameEngine.ts     # Loop principal del juego (requestAnimationFrame)
│   │   ├── Target.ts         # Clase Target (single + hold)
│   │   ├── Renderer.ts       # Canvas: dibuja targets, efectos, HUD
│   │   ├── InputHandler.ts   # Detección de clicks del usuario
│   │   ├── ScoreSystem.ts    # Scoring, combo, accuracy
│   │   └── BeatMapper.ts     # Genera targets desde un mapa o aleatoriamente
│   ├── maps/
│   │   ├── MapLoader.ts      # Carga mapas desde Supabase por track_id
│   │   ├── MapSelector.ts    # Lógica de selección (rated > unrated, por dificultad)
│   │   └── types.ts          # Tipos TypeScript para mapas, notas, etc.
│   ├── editor/
│   │   └── MapEditor.ts      # Editor de mapas para mappers
│   ├── leaderboard/
│   │   └── Leaderboard.ts    # Fetch y display de scores por mapa
│   └── supabase/
│       ├── client.ts         # Inicialización del cliente Supabase
│       ├── auth.ts           # Login/logout con Discord
│       ├── maps.ts           # CRUD de mapas
│       └── scores.ts         # Submit y fetch de scores
├── dist/
│   └── spicetifyosu.js       # Output compilado (va a Extensions/)
├── esbuild.config.js
├── tsconfig.json
└── package.json
```

---

## 5. Base de Datos (Supabase / PostgreSQL)

### Tabla: `maps`

```sql
CREATE TABLE maps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id      TEXT NOT NULL,          -- Spotify track ID (ej: "4iV5W9uYEdYUVa79Axb7Rh")
  title         TEXT NOT NULL,          -- Nombre del mapa
  artist        TEXT NOT NULL,          -- Artista de la canción
  song_name     TEXT NOT NULL,          -- Nombre de la canción
  bpm           FLOAT NOT NULL,         -- BPM del mapa
  difficulty    FLOAT NOT NULL,         -- 0.0 a 10.0 (calculado automáticamente)
  difficulty_name TEXT,                 -- "Easy", "Normal", "Hard", "Expert", "Expert+"
  notes         JSONB NOT NULL,         -- Array de notas (ver estructura abajo)
  mapper_id     UUID REFERENCES users(id),
  is_rated      BOOLEAN DEFAULT FALSE,  -- Verificado por moderadores
  rating        FLOAT DEFAULT 0,        -- Promedio de votos (1-5)
  play_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Estructura de `notes` (JSONB)

```json
[
  {
    "time": 1234,        // ms desde el inicio de la canción
    "x": 0.45,           // posición X relativa (0.0 a 1.0)
    "y": 0.60,           // posición Y relativa (0.0 a 1.0)
    "type": "single",    // "single" | "hold"
    "duration": 0,       // ms (solo para hold targets, 0 en single)
    "size": 1.0          // multiplicador de tamaño (1.0 = normal)
  }
]
```

### Tabla: `scores`

```sql
CREATE TABLE scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id        UUID REFERENCES maps(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  score         INTEGER NOT NULL,
  accuracy      FLOAT NOT NULL,    -- 0.0 a 1.0
  max_combo     INTEGER NOT NULL,
  misses        INTEGER NOT NULL,
  grade         TEXT NOT NULL,     -- "S", "A", "B", "C", "D"
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `map_ratings`

```sql
CREATE TABLE map_ratings (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id    UUID REFERENCES maps(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id),
  rating    INTEGER CHECK (rating BETWEEN 1 AND 5),
  UNIQUE (map_id, user_id)
);
```

### Tabla: `users` (extendida de Supabase Auth)

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  username      TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  is_moderator  BOOLEAN DEFAULT FALSE,
  total_score   BIGINT DEFAULT 0,
  maps_created  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Índices importantes

```sql
CREATE INDEX idx_maps_track_id ON maps(track_id);
CREATE INDEX idx_maps_rated ON maps(is_rated, rating DESC);
CREATE INDEX idx_scores_map_id ON scores(map_id, score DESC);
CREATE INDEX idx_scores_user_id ON scores(user_id);
```

---

## 6. Gameplay

### 6.1 Tipos de Targets

**Single Target**
- Aparece en pantalla con un círculo exterior que se contrae hacia el centro
- El usuario hace click cuando el círculo exterior llega al centro
- Ventana de timing: Perfect (±30ms), Good (±70ms), OK (±110ms), Miss

**Hold Target**
- Igual que single, pero el usuario debe mantener el click durante `duration` ms
- Si suelta antes, cuenta como parcial o miss según cuánto sostuvo

### 6.2 Sistema de Scoring

```
Perfect  → 300 puntos × combo_multiplier
Good     → 200 puntos × combo_multiplier
OK       → 100 puntos × combo_multiplier
Miss     → 0 puntos, resetea combo
```

**Combo multiplier:** `1.0 + (combo * 0.01)` (máx 3.0x a combo 200)

### 6.3 Grades

| Grade | Accuracy |
|---|---|
| S | ≥ 95% |
| A | ≥ 85% |
| B | ≥ 70% |
| C | ≥ 55% |
| D | < 55% |

### 6.4 Difficulty Rating (calculado al subir el mapa)

```
difficulty = (notes_per_second * 1.5) + (avg_distance_between_notes * 0.8) + (hold_ratio * 0.7)
```
Normalizado entre 0.0 y 10.0.

---

## 7. Selección de Mapas

Al iniciar una canción, el flujo es:

```
1. Buscar mapas por track_id en Supabase
2. ¿Hay mapas rated?
   ├── SÍ → Mostrar el mejor rated (mayor rating, mayor play_count como desempate)
   └── NO → ¿Hay mapas unrated?
             ├── SÍ → Mostrar lista de mapas unrated (por fecha, más reciente primero)
             └── NO → Generar mapa aleatorio basado en BPM de Spicetify.Player
```

El usuario puede cambiar el mapa manualmente desde el popup (botón de lista).

---

## 8. Popup Flotante

### Dimensiones y posición
- Tamaño: **300×280px** (discreto, no invasivo)
- Posición por defecto: esquina inferior derecha (encima del mini player de Spotify)
- Draggable: el usuario puede moverlo donde quiera
- Posición persistida en `localStorage`

### Elementos del HUD (dentro del popup)
- Canvas del juego (targets)
- Score actual
- Combo actual  
- Accuracy en tiempo real
- Nombre del mapa + mapper
- Botones: minimizar, cambiar mapa, abrir editor, abrir leaderboard

### Activación
- Botón en la barra de controles de Spotify (inyectado por la extensión)
- Atajo de teclado configurable (default: `Alt+O`)

---

## 9. Editor de Mapas

El editor permite a los usuarios crear mapas mientras escuchan la canción:

### Flujo del editor
1. Usuario hace click en "Crear mapa" desde el popup
2. Se abre un panel más grande (o ventana separada)
3. La canción empieza desde el inicio
4. El usuario hace click en el canvas al ritmo para colocar notas (single)
5. Click sostenido para colocar hold targets
6. Puede previsualizar el mapa con "Play"
7. Al terminar, llena metadata (nombre del mapa, dificultad sugerida) y sube

### Controles del editor
| Acción | Control |
|---|---|
| Colocar single target | Click izquierdo |
| Colocar hold target | Click izquierdo sostenido |
| Eliminar nota | Click derecho sobre nota |
| Play/Pause | Espacio |
| Deshacer | Ctrl+Z |
| Subir mapa | Botón "Publicar" |

---

## 10. Leaderboard

Accesible desde el popup, muestra:
- Top 50 scores del mapa actual
- Username, score, accuracy, max combo, grade, fecha
- Tu posición actual (si estás fuera del top 50)
- Filtros: Global / Solo amigos (futuro)

---

## 11. Fases de Desarrollo

### Fase 1 — MVP del juego (sin backend)
- [ ] Setup del proyecto (TypeScript + esbuild)
- [ ] Popup flotante inyectado en Spotify
- [ ] Canvas con game loop (`requestAnimationFrame`)
- [ ] Detección de BPM con `Spicetify.Player`
- [ ] Generador aleatorio de targets basado en BPM
- [ ] Single targets con approach circle animado
- [ ] Hold targets
- [ ] Sistema de scoring, combo y accuracy
- [ ] HUD básico (score, combo, accuracy)
- [ ] Activar/desactivar con botón en Spotify

### Fase 2 — Backend y mapas
- [ ] Setup Supabase (tablas, auth, RLS policies)
- [ ] Login con Discord OAuth desde el popup
- [ ] Carga de mapas por `track_id`
- [ ] Lógica de selección de mapa (rated > unrated > aleatorio)
- [ ] Submit de scores a Supabase
- [ ] Leaderboard básico

### Fase 3 — Editor de mapas
- [ ] UI del editor en el popup
- [ ] Colocación de notas en tiempo real
- [ ] Preview del mapa
- [ ] Subida a Supabase
- [ ] Sistema de ratings (votos de usuarios)

### Fase 4 — Comunidad y polish
- [ ] Sistema de moderación (rated/unrated)
- [ ] Perfil de usuario con estadísticas
- [ ] Notificaciones ("nuevo mapa para esta canción")
- [ ] Publicación en el Marketplace de Spicetify
- [ ] Soporte para mapas con múltiples dificultades

---

## 12. Configuración del Proyecto

### `package.json`
```json
{
  "name": "spicetify-osu",
  "version": "0.1.0",
  "scripts": {
    "build": "node esbuild.config.js",
    "watch": "node esbuild.config.js --watch",
    "deploy": "cp dist/spicetifyosu.js ~/.config/spicetify/Extensions/ && spicetify apply"
  },
  "devDependencies": {
    "esbuild": "^0.20.0",
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

### `esbuild.config.js`
```js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/spicetifyosu.js',
  format: 'iife',
  globalName: 'SpicetifyOsu',
  platform: 'browser',
  target: 'es2020',
  minify: process.argv.includes('--prod'),
  watch: process.argv.includes('--watch'),
  external: [],
}).catch(() => process.exit(1));
```

### Variables de entorno (hardcoded en el build, son públicas)
```ts
// src/supabase/client.ts
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJ..."; // clave pública (anon key), es seguro exponerla
```

> ⚠️ La `anon key` de Supabase es pública por diseño. La seguridad se maneja con **Row Level Security (RLS)** en las tablas.

---

## 13. Row Level Security (RLS) — Supabase

```sql
-- Maps: cualquiera puede leer, solo el mapper puede editar el suyo
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maps_select" ON maps FOR SELECT USING (true);
CREATE POLICY "maps_insert" ON maps FOR INSERT WITH CHECK (auth.uid() = mapper_id);
CREATE POLICY "maps_update" ON maps FOR UPDATE USING (auth.uid() = mapper_id);

-- Scores: cualquiera puede leer, solo tú puedes subir el tuyo
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scores_select" ON scores FOR SELECT USING (true);
CREATE POLICY "scores_insert" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ratings: un voto por usuario por mapa
ALTER TABLE map_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ratings_select" ON map_ratings FOR SELECT USING (true);
CREATE POLICY "ratings_upsert" ON map_ratings FOR ALL USING (auth.uid() = user_id);

-- Moderadores pueden rated mapas
CREATE POLICY "maps_moderate" ON maps FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_moderator = TRUE));
```

---

## 14. Detección de BPM y Timing

```ts
// Spicetify expone el BPM del track actual
const bpm = Spicetify.Player.data?.track?.metadata?.['audio-attributes.tempo'];
const position = Spicetify.Player.getProgress(); // ms actuales de la canción

// Intervalo entre beats en ms
const beatInterval = 60000 / bpm;

// Para sincronizar targets al beat exacto:
// nextBeatTime = Math.ceil(position / beatInterval) * beatInterval
```

> Si `audio-attributes.tempo` no está disponible, se puede estimar escuchando el `onprogress` de Spicetify y detectando el BPM manualmente, o usar un valor por defecto de 120 BPM.

---

## 15. Nombre del Proyecto

Opciones sugeridas:
- **SpotifyOsu** — directo y descriptivo
- **RhythmClick** — más genérico
- **BeatAim** — fácil de recordar
- **ClickBeat** — simple

El nombre final del archivo de extensión debe ser snake_case: `beat-aim.js` o `rhythm-click.js`.

---

*Documentación generada para desarrollo con Claude Code.*
*Última actualización: Mayo 2026*
