import { Note, APPROACH_TIME_MS, holdEndTime } from "./types";
import { pointAtTime, isStaticHold, cubicCatmullPoint } from "./path";

export interface RenderState {
  visibleNotes: ActiveNote[];
  feedback: FeedbackFx[];
  cursor?: { x: number; y: number } | null;
}

export interface ActiveNote {
  note: Note;
  msUntilHit: number;
  holdState?: "idle" | "active" | "broken" | "complete";
  holdProgress?: number;
  songMs: number;
  dimmed?: boolean;
}

export interface FeedbackFx {
  x: number;
  y: number;
  text: string;
  color: string;
  spawnedAt: number;
}

const COLORS = {
  single: "#f0ffbc",
  holdStatic: "#bcfffc",
  holdDrag: "#dbdd78",
  approach: "rgba(240,255,188,0.75)",
  pathStroke: "rgba(188,255,252,0.45)",
  staticOuter: "rgba(188,255,252,0.3)",
};

const FEEDBACK_LIFE_MS = 600;
const BEZIER_STEPS = 24;

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private width = 0;
  private height = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const w = this.canvas.ownerDocument?.defaultView ?? window;
    this.dpr = w.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  render(state: RenderState, nowPerf: number): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = state.visibleNotes.length - 1; i >= 0; i--) {
      const an = state.visibleNotes[i];
      if (an.dimmed) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.28;
      }
      this.drawNote(an);
      if (an.dimmed) this.ctx.restore();
    }
    for (const fx of state.feedback) {
      this.drawFeedback(fx, nowPerf);
    }
    if (state.cursor) this.drawCursor(state.cursor.x, state.cursor.y);
  }

  private baseRadius(): number {
    return Math.min(this.width, this.height) * 0.06;
  }

  private toPx(x: number, y: number): [number, number] {
    return [x * this.width, y * this.height];
  }

  private drawNote(an: ActiveNote): void {
    const { note, msUntilHit, songMs } = an;
    const r = this.baseRadius() * note.size;
    const ctx = this.ctx;

    if (note.type === "hold" && note.points && note.points.length >= 2) {
      const isDrag = !isStaticHold(note.points);
      const color = isDrag ? COLORS.holdDrag : COLORS.holdStatic;

      if (isDrag) {
        this.drawPath(note.points, color, r * 0.85);
      }

      const startX = note.points[0].x;
      const startY = note.points[0].y;
      const [sx, sy] = this.toPx(startX, startY);

      if (an.holdState === "active" || an.holdState === "broken") {
        const cur = pointAtTime(note.points, songMs);
        const [cx, cy] = this.toPx(cur.x, cur.y);
        ctx.save();
        ctx.fillStyle =
          an.holdState === "broken" ? "#FF4D4D" : color;
        ctx.shadowColor = an.holdState === "broken" ? "rgba(255,77,77,0.5)" : (isDrag ? "rgba(219,221,120,0.45)" : "rgba(188,255,252,0.45)");
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const dur =
          note.points[note.points.length - 1].time -
          note.points[0].time;
        if (dur > 0 && an.holdProgress != null) {
          ctx.save();
          ctx.strokeStyle = "#dbdd78";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            r * 1.15,
            -Math.PI / 2,
            -Math.PI / 2 + Math.PI * 2 * an.holdProgress,
          );
          ctx.stroke();
          ctx.restore();
        }
      } else {
        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowColor = isDrag ? "rgba(219,221,120,0.5)" : "rgba(188,255,252,0.5)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (!isDrag) {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.55;
          ctx.lineWidth = Math.max(2, r * 0.18);
          ctx.beginPath();
          ctx.arc(sx, sy, r * 1.28, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          ctx.save();
          ctx.fillStyle = "rgba(31,31,27,0.85)";
          const bw = Math.max(2, r * 0.16);
          const bh = r * 0.6;
          const off = r * 0.28;
          const rr = Math.min(bw / 2, 2);
          this.roundRect(sx - off - bw / 2, sy - bh / 2, bw, bh, rr);
          ctx.fill();
          this.roundRect(sx + off - bw / 2, sy - bh / 2, bw, bh, rr);
          ctx.fill();
          ctx.restore();
        } else {
          const next = note.points[1];
          const angle = Math.atan2(
            next.y - note.points[0].y,
            next.x - note.points[0].x,
          );
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(angle);
          ctx.strokeStyle = "rgba(31,31,27,0.9)";
          ctx.lineWidth = Math.max(2.5, r * 0.22);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          const a = r * 0.5;
          ctx.beginPath();
          ctx.moveTo(-a * 0.55, -a * 0.6);
          ctx.lineTo(a * 0.55, 0);
          ctx.lineTo(-a * 0.55, a * 0.6);
          ctx.stroke();
          ctx.restore();
        }

        if (msUntilHit > 0) {
          const t = Math.max(
            0,
            Math.min(1, msUntilHit / APPROACH_TIME_MS),
          );
          const ar = r + r * 1.8 * t;
          ctx.save();
          ctx.strokeStyle = COLORS.approach;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(sx, sy, ar, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    } else {
      const [px, py] = this.toPx(note.x, note.y);
      ctx.save();
      ctx.shadowColor = "rgba(240,255,188,0.55)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = COLORS.single;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(31,31,27,0.85)";
      ctx.beginPath();
      ctx.arc(px, py, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (msUntilHit > 0) {
        const t = Math.max(
          0,
          Math.min(1, msUntilHit / APPROACH_TIME_MS),
        );
        const ar = r + r * 1.8 * t;
        ctx.save();
        ctx.strokeStyle = COLORS.approach;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py, ar, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  private drawPath(
    points: NonNullable<Note["points"]>,
    color: string,
    thickness: number,
  ): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const [sx, sy] = this.toPx(points[0].x, points[0].y);
    ctx.moveTo(sx, sy);
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      if (a.smooth && points.length >= 3) {
        for (let step = 1; step <= BEZIER_STEPS; step++) {
          const t = step / BEZIER_STEPS;
          const p = cubicCatmullPoint(points, i, t);
          const [px, py] = this.toPx(p.x, p.y);
          ctx.lineTo(px, py);
        }
      } else {
        const [bx, by] = this.toPx(b.x, b.y);
        ctx.lineTo(bx, by);
      }
    }
    ctx.stroke();
    ctx.restore();

    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    const [lx, ly] = this.toPx(last.x, last.y);
    const [px, py] = this.toPx(prev.x, prev.y);
    this.drawArrowhead(lx, ly, px, py, thickness * 0.65);
  }

  private drawArrowhead(
    tipX: number,
    tipY: number,
    fromX: number,
    fromY: number,
    size: number,
  ): void {
    const ctx = this.ctx;
    const angle = Math.atan2(tipY - fromY, tipX - fromX);
    ctx.save();
    ctx.fillStyle = COLORS.holdDrag;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
      tipX - size * Math.cos(angle - Math.PI / 6),
      tipY - size * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      tipX - size * Math.cos(angle + Math.PI / 6),
      tipY - size * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawFeedback(fx: FeedbackFx, now: number): void {
    const age = now - fx.spawnedAt;
    if (age >= FEEDBACK_LIFE_MS) return;
    const t = age / FEEDBACK_LIFE_MS;
    const alpha = 1 - t;
    const [px, py] = this.toPx(fx.x, fx.y);
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fx.color;
    ctx.font = `bold ${Math.round(Math.min(this.width, this.height) * 0.05)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fx.text, px, py - t * 20);
    ctx.restore();
  }

  private roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    const ctx = this.ctx;
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  private drawCursor(x: number, y: number): void {
    const [px, py] = this.toPx(x, y);
    const ctx = this.ctx;
    const r = Math.min(this.width, this.height) * 0.012;
    ctx.save();
    ctx.fillStyle = "rgba(240,255,188,0.9)";
    ctx.shadowColor = "rgba(240,255,188,0.6)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
