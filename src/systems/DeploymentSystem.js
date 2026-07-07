import { FIELD, GAME_RULES, TEAM } from '../core/constants.js';
import { clamp, nearestLane } from '../core/math.js';
import { CARD_LIBRARY } from '../data/cards.js';
import { Unit } from '../entities/Unit.js';
import { Building } from '../entities/Building.js';
import { Effect } from '../entities/Effect.js';

export class DeploymentSystem {
  deploy(game, cardId, rawX, rawY, team = TEAM.PLAYER, options = {}) {
    const card = CARD_LIBRARY[cardId];
    if (!card || game.state.over) return false;

    const energyKey = team === TEAM.PLAYER ? 'energy' : 'enemyEnergy';
    const free = options.free === true;
    if (!free && game.state[energyKey] < card.cost) {
      if (team === TEAM.PLAYER) game.feed('Not enough cursed energy');
      return false;
    }

    const x = clamp(rawX, FIELD.x + 18, FIELD.x + FIELD.width - 18);
    const y = clamp(rawY, FIELD.top + 26, FIELD.bottom - 26);

    if (!this.isValidHalf(y, team)) {
      if (team === TEAM.PLAYER) game.feed('Deploy in your half of the park');
      return false;
    }

    const snap = nearestLane(game.map.lanes, x, y);
    const laneIndex = snap.lane.index;
    const progress = this.clampedProgressForTeam(snap.snap.t, team, card.kind);

    if (!free) game.state[energyKey] -= card.cost;

    if (card.kind === 'building') {
      const building = new Building({ card, team, x, y, laneIndex, progress });
      game.state.buildings.push(building);
      game.effects.push(new Effect({ x, y: y - 18, text: card.shortName, colour: card.colours[0], life: 0.8 }));
      return true;
    }

    const count = card.count || 1;
    const offsets = this.offsets(count);
    for (let i = 0; i < count; i++) {
      const unit = new Unit({
        card,
        team,
        laneIndex,
        progress: clamp(progress + offsets[i].progress, 0, 1),
        offset: offsets[i].x
      });
      unit.syncPosition(game.map);
      game.state.units.push(unit);
    }
    game.effects.push(new Effect({ x: snap.snap.x, y: snap.snap.y - 16, text: card.shortName, colour: card.colours[0], life: 0.8 }));
    return true;
  }

  summon(game, cardId, team, laneIndex, progress, xShift = 0) {
    const card = CARD_LIBRARY[cardId];
    if (!card) return;
    const unit = new Unit({ card, team, laneIndex, progress, offset: xShift, level: 1 });
    unit.syncPosition(game.map);
    game.state.units.push(unit);
  }

  isValidHalf(y, team) {
    if (team === TEAM.PLAYER) return y >= GAME_RULES.minDeployYPlayer && y <= FIELD.bottom;
    return y <= GAME_RULES.maxDeployYEnemy && y >= FIELD.top;
  }

  clampedProgressForTeam(progress, team, kind) {
    if (team === TEAM.PLAYER) return clamp(progress, kind === 'building' ? 0.52 : 0.50, 0.95);
    return clamp(progress, 0.05, kind === 'building' ? 0.48 : 0.50);
  }

  offsets(count) {
    if (count === 1) return [{ x: 0, progress: 0 }];
    if (count === 2) return [{ x: -8, progress: -0.004 }, { x: 8, progress: 0.004 }];
    if (count === 3) return [{ x: -10, progress: -0.004 }, { x: 0, progress: 0 }, { x: 10, progress: 0.004 }];
    return [
      { x: -12, progress: -0.006 },
      { x: 12, progress: -0.002 },
      { x: -6, progress: 0.004 },
      { x: 8, progress: 0.008 }
    ];
  }
}
