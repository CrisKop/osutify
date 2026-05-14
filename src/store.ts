import { create } from "zustand";
import { Grade } from "./game/scoring";
import { MapData } from "./game/types";
import { TrackInfo } from "./spotify/player";

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

interface AppState {
  open: boolean;
  popupSize: PopupSize;
  track: TrackInfo | null;
  map: MapData | null;
  score: ScoreSnapshot;
  setOpen: (v: boolean) => void;
  toggleOpen: () => void;
  setPopupSize: (s: PopupSize) => void;
  setTrack: (t: TrackInfo | null) => void;
  setMap: (m: MapData | null) => void;
  setScore: (s: ScoreSnapshot) => void;
  resetScore: () => void;
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
const MIN_W = 80;
const MIN_H = 80;
const DEFAULT_W = MIN_W;
const DEFAULT_H = MIN_H;

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

export const useStore = create<AppState>((set) => ({
  open: false,
  popupSize: loadSize(),
  track: null,
  map: null,
  score: DEFAULT_SCORE,
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
}));

export { MIN_W, MIN_H };
