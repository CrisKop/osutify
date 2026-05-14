# ⚡ Osutify — Lista de Features

## 🎮 Gameplay

- Aim trainer rítmico estilo osu! integrado con Spotify
- 3 tipos de targets distintos visualmente:
  - Single (click instantáneo)
  - Hold estático (click + sostener)
  - Hold drag (cursor sigue una trayectoria móvil)
- Hold drags con hasta 3 posiciones y cambio de dirección por beat
- Trayectorias rectas o curvas (smooth) por segmento
- Auto-activación de hold drags al llegar al timestamp (no requiere click)
- Sistema de scoring con multiplicador de combo hasta 3.0x
- 4 niveles de timing: Perfect, Good, OK, Miss
- Accuracy en tiempo real ponderada por calidad de hits
- 5 grados de calificación: S, A, B, C, D
- Feedback flotante visual por cada hit (texto + color animado)
- Combo counter visible
- Cursor visible siguiendo el puntero
- Hit windows generosos para timing (260ms de tolerancia máxima)
- Hit radius con 40% extra de tolerancia espacial

## 🎵 Sincronización musical

- Beats reales obtenidos de Spotify Audio Analysis API (timestamps exactos)
- BPM detectado automáticamente por track
- Cache de análisis por canción (no re-fetch)
- Fallback a Audio Features API si analysis falla
- Fallback a 120 BPM constante si no hay datos
- Cada beat genera un evento musical
- Auto-mapping determinista por trackId (mismo track = mismo mapa)
- Soporte para canciones en cualquier BPM

## 🤖 Auto-mapper

- Generación automática de mapas para cualquier canción
- 60% singles, 18% hold estáticos, 14% drag-2pts, 8% drag-3pts
- Holds estáticos terminan antes del siguiente beat (espacio garantizado)
- Drags ocupan 2-3 beats consecutivos sin conflictos
- Curvas Catmull-Rom opcionales por punto (~50% probabilidad)
- Padding de bordes para que targets no caigan en esquinas
- Dificultad calculada automáticamente (Easy a Expert+)

## 🖼️ Ventana flotante

- Picture-in-Picture window always-on-top
- Sobrevive minimizar Spotify
- Sobrevive cambio de workspace/escritorio
- Mínimo tamaño ~80×80 px (mucho más pequeño que `window.open` normal)
- Sin chrome del navegador (sin URL bar)
- Header draggable estilo ventana nativa
- Resize libre con handles del OS
- Tamaño persistido entre sesiones (localStorage)
- Fallback automático a `window.open` si PiP no disponible
- HUD totalmente responsivo (escala con tamaño de ventana via container queries)

## 🎯 Input

- Mouse: click izquierdo para singles y hold estáticos
- Teclas `Z` y `X` (osu!-style)
- Combinación libre de teclado + mouse
- Repetidas de tecla ignoradas (anti-spam)
- Pointer capture durante hold
- Detección de hover sobre canvas para activación de teclas

## 🔌 Integración Spotify

- Botón gamepad en playbar de Spotify (toggle abrir/cerrar)
- Auto-detección de cambio de canción
- Generación automática de mapa al cambiar de canción
- Lectura de progreso de canción en tiempo real para sync
- Información de track (título, artista, BPM, duración)

## 🎨 Visual

- Tema oscuro con backdrop blur
- Colores semánticos por tipo de target:
  - Verde Spotify para singles
  - Naranja para hold estáticos
  - Morado para hold drags
  - Rojo cuando un drag se sale del path
- Approach circles animados contrayéndose
- Anillo de progreso dorado durante hold
- Flecha indicadora al final de cada path de drag
- Notas próximas se atenúan (28% opacity) durante hold activo (sin parpadeo)
- Path con grosor proporcional al tamaño del target
- Renderizado DPR-aware para pantallas HiDPI
- Animaciones de feedback con fade y slide

## ⚙️ Técnico

- Estado global compartido entre ventana principal y PiP
- Determinismo por seed para mapas reproducibles
- React 19 + Zustand 5 + TypeScript strict mode
- Canvas 2D con `requestAnimationFrame`
- Listo para escalar (estructura modular: game/, components/, spotify/, maps/, css/)
- Punto único de extensión para Fase 2 (selector.ts ← Supabase)
- Logs de debug en console con prefijo `[Osutify]`
- TypeScript typecheck limpio sin errores

## 🔜 Próximamente (Fase 2+)

- Login con Discord OAuth
- Mapas creados por la comunidad
- Sistema de ratings y moderación (rated > unrated > auto)
- Leaderboards por mapa
- Editor de mapas integrado
- Perfil de usuario con estadísticas
- Múltiples dificultades por canción
- Publicación en Marketplace de Spicetify
