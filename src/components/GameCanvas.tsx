import React, { useEffect, useRef } from "react";
import { GameEngine } from "../game/GameEngine";
import { useStore } from "../store";
import { getProgressMs } from "../spotify/player";

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const map = useStore((s) => s.map);
  const setScore = useStore((s) => s.setScore);
  const resetScore = useStore((s) => s.resetScore);

  useEffect(() => {
    if (!canvasRef.current || !map) {
      console.log("[SpotifyOsu] GameCanvas skip mount", { hasCanvas: !!canvasRef.current, hasMap: !!map });
      return;
    }
    const canvas = canvasRef.current;
    console.log("[SpotifyOsu] mounting engine with map", map.title, "notes:", map.notes.length);
    resetScore();

    const engine = new GameEngine(canvas, map, {
      getSongTimeMs: () => getProgressMs(),
      onScoreChange: (s) => setScore(s),
      onMapEnd: () => {},
    });
    engineRef.current = engine;
    engine.start();

    const ro = new ResizeObserver(() => engine.resize());
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, [map, setScore, resetScore]);

  return <canvas ref={canvasRef} className="osu-canvas" />;
};
