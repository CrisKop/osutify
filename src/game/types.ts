export type TargetType = "single" | "hold";

export type Judgement = "perfect" | "good" | "ok" | "miss";

export interface HoldPoint {
  x: number;
  y: number;
  time: number;
  smooth?: boolean;
}

export interface Note {
  id: string;
  type: TargetType;
  time: number;
  x: number;
  y: number;
  size: number;
  points?: HoldPoint[];
}

export interface MapData {
  trackId: string;
  title: string;
  artist: string;
  songName: string;
  bpm: number;
  difficulty: number;
  difficultyName: string;
  notes: Note[];
  mapperId?: string;
  isRated: boolean;
  source: "rated" | "unrated" | "auto";
}

export const TIMING_WINDOWS = {
  perfect: 70,
  good: 160,
  ok: 260,
} as const;

export const APPROACH_TIME_MS = 950;
export const MIN_NOTE_GAP_MS = 90;

export const HIT_RADIUS_SINGLE = 0.10;
export const HIT_RADIUS_HOLD = 0.10;
export const HIT_RADIUS_PATH = 0.09;

export function holdDuration(n: Note): number {
  if (n.type !== "hold" || !n.points || n.points.length < 2) return 0;
  return n.points[n.points.length - 1].time - n.points[0].time;
}

export function holdEndTime(n: Note): number {
  if (n.type !== "hold" || !n.points || n.points.length === 0) return n.time;
  return n.points[n.points.length - 1].time;
}
