import { FIELD, GAME_RULES, TEAM } from '../core/constants.js';
import { clamp, nearestLane, shapeContains } from '../core/math.js';

export class NavigationSystem {
  resolveDeployment(map, card, rawX, rawY, team) {
    const x = clamp(rawX, FIELD.x + 10, FIELD.x + FIELD.width - 10);
    const y = clamp(rawY, FIELD.top + 10, FIELD.bottom - 10);
    const point = { x, y };

    if (!this.isInTeamHalf(y, team)) {
      return { ok: false, reason: team === TEAM.PLAYER ? 'Deploy in your half of the park' : 'Enemy deploy outside half' };
    }

    const blocked = this.blockedAt(map, point, card.kind);
    if (blocked) {
      return { ok: false, reason: `${blocked.name || 'Blocked terrain'} is not walkable` };
    }

    const nearest = nearestLane(map.lanes, x, y);
    if (!nearest) return { ok: false, reason: 'No route found' };

    const lane = nearest.lane;
    const snap = nearest.snap;
    const snapLimit = card.kind === 'building'
      ? map.nav.buildingSnapDistance
      : Math.max(map.nav.unitSnapDistance, lane.deployWidth || lane.width || 42);

    if (snap.distance > snapLimit) {
      return { ok: false, reason: card.kind === 'building' ? 'Build closer to the fight paths' : 'Drop monsters onto a lit walkable path' };
    }

    const progress = this.clampedProgressForTeam(snap.t, team, card.kind);
    const deployPoint = card.kind === 'building'
      ? { x, y }
      : { x: snap.x, y: snap.y };

    return {
      ok: true,
      x: deployPoint.x,
      y: deployPoint.y,
      laneIndex: lane.index,
      progress,
      snap,
      routeName: lane.name
    };
  }

  isInTeamHalf(y, team) {
    if (team === TEAM.PLAYER) return y >= GAME_RULES.minDeployYPlayer && y <= FIELD.bottom;
    return y <= GAME_RULES.maxDeployYEnemy && y >= FIELD.top;
  }

  clampedProgressForTeam(progress, team, kind) {
    const pad = kind === 'building' ? 0.03 : 0;
    if (team === TEAM.PLAYER) {
      return clamp(progress, GAME_RULES.minDeployProgressPlayer, GAME_RULES.maxDeployProgressPlayer - pad);
    }
    return clamp(progress, GAME_RULES.minDeployProgressEnemy + pad, GAME_RULES.maxDeployProgressEnemy);
  }

  blockedAt(map, point, kind = 'unit') {
    for (const zone of map.blockedZones || []) {
      if (shapeContains(zone, point)) {
        if (kind === 'unit' && zone.kind === 'structure') continue;
        return zone;
      }
    }
    return null;
  }

  isWalkableForUnit(map, x, y) {
    const nearest = nearestLane(map.lanes, x, y);
    if (!nearest) return false;
    const width = nearest.lane.width || 34;
    const blocked = this.blockedAt(map, { x, y }, 'unit');
    return !blocked && nearest.snap.distance <= width;
  }
}
