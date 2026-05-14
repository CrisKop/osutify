import React from "react";
import { useStore } from "../store";
import { GameCanvas } from "./GameCanvas";
import { HUD } from "./HUD";

export const Popup: React.FC = () => {
  const open = useStore((s) => s.open);
  const setOpen = useStore((s) => s.setOpen);

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
        <span className="osu-popup-title">SpotifyOsu</span>
        <div className="osu-popup-actions">
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
