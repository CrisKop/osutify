# 🎵 Osutify — Documentación Técnica

> Extensión de Spicetify que convierte Spotify en un aim trainer rítmico estilo osu!, con popup flotante always-on-top (Picture-in-Picture) sincronizado al beat real de la canción mediante Spotify Audio Analysis API.

---

## 1. Visión General

**Osutify** es una extensión de Spicetify que abre una ventana flotante Picture-in-Picture (PiP) sobre Spotify (sobrevive minimize) con un minijuego rítmico. Los targets se generan automáticamente a partir de los timestamps de beats reales de cada canción, obtenidos vía `audio-analysis` API de Spotify. Soporta input con mouse + teclas `Z`/`X` estilo osu!.

### MVP actual (Fase 1)

- 100% offline. Sin backend.
- Auto-mapper único modo de generación (no hay mapas de comunidad aún).
- Scoring, combo, accuracy, grade en tiempo real.
- Ventana PiP nativa always-on-top.

---

## 2. Tipo de Proyecto

**Extensión Spicetify** (no Custom App), scaffoldeada con `create-spicetify-app` (TypeScript + React + spicetify-creator build tool).

---

## 3. Stack Tecnológico

| Capa | Tecnología | Por qué |
|---|---|---|
| Build | spicetify-creator (esbuild + tsc bajo el capó) | Pipeline oficial, HMR, tipos Spicetify incluidos |
| UI | React 19 (Spicetify.React + Spicetify.ReactDOM aliased) | Escalable para fases futuras (editor, perfil) |
| Estado | Zustand 5 | Store singleton compartido entre main window y PiP |
| Juego | Canvas 2D raw + `requestAnimationFrame` | Control total del render, sin overhead de libs |
| Beat sync | `https://api.spotify.com/v1/audio-analysis/{id}` vía `Spicetify.CosmosAsync` | Timestamps exactos por beat |
| Window flotante | `documentPictureInPicture.requestWindow()` | Always-on-top, mínimos pequeños, sobrevive minimize |
| Backend | (no implementado, Fase 2) Supabase + Discord OAuth | — |

---

## 4. Arquitectura de archivos

```
osutify/
├── src/
│   ├── app.tsx                       # Entry. Spicetify wait → Playbar button → store subscribe → fetch map → toggle popout
│   ├── settings.json                 # { "nameId": "osutify" }
│   ├── store.ts                      # Zustand: open, popupSize, track, map, score
│   ├── popout.ts                     # PiP window: requestWindow + style inject + React mount + resize persist
│   ├── components/
│   │   ├── Popup.tsx                 # Layout fill 100vw/100vh con header (título + ✕) y body (canvas + HUD)
│   │   ├── GameCanvas.tsx            # Monta GameEngine, hook a store, ResizeObserver
│   │   └── HUD.tsx                   # Score, combo, accuracy, grade, mapinfo (responsivo container queries)
│   ├── game/
│   │   ├── types.ts                  # Note, HoldPoint, MapData, TIMING_WINDOWS, HIT_RADIUS_*, APPROACH_TIME_MS
│   │   ├── path.ts                   # pointAtTime (lerp + Catmull-Rom), isStaticHold, cubicCatmullPoint
│   │   ├── scoring.ts                # judgeTiming, comboMultiplier, applyJudgement, accuracy, grade
│   │   ├── autoMapper.ts             # Genera notes desde beats[] reales (o BPM fallback)
│   │   ├── Renderer.ts               # Dibuja singles, holds estáticos, holds drag con paths curvos, HUD feedback, cursor
│   │   ├── InputHandler.ts           # Pointer + teclas Z/X. Usa element.ownerDocument.defaultView para soportar PiP
│   │   └── GameEngine.ts             # RAF loop. autoStartDrags + processMisses + updateActiveHold + collectVisible
│   ├── maps/
│   │   └── selector.ts               # Stub: por ahora solo invoca autoMapper. Punto de extensión Fase 2 (Supabase)
│   ├── spotify/
│   │   └── player.ts                 # getCurrentTrack(Async), getProgressMs, onSongChange, fetchAnalysis con cache
│   ├── css/
│   │   └── popupStyles.ts            # CSS embebido como template literal (inyectado en main + PiP)
│   └── types/
│       ├── spicetify.d.ts            # Typings oficiales de Spicetify
│       └── css-modules.d.ts          # Declaraciones de módulos CSS
├── dist/osutify.js                   # Bundle output
├── package.json
├── tsconfig.json
└── Osutify_Docs.md
```

---

## 5. Modelo de datos del Mapa

### Tipos (`src/game/types.ts`)

```typescript
type TargetType = "single" | "hold";
type Judgement = "perfect" | "good" | "ok" | "miss";

interface HoldPoint {
  x: number;        // 0..1 relativo
  y: number;        // 0..1 relativo
  time: number;     // ms absoluto desde inicio canción
  smooth?: boolean; // segmento hacia siguiente punto = Catmull-Rom curve
}

interface Note {
  id: string;
  type: "single" | "hold";
  time: number;       // start time (para single = hit time; para hold = points[0].time)
  x: number;          // posición principal (single = hit, hold = points[0])
  y: number;
  size: number;       // multiplicador 1.0 = normal
  points?: HoldPoint[];  // ≥2 puntos si type==="hold"
}

interface MapData {
  trackId, title, artist, songName: string;
  bpm: number;
  difficulty: number;       // 0.0 - 10.0
  difficultyName: string;   // "Easy" | "Normal" | "Hard" | "Expert" | "Expert+"
  notes: Note[];
  source: "rated" | "unrated" | "auto";
  isRated: boolean;
}
```

### Tipos de targets

| Tipo | Estructura | Comportamiento |
|---|---|---|
| **Single** | `type: "single"`, `time`, `x`, `y` | Click una vez con timing exacto |
| **Hold estático** | `type: "hold"`, `points: [{x,y,t}, {x,y,t+dur}]` (misma `x,y`) | Click + hold durante `duration` |
| **Hold drag** (2 pts) | `type: "hold"`, `points: [{x0,y0,t}, {x1,y1,t+beat}]` | Auto-activa, head se mueve, cursor sigue |
| **Hold drag** (3 pts) | `type: "hold"`, `points: [{x0,y0,t0}, {x1,y1,t1}, {x2,y2,t2}]` | Auto-activa, 2 trayectos consecutivos (uno por beat) |

`smooth: true` en un punto = segmento hacia el siguiente se dibuja como curva Catmull-Rom (cubic spline).

---

## 6. Auto-Mapper

### Algoritmo (`src/game/autoMapper.ts`)

```
beats = audio-analysis API (timestamps reales)  // fallback: 60000/bpm intervalos desde startOffset=2000ms

for beatIdx in beats:
  kind = pickKind(rng, beatsRemaining)
    - 60%  single
    - 18%  hold estático
    - 14%  drag-2pts (si quedan ≥2 beats)
    -  8%  drag-3pts (si quedan ≥3 beats)
  pos = randPos(rng)
  
  switch kind:
    single:        push 1 nota, beatIdx += 1
    hold-static:   push hold con duration = 20-45% del beat actual, beatIdx += 1
    hold-drag-2:   push hold de 2 puntos (t0=beat[N], t1=beat[N+1]), beatIdx += 2
    hold-drag-3:   push hold de 3 puntos (t0, t1, t2 en beats consecutivos), beatIdx += 3
```

### Garantías

- Cada beat tiene exactamente UN evento (single, inicio de hold, o ya consumido por hold previo).
- Holds drag de 2-3 pts consumen sus beats internos — no se generan targets adicionales encima.
- Hold static garantizado a terminar entre 20-45% del beat: gap claro hacia siguiente target (55-80% del beat libre).
- RNG seeded por `trackId` (mismo track → mismo mapa, determinista).
- Path puntos con `smooth=true` aleatorio (~40-50% probabilidad) → curvas.

### Selección de mapa (`src/maps/selector.ts`)

Actualmente siempre genera auto-map. En Fase 2:

```
1. Fetch mapas por track_id en Supabase
2. ¿hay rated? → mejor (por rating)
3. ¿hay unrated? → más reciente (o lista a usuario)
4. else → generateAutoMap(track)
```

---

## 7. Game Engine (`src/game/GameEngine.ts`)

### Loop principal (RAF)

```
each frame:
  songMs = Spicetify.Player.getProgress()
  autoStartDrags(songMs)       // si próximo note es drag y songMs >= n.time → auto-activate
  processMisses(songMs)         // notas vencidas (delta > OK window) → miss + advance nextIdx
  updateActiveHold(songMs)      // tracking de hold activo (estático = held, drag = cursor proximity)
  collectVisible(songMs)        // notas dentro de APPROACH_TIME + active hold
  renderer.render(visible)
  if score changed → callback
  if all consumed → onMapEnd
```

### Diferencia entre tipos de hold

**Static hold** (`points[0].x === points[1].x`):
- Player debe presionar (mouse o Z/X) cerca del punto + sostener durante `duration`.
- Si suelta antes → `ratio = held/total` determina judgement.
- Si cursor se aleja del punto durante hold → `state = "broken"` + judgement basado en proporción.

**Drag hold** (multi-position):
- Auto-activa apenas `songMs >= n.time`. NO requiere click.
- Cada frame: `expected = pointAtTime(points, songMs)`, mide distancia cursor↔expected.
- Acumula `inRangeMs` vs `outOfRangeMs`.
- Al final: `ratio = inRange / total` → judgement (Perfect ≥0.92, Good ≥0.75, OK ≥0.5, else Miss).
- Head se renderiza moviéndose por path. Color rojo si cursor fuera, normal si dentro.

### Constantes timing (`src/game/types.ts`)

```typescript
TIMING_WINDOWS = { perfect: 70, good: 160, ok: 260 }   // ms ± alrededor del time exacto
APPROACH_TIME_MS = 950                                  // tiempo que el approach circle queda visible
HIT_RADIUS_SINGLE = 0.10                                // radio click single (relativo a min(w,h))
HIT_RADIUS_HOLD = 0.10                                  // radio click hold inicial
HIT_RADIUS_PATH = 0.09                                  // radio tracking durante drag
```

Hit radius físico = `baseRadius * note.size * 1.4` (40% de tolerancia espacial extra).

### Scoring (`src/game/scoring.ts`)

```
Perfect → 300 pts × combo_multiplier
Good    → 200 pts × combo_multiplier
OK      → 100 pts × combo_multiplier
Miss    →   0 pts, resetea combo

combo_multiplier = min(3.0, 1.0 + combo * 0.01)

accuracy = Σ(weight[j]) / totalHits
  weights: perfect=1.0, good=0.66, ok=0.33, miss=0

grade:
  S ≥ 95%
  A ≥ 85%
  B ≥ 70%
  C ≥ 55%
  D < 55%
```

---

## 8. Input (`src/game/InputHandler.ts`)

### Pointer

- `pointerdown` (botón izquierdo) → emite `down(x,y)` relativo al canvas.
- `pointerup` → emite `up()`.
- `pointermove` → emite `move(x,y)` + actualiza `lastPos`.
- `pointerenter/leave` → tracking de `hasPointer` para keyboard input.

### Teclado (osu!-style)

- Teclas `Z` y `X` (`KeyZ`, `KeyX`).
- `keydown` con cursor sobre canvas → emite `down(lastPos)`. Repetidas ignoradas.
- `keyup` → emite `up()` cuando ninguna tecla ni pointer presionado.
- Ambas teclas + pointer combinables — `isHeld()` true si CUALQUIERA activa.

### Soporte multi-ventana (PiP)

`InputHandler` usa `element.ownerDocument.defaultView` (no `window` global) para registrar listeners de teclado. Esto permite que Z/X funcionen cuando la ventana PiP tiene focus.

---

## 9. Renderer (`src/game/Renderer.ts`)

### Pintado por frame

1. Clear canvas.
2. Por cada nota visible (de fondo a frente):
   - `dimmed=true` → wrap con `globalAlpha=0.28`.
   - Single: círculo verde + approach ring contrayéndose.
   - Hold static: círculo naranja + anillo interno blanco + approach ring. En active: anillo progreso dorado alrededor.
   - Hold drag: path completo (líneas o curvas Catmull-Rom) en morado translúcido + flecha al final + círculo inicio. En active: head moviéndose en `pointAtTime(songMs)`, color rojo si broken.
3. Feedback flotante (PERFECT/GOOD/OK/MISS) con fade + slide arriba.
4. Cursor blanco siguiendo puntero (DPR-aware).

### Colores

```typescript
single:     "#1DB954"  // verde Spotify
holdStatic: "#FF7B00"  // naranja
holdDrag:   "#9D4EDD"  // morado
broken:     "#FF4D4D"  // rojo (head fuera de path)
perfect:    "#FFD166"
good:       "#1DB954"
ok:         "#9D4EDD"
miss:       "#FF4D4D"
```

### DPR

`canvas.width = rect.width * devicePixelRatio` para nitidez en pantallas HiDPI. `ctx.setTransform(dpr,...)`. Usa `element.ownerDocument.defaultView.devicePixelRatio` para soportar PiP correctamente.

---

## 10. Path interpolation (`src/game/path.ts`)

`pointAtTime(points, time)`:
- `time <= points[0].time` → devuelve start.
- `time >= last.time` → devuelve end.
- Else encuentra segmento `[i, i+1]`, calcula `t = (time - a.time) / (b.time - a.time)`:
  - Si `a.smooth && points.length >= 3` → Catmull-Rom cubic (`cubicCatmullPoint`).
  - Else → lerp lineal.

**Velocidad constante** garantizada por timestamp lineal en lerp. En Catmull-Rom velocidad varía levemente por la curva pero llega al endpoint exacto en su timestamp.

---

## 11. Popup window (`src/popout.ts`)

### Apertura

```typescript
const pip = window.documentPictureInPicture;
const w = await pip.requestWindow({
  width: 80,
  height: 80,
  disallowReturnToOpener: true,
  preferInitialWindowPlacement: false,
});
```

Fallback: si PiP no disponible → `window.open('about:blank', 'osutify-popout', 'popup=yes,resizable=yes')`.

### Inyección en la ventana

```typescript
w.document.title = "Osutify";
w.document.body.className = "osu-popout-body";

// Style tag con POPUP_CSS + DRAG_REGION_CSS
const style = w.document.createElement("style");
style.textContent = POPUP_CSS + DRAG_REGION_CSS;
w.document.head.appendChild(style);

// React root
const container = w.document.createElement("div");
w.document.body.appendChild(container);
const root = Spicetify.ReactDOM.createRoot(container);
root.render(<Popup />);
```

### Estado compartido

Mismo JS realm que main window → `useStore` (zustand) es singleton compartido. Cambios desde main ↔ PiP automáticos vía React subscription.

### Drag region

`-webkit-app-region: drag` en header → toda la barra superior arrastra la ventana OS. Los botones tienen `no-drag` para preservar click.

### Resize

OS handles nativos. Sin handles custom JS. Resize persiste en `localStorage` key `osutify:popupSize` vía evento `resize` en la ventana PiP.

### Cierre

- ✕ del header → `setOpen(false)` → app.tsx subscribe → `closePopoutWindow()`.
- ✕ nativo del OS → `pagehide`/`beforeunload` → `setOpen(false)`.
- Toggle gamepad button → mismo flujo.

---

## 12. Integración con Spicetify

### Botón en Playbar (`src/app.tsx`)

```typescript
const button = new Spicetify.Playbar.Button(
  "Osutify",
  "gamepad",
  () => useStore.getState().toggleOpen(),
  false,
  useStore.getState().open,
);
button.register();
```

### Detección de canción y BPM

`getCurrentTrackAsync()`:
1. Lee `Spicetify.Player.data.item` (sync): `uri`, `name`, `artists[0].name`, `metadata.audio-attributes.tempo`, `duration.milliseconds`.
2. Fetch async `audio-analysis/{trackId}` via `Spicetify.CosmosAsync.get`:
   - Si responde: `track.tempo` (BPM real), `beats[].start` (timestamps por beat en ms).
   - Cache por trackId.
3. Fallback `audio-features/{trackId}`: solo BPM, no beat array.
4. Fallback default: 120 BPM, `startOffsetMs=2000`, intervalos `60000/bpm`.

### Event listeners

```typescript
onSongChange(() => refreshMapForCurrentTrack());
useStore.subscribe(s => {
  button.active = s.open;
  if (s.open !== lastOpen) {
    s.open ? openPopoutWindow() : closePopoutWindow();
  }
});
```

---

## 13. Build & Deploy

### Comandos

```bash
npm run build        # Build via spicetify-creator → deploya a %APPDATA%\spicetify\Extensions\osutify.js
npm run build-local  # Build con --out=dist --minify (no deploya)
npm run watch        # Watch mode (recompila al guardar)
```

### Setup en Spicetify

```bash
spicetify config extensions osutify.js
spicetify apply
```

Iteración rápida:
```bash
npm run watch   # terminal 1
# Ctrl+Shift+R en Spotify para reload
```

DevTools en Spotify: `spicetify enable-devtools` + `Ctrl+Shift+I`.

---

## 14. Limitaciones conocidas

- **Mínimo de tamaño PiP**: ~80×80 px depende de Chromium/Electron build de Spotify.
- **Audio-analysis API rate limit**: en uso pesado puede fallar; fallback a BPM constante.
- **Sin persistencia de scores**: cada sesión empieza fresca (Fase 2 con Supabase).
- **Sin mapas de comunidad**: solo auto-mapping (Fase 2).
- **Mismo seed = mismo mapa**: determinista por trackId (intencional, scores comparables; aleatorio sería injusto).

---

## 15. Fases de desarrollo

### ✅ Fase 1 — MVP del juego (sin backend) — **completa**

- Setup spicetify-creator + React + zustand
- PiP window flotante always-on-top (Document Picture-in-Picture API)
- Canvas + game loop (RAF) + DPR-aware
- BPM y beats reales vía Spotify audio-analysis
- Auto-mapper con every-beat policy
- 3 tipos de target: single, hold estático, hold drag (2-3 puntos con paths curvos opcionales)
- Sistema de scoring + combo + accuracy + grade
- HUD responsive (container queries)
- Input mouse + teclas Z/X
- Botón gamepad en Playbar de Spotify

### 🔜 Fase 2 — Backend y mapas de comunidad

- Setup Supabase (tablas, RLS, Discord OAuth)
- CRUD de mapas por `track_id`
- Selector: rated > unrated > auto
- Submit + leaderboard de scores
- Login desde popup

### 🔮 Fase 3 — Editor de mapas

- UI del editor en popup ampliado
- Colocación de notas con click sincronizado a beats reales
- Preview + publicación

### 🔮 Fase 4 — Comunidad

- Sistema de ratings + moderación
- Perfil con stats
- Múltiples dificultades por mapa
- Publicar en Marketplace de Spicetify

---

## 16. Detección de BPM y Timing — código real

```typescript
// src/spotify/player.ts
const res = await Spicetify.CosmosAsync.get(
  `https://api.spotify.com/v1/audio-analysis/${trackId}`,
);
const beats = res.beats.map(b => Math.round(b.start * 1000));  // ms absolutos
const bpm = res.track.tempo;
```

```typescript
// src/game/GameEngine.ts
const songMs = Spicetify.Player.getProgress();   // ms actuales
const delta = songMs - note.time;
const judgement = judgeTiming(delta);
```

---

## 17. Nombre y identidad

- **Osutify** — combinación de osu! + Spotify
- Bundle filename: `osutify.js`
- localStorage prefix: `osutify:*`
- React root id en PiP: `osutify-popout-root`
- Logs en console: `[Osutify] ...`

---

*Documentación generada para desarrollo con Claude Code.*
*Última actualización: Mayo 2026*
