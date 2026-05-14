import { Judgement, TIMING_WINDOWS } from "./types";

const POINTS: Record<Judgement, number> = {
  perfect: 300,
  good: 200,
  ok: 100,
  miss: 0,
};

export function judgeTiming(deltaMs: number): Judgement {
  const abs = Math.abs(deltaMs);
  if (abs <= TIMING_WINDOWS.perfect) return "perfect";
  if (abs <= TIMING_WINDOWS.good) return "good";
  if (abs <= TIMING_WINDOWS.ok) return "ok";
  return "miss";
}

export function comboMultiplier(combo: number): number {
  return Math.min(3.0, 1.0 + combo * 0.01);
}

export interface ScoreState {
  score: number;
  combo: number;
  maxCombo: number;
  perfect: number;
  good: number;
  ok: number;
  miss: number;
  hits: number;
  weightedAccSum: number;
}

export function initScore(): ScoreState {
  return {
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    good: 0,
    ok: 0,
    miss: 0,
    hits: 0,
    weightedAccSum: 0,
  };
}

const ACC_WEIGHT: Record<Judgement, number> = {
  perfect: 1.0,
  good: 0.66,
  ok: 0.33,
  miss: 0,
};

export function applyJudgement(s: ScoreState, j: Judgement): void {
  if (j === "miss") {
    s.miss++;
    s.combo = 0;
  } else {
    s[j]++;
    s.score += Math.round(POINTS[j] * comboMultiplier(s.combo));
    s.combo++;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
  }
  s.hits++;
  s.weightedAccSum += ACC_WEIGHT[j];
}

export function accuracy(s: ScoreState): number {
  if (s.hits === 0) return 1;
  return s.weightedAccSum / s.hits;
}

export type Grade = "S" | "A" | "B" | "C" | "D";

export function grade(acc: number): Grade {
  if (acc >= 0.95) return "S";
  if (acc >= 0.85) return "A";
  if (acc >= 0.7) return "B";
  if (acc >= 0.55) return "C";
  return "D";
}
