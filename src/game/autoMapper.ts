import {
  MapData,
  Note,
  HoldPoint,
} from "./types";

const EDGE_PADDING = 0.13;
const HOLD_END_RATIO_MIN = 0.20;
const HOLD_END_RATIO_MAX = 0.45;
const DRAG_MIN_DIST = 0.18;
const DRAG_MAX_DIST = 0.45;

interface AutoMapOptions {
  trackId: string;
  title: string;
  artist: string;
  bpm: number;
  durationMs: number;
  startOffsetMs?: number;
  seed?: number;
  beats?: number[];
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v: number, pad = EDGE_PADDING): number {
  return Math.max(pad, Math.min(1 - pad, v));
}

function randPos(rng: () => number): { x: number; y: number } {
  return {
    x: EDGE_PADDING + rng() * (1 - 2 * EDGE_PADDING),
    y: EDGE_PADDING + rng() * (1 - 2 * EDGE_PADDING),
  };
}

function offsetPos(
  from: { x: number; y: number },
  rng: () => number,
): { x: number; y: number } {
  const angle = rng() * Math.PI * 2;
  const dist =
    DRAG_MIN_DIST + rng() * (DRAG_MAX_DIST - DRAG_MIN_DIST);
  return {
    x: clamp01(from.x + Math.cos(angle) * dist),
    y: clamp01(from.y + Math.sin(angle) * dist),
  };
}

type Kind = "single" | "hold-static" | "hold-drag-2" | "hold-drag-3";

function pickKind(rng: () => number, beatsLeft: number): Kind {
  const r = rng();
  if (beatsLeft >= 3 && r < 0.08) return "hold-drag-3";
  if (beatsLeft >= 2 && r < 0.22) return "hold-drag-2";
  if (r < 0.40) return "hold-static";
  return "single";
}

function buildBeatTimes(opts: AutoMapOptions): number[] {
  if (opts.beats && opts.beats.length > 0) return opts.beats;
  const beatMs = 60000 / opts.bpm;
  const start = opts.startOffsetMs ?? 2000;
  const end = opts.durationMs - 1000;
  const out: number[] = [];
  for (let t = start; t < end; t += beatMs) out.push(Math.round(t));
  return out;
}

export function generateAutoMap(opts: AutoMapOptions): MapData {
  const { trackId, title, artist, bpm, durationMs } = opts;
  const seed = opts.seed ?? hashStr(trackId);
  const rng = mulberry32(seed);
  const beatTimes = buildBeatTimes(opts);
  const notes: Note[] = [];

  let beatIdx = 0;
  let nextNoteId = 0;

  while (beatIdx < beatTimes.length) {
    const beatsLeft = beatTimes.length - beatIdx;
    if (beatsLeft <= 0) break;
    const t = beatTimes[beatIdx];
    const kind = pickKind(rng, beatsLeft);
    const pos = randPos(rng);

    if (kind === "single") {
      notes.push({
        id: `auto-${nextNoteId++}`,
        type: "single",
        time: t,
        x: pos.x,
        y: pos.y,
        size: 1.0,
      });
      beatIdx += 1;
    } else if (kind === "hold-static") {
      const nextT =
        beatIdx + 1 < beatTimes.length
          ? beatTimes[beatIdx + 1]
          : t + 60000 / bpm;
      const beatLen = nextT - t;
      const ratio =
        HOLD_END_RATIO_MIN +
        rng() * (HOLD_END_RATIO_MAX - HOLD_END_RATIO_MIN);
      const endT = Math.round(t + beatLen * ratio);
      const points: HoldPoint[] = [
        { x: pos.x, y: pos.y, time: t },
        { x: pos.x, y: pos.y, time: endT },
      ];
      notes.push({
        id: `auto-${nextNoteId++}`,
        type: "hold",
        time: t,
        x: pos.x,
        y: pos.y,
        size: 1.0,
        points,
      });
      beatIdx += 1;
    } else if (kind === "hold-drag-2") {
      const second = offsetPos(pos, rng);
      const tEnd = beatTimes[beatIdx + 1];
      const smooth = rng() < 0.4;
      const points: HoldPoint[] = [
        { x: pos.x, y: pos.y, time: t, smooth },
        { x: second.x, y: second.y, time: tEnd, smooth: false },
      ];
      notes.push({
        id: `auto-${nextNoteId++}`,
        type: "hold",
        time: t,
        x: pos.x,
        y: pos.y,
        size: 1.0,
        points,
      });
      beatIdx += 2;
    } else {
      const second = offsetPos(pos, rng);
      const third = offsetPos(second, rng);
      const t1 = beatTimes[beatIdx + 1];
      const t2 = beatTimes[beatIdx + 2];
      const smooth1 = rng() < 0.5;
      const smooth2 = rng() < 0.5;
      const points: HoldPoint[] = [
        { x: pos.x, y: pos.y, time: t, smooth: smooth1 },
        { x: second.x, y: second.y, time: t1, smooth: smooth2 },
        { x: third.x, y: third.y, time: t2, smooth: false },
      ];
      notes.push({
        id: `auto-${nextNoteId++}`,
        type: "hold",
        time: t,
        x: pos.x,
        y: pos.y,
        size: 1.0,
        points,
      });
      beatIdx += 3;
    }
  }

  const difficulty = computeDifficulty(notes, durationMs);

  return {
    trackId,
    title: `${title} (Auto)`,
    artist,
    songName: title,
    bpm,
    difficulty,
    difficultyName: difficultyName(difficulty),
    notes,
    isRated: false,
    source: "auto",
  };
}

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function computeDifficulty(notes: Note[], durationMs: number): number {
  if (notes.length === 0 || durationMs === 0) return 0;
  const nps = (notes.length / durationMs) * 1000;
  const holds = notes.filter((n) => n.type === "hold").length;
  const holdRatio = holds / notes.length;
  let avgDist = 0;
  for (let i = 1; i < notes.length; i++) {
    const a = notes[i - 1];
    const b = notes[i];
    avgDist += Math.hypot(b.x - a.x, b.y - a.y);
  }
  avgDist /= Math.max(1, notes.length - 1);
  const raw = nps * 1.5 + avgDist * 0.8 + holdRatio * 0.7;
  return Math.max(0, Math.min(10, raw));
}

export function difficultyName(d: number): string {
  if (d < 2) return "Easy";
  if (d < 4) return "Normal";
  if (d < 6) return "Hard";
  if (d < 8) return "Expert";
  return "Expert+";
}
