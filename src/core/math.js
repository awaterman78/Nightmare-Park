export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanceXY(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

export function polylineLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += distance(points[i - 1], points[i]);
  return len;
}

export function pointOnPolyline(points, t) {
  const target = clamp(t, 0, 1) * polylineLength(points);
  let travelled = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const next = points[i];
    const seg = distance(prev, next);
    if (travelled + seg >= target) {
      const local = seg === 0 ? 0 : (target - travelled) / seg;
      return { x: lerp(prev.x, next.x, local), y: lerp(prev.y, next.y, local) };
    }
    travelled += seg;
  }
  return { ...points[points.length - 1] };
}

export function nearestPointOnPolyline(points, x, y) {
  let best = { x: points[0].x, y: points[0].y, distance: Infinity, t: 0 };
  const total = polylineLength(points) || 1;
  let travelled = 0;

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const segLenSq = vx * vx + vy * vy;
    const raw = segLenSq === 0 ? 0 : ((x - a.x) * vx + (y - a.y) * vy) / segLenSq;
    const u = clamp(raw, 0, 1);
    const px = a.x + vx * u;
    const py = a.y + vy * u;
    const d = Math.hypot(px - x, py - y);
    if (d < best.distance) {
      best = {
        x: px,
        y: py,
        distance: d,
        t: (travelled + Math.sqrt(segLenSq) * u) / total
      };
    }
    travelled += Math.sqrt(segLenSq);
  }
  return best;
}

export function nearestLane(lanes, x, y) {
  let best = null;
  for (const lane of lanes) {
    const snap = nearestPointOnPolyline(lane.points, x, y);
    if (!best || snap.distance < best.snap.distance) best = { lane, snap };
  }
  return best;
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(safe / 60).toString().padStart(2, '0');
  const s = (safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
