import React from "react";
import { useStore } from "../store";

export const HUD: React.FC = () => {
  const score = useStore((s) => s.score);
  const map = useStore((s) => s.map);

  return (
    <div className="osu-hud">
      <div className="osu-hud-row osu-hud-top">
        <div className="osu-hud-score">{score.score.toLocaleString()}</div>
        <div className="osu-hud-acc">
          {(score.accuracy * 100).toFixed(2)}%
        </div>
      </div>
      <div className="osu-hud-row osu-hud-bottom">
        <div className="osu-hud-combo">{score.combo}x</div>
        <div className={`osu-hud-grade osu-grade-${score.grade}`}>
          {score.grade}
        </div>
      </div>
      {map && (
        <div className="osu-hud-mapinfo">
          <span className="osu-hud-mapname">{map.title}</span>
          <span className="osu-hud-mapdiff">
            ★ {map.difficulty.toFixed(1)} · {map.difficultyName}
          </span>
        </div>
      )}
    </div>
  );
};
