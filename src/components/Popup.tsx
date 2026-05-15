import React from "react";
import { useStore, DIFFICULTY_LABEL } from "../store";
import { GameCanvas } from "./GameCanvas";
import { HUD } from "./HUD";

export const Popup: React.FC = () => {
  const open = useStore((s) => s.open);
  const setOpen = useStore((s) => s.setOpen);
  const difficulty = useStore((s) => s.difficulty);
  const cycleDifficulty = useStore((s) => s.cycleDifficulty);
  const adaptive = useStore((s) => s.adaptiveTheme);
  const colors = useStore((s) => s.albumColors);
  const toggleAdaptive = useStore((s) => s.toggleAdaptiveTheme);

  if (!open) return null;

  const useAdaptive = adaptive && colors != null;
  const swatch1 = useAdaptive ? colors!.vibrant : "#f0ffbc";
  const swatch2 = useAdaptive ? colors!.prominent : "#bcfffc";
  const swatch3 = useAdaptive ? colors!.lightVibrant : "#dbdd78";

  const adaptiveVars: React.CSSProperties = useAdaptive
    ? ({
        "--ck-a1": colors!.vibrant,
        "--ck-a2": colors!.darkVibrant,
        "--ck-a3": colors!.prominent,
        "--ck-a4": colors!.lightVibrant,
      } as React.CSSProperties)
    : {};

  return (
    <div
      className={`osu-popup osu-popout ${useAdaptive ? "osu-adaptive" : ""}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        ...adaptiveVars,
      }}
    >
      <div className="osu-popup-header">
        <div className="osu-popup-titlebar">
          <span className="osu-popup-title">Osutify</span>
          <a
            className="osu-watermark"
            href="https://criskop.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Hecho por CrisKop — criskop.com"
          >
            by <span className="osu-watermark-name">CrisKop</span>
          </a>
        </div>
        <div className="osu-popup-actions">
          <button
            type="button"
            className={`osu-theme-btn ${adaptive ? "osu-theme-on" : "osu-theme-off"}`}
            title={
              adaptive
                ? "Tema adaptativo (colores de la canción) — click para volver al tema CrisKop"
                : "Tema CrisKop — click para usar colores de la canción"
            }
            onClick={() => toggleAdaptive()}
          >
            <span className="osu-theme-swatch" style={{ background: swatch1 }} />
            <span className="osu-theme-swatch" style={{ background: swatch2 }} />
            <span className="osu-theme-swatch" style={{ background: swatch3 }} />
          </button>
          <button
            type="button"
            className={`osu-diff-btn osu-diff-${difficulty}`}
            title={`Dificultad: ${DIFFICULTY_LABEL[difficulty]} (click para cambiar)`}
            onClick={() => cycleDifficulty()}
          >
            {DIFFICULTY_LABEL[difficulty]}
          </button>
          <button type="button" title="Cerrar" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>
      </div>
      <div className="osu-popup-body">
        <GameCanvas />
        <HUD />
      </div>
    </div>
  );
};
