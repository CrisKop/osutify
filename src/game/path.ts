import { HoldPoint } from "./types";

export interface Vec2 {
  x: number;
  y: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function pointAtTime(points: HoldPoint[], time: number): Vec2 {
  if (points.length === 0) return { x: 0, y: 0 };
  if (time <= points[0].time)
    return { x: points[0].x, y: points[0].y };
  const last = points[points.length - 1];
  if (time >= last.time) return { x: last.x, y: last.y };

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (time >= a.time && time <= b.time) {
      const span = b.time - a.time || 1;
      const t = (time - a.time) / span;
      if (a.smooth && points.length >= 3) {
        return cubicCatmullPoint(points, i, t);
      }
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
    }
  }
  return { x: last.x, y: last.y };
}

export function cubicCatmullPoint(
  points: HoldPoint[],
  i: number,
  t: number,
): Vec2 {
  const p0 = points[i - 1] ?? points[i];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[i + 2] ?? points[i + 1];
  const t2 = t * t;
  const t3 = t2 * t;
  const x =
    0.5 *
    (2 * p1.x +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
  const y =
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
  return { x, y };
}

export function isStaticHold(points: HoldPoint[]): boolean {
  if (points.length < 2) return true;
  const a = points[0];
  for (let i = 1; i < points.length; i++) {
    if (
      Math.abs(points[i].x - a.x) > 0.0001 ||
      Math.abs(points[i].y - a.y) > 0.0001
    )
      return false;
  }
  return true;
}
