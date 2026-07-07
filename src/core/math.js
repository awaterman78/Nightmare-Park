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
  return samplePolyline(points, t).point;
}

export function samplePolyline(points, t) {
  const target = clamp(t, 0, 1) * polylineLength(points);
  let travelled = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const next = points[i];
    const seg = distance(prev, next);
    if (travelled + seg >= target) {
      const local = seg === 0 ? 0 : (target - travelled) / seg;
      const x = lerp(prev.x, next.x, local);
      const y = lerp(prev.y, next.y, local);
      const tx = seg === 0 ? 0 : (next.x - prev.x) / seg;
      const ty = seg === 0 ? -1 : (next.y - prev.y) / seg;
      return {
        point: { x, y },
        tangent: { x: tx, y: ty },
        normal: { x: -ty, y: tx },
        segmentIndex: i - 1,
        travelled: travelled + seg * local
      };
    }
    travelled += seg;
  }

  const last = points[points.length - 1];
  const prev = points[points.length - 2] || last;
  const seg = Math.max(1, distance(prev, last));
  const tx = (last.x - prev.x) / seg;
  const ty = (last.y - prev.y) / seg;
  return {
    point: { ...last },
    tangent: { x: tx, y: ty },
    normal: { x: -ty, y: tx },
    segmentIndex: Math.max(0, points.length - 2),
    travelled: polylineLength(points)
  };
}

export function nearestPointOnPolyline(points, x, y) {
  let best = { x: points[0].x, y: points[0].y, distance: Infinity, t: 0, segmentIndex: 0 };
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
        t: (travelled + Math.sqrt(segLenSq) * u) / total,
        segmentIndex: i - 1
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

export function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 0.000001) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

export function pointInCircle(point, circle) {
  return distanceXY(point.x, point.y, circle.x, circle.y) <= circle.r;
}

export function rectToPolygon(rect) {
  return [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.w, y: rect.y },
    { x: rect.x + rect.w, y: rect.y + rect.h },
    { x: rect.x, y: rect.y + rect.h }
  ];
}

export function shapeContains(shape, point) {
  if (shape.polygon) return pointInPolygon(point, shape.polygon);
  if (shape.circle) return pointInCircle(point, shape.circle);
  if (shape.rect) return pointInPolygon(point, rectToPolygon(shape.rect));
  return false;
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
