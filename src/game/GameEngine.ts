import {
  MapData,
  Note,
  APPROACH_TIME_MS,
  TIMING_WINDOWS,
  Judgement,
  HIT_RADIUS_SINGLE,
  HIT_RADIUS_HOLD,
  HIT_RADIUS_PATH,
  holdEndTime,
} from "./types";
import {
  ScoreState,
  initScore,
  judgeTiming,
  applyJudgement,
  accuracy,
  grade,
  Grade,
} from "./scoring";
import { Renderer, ActiveNote, FeedbackFx } from "./Renderer";
import { InputHandler, PointerEventData } from "./InputHandler";
import { pointAtTime, isStaticHold } from "./path";

interface ActiveHold {
  note: Note;
  state: "active" | "broken" | "complete";
  brokenAt?: number;
  lastPointer?: PointerEventData;
  auto: boolean;
  inRangeMs: number;
  outOfRangeMs: number;
  lastUpdateMs: number;
}

export interface GameCallbacks {
  getSongTimeMs: () => number;
  onScoreChange: (score: GameScoreSnapshot) => void;
  onMapEnd: () => void;
}

export interface GameScoreSnapshot {
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

export class GameEngine {
  private map: MapData;
  private nextIdx = 0;
  private score: ScoreState = initScore();
  private feedback: FeedbackFx[] = [];
  private renderer: Renderer;
  private input: InputHandler;
  private rafId: number | null = null;
  private active: ActiveHold | null = null;
  private running = false;
  private disposed = false;
  private lastReportedScore = -1;

  constructor(
    private canvas: HTMLCanvasElement,
    map: MapData,
    private cb: GameCallbacks,
  ) {
    this.map = map;
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler(canvas);
    this.input.onDown(this.handlePointerDown);
    this.input.onUp(this.handlePointerUp);
    this.input.onMove(this.handlePointerMove);
    this.renderer.resize();
  }

  start(): void {
    if (this.running) return;
    this.skipPastNotes();
    this.running = true;
    console.log(
      "[Osutify] engine start notes=",
      this.map.notes.length,
      "nextIdx=",
      this.nextIdx,
      "songMs=",
      this.cb.getSongTimeMs(),
    );
    this.loop();
  }

  stop(): void {
    this.running = false;
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.input.dispose();
  }

  resize(): void {
    this.renderer.resize();
  }

  setMap(map: MapData): void {
    this.map = map;
    this.nextIdx = 0;
    this.score = initScore();
    this.feedback = [];
    this.active = null;
    this.lastReportedScore = -1;
    this.reportScore();
  }

  private skipPastNotes(): void {
    const songMs = this.cb.getSongTimeMs();
    while (
      this.nextIdx < this.map.notes.length &&
      this.map.notes[this.nextIdx].time < songMs - TIMING_WINDOWS.ok
    ) {
      this.nextIdx++;
    }
  }

  private loop = (): void => {
    if (!this.running) return;
    const songMs = this.cb.getSongTimeMs();
    const perfNow = performance.now();

    this.autoStartDrags(songMs);
    this.processMisses(songMs);
    this.updateActiveHold(songMs);

    const visible = this.collectVisible(songMs);

    this.feedback = this.feedback.filter(
      (f) => perfNow - f.spawnedAt < 600,
    );

    this.renderer.render(
      {
        visibleNotes: visible,
        feedback: this.feedback,
        cursor: this.input.getCursor(),
      },
      perfNow,
    );

    if (this.score.score !== this.lastReportedScore) {
      this.reportScore();
    }

    if (this.nextIdx >= this.map.notes.length && this.active == null) {
      this.running = false;
      this.cb.onMapEnd();
      return;
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  private collectVisible(songMs: number): ActiveNote[] {
    const out: ActiveNote[] = [];
    const holdActive = this.active != null;
    for (let i = this.nextIdx; i < this.map.notes.length; i++) {
      const n = this.map.notes[i];
      const ms = n.time - songMs;
      if (ms > APPROACH_TIME_MS) break;
      if (ms < -TIMING_WINDOWS.ok) continue;
      out.push({ note: n, msUntilHit: ms, songMs, dimmed: holdActive });
    }
    if (this.active) {
      const note = this.active.note;
      const totalDur =
        note.points && note.points.length >= 2
          ? note.points[note.points.length - 1].time - note.points[0].time
          : 0;
      const heldMs = songMs - note.time;
      const progress =
        totalDur > 0 ? Math.min(1, heldMs / totalDur) : 0;
      let visualState: "active" | "broken" = this.active.state === "broken"
        ? "broken"
        : "active";
      if (this.active.auto && note.points && note.points.length >= 2) {
        const cursor = this.input.getCursor();
        const exp = pointAtTime(note.points, songMs);
        const inRange =
          !!cursor &&
          Math.hypot(cursor.x - exp.x, cursor.y - exp.y) <=
            HIT_RADIUS_PATH * note.size * 1.5;
        visualState = inRange ? "active" : "broken";
      }
      out.push({
        note,
        msUntilHit: 0,
        holdState: visualState,
        holdProgress: progress,
        songMs,
      });
    }
    return out;
  }

  private autoStartDrags(songMs: number): void {
    if (this.active) return;
    if (this.nextIdx >= this.map.notes.length) return;
    const n = this.map.notes[this.nextIdx];
    if (
      n.type !== "hold" ||
      !n.points ||
      n.points.length < 2 ||
      isStaticHold(n.points)
    ) {
      return;
    }
    if (songMs >= n.time) {
      this.active = {
        note: n,
        state: "active",
        auto: true,
        inRangeMs: 0,
        outOfRangeMs: 0,
        lastUpdateMs: songMs,
      };
      this.nextIdx++;
    }
  }

  private processMisses(songMs: number): void {
    while (this.nextIdx < this.map.notes.length) {
      const n = this.map.notes[this.nextIdx];
      const delta = songMs - n.time;
      if (delta > TIMING_WINDOWS.ok) {
        this.judge(n, n.x, n.y, "miss");
        this.nextIdx++;
      } else {
        break;
      }
    }
  }

  private handlePointerDown = (e: PointerEventData): void => {
    if (this.active) return;
    const songMs = this.cb.getSongTimeMs();
    const target = this.findHittable(songMs, e);
    if (!target) return;

    const delta = songMs - target.time;
    const j = judgeTiming(delta);
    if (j === "miss") return;

    if (target.type === "single") {
      this.judge(target, target.x, target.y, j);
      this.consumeUpTo(this.map.notes.indexOf(target));
    } else {
      const isDrag =
        target.points != null &&
        target.points.length >= 2 &&
        !isStaticHold(target.points);
      if (isDrag) return;
      this.active = {
        note: target,
        state: "active",
        lastPointer: e,
        auto: false,
        inRangeMs: 0,
        outOfRangeMs: 0,
        lastUpdateMs: songMs,
      };
      if (j !== "perfect") {
        this.feedback.push({
          x: target.x,
          y: target.y - 0.05,
          text: j.toUpperCase(),
          color: judgementColor(j),
          spawnedAt: performance.now(),
        });
      }
      this.consumeUpTo(this.map.notes.indexOf(target));
    }
  };

  private handlePointerUp = (_e: PointerEventData): void => {
    if (!this.active || this.active.auto) return;
    this.resolveActive(this.cb.getSongTimeMs(), true);
  };

  private handlePointerMove = (e: PointerEventData): void => {
    if (!this.active) return;
    this.active.lastPointer = e;
  };

  private updateActiveHold(songMs: number): void {
    if (!this.active) return;
    const note = this.active.note;
    const points = note.points;
    if (!points || points.length < 2) {
      this.resolveActive(songMs, false);
      return;
    }
    const endTime = holdEndTime(note);

    if (this.active.auto) {
      const dt = Math.max(0, songMs - this.active.lastUpdateMs);
      this.active.lastUpdateMs = songMs;
      const cursor = this.input.getCursor();
      const expected = pointAtTime(points, Math.min(songMs, endTime));
      if (
        cursor &&
        Math.hypot(cursor.x - expected.x, cursor.y - expected.y) <=
          HIT_RADIUS_PATH * note.size * 1.5
      ) {
        this.active.inRangeMs += dt;
      } else {
        this.active.outOfRangeMs += dt;
      }
      if (songMs >= endTime) {
        this.resolveActive(songMs, false);
      }
      return;
    }

    if (this.active.state === "active") {
      const cursor = this.input.getCursor();
      if (cursor) {
        const expected = pointAtTime(points, songMs);
        const d = Math.hypot(
          cursor.x - expected.x,
          cursor.y - expected.y,
        );
        if (d > HIT_RADIUS_PATH * note.size * 1.5) {
          this.active.state = "broken";
          this.active.brokenAt = songMs;
        }
      }
      if (!this.input.isHeld()) {
        this.resolveActive(songMs, true);
        return;
      }
    }

    if (songMs >= endTime) {
      this.resolveActive(songMs, false);
    }
  }

  private resolveActive(songMs: number, released: boolean): void {
    if (!this.active) return;
    const a = this.active;
    const note = a.note;
    const points = note.points!;
    const startTime = points[0].time;
    const endTime = points[points.length - 1].time;
    const totalDur = endTime - startTime;

    let j: Judgement;
    let lastPos: { x: number; y: number };

    if (a.auto) {
      const total = a.inRangeMs + a.outOfRangeMs;
      const ratio = total > 0 ? a.inRangeMs / total : 0;
      if (ratio >= 0.92) j = "perfect";
      else if (ratio >= 0.75) j = "good";
      else if (ratio >= 0.5) j = "ok";
      else j = "miss";
      lastPos = pointAtTime(points, Math.min(songMs, endTime));
    } else {
      const heldUntil =
        a.state === "broken"
          ? (a.brokenAt ?? songMs)
          : Math.min(songMs, endTime);
      const ratio =
        totalDur > 0
          ? Math.max(0, Math.min(1, (heldUntil - startTime) / totalDur))
          : 1;
      if (a.state === "broken") {
        j = ratio >= 0.4 ? "ok" : "miss";
      } else if (!released && ratio >= 0.95) {
        j = "perfect";
      } else if (ratio >= 0.9) {
        j = "perfect";
      } else if (ratio >= 0.7) {
        j = "good";
      } else if (ratio >= 0.4) {
        j = "ok";
      } else {
        j = "miss";
      }
      lastPos = pointAtTime(points, heldUntil);
    }

    this.judge(note, lastPos.x, lastPos.y, j);
    this.active = null;
  }

  private findHittable(songMs: number, e: PointerEventData): Note | null {
    for (let i = this.nextIdx; i < this.map.notes.length; i++) {
      const n = this.map.notes[i];
      const ms = n.time - songMs;
      if (ms > APPROACH_TIME_MS) break;
      const delta = songMs - n.time;
      if (delta > TIMING_WINDOWS.ok) continue;
      if (delta < -TIMING_WINDOWS.ok) continue;
      const baseR =
        n.type === "single" ? HIT_RADIUS_SINGLE : HIT_RADIUS_HOLD;
      const hx = n.points ? n.points[0].x : n.x;
      const hy = n.points ? n.points[0].y : n.y;
      const d = Math.hypot(e.x - hx, e.y - hy);
      if (d <= baseR * n.size * 1.4) return n;
    }
    return null;
  }

  private consumeUpTo(idx: number): void {
    while (this.nextIdx <= idx) {
      const n = this.map.notes[this.nextIdx];
      if (this.nextIdx < idx) {
        this.judge(n, n.x, n.y, "miss");
      }
      this.nextIdx++;
    }
  }

  private judge(n: Note, x: number, y: number, j: Judgement): void {
    applyJudgement(this.score, j);
    this.feedback.push({
      x,
      y: y - 0.05,
      text:
        j === "perfect"
          ? "PERFECT"
          : j === "good"
            ? "GOOD"
            : j === "ok"
              ? "OK"
              : "MISS",
      color: judgementColor(j),
      spawnedAt: performance.now(),
    });
  }

  private reportScore(): void {
    this.lastReportedScore = this.score.score;
    const acc = accuracy(this.score);
    this.cb.onScoreChange({
      score: this.score.score,
      combo: this.score.combo,
      maxCombo: this.score.maxCombo,
      accuracy: acc,
      grade: grade(acc),
      perfect: this.score.perfect,
      good: this.score.good,
      ok: this.score.ok,
      miss: this.score.miss,
      totalNotes: this.map.notes.length,
      processedNotes: this.score.hits,
    });
  }
}

function judgementColor(j: Judgement): string {
  if (j === "perfect") return "#FFD166";
  if (j === "good") return "#1DB954";
  if (j === "ok") return "#9D4EDD";
  return "#FF4D4D";
}
