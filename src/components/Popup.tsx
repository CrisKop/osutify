import React from "react";
import { useStore, DIFFICULTY_LABEL } from "../store";
import { GameCanvas } from "./GameCanvas";
import { HUD } from "./HUD";

export const Popup: React.FC = () => {
  const open = useStore((s) => s.open);
  const setOpen = useStore((s) => s.setOpen);
  const difficulty = useStore((s) => s.difficulty);
  const cycleDifficulty = useStore((s) => s.cycleDifficulty);

  if (!open) return null;

  return (
    <div
      className="osu-popup osu-popout"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
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
