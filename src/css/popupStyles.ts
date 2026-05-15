export const POPUP_CSS = `
.osu-popup {
  background: linear-gradient(135deg, #1e2a31 0%, #1f1f1b 100%);
  border: 1px solid rgba(190, 191, 171, 0.18);
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(240, 255, 188, 0.04);
  color: #fff;
  font-family: var(--font-family, "Spotify Mix", system-ui, sans-serif);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  backdrop-filter: blur(12px);
}
.osu-popup.osu-fullscreen, .osu-popup.osu-popout {
  border-radius: 0;
  border: none;
  background: linear-gradient(135deg, #1e2a31 0%, #1f1f1b 100%);
  position: relative;
  overflow: hidden;
}
.osu-popup.osu-adaptive {
  background:
    radial-gradient(ellipse 100% 80% at 20% 15%, var(--ck-a1, #354a55) 0%, transparent 70%),
    radial-gradient(ellipse 90% 90% at 85% 85%, var(--ck-a3, #1e2a31) 0%, transparent 70%),
    radial-gradient(ellipse 80% 100% at 50% 110%, var(--ck-a4, #bcfffc) 0%, transparent 65%),
    linear-gradient(160deg, var(--ck-a2, #1e2a31) 0%, #08080a 100%);
  transition: background 0.8s ease;
}
.osu-popup.osu-adaptive::before {
  content: "";
  position: absolute;
  inset: -25%;
  background:
    radial-gradient(circle 45% at 25% 30%, var(--ck-a1, transparent) 0%, transparent 60%),
    radial-gradient(circle 40% at 75% 65%, var(--ck-a4, transparent) 0%, transparent 60%),
    radial-gradient(circle 35% at 50% 90%, var(--ck-a3, transparent) 0%, transparent 60%);
  opacity: 0.85;
  filter: blur(45px) saturate(1.3);
  animation: osu-mesh-shift 18s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
.osu-popup.osu-adaptive::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 25%, rgba(8, 8, 10, 0.6) 95%);
  pointer-events: none;
  z-index: 0;
}
.osu-popup.osu-adaptive .osu-popup-header,
.osu-popup.osu-adaptive .osu-popup-body {
  position: relative;
  z-index: 1;
}
.osu-popup.osu-adaptive .osu-popup-header {
  background: rgba(31, 31, 27, 0.55);
  backdrop-filter: blur(8px);
}
@keyframes osu-mesh-shift {
  0%, 100% {
    transform: translate(0%, 0%) scale(1) rotate(0deg);
  }
  33% {
    transform: translate(6%, -4%) scale(1.12) rotate(8deg);
  }
  66% {
    transform: translate(-5%, 6%) scale(1.08) rotate(-6deg);
  }
}
.osu-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(65, 65, 65, 0.38);
  border-bottom: 1px solid rgba(190, 191, 171, 0.1);
  cursor: move;
  flex: 0 0 auto;
  font-size: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.osu-popup.osu-fullscreen .osu-popup-header,
.osu-popup.osu-popout .osu-popup-header {
  cursor: default;
}
.osu-popup-title { font-weight: 700; color: #f0ffbc; }
.osu-popup-actions { display: flex; gap: 4px; }
.osu-popup-actions button {
  background: transparent;
  color: rgba(190, 191, 171, 0.8);
  border: none;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.osu-popup-actions button:hover {
  background: rgba(240, 255, 188, 0.1);
  color: #f0ffbc;
}
.osu-popup-actions .osu-btn-active {
  background: rgba(240, 255, 188, 0.18);
  color: #f0ffbc;
}
.osu-popup-actions .osu-diff-btn {
  width: auto;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border: 1px solid rgba(190, 191, 171, 0.18);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.osu-popup-actions .osu-diff-btn:hover {
  background: rgba(240, 255, 188, 0.12);
}
.osu-diff-easy { color: #bcfffc; border-color: rgba(188, 255, 252, 0.35) !important; }
.osu-diff-easy:hover { background: rgba(188, 255, 252, 0.12) !important; }
.osu-diff-normal { color: #f0ffbc; border-color: rgba(240, 255, 188, 0.35) !important; }
.osu-diff-normal:hover { background: rgba(240, 255, 188, 0.12) !important; }
.osu-diff-hard { color: #dbdd78; border-color: rgba(219, 221, 120, 0.45) !important; }
.osu-diff-hard:hover { background: rgba(219, 221, 120, 0.15) !important; }
.osu-diff-expert {
  color: #ffb4a2;
  border-color: rgba(255, 180, 162, 0.5) !important;
  text-shadow: 0 0 6px rgba(255, 180, 162, 0.5);
}
.osu-diff-expert:hover { background: rgba(255, 180, 162, 0.15) !important; }
.osu-popup-actions .osu-theme-btn {
  width: auto;
  padding: 0 6px;
  gap: 3px;
  border: 1px solid rgba(190, 191, 171, 0.18);
}
.osu-theme-btn .osu-theme-swatch {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
  transition: filter 0.2s, transform 0.2s;
}
.osu-theme-btn.osu-theme-off .osu-theme-swatch {
  filter: grayscale(1) brightness(0.7);
}
.osu-theme-btn:hover .osu-theme-swatch {
  transform: scale(1.15);
  filter: none;
}
.osu-theme-btn.osu-theme-on {
  border-color: rgba(240, 255, 188, 0.35) !important;
  background: rgba(240, 255, 188, 0.06);
}
.osu-resize { position: absolute; z-index: 10; }
.osu-resize-n { top: 0; left: 8px; right: 8px; height: 6px; }
.osu-resize-s { bottom: 0; left: 8px; right: 8px; height: 6px; }
.osu-resize-e { top: 8px; bottom: 8px; right: 0; width: 6px; }
.osu-resize-w { top: 8px; bottom: 8px; left: 0; width: 6px; }
.osu-resize-ne { top: 0; right: 0; width: 12px; height: 12px; }
.osu-resize-nw { top: 0; left: 0; width: 12px; height: 12px; }
.osu-resize-se { bottom: 0; right: 0; width: 14px; height: 14px; }
.osu-resize-sw { bottom: 0; left: 0; width: 12px; height: 12px; }
.osu-resizable {
  outline: 2px dashed rgba(240, 255, 188, 0.7);
  outline-offset: -2px;
  box-shadow: 0 0 0 1px rgba(240, 255, 188, 0.2), 0 10px 40px rgba(0, 0, 0, 0.7);
}
.osu-resizable .osu-resize { background: rgba(240, 255, 188, 0.08); }
.osu-resizable .osu-resize:hover { background: rgba(240, 255, 188, 0.25); }
.osu-resizable .osu-resize-se {
  background: linear-gradient(135deg, transparent 0%, transparent 40%,
    rgba(240, 255, 188, 0.85) 40%, rgba(240, 255, 188, 0.85) 100%);
}
.osu-popup-body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  container-type: size;
  container-name: osubody;
}
.osu-canvas {
  width: 100%; height: 100%; display: block; touch-action: none;
}
.osu-hud {
  position: absolute; inset: 0; pointer-events: none;
  padding: clamp(2px, 2cqw, 8px) clamp(3px, 2.5cqw, 10px);
  display: flex; flex-direction: column;
  justify-content: space-between; font-variant-numeric: tabular-nums;
}
.osu-hud-row {
  display: flex; align-items: center; justify-content: space-between;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
}
.osu-hud-score {
  font-size: clamp(10px, 5cqw, 18px);
  font-weight: 700;
  color: #f0ffbc;
  text-shadow: 0 0 12px rgba(240, 255, 188, 0.4), 0 1px 6px rgba(0, 0, 0, 0.9);
}
.osu-hud-acc {
  font-size: clamp(8px, 3.6cqw, 13px);
  opacity: 0.75;
  color: #bebfab;
}
.osu-hud-combo {
  font-size: clamp(12px, 6cqw, 22px);
  font-weight: 700;
  color: #dbdd78;
  text-shadow: 0 0 10px rgba(219, 221, 120, 0.5), 0 1px 6px rgba(0, 0, 0, 0.9);
}
.osu-hud-grade {
  font-size: clamp(12px, 6cqw, 22px);
  font-weight: 800;
  padding: 0 clamp(3px, 2cqw, 8px);
  border-radius: 6px;
  background: rgba(31, 31, 27, 0.6);
  border: 1px solid rgba(190, 191, 171, 0.15);
}
.osu-grade-S { color: #dbdd78; text-shadow: 0 0 10px rgba(219, 221, 120, 0.6); }
.osu-grade-A { color: #f0ffbc; text-shadow: 0 0 10px rgba(240, 255, 188, 0.6); }
.osu-grade-B { color: #bcfffc; text-shadow: 0 0 10px rgba(188, 255, 252, 0.6); }
.osu-grade-C { color: #f29e4c; }
.osu-grade-D { color: #ff4d4d; }
.osu-hud-mapinfo {
  position: absolute;
  bottom: clamp(2px, 1.5cqw, 6px);
  left: clamp(4px, 2.5cqw, 10px);
  right: clamp(4px, 2.5cqw, 10px);
  display: flex; justify-content: space-between;
  font-size: clamp(7px, 2.8cqw, 10px);
  color: rgba(190, 191, 171, 0.6);
  pointer-events: none;
  white-space: nowrap; overflow: hidden;
}
.osu-popup-titlebar {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  flex: 1 1 auto;
}
.osu-watermark {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: none;
  color: rgba(190, 191, 171, 0.55);
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  transition: color 0.2s, text-shadow 0.2s;
}
.osu-watermark:hover {
  color: #f0ffbc;
  text-shadow: 0 0 6px rgba(240, 255, 188, 0.5);
}
.osu-watermark-name {
  color: rgba(240, 255, 188, 0.85);
  font-weight: 700;
}
.osu-watermark:hover .osu-watermark-name {
  color: #f0ffbc;
}
body.osu-popout-body {
  margin: 0; padding: 0; overflow: hidden;
  background: linear-gradient(135deg, #1e2a31 0%, #1f1f1b 100%);
  height: 100vh; width: 100vw;
}
`;
