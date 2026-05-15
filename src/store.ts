import { create } from "zustand";
import { Grade } from "./game/scoring";
import { MapData } from "./game/types";
import { TrackInfo } from "./spotify/player";

export type DifficultyLevel = "easy" | "normal" | "hard" | "expert";

export const DIFFICULTY_ORDER: DifficultyLevel[] = [
  "easy",
  "normal",
  "hard",
  "expert",
];

export const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  expert: "Expert",
};

export interface ScoreSnapshot {
  score: number;
  combo: number;
  maxCombo: number;
  accuracy: number;
  grade: Grade;
  perfect: number;
  good: number;
  ok: number;
  miss: number;
  totalNotes: number;
  processedNotes: number;
}

export interface PopupSize {
  w: number;
  h: number;
}

export interface AlbumColors {
  vibrant: string;
  darkVibrant: string;
  lightVibrant: string;
  prominent: string;
  desaturated: string;
}

interface AppState {
  open: boolean;
  popupSize: PopupSize;
  track: TrackInfo | null;
  map: MapData | null;
  score: ScoreSnapshot;
  difficulty: DifficultyLevel;
  adaptiveTheme: boolean;
  albumColors: AlbumColors | null;
  setOpen: (v: boolean) => void;
  toggleOpen: () => void;
  setPopupSize: (s: PopupSize) => void;
  setTrack: (t: TrackInfo | null) => void;
  setMap: (m: MapData | null) => void;
  setScore: (s: ScoreSnapshot) => void;
  resetScore: () => void;
  setDifficulty: (d: DifficultyLevel) => void;
  cycleDifficulty: () => void;
  setAdaptiveTheme: (v: boolean) => void;
  toggleAdaptiveTheme: () => void;
  setAlbumColors: (c: AlbumColors | null) => void;
}

const DEFAULT_SCORE: ScoreSnapshot = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  accuracy: 1,
  grade: "S",
  perfect: 0,
  good: 0,
  ok: 0,
  miss: 0,
  totalNotes: 0,
  processedNotes: 0,
};

const SIZE_KEY = "osutify:popupSize";
const DIFFICULTY_KEY = "osutify:difficulty";
const MIN_W = 80;
const MIN_H = 80;
const DEFAULT_W = MIN_W;
const DEFAULT_H = MIN_H;

function loadDifficulty(): DifficultyLevel {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY);
    if (raw && (DIFFICULTY_ORDER as string[]).includes(raw)) {
      return raw as DifficultyLevel;
    }
  } catch {}
  return "normal";
}

function saveDifficulty(d: DifficultyLevel): void {
  try {
    localStorage.setItem(DIFFICULTY_KEY, d);
  } catch {}
}

const ADAPTIVE_KEY = "osutify:adaptiveTheme";

function loadAdaptive(): boolean {
  try {
    const raw = localStorage.getItem(ADAPTIVE_KEY);
    if (raw === "false") return false;
    if (raw === "true") return true;
  } catch {}
  return true;
}

function saveAdaptive(v: boolean): void {
  try {
    localStorage.setItem(ADAPTIVE_KEY, v ? "true" : "false");
  } catch {}
}

function loadSize(): PopupSize {
  try {
    const raw = localStorage.getItem(SIZE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return {
        w: Math.max(MIN_W, s.w ?? DEFAULT_W),
        h: Math.max(MIN_H, s.h ?? DEFAULT_H),
      };
    }
  } catch {}
  return { w: DEFAULT_W, h: DEFAULT_H };
}

function saveSize(s: PopupSize): void {
  try {
    localStorage.setItem(SIZE_KEY, JSON.stringify(s));
  } catch {}
}

export const useStore = create<AppState>((set, get) => ({
  open: false,
  popupSize: loadSize(),
  track: null,
  map: null,
  score: DEFAULT_SCORE,
  difficulty: loadDifficulty(),
  setOpen: (v) => set({ open: v }),
  toggleOpen: () => set((s) => ({ open: !s.open })),
  setPopupSize: (s) => {
    const clamped = {
      w: Math.max(MIN_W, s.w),
      h: Math.max(MIN_H, s.h),
    };
    saveSize(clamped);
    set({ popupSize: clamped });
  },
  setTrack: (t) => set({ track: t }),
  setMap: (m) => set({ map: m }),
  setScore: (s) => set({ score: s }),
  resetScore: () => set({ score: DEFAULT_SCORE }),
  setDifficulty: (d) => {
    saveDifficulty(d);
    set({ difficulty: d });
  },
  cycleDifficulty: () => {
    const cur = get().difficulty;
    const idx = DIFFICULTY_ORDER.indexOf(cur);
    const next = DIFFICULTY_ORDER[(idx + 1) % DIFFICULTY_ORDER.length];
    saveDifficulty(next);
    set({ difficulty: next });
  },
  adaptiveTheme: loadAdaptive(),
  albumColors: null,
  setAdaptiveTheme: (v) => {
    saveAdaptive(v);
    set({ adaptiveTheme: v });
  },
  toggleAdaptiveTheme: () => {
    const next = !get().adaptiveTheme;
    saveAdaptive(next);
    set({ adaptiveTheme: next });
  },
  setAlbumColors: (c) => set({ albumColors: c }),
}));

export { MIN_W, MIN_H };
